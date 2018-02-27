# bristolfolksoc.github.io

[Link to Live Website](https://bristolfolksoc.github.io)

Current Website Build Status: [![Build Status](https://travis-ci.org/bristolfolksoc/bristolfolksoc.github.io.svg?branch=master)](https://travis-ci.org/bristolfolksoc/bristolfolksoc.github.io)

Source code for a potential website that allows viewing and sharing of folk tunes in ABC notation. This site specifically displays tunes played by the Bristol Univeristy Folk Society and is intended as an online version of the society tunebook rather than a general place to share folk tunes.

## I want to add a tune to the website

Tunes on the website are stored in ABC Notation. This is a way of representing music using text. If your tune is common you may be able to find a version of it already in ABC format on [The Session](www.thesession.org). Otherwise you may need to write the ABC from scratch.

### Preparing your ABC for upload
* Make sure the ABC is the correct version played at the session, many common tunes can be played differently to published versions you may find online.
* Ensure the ABC has a "C:" tag, this should contain the composer if known. If the tune is Trad state it explicitly using a C: tag
* Try to add chord markings if possible

Once the ABC is created and looks correct, create a new file in the __tunes__ folder with the file extension _.abc_. The easist way to do this is to copy and paste an existing file in the folder. Name the file something appropriate and open in in a Text editor (Notepad if you use Windows, Emacs for Mac etc.) and paste your ABC code here. When you push the tune it will automatically be scanned and added to the list of tunes.

### Helpful Links
* [Live ABC Preview](https://abcjs.net/abcjs-editor.html): Edit the ABC data and preview the printed music in real time. This is the exact renderer used on the website so if it looks correct on this page it will look correct on the website.
* [ABC Cheatsheet](http://www.stephenmerrony.co.uk/uploads/ABCquickRefv0_6.pdf): List of all the various ABC codes you can use.
