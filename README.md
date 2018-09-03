# bristolfolksoc.github.io

[Link to Live Website](https://bristolfolksoc.github.io)

Current Website Build Status: [![Build Status](https://travis-ci.org/bristolfolksoc/bristolfolksoc.github.io.svg?branch=development)](https://travis-ci.org/bristolfolksoc/bristolfolksoc.github.io)

Source code for a potential website that allows viewing and sharing of folk tunes in ABC notation. This site specifically displays tunes played by the Bristol University Folk Society and is intended as an online version of the society tunebook rather than a general place to share folk tunes.

## Features in Progress
* Custom set (with option to modify order, number of repeats and view sheet music)
* Search tunes by origin
* Tune collections/groups (dance tunes, beginner tunes etc.)
* Predefined tune sets
* Page explaining different tune types (e.g. Swung Hornpipes vs. Unswung)
* Configuring the MIDI player to use a different voice and have options to vary playback speed
* Transcribing tunes to other commonly played keys
* Generate a printable PDF tunebook from a set of tunes
* Use the HTML5 history API so you can 'hotlink' to a tune, extend so that you can do this for sets too
* Optimise the searching algorithm (try to get better performance on mobile)

## I want to add a tune to the website

Tunes on the website are stored in ABC Notation. This is a way of representing music using text. If your tune is common you may be able to find a version of it already in ABC format on [The Session](http://www.thesession.org/). Otherwise you may need to write the ABC from scratch.

### Preparing your ABC for upload
* Make sure the ABC is the correct version played at the session, many common tunes can be played differently to published versions you may find online.
* Ensure the ABC has a "C:" tag, this should contain the composer if known. If the tune is Trad state it explicitly using a C: tag
* Try to add chord markings if possible

Once the ABC is created and looks correct, create a new file in the __tunes__ folder with the file extension _.abc_. The easist way to do this is to copy and paste an existing file in the folder. Name the file something appropriate and open in in a Text editor (Notepad if you use Windows, Emacs for Mac etc.) and paste your ABC code here. When you push the tune it will automatically be scanned and added to the list of tunes.

### External Links
* [Live ABC Preview](https://abcjs.net/abcjs-editor.html): Edit the ABC data and preview the printed music in real time. This is the exact renderer used on the website so if it looks correct on this page it will look correct on the website.
* [ABC Cheatsheet](http://www.stephenmerrony.co.uk/uploads/ABCquickRefv0_6.pdf): List of all the various ABC codes you can use.
* [ABC Standard v2.1](http://abcnotation.com/wiki/abc:standard:v2.1)
* [Steve Mansfield's ABC Tutorial](http://www.lesession.co.uk/abc/abc_notation.htm)
* [John Chamber's ABC Primer](http://abcnotation.com/wiki/abc:standard:v2.1)
* [John Chamber's ABC Tutorial](http://trillian.mit.edu/~jc/music/abc/doc/ABCtutorial.html)
* [Jens Wollschläger's ABC Transposer](http://www.franziskaludwig.de/abctransposer/)
