#!/bin/bash
set -e

cd "$(dirname "$0")"

if [ -z "$1" ]; then
    echo "Error: no hash provided!"
    exit 1
fi

if [ -z "$CRAFTIP_SERVER" ]; then
    echo "Error: No \$CRAFTIP_SERVER provided. <username>@<server>"
    exit 1
fi

if [ -z "$CRAFTIP_SERVER_DIR" ]; then
    echo "Error: No \$CRAFTIP_SERVER_DIR provided. /var/www/update.craftip.net"
    exit 1
fi



BUNDLE="/tmp/craftip-bundle"
rm -fr /tmp/craftip-bundle
mkdir /tmp/craftip-bundle


mkdir -p $BUNDLE/input/bin
URL_PREFIX="https://codeberg.org/api/packages/craftip/generic/craftip-artifacts/$1"

for arch in i686-pc-windows-msvc.exe x86_64-pc-windows-msvc.exe x86_64-apple-darwin aarch64-apple-darwin
do
	curl --fail "$URL_PREFIX/$arch" -o $BUNDLE/input/bin/`basename $arch .exe`
done

echo "creating downloads folder"
mkdir -p $BUNDLE/input/downloads
curl --fail "$URL_PREFIX/CraftIP.dmg" -o $BUNDLE/input/downloads/CraftIP.dmg
cp $BUNDLE/input/bin/i686-pc-windows-msvc $BUNDLE/input/downloads/CraftIP-32bit.exe
cp $BUNDLE/input/bin/x86_64-pc-windows-msvc $BUNDLE/input/downloads/CraftIP.exe

curl --fail "$URL_PREFIX/version" -o $BUNDLE/input/version

cargo run --bin update-tool -- --input $BUNDLE/input/bin --output $BUNDLE/output --ver $(cat "${BUNDLE}/input/version")
echo "Uploading updater files into staging..."
scp -r $BUNDLE/output/* "${CRAFTIP_SERVER}:${CRAFTIP_SERVER_DIR}/update/v1/"
echo "Testing staging..."
cargo run --bin update-tool -- --test-staging
echo "Uploading Binaries to be downloaded from the website"
scp -r $BUNDLE/input/downloads/ "${CRAFTIP_SERVER}:${CRAFTIP_SERVER_DIR}/downloads_staging"
echo "Moving everything from staging to production"

read -r -p "Are you sure? [y/N] " response
if [[ ! $response =~ ^([yY][eE][sS]|[yY])$ ]]
then
    exit 1
fi


ssh ${CRAFTIP_SERVER} "\
    mv ${CRAFTIP_SERVER_DIR}/update/v1/latest.json.staging.json ${CRAFTIP_SERVER_DIR}/update/v1/latest.json;
    mv ${CRAFTIP_SERVER_DIR}/downloads /tmp/downloads-$(date +%s);
    mv ${CRAFTIP_SERVER_DIR}/downloads_staging ${CRAFTIP_SERVER_DIR}/downloads;"

echo "Done!"
