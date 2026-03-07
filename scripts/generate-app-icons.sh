#!/bin/bash

set -e

echo "🎨 Generating Android App Icons from Logo..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Source logo
SOURCE_LOGO="../src/assets/images/logo.png"
ANDROID_RES="../android/app/src/main/res"

# Check if source logo exists
if [ ! -f "$SOURCE_LOGO" ]; then
    echo -e "${RED}❌ Logo not found: $SOURCE_LOGO${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Source logo: $SOURCE_LOGO${NC}"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick not installed!${NC}"
    echo ""
    echo "Install with:"
    echo "  brew install imagemagick"
    echo ""
    exit 1
fi

# Create mipmap directories if they don't exist
mkdir -p "$ANDROID_RES/mipmap-mdpi"
mkdir -p "$ANDROID_RES/mipmap-hdpi"
mkdir -p "$ANDROID_RES/mipmap-xhdpi"
mkdir -p "$ANDROID_RES/mipmap-xxhdpi"
mkdir -p "$ANDROID_RES/mipmap-xxxhdpi"

echo -e "${BLUE}🔨 Generating icons...${NC}"

# Generate launcher icons (square with rounded corners)
convert "$SOURCE_LOGO" -resize 48x48 "$ANDROID_RES/mipmap-mdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 72x72 "$ANDROID_RES/mipmap-hdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 96x96 "$ANDROID_RES/mipmap-xhdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 144x144 "$ANDROID_RES/mipmap-xxhdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 192x192 "$ANDROID_RES/mipmap-xxxhdpi/ic_launcher.png"

echo -e "${GREEN}✅ Square icons generated${NC}"

# Generate round launcher icons
convert "$SOURCE_LOGO" -resize 48x48 \( +clone -threshold -1 -negate -fill white -draw "circle 24,24 24,0" \) -alpha off -compose copy_opacity -composite "$ANDROID_RES/mipmap-mdpi/ic_launcher_round.png"
convert "$SOURCE_LOGO" -resize 72x72 \( +clone -threshold -1 -negate -fill white -draw "circle 36,36 36,0" \) -alpha off -compose copy_opacity -composite "$ANDROID_RES/mipmap-hdpi/ic_launcher_round.png"
convert "$SOURCE_LOGO" -resize 96x96 \( +clone -threshold -1 -negate -fill white -draw "circle 48,48 48,0" \) -alpha off -compose copy_opacity -composite "$ANDROID_RES/mipmap-xhdpi/ic_launcher_round.png"
convert "$SOURCE_LOGO" -resize 144x144 \( +clone -threshold -1 -negate -fill white -draw "circle 72,72 72,0" \) -alpha off -compose copy_opacity -composite "$ANDROID_RES/mipmap-xxhdpi/ic_launcher_round.png"
convert "$SOURCE_LOGO" -resize 192x192 \( +clone -threshold -1 -negate -fill white -draw "circle 96,96 96,0" \) -alpha off -compose copy_opacity -composite "$ANDROID_RES/mipmap-xxxhdpi/ic_launcher_round.png"

echo -e "${GREEN}✅ Round icons generated${NC}"

echo ""
echo -e "${GREEN}🎉 App icons generated successfully!${NC}"
echo ""
echo "Generated files:"
echo "  - mipmap-mdpi (48x48)"
echo "  - mipmap-hdpi (72x72)"
echo "  - mipmap-xhdpi (96x96)"
echo "  - mipmap-xxhdpi (144x144)"
echo "  - mipmap-xxxhdpi (192x192)"
echo ""
echo -e "${BLUE}📱 Next steps:${NC}"
echo "  1. Rebuild app: yarn android:dev"
echo "  2. Firebase will automatically use new icon"
echo ""





