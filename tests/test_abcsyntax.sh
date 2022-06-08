#!/bin/bash
# Simple tests to check abc_synatax:

RED="\e[31m"
GREEN="\e[32m"
ENDCOLOR="\e[0m"

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";

GOOD=0
BAD=0

for tune in "${SCRIPT_DIR}"/../tunes/*.abc; do
    abcm2ps "$tune" > /dev/null && GOOD=$((GOOD + 1)) || BAD=$((BAD + 1))
done
rm Out.ps


echo -e "${GREEN}${GOOD} good abc files in collection.${ENDCOLOR}"
if [[ $BAD != 0 ]]; then
    color="${RED}"
else
    color="${GREEN}"
fi
echo -e "${color}${BAD} abc files with problems in collection.${ENDCOLOR}"

if [[ $BAD != 0 ]]; then
    exit 1
fi
