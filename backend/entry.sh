#!/usr/bin/bash

set -e

npx prisma db push

node src/main.js
