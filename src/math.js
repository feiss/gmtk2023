// Diego F. Goberna - http://diegofg.com - GMTK 2023

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function angle(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.atan2(dy, dx);
}

function clamp(v, min, max) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    static from_angle(a, m) {
        return new Vec(cos(a) * m, sin(a) * m);
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    equals_to(v) {
        if (!v) return false;
        return v.x == this.x && v.y == this.y;
    }

    clone() {
        return new Vec(this.x, this.y);
    }

    add(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    }

    sub(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    }

    mul(v) {
        this.x *= v;
        this.y *= v;
        return this;
    }

    div(v) {
        if (v !== 0) {
            this.x /= v;
            this.y /= v;
            return this;
        } else {
            throw new Error("Zero division");
        }
    }

    floor() {
        this.x = floor(this.x);
        this.y = floor(this.y);
        return this;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // clamp(min, max) {
    //     const m = this.length();
    //     if (m < min) {
    //         this.normalize().mul(min);
    //     } else if (m > max) {
    //         this.normalize().mul(max);
    //     }
    // }

    distance(p) {
        const dx = p.x - this.x;
        const dy = p.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    angle(p) {
        if (p === undefined) {
            return Math.atan2(this.y, this.x);
        } else {
            const dx = p.x - this.x;
            const dy = p.y - this.y;
            return Math.atan2(dy, dx);
        }
    }

    dot(p) {
        return this.x * p.x + this.y * p.y;
    }

    cross(p) {
        return this.x * p.y - this.y * p.x;
    }

    lerp(p, t) {
        const x = this.x + (p.x - this.x) * t;
        const y = this.y + (p.y - this.y) * t;
        return new Vec(x, y);
    }

    normalize() {
        const m = this.length();
        if (m !== 0) {
            this.x /= m;
            this.y /= m;
        }
        return this;
    }

    toString() {
        return this.x + "," + this.y;
    }
}


class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        return this;
    }
    hit_test(p) {
        return p.x >= this.x && p.x < this.x + this.w && p.y >= this.y && p.y < this.y + this.h;
    }

    hit_test(rect) {
        return !(
            rect.x + rect.w < this.x ||
            rect.x >= this.x + this.w ||
            rect.y + rect.h < this.y ||
            rect.y >= this.y + this.h
        )
    }
}