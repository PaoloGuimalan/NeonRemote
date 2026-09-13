/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AuthStateInterface, IConnectedAccount, IAvailablePage } from "@/hooks/interfaces";
import {
  ConnectPageRequest,
  DisconnectRequest,
  GetConnectionImpactRequest,
  GetAvailablePagesRequest,
  GetConnectionsRequest,
} from "@/hooks/requests";
import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { FiUser } from "react-icons/fi";
import { MdOutlinePages } from "react-icons/md";
import { useSelector } from "react-redux";

import { ConfirmDialog } from "@/app/widgets/Modal";

/**
 * The identities this account can publish bots as.
 *
 * Two kinds, and the difference is worth showing rather than flattening:
 * the PERSONAL identity comes from signing in and cannot be disconnected
 * without signing out, while a PAGE is connected on purpose and can be
 * removed. They are different rows in different places for that reason -
 * personal lives on the account, pages live in connected accounts.
 */
function Connections() {
  const authentication: AuthStateInterface = useSelector(
    (state: any) => state.authentication,
  );
  const token = authentication.user.token as string;

  const [personal, setpersonal] = useState<any>(null);
  const [connections, setconnections] = useState<IConnectedAccount[]>([]);
  const [pages, setpages] = useState<IAvailablePage[]>([]);
  const [loading, setloading] = useState(true);
  const [busyId, setbusyId] = useState<string | null>(null);
  const [disconnecting, setdisconnecting] = useState<{
    connection: IConnectedAccount;
    bots: { id: string; handle: string; name: string }[];
  } | null>(null);

  const { toast } = useToast();

  const failed = (err: any) =>
    toast({
      title: "Something went wrong",
      description: err?.message ?? String(err),
      variant: "destructive",
    });

  const load = () => {
    if (!token) return;
    setloading(true);

    Promise.all([
      GetConnectionsRequest({ token }),
      GetAvailablePagesRequest({ token }),
    ])
      .then(([connectionsResponse, pagesResponse]) => {
        setpersonal(connectionsResponse.personal);
        setconnections(connectionsResponse.connections ?? []);
        setpages(pagesResponse.pages ?? []);
      })
      .catch(failed)
      .finally(() => setloading(false));
  };

  useEffect(load, [token]);

  const connectPage = (page: IAvailablePage) => {
    setbusyId(page.entity_id);
    ConnectPageRequest({ token }, { entity_id: page.entity_id })
      .then(() => {
        toast({ title: `Connected ${page.name}` });
        load();
      })
      .catch(failed)
      .finally(() => setbusyId(null));
  };

  // Asks the server what this would break, then names it. A generic
  // "are you sure?" is not a confirmation when the consequence - bots going
  // silent - is invisible from this screen and is not undone by reconnecting.
  const askToDisconnect = (connection: IConnectedAccount) => {
    setbusyId(connection.id);
    GetConnectionImpactRequest({ token, connection_id: connection.id })
      .then((response) => setdisconnecting({ connection, bots: response.bots ?? [] }))
      .catch(failed)
      .finally(() => setbusyId(null));
  };

  const confirmDisconnect = () => {
    if (!disconnecting) return;
    setbusyId(disconnecting.connection.id);
    DisconnectRequest({ token, connection_id: disconnecting.connection.id })
      .then((response) => {
        // The server reports bots it could NOT stop. Surfaced rather than
        // swallowed: those are still live, and only the user can escalate it.
        const failedBots = response?.failed_bots ?? [];
        toast({
          title: "Disconnected",
          description: failedBots.length
            ? `${failedBots.join(", ")} could not be stopped - revoke their tokens from the Bots screen.`
            : undefined,
          variant: failedBots.length ? "destructive" : undefined,
        });
        setdisconnecting(null);
        load();
      })
      .catch(failed)
      .finally(() => setbusyId(null));
  };

  return (
    <div className="w-full flex flex-col flex-1 bg-transparent overflow-y-auto p-[20px] font-Inter gap-[25px]">
      <div className="w-full flex flex-col gap-[4px]">
        <span className="text-[20px] font-semibold">Connections</span>
        <span className="text-[14px] text-[#525252]">
          The Chatterloop identities your agents can be published as.
        </span>
      </div>

      {loading ? (
        <span className="text-[14px] text-[#767676]">Loading…</span>
      ) : (
        <>
          <div className="flex flex-col gap-[10px]">
            <span className="text-[13px] font-semibold text-[#767676] uppercase tracking-wide">
              You
            </span>
            {personal && (
              <div className="flex flex-row items-center gap-[12px] border-[1px] border-[#e5e6ea] rounded-[8px] p-[15px] max-w-[560px]">
                <div className="w-[38px] h-[38px] rounded-full bg-[#e3e7f1] flex items-center justify-center shrink-0">
                  <FiUser style={{ fontSize: 18, color: "#21242c" }} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[14px] font-semibold">
                    {personal.external_name || personal.external_username}
                  </span>
                  <span className="text-[13px] text-[#767676]">
                    @{personal.external_username}
                  </span>
                </div>
                <span className="text-[12px] text-[#767676]">
                  Signed in
                </span>
              </div>
            )}
          </div>

          {connections.length > 0 && (
            <div className="flex flex-col gap-[10px]">
              <span className="text-[13px] font-semibold text-[#767676] uppercase tracking-wide">
                Connected pages
              </span>
              {connections.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-row items-center gap-[12px] border-[1px] border-[#e5e6ea] rounded-[8px] p-[15px] max-w-[560px]"
                >
                  <div className="w-[38px] h-[38px] rounded-full bg-[#e3e7f1] flex items-center justify-center shrink-0">
                    <MdOutlinePages style={{ fontSize: 18, color: "#21242c" }} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[14px] font-semibold">
                      {c.external_name}
                    </span>
                    <span className="text-[13px] text-[#767676]">
                      @{c.external_username} · {c.metadata?.role ?? "page"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    disabled={busyId === c.id}
                    onClick={() => askToDisconnect(c)}
                    className="h-[32px] text-[12px] text-red-600 hover:text-red-600"
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-[10px]">
            <span className="text-[13px] font-semibold text-[#767676] uppercase tracking-wide">
              Available pages
            </span>
            {pages.length === 0 ? (
              <span className="text-[14px] text-[#767676] max-w-[560px]">
                No pages available. Only Chatterloop pages you own or
                administer can be connected.
              </span>
            ) : (
              pages.map((p) => (
                <div
                  key={p.entity_id}
                  className="flex flex-row items-center gap-[12px] border-[1px] border-[#e5e6ea] rounded-[8px] p-[15px] max-w-[560px]"
                >
                  <div className="w-[38px] h-[38px] rounded-full bg-[#f3f5f9] flex items-center justify-center shrink-0">
                    <MdOutlinePages style={{ fontSize: 18, color: "#767676" }} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[14px] font-semibold">{p.name}</span>
                    <span className="text-[13px] text-[#767676]">
                      @{p.slug} · {p.role}
                    </span>
                  </div>
                  <Button
                    disabled={busyId === p.entity_id}
                    onClick={() => connectPage(p)}
                    className="gap-[5px] h-[32px] text-[12px] bg-black text-white hover:bg-black"
                  >
                    <IoMdAdd style={{ fontSize: 14, color: "#ffffff" }} />
                    <span>Connect</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={disconnecting !== null}
        onOpenChange={(open) => !open && setdisconnecting(null)}
        title={`Disconnect ${disconnecting?.connection.external_name}?`}
        confirmLabel="Disconnect"
        working={busyId !== null}
        consequence={
          disconnecting && disconnecting.bots.length > 0 ? (
            <>
              <span>
                {disconnecting.bots.length === 1
                  ? "This bot will stop answering on Chatterloop, and its tokens will be revoked:"
                  : "These bots will stop answering on Chatterloop, and their tokens will be revoked:"}
              </span>
              <ul className="flex flex-col gap-[3px] pl-[16px] list-disc">
                {disconnecting.bots.map((bot) => (
                  <li key={bot.id} className="text-[13px]">
                    {bot.name} (@{bot.handle})
                  </li>
                ))}
              </ul>
              <span>
                Reconnecting the page later does not bring them back - they need new
                tokens.
              </span>
            </>
          ) : (
            <span>
              No bots are published as this identity, so nothing stops answering. You can
              reconnect the page at any time.
            </span>
          )
        }
        onConfirm={confirmDisconnect}
      />
    </div>
  );
}

export default Connections;
