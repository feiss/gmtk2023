// Diego F. Goberna - http://diegofg.com - GMTK 2023

function preload() {
    return [
        "1.png",
        "2.png",
        "3.png",
    ];
}

function start() {
    set_palette([
        '#0d2b45',
        '#112f4a',
        // '#203c56',
        '#544e68',
        '#8d697a',
        '#d08159',
        '#ffaa5e',
        // '#ffd4a3',
        '#3cf',
        '#ffecd6',
    ]);
    // new_sprite('sonic', {
    //     'count': { frames: ['sonic0.png', 'sonic1.png', 'sonic2.png', 'sonic3.png'], fps: 10 },
    // }, 0.5, 0.5);

    canvas.fill_rect(0, 0, W, H, 0);
}

function loading(progress) {
    console.log(progress);
    canvas.fill_rect(10, H / 2, floor(progress * (W - 20)), 1, 3);
}

function loop(t, dt) {
    canvas.fill_rect(0, 0, W, H, 0);
    if (mouse.left && mouse.prevx) {
        canvas.draw_line(mouse.prevx, mouse.prevy, mouse.x, mouse.y, 6);
    }
}