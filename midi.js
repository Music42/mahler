/*global SETTINGS, Note, checkUserInput*/

var MIDI_NOTES = new HashSet(function(note) {
    return note.code;
});

if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
        sysex: false
    }).then(onMIDISuccess, onMIDIFailure);
} else {
    alert('No MIDI support in your browser.');
}

function onMIDISuccess(midiAccess) {
    var midi = midiAccess;
    var inputs = midi.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMIDIMessage;
    }
    midi.onstatechange = onStateChange;
}

function onMIDIFailure(e) {
    alert('No access to MIDI devices or your browser doesn\'t support WebMIDI API.' + e);
}

function onStateChange(event) {
    var port = event.port;
    var state = port.state;
    var name = port.name;
    var type = port.type;

    var inputs = this.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMIDIMessage;
    }
    if (type == 'input') {
        console.log('name', name, 'port', port, 'state', state);
    }
}

function onMIDIMessage(event) {
    var data = event.data;
    var cmd = data[0] === 128 ? 'keyup' : 'keydown';
    var code = data[1];
    if (cmd === 'keydown') {
        MIDI_NOTES.add(new Note(code, SETTINGS.key));
        checkUserInput(MIDI_NOTES.toArray(), true);
    }
    if (cmd === 'keyup') {
        MIDI_NOTES.remove(new Note(code, SETTINGS.key));
    }
}
