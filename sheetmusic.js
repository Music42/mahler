/*global randomNote, accidentals*/

var SheetMusic = function(options) {
    this.update(options);
};

SheetMusic.prototype.update = function(options) {
    this.ctx = options.ctx;
    this.key = options.key;
    this.withTreble = options.withTreble;
    this.withBass = options.withBass;
    this.index = 0;
    this.trebleBars = new Queue();
    this.bassBars = new Queue();
    var i;
    if (this.withTreble) {
        for (i = 0; i < 4; i++) {
            this.trebleBars.enqueue(this.generateNotes(4, 'g'));
        }
    }
    if (this.withBass) {
        for (i = 0; i < 4; i++) {
            this.bassBars.enqueue(this.generateNotes(4, 'f'));
        }
    }
};

SheetMusic.prototype.nextNotes = function() {
    var notes = [];
    if (this.withTreble) {
        notes.push(this.trebleBars.peek()[this.index]);
    }
    if (this.withBass) {
        notes.push(this.bassBars.peek()[this.index]);
    }
    return notes;
};

SheetMusic.prototype.consumeNotes = function() {
    this.index++;
    if (this.index >= 4) {
        this.index = 0;
        if (this.withTreble) {
            this.trebleBars.dequeue();
            this.trebleBars.enqueue(this.generateNotes(4, 'g'));
        }
        if (this.withBass) {
            this.bassBars.dequeue();
            this.bassBars.enqueue(this.generateNotes(4, 'f'));
        }
    }
};

SheetMusic.prototype.generateNotes = function(n, clef) {
    var notes = [];
    for (var i = 0; i < n; ++i) {
        notes.push(randomNote(clef, this.key));
    }
    return notes;
};

SheetMusic.prototype.nOfClefs = function() {
    return (this.withBass && this.withTreble) ? 2 : 1;
};

SheetMusic.prototype.height = function() {
    return this.nOfClefs() * 135;
};

SheetMusic.prototype.keySigWidth = function() {
    return 70 + accidentals(this.key) * 12;
};

SheetMusic.prototype._drawBars = function(vexCtx) {
    var clefBars = [];
    if (!this.trebleBars.empty()) {
        clefBars.push(this.trebleBars);
    }
    if (!this.bassBars.empty()) {
        clefBars.push(this.bassBars);
    }
    var shift = this.index * 45;
    for (var clefIndex = 0; clefIndex < clefBars.length; ++clefIndex) {
        var i = 0;
        clefBars[clefIndex].forEach(function(bar) {
            var staveMeasure = new Vex.Flow.Stave(this.keySigWidth() - shift + 200 * i, clefIndex * 125 + 10, 200, {
                fill_style: 'black'
            });
            staveMeasure.setContext(vexCtx).draw();
            var notesMeasure = bar.map(function(item) {
                return item.toVexNote();
            });
            Vex.Flow.Formatter.FormatAndDraw(vexCtx, staveMeasure, notesMeasure);
            ++i;
        }, this);
    }
};

SheetMusic.prototype._drawKeySig = function(vexCtx) {
    vexCtx.save();
    vexCtx.fillStyle = 'white';
    vexCtx.fillRect(0, 0, this.keySigWidth(), 250);
    vexCtx.restore();

    var cleffs = [this.withTreble, this.withBass];
    var clefIndex = 0;
    for (var i = 0; i < cleffs.length; ++i) {
        if (cleffs[i]) {
            var staveMeasure = new Vex.Flow.Stave(0, clefIndex * 125 + 10, this.keySigWidth(), {
                fill_style: 'black'
            });
            var cleffName = i === 0 ? 'treble' : 'bass';
            staveMeasure.addClef(cleffName).addKeySignature(this.key).addTimeSignature('4/4');
            vexCtx.save();
            staveMeasure.setContext(vexCtx).draw();
            vexCtx.restore();
            ++clefIndex;
        }
    }
};

SheetMusic.prototype._drawIndicator = function(vexCtx, color) {
    vexCtx.save();
    vexCtx.globalAlpha = 0.25;
    vexCtx.fillStyle = color || '#FFE795';
    vexCtx.fillRect(this.keySigWidth(), 0, 50, this.height());
    vexCtx.restore();
};

SheetMusic.prototype.draw = function(indicatorColor) {
    var renderer = new Vex.Flow.Renderer(this.ctx.canvas, Vex.Flow.Renderer.Backends.CANVAS);
    var ctx = renderer.getContext();

    ctx.beginPath();
    ctx.clearRect(0, 0, this.ctx.canvas.width, this.height());

    this._drawBars(ctx);
    this._drawKeySig(ctx);
    this._drawIndicator(ctx, indicatorColor);
};
