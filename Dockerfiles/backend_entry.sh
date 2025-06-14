#!/usr/bin/env sh

set -e

# TODO: check if this works correctly
# this is the baseline for migrations, which means, this was the schema before we started using migartions
npx prisma migrate resolve --applied 0_init
# run migrations, if there are any
npx prisma migrate deploy
# push the schema to the db, for new dbs instances, otherwise a noop
npx prisma db push --skip-generate

# Note: The fast termination doesn't work in node:x-alpine, I tried everything, but no --init or tini -- solved the problem :(
exec node main.js
