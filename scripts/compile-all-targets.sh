#!/usr/bin/env bash

# Set strict mode
set -euo pipefail

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Navigate to project root
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
# Change to project root directory
cd "$PROJECT_ROOT"

# Define output directory
OUTPUT_DIR="$PROJECT_ROOT/dist"
mkdir -p "$OUTPUT_DIR"
# If output directory is not empty, clean it
if [ "$(ls -A "$OUTPUT_DIR" 2>/dev/null)" ]; then
    echo "Cleaning output directory..."
    rm -rf "$OUTPUT_DIR"/*
fi

# Define the main CLI file
CLI_FILE="cli.ts"

# Define all target architectures supported by Deno 2
TARGETS=(
  # "x86_64-unknown-linux-gnu"   # Linux x64
  # "x86_64-pc-windows-msvc"     # Windows x64
  # "x86_64-apple-darwin"        # macOS Intel
  "aarch64-apple-darwin"       # macOS Apple Silicon
  # "aarch64-unknown-linux-gnu"  # Linux ARM64
)

# Compile for each target
for target in "${TARGETS[@]}"; do
  echo "Compiling for $target..."
  
  # Define output filename based on target
  if [[ "$target" == *"windows"* ]]; then
    output_filename="csap-${target}.exe"
  else
    output_filename="csap-${target}"
  fi
  
  # Run the compile command
  deno compile -A --target "$target" --output "$OUTPUT_DIR/$output_filename" "$CLI_FILE"
  
  if [ $? -eq 0 ]; then
    echo "✓ Successfully compiled for $target"
  else
    echo "! Failed to compile for $target"
  fi
done

echo ""
echo "🎉 Compilation complete! Binaries available in $OUTPUT_DIR:"
ls -la "$OUTPUT_DIR"
