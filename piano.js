/*global Note, nameToCode*/

var PianoKey = function(ctx, x, y, w, h, note) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.note = note;
    this.pressed = false;
    this.keyColor = 'white';
    this._clickCalls = [];
    this.ctx.canvas.addEventListener('click', this._clickCall.bind(this));
};

PianoKey.prototype.draw = function() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.clearRect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);

    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = this.pressed ? 'yellow' : this.keyColor;
    this.ctx.rect(this.x, this.y, this.w, this.h);
    this.ctx.stroke();
    this.ctx.fill();

    this.ctx.restore();
};

PianoKey.prototype.click = function(callback) {
    this._clickCalls.push(callback);
};

PianoKey.prototype._clickCall = function(e) {
    if (this._isInside(e)) {
        this._clickCalls.forEach(function(callback) {
            callback.call(this);
        }, this);
    }
};

PianoKey.prototype._isInside = function(e) {
    if (e.offsetX >= this.x && e.offsetX <= this.x + this.w &&
        e.offsetY >= this.y && e.offsetY <= this.y + this.h) {
        return true;
    }
    return false;
};

var Piano = function(ctx, x, y, w, h) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.keys = this._createKeys();
    this.pressedKeys = new HashSet(function(note) {
        return note.name;
    });
    this._clickCalls = [];
    this._setUpClicks();
};

Piano.prototype.update = function(x, y) {
    this.keys.forEach(function(key) {
        key.x += (x - this.x);
        key.y += (y - this.y);
        key.toDraw = true;
        key.pressed = false;
    }, this);
    this.x = x;
    this.y = y;
    this.pressedKeys = new HashSet(function(note) {
        return note.name;
    });
};

Piano.prototype._createKeys = function() {
    var pianoKeys = [];

    var keyWidth = this.w / 7;
    var wKeyHeight = this.h * 0.55;
    var bKeyHeight = this.h * 0.45;

    var xMult = 0;
    var x, y, note, b;
    var C4 = nameToCode('C', 4);
    for (var i = 0; i < 12; i++) {
        if ([1, 3, 6, 8, 10].indexOf(i) !== -1) {
            x = this.x + xMult * 1.1 * keyWidth - keyWidth / 2;
            y = this.y;
            note = new Note(C4 + i);
            b = new PianoKey(this.ctx, x, y, keyWidth, bKeyHeight, note);
            b.keyColor = 'black';
        } else {
            x = this.x + xMult * 1.1 * keyWidth;
            y = this.y + bKeyHeight + 0.1 * keyWidth;
            note = new Note(C4 + i);
            b = new PianoKey(this.ctx, x, y, keyWidth, wKeyHeight, note);
            xMult++;
        }
        b.toDraw = true;
        pianoKeys.push(b);
    }
    return pianoKeys;
};

Piano.prototype._setUpClicks = function() {
    this.keys.forEach(function(key) {
        var self = this;
        key.click(function() {
            if (this.pressed) {
                self.pressedKeys.remove(this.note);
                this.pressed = false;
            } else {
                self.pressedKeys.add(this.note);
                this.pressed = true;
            }
            this.toDraw = true;
            self._clickCall(this);
        });
    }, this);
};

Piano.prototype._clickCall = function(pianoKey) {
    this._clickCalls.forEach(function(callback) {
        callback.call(this, pianoKey);
    }, this);
};

Piano.prototype.draw = function() {
    this.keys.forEach(function(key) {
        if (key.toDraw) {
            key.draw();
            key.toDraw = false;
        }
    });
};

Piano.prototype.release = function() {
    this.keys.forEach(function(key) {
        if (key.pressed) {
            key.toDraw = true;
        }
        key.pressed = false;
    });
    this.pressedKeys = new HashSet(function(note) {
        return note.name;
    });
};

Piano.prototype.click = function(callback) {
    this._clickCalls.push(callback);
};
