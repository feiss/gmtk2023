// Diego F. Goberna - http://diegofg.com - GMTK 2023

function preload() {
    return [
        "map1-1.png",
        "pepe.png",
        "block_a.png",
        "block_b.png",
        "block_c.png",
        "block_q.png",
        "enemy_a.png",
        "enemy_b.png",
    ];
}

let map;
let map_size;

const is_sky = idx => idx == 6;
const is_floor = idx => idx == 32 || idx == 4;
const is_breakable = idx => idx == 36;

function loading(progress) {
    canvas.fill_rect(10, H / 2, floor(progress * (W - 20)), 1, 3);
}

function load_map(path) {
    let img = assets[path];
    let c = new Canvas(img.width, img.height);
    map_size = img.width;
    c.draw_image(path, 0, 0);
    map = new Array(img.width);
    for (let x = 0; x < img.width; x++) {
        let col = new Array(img.height);
        for (let y = 0; y < img.height; y++) {
            col[y] = c.pget(x, y);
        }
        map[x] = col;
    }
}

let scroll = 0;
let TILE = 16;
let mapW = floor(W / TILE);
let mapH = floor(H / TILE);

const MAP_TILE = new Array(100);
MAP_TILE[32] = 'block_c.png';
MAP_TILE[4] = 'block_b.png';
MAP_TILE[36] = 'block_a.png';

function draw_map() {
    const map_scroll = floor(scroll);
    const scroll_frac = scroll - map_scroll;
    for (let x = 0; x < mapW + 1; x++) {
        for (let y = 0; y < mapH; y++) {
            const img = MAP_TILE[map[x + map_scroll][y]];
            if (img) {
                canvas.draw_image(img, (x - scroll_frac) * TILE, y * TILE);
            }
        }
    }
}

function get_map_at(p) {

}

function start() {
    set_palette([
        '#000000', '#fcfcfc', '#f8f8f8', '#bcbcbc', '#7c7c7c', '#a4e4fc', '#3cbcfc', '#0078f8', '#0000fc', '#b8b8f8', '#6888fc', '#0058f8', '#0000bc', '#d8b8f8', '#9878f8', '#6844fc', '#4428bc', '#f8b8f8', '#f878f8', '#d800cc', '#940084', '#f8a4c0', '#f85898', '#e40058', '#a80020', '#f0d0b0', '#f87858', '#f83800', '#a81000', '#fce0a8', '#fca044', '#e45c10', '#881400', '#f8d878', '#f8b800', '#ac7c00', '#503000', '#d8f878', '#b8f818', '#00b800', '#007800', '#b8f8b8', '#58d854', '#00a800', '#006800', '#b8f8d8', '#58f898', '#00a844', '#005800', '#00fcfc', '#00e8d8', '#008888', '#004058', '#f8d8f8', '#787878',
    ]);
    load_map("map1-1.png");
    draw_map();
    // new_sprite('sonic', {
    //     'count': { frames: ['sonic0.png', 'sonic1.png', 'sonic2.png', 'sonic3.png'], fps: 10 },
    // }, 0.5, 0.5);

}

const PLAYER_ACCEL = 0.01;
const PLAYER_MAX_SPEED = new Vec(20.0, 20.0);
const PLAYER_DRAG = 0.93;
const PLAYER_JUMP_SPEED = 5.0;
const GRAVITY = 2.0;

let player = {
    pos: new Vec(100, 192),
    speed: new Vec(0, 0),
    on_air: false,
};

function update_player() {
    if (keys['ArrowUp'] && !player.on_air) {
        player.on_air = true;
        player.speed.y = -PLAYER_JUMP_SPEED;
    }
    if (keys['ArrowRight']) {
        player.speed.x += PLAYER_ACCEL;
    }
    if (keys['ArrowLeft']) {
        player.speed.x -= PLAYER_ACCEL;
    }

    player.speed.clamp(PLAYER_MAX_SPEED);

    player.pos.x += player.speed.x;
    player.pos.y += player.speed.y;
    player.speed.x *= PLAYER_DRAG;

    if (is_sky(get_map_at(player.pos))) {
        player.speed.y += GRAVITY;
    } else {
        player.on_air = false;
    }

    player.pos.x = clamp(player.pos.x, 100, map_size);
    player.pos.y = clamp(player.pos.y, 0, 192);
}

function draw_player() {
    canvas.draw_image('pepe.png', player.pos.x, player.pos.y);
}

function loop(t, dt) {
    canvas.fill_rect(0, 0, W, H, 6);

    update_player();

    scroll = clamp(player.pos.x - 100, 0, map_size);

    draw_map();
    draw_player();

    if (mouse.left && mouse.prevx) {
        canvas.draw_line(mouse.prevx, mouse.prevy, mouse.x, mouse.y, 6);
    }
}