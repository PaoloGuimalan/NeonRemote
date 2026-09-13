#!/bin/sh
# Runtime configuration, then serve.
#
# The stack mounts a Docker secret at /app/.env; render-env.cjs turns it into
# dist/env-config.js, which index.html loads before the bundle. See that file
# for why this exists at all.
set -e

node /app/docker/render-env.cjs

exec serve -s dist -l 3006
