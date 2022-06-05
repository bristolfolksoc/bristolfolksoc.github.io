#!/bin/bash
# This script pushes the travis build to the master branch if we are on the development branch
set -eu

mv node_modules/ node_modules_full/
npm install --production
git config --global user.email "deploy@travis-ci.org"
git config --global user.name "Deployment Bot"
rm .gitignore
mv .gitignore-deploy .gitignore
git checkout -b master
git add -A
git commit -m "Build"
git remote add origin-pages https://git@github.com/wxtim/bristolfolksoc.github.io.git > /dev/null 2>&1
git push --quiet -f origin-pages master
mv node_modules_full/ node_modules/
