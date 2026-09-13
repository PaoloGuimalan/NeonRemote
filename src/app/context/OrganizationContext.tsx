/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Which organization the app is acting in.
 *
 * WHY THIS EXISTS AT ALL
 * ----------------------
 * Nearly every platform endpoint is tenant-scoped, and the tenant travels in
 * the `X-Organization` header. Something has to decide what goes in it, and
 * it cannot be each screen: a screen that forgot would either be told to name
 * an organization or - for a single-organization user - quietly act in the
 * one the server picked. One context, read by `useApiContext`, is what keeps
 * that answer in a single place.
 *
 * WHY THE APP BLOCKS WITHOUT ONE
 * ------------------------------
 * A signed-in user with no organization gets a 403 from every scoped route,
 * which would render as a wall of failed panels. There is genuinely nothing
 * to show them until an organization exists, so onboarding is not a nag - it
 * is the only useful screen at that point.
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { ApiContext } from "@/hooks/api/client";
import { Organizations } from "@/hooks/api/resources";
import { IOrganization } from "@/hooks/api/types";
import { AuthStateInterface } from "@/hooks/interfaces";

const STORAGE_KEY = "neon.organization";

interface OrganizationContextValue {
  organizations: IOrganization[];
  active: IOrganization | null;
  loading: boolean;
  error: string;
  setActive: (organization: IOrganization) => void;
  reload: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue>({
  organizations: [],
  active: null,
  loading: true,
  error: "",
  setActive: () => undefined,
  reload: async () => undefined,
});

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication);
  const token = authentication.user.token as string;

  const [organizations, setorganizations] = useState<IOrganization[]>([]);
  const [activeId, setactiveId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState("");

  const reload = async () => {
    if (!token) return;
    setloading(true);
    seterror("");
    try {
      const rows = await Organizations.list({ token });
      setorganizations(rows);

      // A remembered organization the user is no longer a member of would
      // make every request 403 with no visible cause, so the stored choice is
      // only honoured while it is still in the list.
      setactiveId((current) => {
        const stillValid = current && rows.some((row) => row.id === current);
        const next = stillValid ? current : (rows[0]?.id ?? null);
        if (next) localStorage.setItem(STORAGE_KEY, next);
        else localStorage.removeItem(STORAGE_KEY);
        return next;
      });
    } catch (err: any) {
      seterror(err?.message ?? "Could not load your organizations.");
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [token]);

  const setActive = (organization: IOrganization) => {
    localStorage.setItem(STORAGE_KEY, organization.id);
    setactiveId(organization.id);
  };

  const active = useMemo(
    () => organizations.find((row) => row.id === activeId) ?? null,
    [organizations, activeId],
  );

  return (
    <OrganizationContext.Provider
      value={{ organizations, active, loading, error, setActive, reload }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => useContext(OrganizationContext);

/**
 * Everything a request needs: who is asking, and on whose behalf.
 *
 * Returned as one object so a call site cannot accidentally pass the token
 * without the organization.
 */
export const useApiContext = (): ApiContext => {
  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication);
  const { active } = useOrganization();
  return useMemo(
    () => ({ token: authentication.user.token as string, organizationId: active?.id ?? null }),
    [authentication.user.token, active?.id],
  );
};
