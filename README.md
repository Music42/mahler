# mahler

This is a sight reading app designed to help you practice your music
reading skills. You can use it with the on-screen piano for a quick session
as well as with any of your MIDI devices (MIDI support is available in
Chrome 43+). Play it online at http://cristiandima.github.io/mahler/.

## Features

- practice in any key
- chose which clef to play on (treble, bass, or both)
- three modes available
    - melody (single notes on the treble, chords on the bass)
    - notes (single notes on either of the two clefs)
    - chords (chords on either of the two clefs)
- note annotations to help you remember the name of the note

Note you will probably have to restart chrome (close all winodws) after pluging in and turning on your midi device to get it to show up in the list. 

Annotations in chords currently show the name of the lowest note of that chord (maybe switch to showing the root?).

The sheet music is rendered using the open source [vexflow][1] library.

[1]: https://github.com/0xfe/vexflow
