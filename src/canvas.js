// Diego F. Goberna - http://diegofg.com - GMTK 2023

let palette, palette_rgb, palette_rgb_index;

function set_palette(pal) {
    palette = pal;
    palette_rgb = [];
    palette_rgb_index = [];
    for (const col of pal) {
        const rgb = __hex2rgb(col);
        palette_rgb.push(rgb);
        palette_rgb_index.push(rgb[0] + ',' + rgb[1] + ',' + rgb[2]);
    }
}

class Canvas {
    constructor(w, h, scale, parent) {
        this.width = w;
        this.height = h;
        this.scale = scale;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = (this.width * this.scale) + 'px';
        this.canvas.style.height = (this.height * this.scale) + 'px';

        this.offcanvas = new OffscreenCanvas(this.width, this.height);

        this.canvas_ctx = this.canvas.getContext('2d', {
            antialias: false,
            alpha: false,
            preserveDrawingBuffer: true,
        });
        this.canvas_ctx.imageSmoothingEnabled = false;
        this.ctx = this.offcanvas.getContext('2d', {
            antialias: false,
            alpha: false,
            willReadFrequently: true,
            preserveDrawingBuffer: true,
        });
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.willReadFrequently = true;

        this.ctx.font = '8px pixelfont';
        if (parent) {
            parent.appendChild(this.canvas);
        } else {
            document.body.appendChild(this.canvas);
        }
    }

    destroy() {
        this.canvas.parentElement.removeChild(this.canvas);
    }

    render() {
        this.canvas_ctx.drawImage(this.offcanvas, 0, 0);
    }

    fill_rect(x, y, w, h, color) {
        this.ctx.fillStyle = palette[color];
        this.ctx.fillRect(x, y, w, h);
    }

    draw_rect(x, y, w, h, color) {
        this.ctx.strokeStyle = palette[color];
        this.ctx.strokeRect(x + 0.5, y + 0.5, w, h);
    }

    draw_text(text, x, y, color, align) {
        this.ctx.fillStyle = palette[color];
        this.ctx.textAlign = align || 'left';
        this.ctx.fillText(text, floor(x), floor(y));
    }

    draw_circle(x, y, r, color) {
        this.ctx.fillStyle = palette[color];
        const incr = 1 / r;
        for (let a = incr; a < Math.PI * 2; a += incr) {
            this.ctx.fillRect(floor(x + Math.cos(a) * r), floor(y + Math.sin(a) * r), 1, 1);
        }
    }

    fill_circle(cx, cy, r, color) {
        this.ctx.fillStyle = palette[color];
        let error = -r;
        let x = r;
        let y = 0;
        let self = this;

        function __scanline(cx, cy, x, y) {
            self.fill_rect(cx - x, cy + y, x * 2, 1);
            if (y != 0) {
                self.fill_rect(cx - x, cy - y, x * 2, 1);
            }
        }

        while (x >= y) {
            let lastY = y;
            error += y;
            ++y;
            error += y;
            __scanline(cx, cy, x, lastY);
            if (error >= 0) {
                if (x != lastY)
                    __scanline(cx, cy, lastY, x);
                error -= x;
                --x;
                error -= x;
            }
        }
    }

    draw_image(img, x, y, flip) {
        let asset = typeof img === 'string' ? assets[img] : img;
        if (asset === undefined) {
            console.warn("No image found: ", img);
            return;
        }
        if (flip === true) {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(asset, -x - asset.width, y);
            this.ctx.scale(-1, 1);
        }
        else {
            this.ctx.drawImage(asset, x, y);
        }
    }

    draw_sprite(name, x, y, flip) {
        const spr = sprites[name];
        if (x === undefined) {
            x = spr.x;
            y = spr.y;
        }
        this.draw_image(assets[spr.animations[spr.animation].frames[spr.frame]], x - spr.anchor_x, y - spr.anchor_y, flip);
    }


    pset(x, y, color) {
        this.ctx.fillStyle = palette[color];
        this.ctx.fillRect(x, y, 1, 1);
    }

    pget(x, y) {
        const pixel = this.ctx.getImageData(x, y, 1, 1).data;
        const index_key = pixel[0] + ',' + pixel[1] + ',' + pixel[2];
        const index = palette_rgb_index.indexOf(index_key);
        if (index == -1) {
            console.warn("not found palette index of color " + index_key);
            return 0;
        }
        return index;
    }

    draw_line(x1, y1, x2, y2, color) {
        this.ctx.fillStyle = palette[color];
        let tmp;
        let steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
        if (steep) {
            tmp = x1;
            x1 = y1;
            y1 = tmp;
            tmp = x2;
            x2 = y2;
            y2 = tmp;
        }

        let sign = 1;
        if (x1 > x2) {
            sign = -1;
            x1 *= -1;
            x2 *= -1;
        }

        let dx = x2 - x1;
        let dy = Math.abs(y2 - y1);
        let err = ((dx / 2));
        let ystep = y1 < y2 ? 1 : -1;
        let y = y1;

        for (let x = x1; x <= x2; x++) {
            if (!(steep ? this.ctx.fillRect(y, sign * x, 1, 1) : this.ctx.fillRect(sign * x, y, 1, 1)));
            err = (err - dy);
            if (err < 0) {
                y += ystep;
                err += dx;
            }
        }
    }
}
