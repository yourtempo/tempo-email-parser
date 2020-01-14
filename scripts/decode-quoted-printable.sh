#!/usr/bin/env bash

####################################################
# Decode and rewrite a quoted-printable encoded file
####################################################

set -o errexit
set -o pipefail
# set -o xtrace

if ! type qprint > /dev/null; then
  echo 'This script requires qprint in PATH.';
  echo 'https://brewinstall.org/Install-qprint-on-Mac-with-Brew/';
  exit 1;
fi

INPUT_FILE_PATH=$1

if [ -z "$1" ]; then
  echo 'Missing input file';
  echo 'Usage: ./decode-quoted-printable.sh ./path/to/encoded/file';
  exit 1;
fi 



DECODED=$(qprint -d "$INPUT_FILE_PATH")

cat <<< "$DECODED" > "$INPUT_FILE_PATH"

echo 'Done';
exit 0;