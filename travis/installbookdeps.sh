#!/bin/bash
# This script grabs the required programs to build printed tunebooks:
# - abcm2ps : converts ABC files to postscript
# - ps2eps : converts postscript to EPS
# - eps2pdf : converts EPS to a pdf file (which can be rendered by latex)

mkdir -p ./download

cd download

if [ ! -d "abcm2ps" ]; then
  git clone https://github.com/leesavide/abcm2ps.git
fi

cd abcm2ps
./configure
make
