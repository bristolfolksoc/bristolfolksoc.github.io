#!/bin/bash
# This script grabs the required programs to build printed tunebooks:
# - abcm2ps : converts ABC files to postscript
# - ps2eps : converts postscript to EPS
# - eps2pdf : converts EPS to a pdf file (which can be rendered by latex)

set -eu

mkdir -p ./download

cd download

docker pull strauman/travis-latexbuild:small

sudo apt-add-repository -y ppa:anton+/photo-video-apps;
sudo apt-get update;
sudo apt-get -y install ghostscript;

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

   mkdir -p ./bin/
   gcc -o ./bin/bbox ./src/C/bbox.c
   tree ./bin
   chmod a+x ./bin/bbox
   chmod a+x ./bin/ps2eps

   cd ..
fi


if [ ! -d "epstopdf" ]; then
   curl -L http://mirrors.ctan.org/support/epstopdf.zip -o ./epstopdf.zip

   unzip ./epstopdf.zip

   rm epstopdf.zip

   mv ./epstopdf/epstopdf.pl ./epstopdf/epstopdf
   chmod a+x ./epstopdf/epstopdf
fi

WD="$(pwd)";
export PATH="$PATH:$WD/ps2eps/bin:$WD/abcm2ps:$WD/epstopdf"

cd ..

# TESTING
echo ""
echo "*** Testing Book Dependancies ***"
echo ""

echo "ABCM2PS"
abcm2ps -V

echo ""
echo "PS2EPS"
ps2eps -V

echo ""
echo "EPSTOPDF"
epstopdf --version
