/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Load something from the API, with the three states every screen needs.
 *
 * Written because the alternative is the same twenty lines of
 * loading/error/data wiring in eight screens, and the version that gets
 * copy-pasted is the version where one screen quietly swallows its error into
 * a `console.log` - which is what the old screens did.
 *
 * Reloads when the organization changes: the active tenant is part of what the
 * request means, so a stale list after switching would be showing another
 * organization's data under the new one's name.
 */
import { useCallback, useEffect, useState } from "react";

import { useApiContext } from "@/app/context/OrganizationContext";
import { ApiContext } from "./api/client";

export function useResource<T>(
  loader: (ctx: ApiContext) => Promise<T>,
  initial: T,
  options: { enabled?: boolean } = {},
) {
  const ctx = useApiContext();
  const enabled = options.enabled ?? true;

  const [data, setdata] = useState<T>(initial);
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState("");

  const reload = useCallback(async () => {
    if (!ctx.token || !enabled) {
      setloading(false);
      return;
    }
    setloading(true);
    seterror("");
    try {
      setdata(await loader(ctx));
    } catch (err: any) {
      seterror(err?.message ?? "Something went wrong.");
    } finally {
      setloading(false);
    }
  }, [ctx.token, ctx.organizationId, enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setdata, loading, error, reload, ctx };
}
