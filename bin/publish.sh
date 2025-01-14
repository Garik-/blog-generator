#!/bin/bash

REPO_URL="git@github.com:Garik-/garik-.github.io.git"
LOCAL_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/../" &> /dev/null && pwd ) 
DIST_DIR="$LOCAL_DIR/dist"
TARGET_BRANCH="main" 
TEMP_DIR=$(mktemp -d) 

function exit_on_error {
    echo "Ошибка: $1"
    exit 1
}

git clone -b $TARGET_BRANCH $REPO_URL $TEMP_DIR
cd $TEMP_DIR
git rm -r --cached .
rm -rf *
cp -r "$DIST_DIR/." . 
git add .
git commit -m "$(date)"
git push origin $TARGET_BRANCH
rm -rf $TEMP_DIR