// Diego F. Goberna - http://diegofg.com - GMTK 2023

let sounds = {};

function preload() {
    for (const sound of [
        'block',
        'click',
        'coin',
        'coin_pick',
        'jump',
        'pickup',
        'tump',
        'mushroom',
    ]) {
        sounds[sound] = new Audio('assets/' + sound + '.wav');
    }

    return [
        "map1-1.png",
        "pepe.png",
        "pepe_jump.png",
        "pepe_run1.png",
        "pepe_run2.png",
        "pepe_run3.png",
        "pepe_dead.png",
        "block_break1.png",
        "block_break2.png",
        "block_a.png",
        "block_b.png",
        "block_c.png",
        "block_q1.png",
        "block_q2.png",
        "block_q3.png",
        "block_q_dead.png",
        "enemy_a1.png",
        "enemy_a2.png",
        "enemy_a_life1.png",
        "enemy_a_life2.png",
        "enemy_a_life3.png",
        "enemy_a_dead.png",
        "enemy_b1.png",
        "enemy_b2.png",
        "enemy_b_dead.png",
        "pipe1.png",
        "pipe2.png",
        "pipe3.png",
        "pipe4.png",
        "coin1.png",
        "coin2.png",
        "coin3.png",
        "heart.png",
        "mushroom.png",
        "mushroom2.png",


        "sky.png",
        "mountain1.png",
        "cloud1.png",
        "cloud2.png",
        "cloud3.png",
        "bush1.png",
    ];
}

let map;
let map_items;
let map_size;

function loading(progress) {
    canvas.fill_rect(10, H / 2, floor(progress * (W - 20)), 1, 3);
}

function draw(item, x, y, flip) {
    if (item.indexOf('.png') == -1) {
        canvas.draw_sprite(item, x, y, flip);
    } else {
        canvas.draw_image(item, x, y, flip);
    }
}


function add_map_item(type, subtype, x, y) {
    map_items.push({
        type: type,
        subtype: subtype,
        pos: new Vec(x, y).mul(TILE),
    })
}

function load_map(path) {
    map_items = [];
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
let gameover_t = 0;
let game_speed = 1;
let gameover_msg;


const is_sky = idx => idx == 6 || idx == 1 || idx == 2 || idx == 3 || idx == 49 || idx == 50;
const is_floor = idx => idx == 32 || idx == 4;
const is_hitable = idx => idx == 36 || idx == 35 || idx == 34 || idx == 33;
const is_coin = idx => idx == 35;
const is_mushroom = idx => idx == 34 || idx == 33;

const MAP_TILE = new Array(100);
MAP_TILE[32] = 'block_c.png';
MAP_TILE[4] = 'block_b.png';
MAP_TILE[1] = 'cloud1.png';
MAP_TILE[2] = 'cloud2.png';
MAP_TILE[3] = 'cloud3.png';
MAP_TILE[33] = 'sky.png';
MAP_TILE[34] = 'block_q';
MAP_TILE[35] = 'block_q';
MAP_TILE[99] = 'block_q_dead.png';
MAP_TILE[36] = 'block_a.png';
MAP_TILE[39] = 'pipe1.png';
MAP_TILE[40] = 'pipe2.png';
MAP_TILE[41] = 'pipe3.png';
MAP_TILE[42] = 'pipe4.png';
MAP_TILE[49] = 'mountain1.png';
MAP_TILE[50] = 'bush1.png';

function draw_map() {
    const map_scroll = floor(scroll);
    const scroll_frac = scroll - map_scroll;
    let offset = new Vec(0, 0);

    for (let x = -5; x < mapW + 1; x++) {
        for (let y = 0; y < mapH; y++) {
            offset.x = 0;
            offset.y = 0;
            const xx = Math.max(0, x + map_scroll);
            const img = MAP_TILE[map[xx][y]];


            if (player.block) {
                if (player.block.x == xx && player.block.y == y && player.block_time > 0) {
                    player.block_time -= 1;
                    offset.y = -Math.sin((player.block_time / BRICK_SHAKE_TIME) * Math.PI) * 5;
                    if (player.block_time <= 0) {
                        player.block = null;
                    }
                }
            }

            if (img) {
                draw(img,
                    floor((x - scroll_frac) * TILE + offset.x),
                    floor(y * TILE + offset.y));
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

    new_sprite('a', { 'count': { frames: ['enemy_a1.png', 'enemy_a2.png'], fps: 2 } }, 0.5, 1);
    new_sprite('b', { 'count': { frames: ['enemy_b1.png', 'enemy_b2.png'], fps: 2 } }, 0.5, 1);
    new_sprite('run', { 'count': { frames: ['pepe_run1.png', 'pepe_run2.png', 'pepe_run3.png'], fps: 0.3 } });
    new_sprite('block_q', { 'count': { frames: ['block_q1.png', 'block_q2.png', 'block_q3.png', 'block_q2.png', 'block_q1.png', 'block_q1.png'], fps: 7 } });
    new_sprite('block_break', { 'count': { frames: ['block_break1.png', 'block_break2.png'], fps: 10 } }, 0.5, 0.5);
    new_sprite('coin', { 'count': { frames: ['coin1.png', 'coin2.png', 'coin3.png', 'coin2.png'], fps: 10 } }, 0.5, 1);

    restart();
    gameover_msg = "PEPE";
    gameover = true;
    gameover_t = -10;
}

const PLAYER_ACCEL = 13;
const PLAYER_DRAG = 0.93;
const PLAYER_MAX_HSPEED = 1333.0;
const PLAYER_MAX_VSPEED = 1333.0;
const PLAYER_JUMP_SPEED = 266.0;
const MEGAJUMP_FRAME_CHECK = 11;
const GRAVITY = 1200;

const GOOMBA_SPEED = 10.0;
const BRICK_SHAKE_TIME = 8;

let player, enemies, extras;


function restart() {

    load_map("map1-1.png");


    gameover = false;
    gameover_t = 0;
    game_speed = 1;
    gameover_msg = "GAME OVER";

    player = {
        pos: new Vec(110, 150),
        speed: new Vec(0, 0),
        on_air: false,
        look_right: true,
        jump_frame: 0,
        block: null,
        block_time: 0,
        points: 0,
        wants_to_pick: false,
        inventory: null,
    };

    extras = [];
    enemies = [];
    for (let i = 0; i < map_items.length; i++) {
        const item = map_items[i];
        switch (item.type) {
            case 'enemy':
                enemies.push({
                    type: item.subtype,
                    pos: item.pos,
                    speed: -GOOMBA_SPEED,
                    alive: true,
                    life: 3,
                });
                break;
        }

    }
}

function add_extra(type, x, y, sx, sy, life) {
    extras.push({
        type: type,
        orig_pos: new Vec(x, y),
        pos: new Vec(x, y),
        speed: new Vec(sx, sy),
        life: life,
        time: 0,
    });
}

function keydown(key) {
    if (key == ' ') {
        if (player.inventory) {
            const dir = player.look_right ? 1 : -1;
            add_extra(player.inventory, player.pos.x, player.pos.y - TILE, dir * 100 + player.speed.x, player.speed.y - 100);
            sounds['pickup'].play();
            player.inventory = null;
        } else {
            player.wants_to_pick = true;
        }
    }
}


function hit_block(block) {
    let kind = map[block.x][block.y];
    if (is_coin(kind)) {
        player.block = block;
        player.block_time = BRICK_SHAKE_TIME;
        player.points += 50;
        add_extra('coin', block.x * TILE, block.y * TILE, Math.random() * 300 - 150, -(200 + Math.random() * 100));
        map[block.x][block.y] = 99;
        sounds['coin_pick'].play();
        sounds['tump'].play();
    } else if (is_mushroom(kind)) {
        player.block = block;
        player.block_time = BRICK_SHAKE_TIME;
        add_extra('mushroom.png', block.x * TILE, block.y * TILE, 0, -10);
        map[block.x][block.y] = 99;
        sounds['tump'].play();
        sounds['mushroom'].play();

    } else if (is_hitable(kind)) {
        // for (let i = 0; i < 4; i++) {
        //     add_extra('block_break', block.x * TILE, block.y * TILE, Math.random() * 300 - 150, -(100 + Math.random() * 300));
        // }
        // map[block.x][block.y] = 6;
        player.block = block;
        player.block_time = BRICK_SHAKE_TIME;
        sounds['tump'].play();
        player.points += 50;
    }


}

function update_player(dt) {
    let hit_bottom_left = get_map_at(new Vec(player.pos.x - TILE2 - 1, player.pos.y - 1));
    let hit_bottom_right = get_map_at(new Vec(player.pos.x + TILE2 + 1, player.pos.y - 1));

    if (keys['ArrowUp'] && !player.on_air) {
        player.on_air = true;
        player.speed.y = -PLAYER_JUMP_SPEED;
        player.jump_frame = 0;
        sounds['jump'].play();

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

    player.pos.x += player.speed.x * dt;
    player.pos.y += player.speed.y * dt;

    player.pos.x = clamp(player.pos.x, TILE2 + 1, map_size.x * TILE - TILE2 - 1);

    const hit_corner_bottom_left = get_map_at(new Vec(player.pos.x - TILE2 + 3, player.pos.y));
    const hit_corner_bottom_right = get_map_at(new Vec(player.pos.x + TILE2 - 3, player.pos.y));
    const hit_corner_top_left = get_map_at(new Vec(player.pos.x - TILE2 + 3, player.pos.y - TILE));
    const hit_corner_top_right = get_map_at(new Vec(player.pos.x + TILE2 - 3, player.pos.y - TILE));
    const hit_top_left = get_map_at(new Vec(player.pos.x - TILE2 + 3, player.pos.y - TILE + 4));
    const hit_top_right = get_map_at(new Vec(player.pos.x + TILE2 - 3, player.pos.y - TILE + 4));
    hit_bottom_right = get_map_at(new Vec(player.pos.x + TILE2 + 3, player.pos.y - 4));
    hit_bottom_left = get_map_at(new Vec(player.pos.x - TILE2 - 3, player.pos.y - 4));


    if (player.pos.y >= H || (is_sky(hit_corner_bottom_left) && is_sky(hit_corner_bottom_right))) {
        player.on_air = true;
    } else if (player.speed.y > 0) {
        // player.pos.y -= player.speed.y;
        player.pos.y = floor(player.pos.y / TILE) * TILE;
        player.speed.y = 0;
        player.on_air = false;
    }

    if (player.speed.y < 0) {

        if (!is_sky(hit_corner_top_left) || !is_sky(hit_corner_top_right)) {
            player.speed.y = 33;
            let block;

            if (is_hitable(hit_corner_top_left)) {
                block = new Vec(player.pos.x - TILE2, player.pos.y - TILE).div(TILE).floor();
            } else if (is_hitable(hit_corner_top_right)) {
                block = new Vec(player.pos.x + TILE2, player.pos.y - TILE).div(TILE).floor();
            }
            if (block && (!player.block || !player.block.equals_to(block))) {
                hit_block(block);
            }
        }
    }

    if (player.on_air) {
        player.jump_frame++;
        if (player.speed.y < 0) {
            const megajump = player.jump_frame < MEGAJUMP_FRAME_CHECK && keys['ArrowUp'];
            if (!megajump) {
                player.speed.y += GRAVITY * dt;
            }
        } else {
            player.speed.y += GRAVITY * dt;
        }
    }

    if (!is_sky(hit_bottom_left) || !is_sky(hit_top_left)) {
        player.pos.x -= player.speed.x * dt;
        player.speed.x = 0;
    }
    if (!is_sky(hit_bottom_right) || !is_sky(hit_top_right)) {
        player.pos.x -= player.speed.x * dt;
        player.speed.x = 0;
    }


    // player.pos.y = clamp(player.pos.y, 0, 192);

    player.speed.x *= PLAYER_DRAG;
}


function draw_player(dt) {
    const x = floor(player.pos.x - scroll * TILE - TILE2);
    const y = floor(player.pos.y - TILE + 1);

    const flip = !player.look_right;


    if (gameover) {
        draw('pepe_dead.png', x, y);
        return;
    }

    if (player.on_air) {
        draw('pepe_jump.png', x, y, flip);
    } else {
        if (Math.abs(player.speed.x) < 0.1) {
            draw('pepe.png', x, y, flip);
        } else {
            draw('run', x, y, flip);
            update_sprite('run', Math.abs(player.speed.x * dt));
        }
    }

    if (player.inventory) {
        const offset_y = player.inventory.indexOf('.png') == -1 ? TILE2 : -TILE2;
        draw(player.inventory, x + (flip ? 0 : TILE), y + offset_y);
    }
}

function pick(spr) {
    player.inventory = spr.type;
    sounds['pickup'].play();
}


function update_enemies(t, dt) {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (!enemy.alive) continue;

        enemy.pos.x += enemy.speed * enemy.life * dt;

        if (enemy.pos.y >= H) {
            enemy.pos.y += 1;
        } else {
            const hit_left = get_map_at(new Vec(enemy.pos.x - TILE2 + 1, enemy.pos.y - TILE2));
            const hit_right = get_map_at(new Vec(enemy.pos.x + TILE2 - 1, enemy.pos.y - TILE2));
            const hit_bottom_left = get_map_at(new Vec(enemy.pos.x - TILE2 + 1, enemy.pos.y));
            const hit_bottom_right = get_map_at(new Vec(enemy.pos.x + TILE2 - 1, enemy.pos.y));

            if (!is_sky(hit_left) || !is_sky(hit_right) || enemy.pos.x < TILE2 + 1) {
                enemy.speed *= -1;
                enemy.pos.x += enemy.speed * dt;
            }

            if (is_sky(hit_bottom_left) && is_sky(hit_bottom_right)) {
                enemy.pos.y += 66 * dt;
            }

            // check player
            const distance = enemy.pos.distance(player.pos);
            if (distance < TILE * 1.2) {
                if (abs(enemy.pos.y - player.pos.y) > abs(enemy.pos.x - player.pos.x)) {
                    enemy.alive = false;
                    player.speed.y = -PLAYER_JUMP_SPEED * 0.75;
                } else {
                    if (distance < TILE * 0.8)
                        gameover = true;
                    gameover_t = t;
                }
            }

            if (check_inside_screen(enemy.pos.x - scroll * TILE, enemy.pos.y)) {
                enemy.life -= dt * 0.1;
                if (enemy.life < 1) {
                    enemy.alive = false;
                }
            }

            for (let e = 0; e < extras.length; e++) {
                const extra = extras[e];
                const distance = enemy.pos.distance(extra.pos);
                if (distance < TILE) {
                    player.points += 200;
                    enemy.life++;
                    add_extra('heart.png', enemy.pos.x - TILE2, enemy.pos.y - TILE * 1.5, 0, -50, 1);
                    sounds['coin_pick'].play();
                    extras.splice(e, 1);
                    break;
                }
            }


        }
        if (enemy.pos.y > H + 30) {
            enemy.alive = false;
        }

    }
}

function check_inside_screen(x, y) {
    return x > -TILE && x < W + TILE && y < H + TILE * 2;
}

function draw_enemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];

        const x = floor(enemy.pos.x - scroll * TILE);
        const y = floor(enemy.pos.y);
        if (check_inside_screen(x, y)) {
            if (enemy.alive) {
                draw(enemy.type, x, y, enemy.speed > 0);
                if (enemy.type == 'a') {
                    const life = Math.min(3, floor(enemy.life));
                    draw('enemy_' + enemy.type + '_life' + life + '.png', x - TILE2, y - TILE);
                }
            } else {
                draw('enemy_' + enemy.type + '_dead.png', x - TILE2, y - TILE);
            }
        }
    }
}


function update_extras(t, dt) {
    let remove = [];
    for (let i = 0; i < extras.length; i++) {
        let remove_me = false;
        const spr = extras[i];
        spr.pos.x += spr.speed.x * dt;
        spr.pos.y += spr.speed.y * dt;
        if (spr.type != 'heart.png' && spr.type != 'mushroom.png' && spr.type != 'mushroom2.png') {
            spr.speed.y += GRAVITY * dt;
        }
        if (spr.type == 'coin') {
            if (spr.speed.y != 0 && (!is_sky(get_map_at(spr.pos)) || !is_sky(get_map_at(new Vec(spr.pos.x, spr.pos.y - TILE))))) {
                spr.speed.y *= -0.5;
                spr.pos.y += spr.speed.y * dt;
                spr.speed.x *= 0.5;
                if (spr.speed.y > -10) {
                    spr.speed.set(0, 0);
                }
            }

        }
        if (spr.type == 'mushroom2.png') {
            const hit_left = get_map_at(new Vec(spr.pos.x + 1, spr.pos.y + TILE2));
            const hit_right = get_map_at(new Vec(spr.pos.x + TILE - 1, spr.pos.y + TILE2));
            const hit_bottom_left = get_map_at(new Vec(spr.pos.x + 1, spr.pos.y + TILE));
            const hit_bottom_right = get_map_at(new Vec(spr.pos.x + TILE - 1, spr.pos.y + TILE));

            if (!is_sky(hit_left) || !is_sky(hit_right) || spr.pos.x < 1) {
                spr.speed.x *= -1;
                spr.pos.x += spr.speed.x * dt;
            }

            if (is_sky(hit_bottom_left) && is_sky(hit_bottom_right)) {
                spr.pos.y += 100 * dt;
            }
        }

        if (spr.type == 'coin' || spr.type == 'mushroom2.png') {
            const distance = spr.pos.distance(player.pos);
            if (distance < TILE && player.wants_to_pick) {
                pick(spr);
                remove_me = true;
            }
        }

        spr.time += dt;

        if (spr.type == 'mushroom.png' && spr.time > 1.75) {
            remove_me = true;
            add_extra('mushroom2.png', spr.pos.x, spr.pos.y, 50, 0);
        }

        if (spr.life !== undefined) {
            spr.life -= dt;
            if (spr.life < 0) {
                remove_me = true;
            }
        }

        if (remove_me || spr.pos.y > H) {
            remove.push(i);
        }
    }

    // clean
    for (let i = 0; i < remove.length; i++) {
        extras.splice(remove[i], 1);
    }
}

function draw_extras() {
    for (let i = 0; i < extras.length; i++) {
        const spr = extras[i];
        const x = floor(spr.pos.x - scroll * TILE);
        const y = floor(spr.pos.y);
        const ox = floor(spr.orig_pos.x - scroll * TILE);
        const oy = floor(spr.orig_pos.y);

        if (check_inside_screen(x, y)) {
            draw(spr.type, x, y);
            if (spr.type == 'mushroom.png') {
                draw('block_q_dead.png', ox, oy);
            }
        }
    }
}

function loop(t, dt) {
    dt = dt * game_speed;

    if (gameover) {
        return loop_gameover(t, dt);
    }

    canvas.fill_rect(0, 0, W, H, 6);

    update_sprite('a', dt);
    update_sprite('b', dt);
    update_sprite('block_break', dt);
    update_sprite('block_q', dt);
    update_sprite('coin', dt);

    update_enemies(t, dt);
    update_extras(t, dt);
    update_player(dt);

    if (player.pos.x > 120) {
        scroll = (player.pos.x - 120) / TILE;
    } else {
        scroll = 0;
    }

    draw_map();
    draw_enemies();
    draw_extras();
    draw_player(dt);

    if (player.pos.y > H + 30) {
        gameover = true;
    }

    // debug
    // canvas.draw_image("map1-1.png", 0, 0);
    // canvas.pset(floor((player.pos.x - scroll) / TILE), floor(player.pos.y / TILE) - 1, 23)
    // canvas.draw_rect(20, 30, 0, 5, 0);
    // canvas.draw_rect(20, 31, floor(player.speed.x) * 2, 3, 0);

    if (t < 1.5) {
        canvas.draw_text("WORLD 1 - 1", W / 2 - 30, H / 2, 2);
    }

    canvas.draw_text("PEPE", 60, 20, 2, 'right');
    canvas.draw_text(player.points, 60, 30, 2, 'right');
    canvas.draw_text("TIME", W - 30, 20, 2, 'right');
    canvas.draw_text(300 - floor(t), W - 30, 30, 2, 'right');

    if (floor(t) >= 300) {
        gameover = true;
        gameover_msg = "TIME OUT!";
    }

    if (abs(mouse.wheel) > 1) {
        game_speed -= mouse.wheel / 2000;
        game_speed = clamp(game_speed, -3, 3);
    }
    if (game_speed != 1) {
        canvas.draw_text("x" + floor(game_speed * 10) / 10, 5, 10, 24);
    }

    if (mouse.left && mouse.prevx) {
        canvas.draw_line(mouse.prevx, mouse.prevy, mouse.x, mouse.y, 6);
    }

    player.wants_to_pick = false;

}


function loop_gameover(t, dt) {
    if (t - gameover_t > 1) {
        canvas.fill_rect(0, 0, W, H, 0);
        canvas.draw_text(gameover_msg, W / 2, H / 2, 2, 'center');
        canvas.draw_text("- CLICK TO RESTART- ", W / 2, H / 2 + 20, 2, 'center');
        if (mouse.just_left) {
            sounds['click'].play();
            restart();
        }
    }
}
