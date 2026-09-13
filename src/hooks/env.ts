/**
 * Where configuration comes from.
 *
 * Vite inlines `import.meta.env.VITE_*` at build time, which pins a built
 * bundle to whichever `.env` produced it. That is fine for `yarn dev` and
 * wrong for a deployed image: staging and production would be two different
 * builds of the same commit, and changing an API URL would mean a rebuild.
 *
 * So the container renders the env file it was given into `window._env_`
 * (see `docker/render-env.cjs`) and `index.html` loads it before the bundle.
 * Runtime wins where it has a value; the build-time value is the fallback, so
 * nothing here breaks under `yarn dev` or a plain `docker run` with no secret
 * mounted.
 *
 * NONE OF THIS IS SECRET. Every value ends up in JavaScript served to
 * browsers, whichever path it arrives by. Anything that must stay private
 * belongs on the API, behind the API's own credentials.
 */

declare global {
  interface Window {
    _env_?: Record<string, string | undefined>;
  }
}

const runtime: Record<string, string | undefined> =
  (typeof window !== "undefined" && window._env_) || {};

const buildTime = import.meta.env as unknown as Record<string, string | undefined>;

function read(name: string): string {
  // An empty string counts as absent. A stray `VITE_NEON_AI_API=` in the
  // mounted file would otherwise beat the build-time value and send every
  // request to the page's own origin, which fails as a 404 on the SPA
  // fallback - an HTML body where JSON was expected, rather than anything
  // that names the real problem.
  const value = runtime[name] || buildTime[name];
  return value ?? "";
}

export const API_URL = read("VITE_NEON_AI_API");
export const GOOGLE_CLIENT_ID = read("VITE_GOOGLE_CLIENT_ID");

/**
 * Signs the envelope the auth token is stored in, in `localStorage`.
 *
 * Named "secret" for historical reasons and it is not one - it ships in the
 * bundle like everything else here. It is deliberately NOT the API's
 * `JWT_TOKEN`: the server never verifies anything with this, so a forged
 * envelope buys nothing, whereas wiring the API's real signing key in here
 * would publish it to every visitor.
 */
export const LOCAL_TOKEN_SECRET = read("VITE_JWT_SECRET");
