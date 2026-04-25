#!/bin/bash

# on error, fail script
set -e

APP_NAME=CraftIP

if [ -z $BUILD_FOLDER ]; then
    echo "BUILD_FOLDER not set, using default."
    BUILD_FOLDER=/tmp/mac-build
fi
if [ -z $DMG_OUTPUT_PATH ]; then
    echo "DMG_OUTPUT_PATH not set, using default."
    DMG_OUTPUT_PATH=$BUILD_FOLDER/CraftIP.dmg
fi

if [ "`uname`" == "Darwin" ]; then
	if [ -z $X86_64_APPLE_DARWIN ]; then
		X86_64_APPLE_DARWIN=$(dirname "$0")/../target/x86_64-apple-darwin/release/client-gui
		echo "X86_64_APPLE_DARWIN not set, using default: $X86_64_APPLE_DARWIN"
	fi
	if [ -z $AARCH64_APPLE_DARWIN ]; then
		AARCH64_APPLE_DARWIN=$(dirname "$0")/../target/aarch64-apple-darwin/release/client-gui
		echo "AARCH64_APPLE_DARWIN not set, using default: $AARCH64_APPLE_DARWIN"
	fi
else
	if [ -z $APPLE_BINARY ]; then
		APPLE_BINARY=$(dirname "$0")/../target/universal2-apple-darwin/release/client-gui
		echo "APPLE_BINARY for the universal binary not set, using default: $APPLE_BINARY"
	fi
fi

APP_DESTINATION=$BUILD_FOLDER/dmg/$APP_NAME.app
RESOURCES=$(dirname "$0")/resources
echo "cleaning up..."
rm -fr $BUILD_FOLDER/dmg
rm -fr DMG_OUTPUT_PATH
rm -fr $APP_DESTINATION
# creates all folders
mkdir -p $APP_DESTINATION

echo "Building $APP_NAME.app..."
mkdir -p $APP_DESTINATION/Contents/MacOS


if [ "`uname`" == "Darwin" ]; then
	echo "building universal binary..."
	lipo $X86_64_APPLE_DARWIN $AARCH64_APPLE_DARWIN -create -output $APP_DESTINATION/Contents/MacOS/CraftIP
else
	echo "copying universal binary to .app folder"
	cp "$APPLE_BINARY" "$APP_DESTINATION/Contents/MacOS/CraftIP"
fi

chmod +x "$APP_DESTINATION/Contents/MacOS/CraftIP"

echo "copying resources..."
mkdir -p $APP_DESTINATION/Contents/Resources
cp $RESOURCES/Info.plist $APP_DESTINATION/Contents/Info.plist

echo "building icon..."
ICON=$RESOURCES/logo-mac.png
ICON_BUILD=$APP_DESTINATION/Contents/Resources/logo
mkdir $ICON_BUILD.iconset

if [ "`uname`" == "Darwin" ]; then
	sips -z 16 16     $ICON --out $ICON_BUILD.iconset/icon_16x16.png
	sips -z 32 32     $ICON --out $ICON_BUILD.iconset/icon_16x16@2x.png
	sips -z 32 32     $ICON --out $ICON_BUILD.iconset/icon_32x32.png
	sips -z 64 64     $ICON --out $ICON_BUILD.iconset/icon_32x32@2x.png
	sips -z 128 128   $ICON --out $ICON_BUILD.iconset/icon_128x128.png
	sips -z 256 256   $ICON --out $ICON_BUILD.iconset/icon_128x128@2x.png
	sips -z 256 256   $ICON --out $ICON_BUILD.iconset/icon_256x256.png
	sips -z 512 512   $ICON --out $ICON_BUILD.iconset/icon_256x256@2x.png
	sips -z 512 512   $ICON --out $ICON_BUILD.iconset/icon_512x512.png
	sips -z 1024 1024 $ICON --out $ICON_BUILD.iconset/icon_512x512@2x.png
	
	iconutil -c icns $ICON_BUILD.iconset
else
	magick $ICON -resize 16x16     $ICON_BUILD.iconset/icon_16x16.png
	magick $ICON -resize 32x32     $ICON_BUILD.iconset/icon_16x16@2x.png
	magick $ICON -resize 32x32     $ICON_BUILD.iconset/icon_32x32.png
	magick $ICON -resize 64x64     $ICON_BUILD.iconset/icon_32x32@2x.png
	magick $ICON -resize 128x128   $ICON_BUILD.iconset/icon_128x128.png
	magick $ICON -resize 256x256   $ICON_BUILD.iconset/icon_128x128@2x.png
	magick $ICON -resize 256x256   $ICON_BUILD.iconset/icon_256x256.png
	magick $ICON -resize 512x512   $ICON_BUILD.iconset/icon_256x256@2x.png
	magick $ICON -resize 512x512   $ICON_BUILD.iconset/icon_512x512.png
	magick $ICON -resize 1024x1024 $ICON_BUILD.iconset/icon_512x512@2x.png

	python -m icnsutil c $ICON_BUILD.icns $ICON_BUILD.iconset/*
fi
echo "clean up..."
rm -r $ICON_BUILD.iconset

echo "building dmg..."

if [ "`uname`" == "Darwin" ]; then
		create-dmg \
		  --volname "CraftIP Installer" \
		  --background "$RESOURCES/dmg/dmg-background.png" \
		  --window-size 450 390 \
          --icon-size 70 \
		  --icon "CraftIP.app" 70 90 \
		  --hide-extension "CraftIP.app" \
		  --app-drop-link 290 90 \
		  --add-file "can’t open.pdf" "${RESOURCES}/dmg/can not open.pdf" 180 260 \
		  "${DMG_OUTPUT_PATH}" \
		  "${BUILD_FOLDER}/dmg/"

else
	mkdir -p /Applications
	ln -s /Applications ${BUILD_FOLDER}/dmg/Applications
    cp -r $RESOURCES/dmg/DS_Store ${BUILD_FOLDER}/dmg/.DS_Store
    mkdir ${BUILD_FOLDER}/dmg/.background
    cp $RESOURCES/dmg/dmg-background.png ${BUILD_FOLDER}/dmg/.background/
    cp "${RESOURCES}/dmg/can not open.pdf" "${BUILD_FOLDER}/dmg/can’t open.pdf"
	genisoimage -D -V "CraftIP Installer" -no-pad -r -hfs -o "${DMG_OUTPUT_PATH}.uncompressed.dmg" "${BUILD_FOLDER}/dmg"
    dmg "${DMG_OUTPUT_PATH}.uncompressed.dmg" ${DMG_OUTPUT_PATH}
fi
echo "Dmg at ${DMG_OUTPUT_PATH}"
