/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * One place that knows how to talk to the Neon API.
 *
 * WHY A CLIENT RATHER THAN MORE FUNCTIONS IN requests.ts
 * ------------------------------------------------------
 * Every platform call now needs two headers, not one: the session token AND
 * `X-Organization`, which decides the tenant the request acts in. Spreading
 * that across a flat list of hand-written Axios calls means one of them will
 * eventually forget the second header, and the symptom - a 409 telling the
 * user to name an organization, or worse, silently acting in the wrong one -
 * would look like a backend bug.
 *
 * `requests.ts` keeps the calls that predate this: sign-in (no organization
 * exists yet) and the SSE stream (read incrementally, so it cannot use Axios).
 *
 * ERRORS
 * ------
 * The API answers in two shapes and both have to be read:
 *
 *   {"status": false, "message": "..."}      - our own envelope
 *   {"field": ["this is wrong"], ...}        - DRF serializer validation
 *
 * `messageFrom` flattens either into one sentence, because a form that says
 * "Request failed with status code 400" tells the user nothing they can act
 * on, and the server has already written the sentence that does.
 */
import Axios, { AxiosRequestConfig } from "axios";
import { API_URL } from "../env";

const API = API_URL;

export interface ApiContext {
  token: string;
  /** Absent during onboarding, before an organization exists. */
  organizationId?: string | null;
}

export class ApiError extends Error {
  status: number;
  /** Field-level errors, when the server sent them. Keyed by field name. */
  fields: Record<string, string[]>;

  constructor(message: string, status: number, fields: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

const fieldErrorsFrom = (data: any): Record<string, string[]> => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const fields: Record<string, string[]> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (key === "status" || key === "message" || key === "data") return;
    if (Array.isArray(value)) fields[key] = value.map(String);
    else if (typeof value === "string") fields[key] = [value];
  });
  return fields;
};

export const messageFrom = (err: any, fallback: string): string => {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.message) return String(data.message);
  if (data.detail) return String(data.detail);

  const fields = fieldErrorsFrom(data);
  const entries = Object.entries(fields);
  if (entries.length) {
    // "name: An agent in this organization already uses that slug."
    // `non_field_errors` has no useful name to show, so it loses the prefix.
    return entries
      .map(([field, messages]) =>
        field === "non_field_errors" ? messages.join(" ") : `${field}: ${messages.join(" ")}`,
      )
      .join("\n");
  }
  return err?.message || fallback;
};

const headersFor = (ctx: ApiContext, isForm = false) => {
  const headers: Record<string, string> = {
    "x-access-token": ctx.token,
  };
  if (!isForm) headers["Content-Type"] = "application/json";
  // Left off entirely when absent rather than sent empty: the server treats a
  // missing header as "resolve my sole organization", which is what a
  // single-organization user should get, and an empty string as a named
  // organization that does not exist.
  if (ctx.organizationId) headers["X-Organization"] = ctx.organizationId;
  return headers;
};

async function call<T>(
  method: "get" | "post" | "patch" | "delete",
  path: string,
  ctx: ApiContext,
  options: { data?: any; params?: any; fallback?: string; isForm?: boolean } = {},
): Promise<T> {
  const config: AxiosRequestConfig = {
    method,
    url: `${API}${path}`,
    headers: headersFor(ctx, options.isForm),
    params: options.params,
    data: options.data,
  };

  try {
    const response = await Axios.request(config);
    // Unwrap the envelope here so no screen has to remember to. Endpoints that
    // answer with a bare body (the messenger routes) pass straight through.
    const body = response.data;
    if (body && typeof body === "object" && "status" in body && "data" in body) {
      return body.data as T;
    }
    return body as T;
  } catch (err: any) {
    throw new ApiError(
      messageFrom(err, options.fallback ?? "Something went wrong."),
      err?.response?.status ?? 0,
      fieldErrorsFrom(err?.response?.data),
    );
  }
}

export const apiGet = <T>(path: string, ctx: ApiContext, params?: any, fallback?: string) =>
  call<T>("get", path, ctx, { params, fallback });

export const apiPost = <T>(path: string, ctx: ApiContext, data?: any, fallback?: string) =>
  call<T>("post", path, ctx, { data, fallback });

export const apiPostForm = <T>(path: string, ctx: ApiContext, data: FormData, fallback?: string) =>
  call<T>("post", path, ctx, { data, fallback, isForm: true });

export const apiPatch = <T>(path: string, ctx: ApiContext, data?: any, fallback?: string) =>
  call<T>("patch", path, ctx, { data, fallback });

export const apiDelete = <T>(path: string, ctx: ApiContext, fallback?: string) =>
  call<T>("delete", path, ctx, { fallback });
