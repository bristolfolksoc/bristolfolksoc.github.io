#!/bin/bash
# This script pushes the travis build to the master branch if we are on the development branch
if [ "$TRAVIS_PULL_REQUEST" == "false"  ]; then

  if [ "$TRAVIS_BRANCH" == "development" ]; then
    cd ..
    git config --global user.email "deploy@travis-ci.org"
    git config --global user.name "Deployment Bot"
    rm .gitignore
    mv .gitignore-deploy .gitignore
    git checkout -b master
    git add -A
    git commit -m "Build $TRAVIS_BUILD_NUMBER"
    git remote add origin-pages https://${GITHUB_TOKEN}@github.com/bristolfolksoc/bristolfolksoc.github.io.git > /dev/null 2>&1
    git push --quiet -f origin-pages master
    cd travis
  else
    echo "Skipping depoyment, deployment only occurs on the development branch";
  fi

else
  echo "Skipping depoyment, deployment does not occur on pull request builds";
fi
