#!/bin/sh

printenv | tee .env >/dev/null

BASE_URL=$(grep BASE_URL .env | cut -d '=' -f2)
sed -i '' "s|%BASE_URL%|$BASE_URL|g" static/index.html

./main