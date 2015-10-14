var Note = function(code, key) {
    this.code = code;
    this.name = codeToName(code, key);
    this.key = key;
    this.octave = Math.floor(code / 12) - 1;
};

Note.prototype = {
    toNoteList: function() {
        return [this];
    },
    toString: function() {
        return this.name + this.octave;
    },
    toVexString: function() {
        return this.name + '/' + this.octave;
    },
    toVexNote: function() {
        return new Vex.Flow.StaveNote({
            clef: this.octave < 4 ? 'bass' : 'treble',
            keys: [this.toVexString()],
            duration: '4'
        });
    },
    equals: function(note, strict) {
        if (strict === undefined) {
            strict = true;
        }
        var diff = this.code - note.code;
        return strict ? diff === 0 : diff % 12 === 0;
    }
};

var Chord = function(noteList) {
    this.notes = noteList;
};

Chord.prototype = {
    toNoteList: function() {
        return this.notes;
    },
    toVexNote: function() {
        var vexKeys = [];
        this.notes.forEach(function(note) {
            vexKeys.push(note.toVexString());
        });
        return new Vex.Flow.StaveNote({
            clef: this.notes[0].octave < 4 ? 'bass' : 'treble',
            keys: vexKeys,
            duration: '4'
        });
    }
};

function accidentals(key) {
    var acc1 = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
    var acc2 = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
    var n = acc1.indexOf(key);
    return n !== -1 ? n : acc2.indexOf(key);
}

function keyAccType(key) {
    var fourths = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
    return key === 'C' ? '' : fourths.indexOf(key) != -1 ? 'b' : '#';
}

function keyHasAccAt(key, noteIndex) {
    var inFourths = keyAccType(key) === 'b';
    for (var j = 0; j < accidentals(key); ++j) {
        var toModifyIndex = inFourths ? (4 * j + 3) % 7 : (3 * j + 6) % 7;
        if (toModifyIndex === noteIndex) {
            return true;
        }
    }
    return false;
}

function rootNoteCode(key) {
    var enh = ['Db', 'Gb', 'Cb'].indexOf(key);
    var enhKey = enh != -1 ? ['C#', 'F#', 'B'][enh] : key;
    var rootNotes = [
        'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'
    ];
    return rootNotes.indexOf(enhKey);
}

function codeToName(code, key) {
    key = key || 'C';
    code = code % 12;
    var accType = keyAccType(key);
    var currentCode = rootNoteCode(key);
    if (code < currentCode) {
        code = code + 12;
    }
    var i;
    for (i = 0; i < 7; ++i) {
        if (currentCode === code) {
            break;
        }
        var halfSteps = i === 2 || i === 6 ? 1 : 2;
        var currDiff, nextDiff;
        currDiff = currentCode - code;
        nextDiff = (currentCode + halfSteps) - code;
        if (currDiff === -1 && nextDiff === 1) {
            if (accType === 'b') {
                if (keyHasAccAt(key, i)) {
                    break;
                } else {
                    currentCode += halfSteps;
                    i += 1;
                    break;
                }
            } else {
                if (keyHasAccAt(key, i + 1)) {
                    currentCode += halfSteps;
                    i += 1;
                    break;
                } else {
                    break;
                }
            }
        }
        currentCode += halfSteps;
    }
    var notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    var noteName = notes[(notes.indexOf(key[0]) + i) % 7];
    noteName += keyHasAccAt(key, i) ? accType : '';
    var addFlats = currentCode > code,
        addSharps = currentCode < code;
    if ((accType === '#' && addFlats) || (accType === 'b' && addSharps)) {
        noteName += 'n';
    } else {
        noteName += addFlats ? 'b' : addSharps ? '#' : '';
    }
    return noteName;
}

function nameToCode(noteName, octave) {
    var allNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    var index = allNames.indexOf(noteName[0]);
    index = index < 3 ? index * 2 : index * 2 - 1;
    var min = 12 * (octave + 1),
        max = min + 12;
    var code;
    for (code = min; code < max; ++code) {
        if (code % 12 === index) {
            break;
        }
    }
    var lastVal = 0;
    for (var j = 1; j < noteName.length; j++) {
        if (noteName[j] === '#') {
            ++code;
            lastVal = 1;
        } else if (noteName[j] === 'b') {
            --code;
            lastVal = -1;
        } else {
            code += -lastVal;
        }
    }
    return code;
}

function randomNote(cleff, key) {
    key = key || 'C';
    cleff = cleff.toUpperCase();
    // pick a random octave
    var rn = Math.random();
    var octave = 4;
    if (cleff === 'G') {
        octave = rn < 0.5 ? 4 : 5;
    } else {
        octave = rn < 0.5 ? 2 : 3;
    }
    // pick one of 7 notes in the key scale
    rn = Math.floor(Math.random() * 7);
    var code = rootNoteCode(key);
    code += rn < 3 ? rn * 2 : rn * 2 - 1;
    // increase code to proper octave
    code = code % 12 + 12 * (octave + 1);
    return new Note(code, key);
}

function scaleIndex(note, key) {
    var keyRootCode = rootNoteCode(key);
    var diff = (note.code % 12) - keyRootCode;
    var index = -1;
    if (diff < 5) {
        if (diff % 2 === 0) {
            index = diff / 2;
        }
    } else {
        if ((diff + 1) % 2 === 0) {
            index = (diff + 1) / 2;
        }
    }
    return index;
}

function randomChord(clef, key) {
    var chordRoot = randomNote(clef, key);
    var rootIndex = scaleIndex(chordRoot, key);
    var chordNotes = [chordRoot];

    var rn = Math.floor(Math.random() * 3);
    var chordIndices = [];
    if (rn === 0) {
        chordIndices = [rootIndex + 2, rootIndex + 4];
    } else if (rn === 1) {
        chordIndices = [rootIndex + 2, rootIndex + 4, rootIndex + 5];
    } else {
        chordIndices = [rootIndex + 2, rootIndex + 4, rootIndex + 6];
    }

    var octave = chordRoot.octave;
    chordIndices.forEach(function(index) {
        if (index > 6) {
            if (octave === 4 || octave === 2) {
                octave += 1;
            }
            index = index % 7;
        }
        var code = rootNoteCode(key);
        code += index < 3 ? index * 2 : index * 2 - 1;
        code = code % 12 + 12 * (octave + 1);
        chordNotes.push(new Note(code, key));
    });
    return new Chord(chordNotes);
}
