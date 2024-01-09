#!/usr/bin/env bash
set -eufxo pipefail

rm -rf dist
parcel build --public-url './' --no-cache
cp -r src dist/
cp src/favicon.ico dist/
