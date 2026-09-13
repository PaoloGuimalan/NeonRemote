/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Agents: a name, a role, and whether they are live.
 *
 * An agent is thin on purpose - the behaviour lives in its role, which carries
 * the system prompt and the tools. The editor therefore links to the role
 * rather than inlining it, so there is one place a prompt is edited and no
 * question about which copy won.
 */
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";

import { ConfirmDialog, FormDialog } from "@/app/widgets/Modal";
import {
  Badge,
  Card,
  EmptyState,
  ErrorNotice,
  Field,
  Grid,
  Loading,
  Page,
  PageHeader,
  Select,
} from "@/app/widgets/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Agents as AgentsApi, Roles as RolesApi } from "@/hooks/api/resources";
import { IAgent, IRole } from "@/hooks/api/types";
import { useResource } from "@/hooks/useResource";

function Agents() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const agents = useResource<IAgent[]>((ctx) => AgentsApi.list(ctx), []);
  const roles = useResource<IRole[]>((ctx) => RolesApi.list(ctx), []);

  const [editing, setediting] = useState<IAgent | null>(null);
  const [creating, setcreating] = useState(false);
  const [deactivating, setdeactivating] = useState<IAgent | null>(null);

  const [name, setname] = useState("");
  const [roleId, setroleId] = useState("");
  const [busy, setbusy] = useState(false);
  const [formError, setformError] = useState("");

  const openCreate = () => {
    setname("");
    setroleId("");
    setformError("");
    setcreating(true);
  };

  const openEdit = (agent: IAgent) => {
    setname(agent.name);
    setroleId(agent.role ? String(agent.role.id) : "");
    setformError("");
    setediting(agent);
  };

  const submit = async () => {
    setbusy(true);
    setformError("");
    // An empty selection means "no role", which the API expects as null rather
    // than as a missing key - otherwise clearing a role would be indistinguishable
    // from not touching it.
    const payload = { name: name.trim(), role_id: roleId ? Number(roleId) : null };
    try {
      if (editing) {
        await AgentsApi.update(agents.ctx, editing.uuid, payload);
        toast({ title: `Saved ${payload.name}` });
      } else {
        await AgentsApi.create(agents.ctx, payload);
        toast({ title: `Created ${payload.name}` });
      }
      setediting(null);
      setcreating(false);
      agents.reload();
    } catch (err: any) {
      setformError(err?.message ?? "Could not save that agent.");
    } finally {
      setbusy(false);
    }
  };

  const toggleActive = async (agent: IAgent) => {
    try {
      await AgentsApi.update(agents.ctx, agent.uuid, { is_active: !agent.is_active });
      agents.reload();
    } catch (err: any) {
      toast({ title: "Could not change that", description: err?.message, variant: "destructive" });
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivating) return;
    setbusy(true);
    try {
      await AgentsApi.deactivate(agents.ctx, deactivating.uuid);
      toast({ title: `${deactivating.name} deactivated` });
      setdeactivating(null);
      agents.reload();
    } catch (err: any) {
      toast({ title: "Could not deactivate", description: err?.message, variant: "destructive" });
    } finally {
      setbusy(false);
    }
  };

  const roleOptions = (
    <>
      <option value="">No role</option>
      {roles.data.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </>
  );

  return (
    <Page>
      <PageHeader
        title="Agents"
        description="An agent answers as the role you give it. The role carries the system prompt and the tools."
        action={
          <Button
            onClick={openCreate}
            className="gap-[5px] text-[12px] h-[35px] bg-black text-white hover:bg-black"
          >
            <IoMdAdd style={{ fontSize: "15px" }} />
            <span>New agent</span>
          </Button>
        }
      />

      <ErrorNotice message={agents.error} onRetry={agents.reload} />

      {agents.loading ? (
        <Loading label="Loading agents" />
      ) : agents.data.length === 0 ? (
        <EmptyState
          title="No agents yet"
          description="Create one, give it a role, and try it in the playground."
          action={
            <Button onClick={openCreate} className="mt-[6px] h-[34px] text-[13px] bg-black text-white hover:bg-black">
              New agent
            </Button>
          }
        />
      ) : (
        <Grid>
          {agents.data.map((agent) => (
            <Card key={agent.uuid}>
              <div className="flex flex-row items-start gap-[8px]">
                <div className="flex flex-col flex-1 gap-[2px]">
                  <span className="text-[14px] font-semibold">{agent.name}</span>
                  <span className="text-[12px] text-[#767676]">/{agent.slug}</span>
                </div>
                <Badge tone={agent.is_active ? "good" : "neutral"}>
                  {agent.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex flex-row items-center gap-[6px] text-[12px] text-[#4b5563]">
                <span>Role:</span>
                {agent.role ? (
                  <button
                    onClick={() => navigate("/roles")}
                    className="font-semibold underline underline-offset-2"
                  >
                    {agent.role.name}
                  </button>
                ) : (
                  // Worth flagging rather than showing a dash: an agent with no
                  // role has no system prompt and no tools, which reads as a
                  // broken agent rather than an unfinished one.
                  <span className="text-[#8a6100]">None — it has no instructions yet</span>
                )}
              </div>

              <div className="flex flex-row gap-[6px] pt-[4px]">
                <Button variant="outline" className="h-[30px] text-[12px]" onClick={() => openEdit(agent)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="h-[30px] text-[12px]"
                  onClick={() => navigate(`/playground?agent=${agent.uuid}`)}
                >
                  Try it
                </Button>
                <div className="flex flex-1" />
                {agent.is_active ? (
                  <Button
                    variant="outline"
                    className="h-[30px] text-[12px] text-[#c0392b]"
                    onClick={() => setdeactivating(agent)}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button variant="outline" className="h-[30px] text-[12px]" onClick={() => toggleActive(agent)}>
                    Reactivate
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </Grid>
      )}

      <FormDialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setcreating(false);
            setediting(null);
          }
        }}
        title={editing ? `Edit ${editing.name}` : "New agent"}
        description={editing ? undefined : "The URL slug is derived from the name."}
        error={formError}
        submitLabel={editing ? "Save" : "Create"}
        submitting={busy}
        disabled={!name.trim()}
        onSubmit={submit}
      >
        <Field label="Name">
          <Input value={name} autoFocus onChange={(e) => setname(e.target.value)} />
        </Field>
        <Field
          label="Role"
          hint={
            roles.data.length === 0
              ? "No roles yet — create one first, or the agent will have no instructions."
              : "The system prompt and tools come from here."
          }
        >
          <Select value={roleId} onChange={setroleId}>
            {roleOptions}
          </Select>
        </Field>
      </FormDialog>

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setdeactivating(null)}
        title={`Deactivate ${deactivating?.name}?`}
        confirmLabel="Deactivate"
        working={busy}
        consequence={
          <>
            <span>
              It stops answering. Its conversation history is kept — messages record which agent wrote
              them, so the agent is deactivated rather than deleted.
            </span>
            <span>You can reactivate it at any time.</span>
          </>
        }
        onConfirm={confirmDeactivate}
      />
    </Page>
  );
}

export default Agents;
