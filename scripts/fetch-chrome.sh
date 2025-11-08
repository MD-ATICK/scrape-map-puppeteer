set -e

# URL to the prebuilt Chromium tarball you want to include
CHROME_URL="https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar"
OUT_DIR=".chrome"

echo ">> Preparing chrome dir..."
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

echo ">> Downloading chromium from $CHROME_URL ..."
curl -L --fail --retry 3 -o /tmp/chrome.tar.gz "$CHROME_URL"

echo ">> Extracting..."
tar -xzf /tmp/chrome.tar.gz -C "$OUT_DIR"

# After extraction find the binary path. This depends on how the tarball is packaged.
# Common case: a 'chrome' or 'chrome-linux' folder with 'chrome' binary inside.
# You may need to adjust this to your tarball structure.
# Example target: .chrome/chrome-linux/chrome
if [ -f "$OUT_DIR/chrome" ]; then
  BIN="$OUT_DIR/chrome"
else
  BIN=$(find "$OUT_DIR" -type f -name chrome -perm /u=x | head -n 1)
fi

if [ -z "$BIN" ]; then
  echo "ERROR: chrome binary not found after extraction. Files:"
  ls -la "$OUT_DIR"
  exit 2
fi

echo ">> Chrome binary found: $BIN"
chmod +x "$BIN"

# Create a small JSON file that stores the binary path for runtime lookup
echo "{\"path\":\"$BIN\"}" > "$OUT_DIR/chrome-path.json"

echo ">> Done. Chrome ready in $OUT_DIR"
