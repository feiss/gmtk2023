// Diego F. Goberna - http://diegofg.com - GMTK 2023

function preload() {
    return [
        "map1-1.png",
        "pepe.png",
        "pepe_jump.png",
        "block_a.png",
        "block_b.png",
        "block_c.png",
        "block_q.png",
        "enemy_a1.png",
        "enemy_a2.png",
        "enemy_b1.png",
        "enemy_b2.png",
        "pipe1.png",
        "pipe2.png",
        "pipe3.png",
        "pipe4.png",
    ];
}

let map;
let map_items = [];
let map_size;

const is_sky = idx => idx == 6;
const is_floor = idx => idx == 32 || idx == 4;
const is_breakable = idx => idx == 36;

function loading(progress) {
    canvas.fill_rect(10, H / 2, floor(progress * (W - 20)), 1, 3);
}


function add_map_item(type, subtype, x, y) {
    map_items.push({
        type: type,
        subtype: subtype,
        pos: new Vec(x, y),
    })
}

function load_map(path) {
    let img = assets[path];
    let c = new Canvas(img.width, img.height, 1);
    c.canvas.style.display = 'none';
    map_size = new Vec(img.width, img.height);
    c.draw_image(path, 0, 0);
    map = new Array(img.width);
    for (let x = 0; x < img.width; x++) {
        let col = new Array(img.height);
        for (let y = 0; y < img.height; y++) {
            const color = c.pget(x, y);
            switch (color) {
                case 19: add_map_item('enemy', 'a', x, y); col[y] = 6; break;
                case 20: add_map_item('enemy', 'b', x, y); col[y] = 6; break;
                default: col[y] = color;
            }


        }
        map[x] = col;
    }
}

let scroll = 0;
let TILE = 16;
let TILE2 = 8;
let mapW = floor(W / TILE);
let mapH = floor(H / TILE);

let gameover = false;

const MAP_TILE = new Array(100);
MAP_TILE[32] = 'block_c.png';
MAP_TILE[4] = 'block_b.png';
MAP_TILE[36] = 'block_a.png';
MAP_TILE[39] = 'pipe1.png';
MAP_TILE[40] = 'pipe2.png';
MAP_TILE[41] = 'pipe3.png';
MAP_TILE[42] = 'pipe4.png';

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
    const x = floor(p.x / TILE);
    const y = floor(p.y / TILE);
    if (isNaN(x) || isNaN(y) || x >= map_size.x || x < 0 || y < 0 || y >= map_size.y) {
        // throw RangeError("Map outside bounds (" + x + ', ' + y + ')');
        return 6;
    }
    return map[x][y];
}

function start() {
    set_palette([
        '#000000', '#fcfcfc', '#f8f8f8', '#bcbcbc', '#7c7c7c', '#a4e4fc', '#3cbcfc', '#0078f8', '#0000fc', '#b8b8f8', '#6888fc', '#0058f8', '#0000bc', '#d8b8f8', '#9878f8', '#6844fc', '#4428bc', '#f8b8f8', '#f878f8', '#d800cc', '#940084', '#f8a4c0', '#f85898', '#e40058', '#a80020', '#f0d0b0', '#f87858', '#f83800', '#a81000', '#fce0a8', '#fca044', '#e45c10', '#881400', '#f8d878', '#f8b800', '#ac7c00', '#503000', '#d8f878', '#b8f818', '#00b800', '#007800', '#b8f8b8', '#58d854', '#00a800', '#006800', '#b8f8d8', '#58f898', '#00a844', '#005800', '#00fcfc', '#00e8d8', '#008888', '#004058', '#f8d8f8', '#787878',
    ]);
    load_map("map1-1.png");
    draw_map();
    restart();
    // new_sprite('sonic', {
    //     'count': { frames: ['sonic0.png', 'sonic1.png', 'sonic2.png', 'sonic3.png'], fps: 10 },
    // }, 0.5, 0.5);

}

const PLAYER_ACCEL = 0.2;
const PLAYER_DRAG = 0.93;
const PLAYER_MAX_HSPEED = 20.0;
const PLAYER_MAX_VSPEED = 20.0;
const PLAYER_JUMP_SPEED = 4.0;
const MEGAJUMP_FRAME_CHECK = 12;
const GRAVITY = 0.3;

const GOOMBA_SPEED = 0.3;

let player, enemies;


function restart() {
    gameover = false;
    player = {
        pos: new Vec(100, 150),
        speed: new Vec(0, 0),
        on_air: false,
        look_right: true,
        jump_frame: 0,
    };

    enemies = [];
    for (let i = 0; i < map_items.length; i++) {
        const item = map_items[i];
        switch (item.type) {
            case 'enemy':
                enemies.push({
                    type: item.subtype,
                    pos: item.pos.mul(TILE),
                    speed: -GOOMBA_SPEED,
                    alive: true,
                });
                break;
        }

    }

    new_sprite('a', { 'count': { frames: ['enemy_a1.png', 'enemy_a2.png'], fps: 2 } }, 0.5, 1);
    new_sprite('b', { 'count': { frames: ['enemy_b1.png', 'enemy_b2.png'], fps: 2 } }, 0.5, 1);
}

function update_player() {
    let hit_bottom_left = get_map_at(new Vec(player.pos.x - TILE2 - 1, player.pos.y - 1));
    let hit_bottom_right = get_map_at(new Vec(player.pos.x + TILE2 + 1, player.pos.y - 1));

    if (keys['ArrowUp'] && !player.on_air) {
        player.on_air = true;
        player.speed.y = -PLAYER_JUMP_SPEED;
        player.jump_frame = 0;
    }
    if (keys['ArrowRight'] && is_sky(hit_bottom_right)) {
        player.speed.x += PLAYER_ACCEL;
        player.look_right = true;
    }
    if (keys['ArrowLeft'] && is_sky(hit_bottom_left)) {
        player.look_right = false;
        player.speed.x -= PLAYER_ACCEL;
    }
    player.speed.x = clamp(player.speed.x, -PLAYER_MAX_HSPEED, PLAYER_MAX_HSPEED);
    player.speed.y = clamp(player.speed.y, -PLAYER_MAX_VSPEED, PLAYER_MAX_VSPEED);

    player.pos.x += player.speed.x;
    player.pos.y += player.speed.y;

    player.pos.x = clamp(player.pos.x, TILE2 + 1, map_size.x * TILE - TILE2 - 1);

    const hit_corner_bottom_left = get_map_at(new Vec(player.pos.x - TILE2, player.pos.y));
    const hit_corner_bottom_right = get_map_at(new Vec(player.pos.x + TILE2, player.pos.y));
    const hit_corner_top_left = get_map_at(new Vec(player.pos.x - TILE2, player.pos.y - TILE));
    const hit_corner_top_right = get_map_at(new Vec(player.pos.x + TILE2, player.pos.y - TILE));
    const hit_top_left = get_map_at(new Vec(player.pos.x - TILE2, player.pos.y - TILE + 4));
    const hit_top_right = get_map_at(new Vec(player.pos.x + TILE2, player.pos.y - TILE + 4));
    hit_bottom_right = get_map_at(new Vec(player.pos.x + TILE2, player.pos.y - 4));
    hit_bottom_left = get_map_at(new Vec(player.pos.x - TILE2, player.pos.y - 4));


    if (player.pos.y >= H || (is_sky(hit_corner_bottom_left) && is_sky(hit_corner_bottom_right))) {
        player.on_air = true;
    } else if (player.speed.y > 0) {
        // player.pos.y -= player.speed.y;
        player.pos.y = floor(player.pos.y / TILE) * TILE;
        player.speed.y = 0;
        player.on_air = false;
    }

    if (!is_sky(hit_corner_top_left) || !is_sky(hit_corner_top_right)) {
        player.speed.y = 1;
    }

    if (player.on_air) {
        player.jump_frame++;
        if (player.speed.y < 0) {
            const megajump = player.jump_frame < MEGAJUMP_FRAME_CHECK && keys['ArrowUp'];
            if (!megajump) {
                player.speed.y += GRAVITY;
            }
        } else {
            player.speed.y += GRAVITY;
        }
    }

    if (!is_sky(hit_bottom_left) || !is_sky(hit_top_left)) {
        player.pos.x -= player.speed.x;
        player.speed.x = 0;
    }
    if (!is_sky(hit_bottom_right) || !is_sky(hit_top_right)) {
        player.pos.x -= player.speed.x;
        player.speed.x = 0;
    }


    // player.pos.y = clamp(player.pos.y, 0, 192);

    player.speed.x *= PLAYER_DRAG;
}


function draw_player() {
    const x = floor(player.pos.x - scroll * TILE - TILE2);
    const y = floor(player.pos.y - TILE + 1);

    const flip = !player.look_right;

    if (player.on_air) {
        canvas.draw_image('pepe_jump.png', x, y, flip);
    } else {
        canvas.draw_image('pepe.png', x, y, flip);
    }
}


function update_enemies(dt) {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (!enemy.alive) continue;

        enemy.pos.x += enemy.speed;

        if (enemy.pos.y >= H) {
            enemy.pos.y += 1;
        } else {
            const hit_left = get_map_at(new Vec(enemy.pos.x - TILE2 + 1, enemy.pos.y - TILE2));
            const hit_right = get_map_at(new Vec(enemy.pos.x + TILE2 - 1, enemy.pos.y - TILE2));
            const hit_bottom_left = get_map_at(new Vec(enemy.pos.x - TILE2 + 1, enemy.pos.y));
            const hit_bottom_right = get_map_at(new Vec(enemy.pos.x + TILE2 - 1, enemy.pos.y));

            if (!is_sky(hit_left) || !is_sky(hit_right) || enemy.pos.x < TILE2 + 1) {
                enemy.speed *= -1;
                enemy.pos.x += enemy.speed;
            }

            if (is_sky(hit_bottom_left) && is_sky(hit_bottom_right)) {
                enemy.pos.y += 1;
            }

        }
        if (enemy.pos.y > H + 30) {
            enemy.alive = false;
        }

    }
}

function draw_enemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];

        const x = floor(enemy.pos.x - scroll * TILE);
        const y = floor(enemy.pos.y);
        if (x > -TILE && x < W + TILE && y < H + TILE * 2) {
            canvas.draw_sprite(enemy.type, x, y, enemy.speed > 0);
        }
    }
}


function loop(t, dt) {

    if (gameover) {
        return loop_gameover(t, dt);
    }

    canvas.fill_rect(0, 0, W, H, 6);

    update_sprite('a', dt);
    update_sprite('b', dt);

    update_enemies(dt);
    update_player();

    if (player.pos.x > 120) {
        scroll = (player.pos.x - 120) / TILE;
    } else {
        scroll = 0;
    }
    draw_map();
    draw_enemies();
    draw_player();

    if (player.pos.y > H + 30) {
        gameover = true;
    }

    // debug
    canvas.draw_image("map1-1.png", 0, 0);
    canvas.pset(floor((player.pos.x - scroll) / TILE), floor(player.pos.y / TILE) - 1, 23)
    // canvas.draw_rect(20, 30, 0, 5, 0);
    // canvas.draw_rect(20, 31, floor(player.speed.x) * 2, 3, 0);

    if (mouse.left && mouse.prevx) {
        canvas.draw_line(mouse.prevx, mouse.prevy, mouse.x, mouse.y, 6);
    }
}


function loop_gameover(t, dt) {
    canvas.fill_rect(0, 0, W, H, 0);
    canvas.draw_text("GAME OVER", W / 2 - 30, H / 2, 2);
    canvas.draw_text("- CLICK TO TRY AGAIN- ", W / 2 - 60, H / 2 + 20, 2);
    if (mouse.just_left) {
        restart();
    }
}
