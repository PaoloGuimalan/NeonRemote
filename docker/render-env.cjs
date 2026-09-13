/**
 * Render the mounted env file into the runtime config the app reads.
 *
 * Vite inlines VITE_* at BUILD time, so without this a built image is pinned
 * to whichever .env produced it - staging and production would be two
 * different images of the same commit, and changing an API URL would mean a
 * rebuild rather than a restart.
 *
 * The stack mounts a Docker secret at /app/.env. This turns it into
 * window._env_ before `serve` starts, so one image runs in any environment.
 *
 * src/hooks/env.ts prefers these values and falls back to the build-time ones,
 * so a container started with no secret mounted still works.
 *
 * Node rather than shell because the values have to be escaped into JavaScript
 * and JSON.stringify does that correctly - an awk or sed version gets the
 * backslash and quote cases wrong in ways that only show up on the one value
 * that happens to contain them.
 */

const fs = require("fs");
const path = require("path");

const ENV_FILE = process.env.ENV_FILE || "/app/.env";
const OUT = process.env.ENV_CONFIG_OUT || "/app/dist/env-config.js";

// Only VITE_* is read by the app, and only VITE_* is safe to publish: this
// file is served to browsers, so anything else in the mounted secret - were it
// ever to hold anything else - must not be copied into it.
const LINE = /^\s*(VITE_[A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/;

function unquote(value) {
  const quoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));
  return quoted && value.length >= 2 ? value.slice(1, -1) : value;
}

function read(file) {
  const vars = {};
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(LINE);
    if (!match) continue;
    const value = unquote(match[2]);
    // An empty assignment means "not set" rather than "set to empty" - a
    // stray `VITE_NEON_AI_API=` would otherwise point the app at "" and every
    // request would go to the page's own origin.
    if (value !== "") vars[match[1]] = value;
  }
  return vars;
}

const vars = fs.existsSync(ENV_FILE) ? read(ENV_FILE) : null;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  "window._env_ = " + JSON.stringify(vars || {}, null, 2) + ";\n",
  "utf8"
);

if (vars === null) {
  console.log(`[env] no ${ENV_FILE} mounted; using build-time configuration`);
} else {
  // Names only. The values are about to be served to every visitor anyway,
  // but there is no reason to also put them in the container's logs.
  console.log(`[env] ${OUT} rendered from ${ENV_FILE}: ${Object.keys(vars).join(", ") || "(none)"}`);
}
