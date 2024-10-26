#!/usr/bin/env sh

set -e

npx prisma db push --skip-generate

# Note: The fast termination doesn't work in node:x-alpine, I tried everything, but no --init or tini -- solved the problem :(
exec node main.js
