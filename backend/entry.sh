#!/usr/bin/env sh

set -e

npx prisma db push

exec node src/main.js
