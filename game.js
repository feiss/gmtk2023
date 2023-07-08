// Diego F. Goberna - http://diegofg.com - GMTK 2023

function preload() {
    return [
        "map1-1.png",
        "block_a.png",
        "block_b.png",
        "block_c.png",
        "block_q.png",
        "enemy_a.png",
        "enemy_b.png",
    ];
}

let map;

const is_sky = idx => idx == 6;
const is_floor = idx => idx == 32 || idx == 4;
const is_breakable = idx => idx == 36;

function loading(progress) {
    canvas.fill_rect(10, H / 2, floor(progress * (W - 20)), 1, 3);
}

function load_map(map) {
    let img = assets[map];
    let c = new Canvas(img.width, img.height);
    c.draw_image(map, 0, 0);
    map = new Array(img.width);
    for (let x = 0; x < img.width; x++) {
        let col = new Array(img.height);
        for (let y = 0; y < img.height; y++) {
            col[y] = c.pget(x, y);
        }
        map[x] = col;
    }

    console.log(map);
}


function start() {
    set_palette([
        '#000000', '#fcfcfc', '#f8f8f8', '#bcbcbc', '#7c7c7c', '#a4e4fc', '#3cbcfc', '#0078f8', '#0000fc', '#b8b8f8', '#6888fc', '#0058f8', '#0000bc', '#d8b8f8', '#9878f8', '#6844fc', '#4428bc', '#f8b8f8', '#f878f8', '#d800cc', '#940084', '#f8a4c0', '#f85898', '#e40058', '#a80020', '#f0d0b0', '#f87858', '#f83800', '#a81000', '#fce0a8', '#fca044', '#e45c10', '#881400', '#f8d878', '#f8b800', '#ac7c00', '#503000', '#d8f878', '#b8f818', '#00b800', '#007800', '#b8f8b8', '#58d854', '#00a800', '#006800', '#b8f8d8', '#58f898', '#00a844', '#005800', '#00fcfc', '#00e8d8', '#008888', '#004058', '#f8d8f8', '#787878',
    ]);
    load_map("map1-1.png");
    // new_sprite('sonic', {
    //     'count': { frames: ['sonic0.png', 'sonic1.png', 'sonic2.png', 'sonic3.png'], fps: 10 },
    // }, 0.5, 0.5);

    canvas.fill_rect(0, 0, W, H, 0);
}

function loop(t, dt) {
    canvas.fill_rect(0, 0, W, H, 0);
    if (mouse.left && mouse.prevx) {
        canvas.draw_line(mouse.prevx, mouse.prevy, mouse.x, mouse.y, 6);
    }
}