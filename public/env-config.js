// Overwritten at container start by docker/render-env.cjs. Empty here so
// `yarn dev` and any container without a mounted env file fall through to
// the build-time values instead of 404ing on this script.
window._env_ = {};
