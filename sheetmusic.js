/*global randomNote, randomChord, Note, Chord, accidentals*/

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
    this.mode = options.mode;
    this._initializeBars();
};

SheetMusic.prototype._createBar = function(clef) {
    var bar;
    if (this.mode === 'NOTES') {
        bar = this._generateNotes(4, clef);
    }
    if (this.mode === 'CHORDS') {
        bar = this._generateChords(4, clef);
    }
    if (this.mode === 'MELODY') {
        if (clef === 'g') {
            bar = this._generateNotes(4, clef);
        }
        if (clef === 'f') {
            var howMany = Math.random() < 0.4 ? 2 : 1;
            var oct = Math.random() < 0.5;
            var whatType = oct ? this._generateOctaves : this._generateChords;
            bar = whatType.call(this, howMany, clef, howMany.toString());
        }
    }
    return bar;
};

SheetMusic.prototype._initializeBars = function() {
    var i;
    if (this.withTreble) {
        for (i = 0; i < 4; i++) {
            this.trebleBars.enqueue(this._createBar('g'));
        }
    }
    if (this.withBass) {
        for (i = 0; i < 4; i++) {
            this.bassBars.enqueue(this._createBar('f'));
        }
    }
};

SheetMusic.prototype.nextNotes = function() {
    var notes = [];
    if (this.withTreble) {
        this.trebleBars.peek()[this.index].toNoteList().forEach(function(n) {
            notes.push(n);
        });
    }
    if (this.withBass) {
        this.bassBars.peek()[this.index].toNoteList().forEach(function(n) {
            notes.push(n);
        });
    }
    return notes;
};

SheetMusic.prototype.consumeNotes = function() {
    this.index++;
    if (this.index >= 4) {
        this.index = 0;
        if (this.withTreble) {
            this.trebleBars.dequeue();
            this.trebleBars.enqueue(this._createBar('g'));
        }
        if (this.withBass) {
            this.bassBars.dequeue();
            this.bassBars.enqueue(this._createBar('f'));
        }
    }
};

SheetMusic.prototype._generateNotes = function(n, clef) {
    var notes = [];
    for (var i = 0; i < n; ++i) {
        notes.push(randomNote(clef, this.key));
    }
    return notes;
};

SheetMusic.prototype._generateChords = function(n, clef, duration) {
    var chords = [];
    for (var i = 0; i < n; ++i) {
        chords.push(randomChord(clef, this.key, duration));
    }
    return chords;
};

SheetMusic.prototype._generateOctaves = function(n, clef, duration) {
    var octaves = [];
    for (var i = 0; i < n; ++i) {
        var first = randomNote(clef, this.key);
        var curCode = first.code,
            nextCode;
        if (clef === 'f') {
            nextCode = curCode + 12 < 58 ? curCode + 12 : curCode - 12;
        }
        if (clef === 'g') {
            nextCode = curCode - 12 > 59 ? curCode - 12 : curCode + 12;
        }
        var next = new Note(nextCode, this.key);
        octaves.push(new Chord([first, next], duration));
    }
    return octaves;
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
            var x = this.keySigWidth() - shift + 200 * i;
            var y = clefIndex * 125 + 10;
            var stave = new Vex.Flow.Stave(x, y, 200, {
                fill_style: 'black'
            });
            stave.setContext(vexCtx).draw();
            var notes = bar.map(function(item) {
                return item.toVexNote();
            });
            Vex.Flow.Formatter.FormatAndDraw(vexCtx, stave, notes);
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
            var y = clefIndex * 125 + 10;
            var stave = new Vex.Flow.Stave(0, y, this.keySigWidth(), {
                fill_style: 'black'
            });
            var cleffName = i === 0 ? 'treble' : 'bass';
            stave.addClef(cleffName).addKeySignature(this.key);
            stave.addTimeSignature('4/4');
            vexCtx.save();
            stave.setContext(vexCtx).draw();
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
    var vexCANVAS = Vex.Flow.Renderer.Backends.CANVAS;
    var renderer = new Vex.Flow.Renderer(this.ctx.canvas, vexCANVAS);
    var ctx = renderer.getContext();

    ctx.beginPath();
    ctx.clearRect(0, 0, this.ctx.canvas.width, this.height());

    console.log(this.nextNotes().map(function(note) {
        return note.toString() + ' ' + note.code;
    }));
    this._drawBars(ctx);
    this._drawKeySig(ctx);
    this._drawIndicator(ctx, indicatorColor);
};
