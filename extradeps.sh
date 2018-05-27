#!/bin/bash

if [ ! -f ./libs/pdfkit/pdfkit.js ]; then
  mkdir -p ./libs/pdfkit
  wget -O ./libs/pdfkit/pdfkit.js https://github.com/devongovett/pdfkit/releases/download/v0.8.0/pdfkit.js
  wget -O ./libs/pdfkit/pdfkit.js.map https://github.com/devongovett/pdfkit/releases/download/v0.8.0/pdfkit.js.map
fi

if [ ! -f ./libs/blob-stream/blob-stream.js ]; then
  mkdir -p ./libs/blob-stream
  wget -O ./libs/blob-stream/blob-stream.js https://github.com/devongovett/blob-stream/releases/download/v0.1.3/blob-stream.js
fi
