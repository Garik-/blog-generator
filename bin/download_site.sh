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
wget -nc -r -P $DIST_DIR -nH $TARGET_URL 2>/dev/null
export RC=$?
if [ "$RC" = "0" ]; then
   echo $1 OK
   cp -r $PUBLIC_DIR/. $DIST_DIR
   find $DIST_DIR -name "*.css.map" | xargs rm
else
    echo $RC FAILED
    exit 1
fi
