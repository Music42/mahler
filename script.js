/*global SheetMusic, Piano */

var CANVAS = document.getElementById('game-board');
var CTX = CANVAS.getContext('2d');
var SETTINGS = getOptions();
var SHEET_MUSIC = new SheetMusic(SETTINGS);
var PIANO_WIDTH = 300;
var PIANO = new Piano(CTX, calcPianoX(), calcPianoY(), PIANO_WIDTH, 150);

PIANO.click(function() {
    this.draw();
    checkUserInput(this.pressedKeys.toArray(), false);
});

function checkUserInput(pressedKeys, strict) {
    if (compareKeys(SHEET_MUSIC.nextNotes(), pressedKeys, strict)) {
        SHEET_MUSIC.draw('green');
        SHEET_MUSIC.consumeNotes();
        setTimeout(function() {
            SHEET_MUSIC.draw();
            PIANO.release();
            PIANO.draw();
        }, 200);
    }
}

function compareKeys(correctKeys, pressedKeys, strict) {
    return correctKeys.every(function(note) {
        return pressedKeys.some(function(pNote) {
            return pNote.equals(note, strict);
        });
    });
}

function updateGame() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    SETTINGS = getOptions();
    SHEET_MUSIC.update(SETTINGS);
    SHEET_MUSIC.draw();
    PIANO.update(calcPianoX(), calcPianoY());
    PIANO.draw();
}

function calcPianoY() {
    return SHEET_MUSIC.height() + 50;
}

function calcPianoX() {
    return CANVAS.width / 2 - PIANO_WIDTH / 2;
}

function getOptions() {
    var selectedKey = $('#selKey').val();
    var selectedClef = $('#selClef').val();
    var treble, bass;
    if (selectedClef === 'BOTH') {
        treble = bass = true;
    } else if (selectedClef === 'TREBLE') {
        treble = true;
        bass = false;
    } else {
        treble = false;
        bass = true;
    }
    return {
        'ctx': CTX,
        'key': selectedKey,
        'withTreble': treble,
        'withBass': bass
    };
}

function updateLocalSettings() {
    var settings = {
        mode: $('#selMode').val(),
        key: $('#selKey').val(),
        clef: $('#selClef').val()
    };
    localStorage.setItem('mahler-settings', JSON.stringify(settings));
}

$('#btn-start').click(function() {
    var mainBtn = this;
    var startClick = true;
    if ($(mainBtn).hasClass('clicked')) {
        $(mainBtn).removeClass('clicked');
        startClick = false;
    } else {
        $(mainBtn).addClass('clicked');
    }
    if (startClick) {
        updateLocalSettings();
        $('#game-menu').fadeOut(300, function() {
            updateGame();
            $('#game-board').show();
            $(mainBtn).text('OPTIONS');
        });
    } else {
        $('#game-board').fadeOut(300, function() {
            $('#game-menu').show();
            $(mainBtn).text('START');
        });
    }
});

$(document).ready(function() {
    var settings = localStorage.getItem('mahler-settings');
    if (settings !== null) {
        settings = JSON.parse(settings);
        $('#selMode').val(settings.mode);
        $('#selKey').val(settings.key);
        $('#selClef').val(settings.clef);
    }
});
