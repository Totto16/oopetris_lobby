#!/usr/bin/bash

set -e

npx prisma db push

node dist/src/main.js
