# file to recursively replace logos under "favicon" with new logo

SVG_LOGO="public/badapple_logo.svg"
SVG_LOGO_NO_TEXT="public/badapple_logo_no_text.svg"

# Directory containing the favicons
FAVICONS_DIR="public/favicons"

# Array of sizes for the favicons
SIZES=(16 32)

# Convert SVG to PNG for each size and replace the existing files
for SIZE in "${SIZES[@]}"; do
    PNG_FILE="${FAVICONS_DIR}/favicon-${SIZE}x${SIZE}.png"
    rsvg-convert -w $SIZE -h $SIZE -o $PNG_FILE $SVG_LOGO_NO_TEXT
done

# Convert favicon.ico file - is 48x48
FAVICON_FILE="${FAVICONS_DIR}/favicon.ico"
rsvg-convert -w 48 -h 48 -o $FAVICON_FILE $SVG_LOGO_NO_TEXT

# Convert apple-touch-icon.png - is 180x180
APPLE_TOUCH_ICON="${FAVICONS_DIR}/apple-touch-icon.png"
rsvg-convert -w 180 -h 180 -o $APPLE_TOUCH_ICON $SVG_LOGO

# Convert android-chrome-192x192.png
ANDROID_192="${FAVICONS_DIR}/android-chrome-192x192.png"
rsvg-convert -w 192 -h 192 -o $ANDROID_192 $SVG_LOGO

# Convert android-chrome-512x512.png
ANDROID_512="${FAVICONS_DIR}/android-chrome-512x512.png"
rsvg-convert -w 512 -h 512 -o $ANDROID_512 $SVG_LOGO

# Convert mstile-150x150.png
MSTILE_150="${FAVICONS_DIR}/mstile-150x150.png"
rsvg-convert -w 150 -h 150 -o $MSTILE_150 $SVG_LOGO

# Convert safari-pinned-tab.svg
SAFARI_PINNED_TAB="${FAVICONS_DIR}/safari-pinned-tab.svg"
cp $SVG_LOGO_NO_TEXT $SAFARI_PINNED_TAB


echo "Favicons replaced successfully."