#!/usr/bin/bash

set -e

npx prisma db push

exec node src/main.js
