#!/bin/bash
# This script grabs the required programs to build printed tunebooks:
# - abcm2ps : converts ABC files to postscript
# - ps2eps : converts postscript to EPS
# - eps2pdf : converts EPS to a pdf file (which can be rendered by latex)

mkdir -p ./download

cd download

if [ ! -d "abcm2ps" ]; then
  git clone https://github.com/leesavide/abcm2ps.git

  cd abcm2ps
  ./configure
  make
  cd ..
fi

if [ ! -d "ps2eps" ]; then
   curl -L http://mirrors.ctan.org/support/ps2eps.zip -o ./ps2eps.zip

   unzip ./ps2eps.zip

   rm ps2eps.zip

   cd ps2eps

   rm -r ./bin/linux
   rm -r ./bin/win32

   gcc -o ./bin/bbox ./src/C/bbox.c

   chmod a+x ./bin/bbox
   chmod a+x ./bin/ps2eps

   cd ..
fi

WD="$(pwd)";
export PATH="$PATH:$WD/ps2eps/bin:$WD/abcm2ps"

# TESTING
echo ""
echo "*** Testing Book Dependancies ***"
echo ""
abcm2ps -V
ps2eps -V
#epstopdf -V
