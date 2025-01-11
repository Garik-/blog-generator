#!/bin/bash
TARGET_URL="http://localhost:3000/" # TODO: move to env
LOCAL_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/../" &> /dev/null && pwd )
DIST_DIR="$LOCAL_DIR/dist"
PUBLIC_DIR="$LOCAL_DIR/public"


function exit_on_error {
    echo "Ошибка: $1"
    exit 1
}

rm -rf $DIST_DIR

echo "Download site $TARGET_URL to $DIST_DIR"
wget -r -P $DIST_DIR -nH $TARGET_URL &> /dev/null || exit_on_error "download error"
cp -r $PUBLIC_DIR/. $DIST_DIR
find $DIST_DIR -name "*.css.map" | xargs rm