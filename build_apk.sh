#!/bin/bash
# ==============================================================================
# RouteSense Fleet - Mobile APK Build Script
# ==============================================================================
set -e

echo "=== 1. Checking Flutter Environment ==="
flutter doctor -v

echo "=== 2. Fetching Dependencies ==="
flutter pub get

echo "=== 3. Running Unit and Widget Tests ==="
flutter test

echo "=== 4. Building Release APK ==="
flutter build apk --release

echo ""
echo "=============================================================================="
echo " BUILD SUCCESSFUL!"
echo " Output APK location: build/app/outputs/flutter-apk/app-release.apk"
echo "=============================================================================="
