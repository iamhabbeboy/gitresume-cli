#!/usr/bin/env bash
set -e

# Variables
VERSION="0.1.0"
OS="$(uname | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
ARCH=${ARCH/x86_64/amd64}

URL="https://github.com/iamhabbeboy/gitresume-cli/releases/download/v$VERSION/gitresume-cli_${VERSION}_${OS}_${ARCH}.tar.gz"

# Download
TMPDIR=$(mktemp -d)
curl -L "$URL" -o "$TMPDIR/gitresume-cli.tar.gz"

# Extract
tar -xzf "$TMPDIR/gitresume-cli.tar.gz" -C "$TMPDIR"

# Move to /usr/local/bin
sudo mv "$TMPDIR/gitresume-cli" /usr/local/bin/

# Clean up
rm -rf "$TMPDIR"

echo "gitresume-cli $VERSION installed successfully!"
