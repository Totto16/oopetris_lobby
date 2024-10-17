#!/usr/bin/env bash

docker compose --env-file .test.env up "$@"
