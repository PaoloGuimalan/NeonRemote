FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn

# No .env here on purpose. Configuration is resolved at RUNTIME from the env
# file the container is given (docker/render-env.cjs -> window._env_), so the
# build needs none of it - and .env is gitignored, which means a CI checkout
# has no such file and `COPY .env .env` fails the build outright.
#
# It also keeps one image honest across environments: nothing is baked in, so a
# staging container cannot quietly inherit a production API URL from whatever
# .env happened to sit next to the Dockerfile at build time.
COPY . .
RUN yarn build

FROM node:22-alpine
RUN yarn global add serve
WORKDIR /app
COPY --from=build /app/dist ./dist

COPY docker ./docker
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3006

# Renders the mounted /app/.env into dist/env-config.js, then serves. The old
# version of this built the same file out of `env | grep VITE_`, which nothing
# read - the app was compiled against import.meta.env - so it published the
# container's environment at /env-config.js and configured nothing.
CMD ["./docker-entrypoint.sh"]
