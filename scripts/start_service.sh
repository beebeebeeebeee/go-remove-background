#!/bin/sh

printenv | tee .env >/dev/null
./main