/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Roles: the system prompt, and which tools the agent may call.
 *
 * This is where an agent's behaviour actually lives, so the prompt gets room
 * rather than a single-line input.
 */
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";

import { ConfirmDialog, FormDialog } from "@/app/widgets/Modal";
import {
  Badge,
  Card,
  EmptyState,
  ErrorNotice,
  Field,
  Grid,
  Loading,
  Notice,
  Page,
  PageHeader,
} from "@/app/widgets/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Roles as RolesApi, Tools as ToolsApi } from "@/hooks/api/resources";
import { IRole, ITool } from "@/hooks/api/types";
import { useResource } from "@/hooks/useResource";

function Roles() {
  const { toast } = useToast();

  const roles = useResource<IRole[]>((ctx) => RolesApi.list(ctx), []);
  const tools = useResource<ITool[]>((ctx) => ToolsApi.list(ctx), []);

  const [creating, setcreating] = useState(false);
  const [editing, setediting] = useState<IRole | null>(null);
  const [deleting, setdeleting] = useState<IRole | null>(null);

  const [name, setname] = useState("");
  const [description, setdescription] = useState("");
  const [prompt, setprompt] = useState("");
  const [toolIds, settoolIds] = useState<number[]>([]);
  const [busy, setbusy] = useState(false);
  const [formError, setformError] = useState("");
  const [deleteError, setdeleteError] = useState("");

  const reset = () => {
    setname("");
    setdescription("");
    setprompt("");
    settoolIds([]);
    setformError("");
  };

  const openCreate = () => {
    reset();
    setcreating(true);
  };

  const openEdit = (role: IRole) => {
    setname(role.name);
    setdescription(role.description);
    setprompt(role.system_prompt);
    settoolIds(role.tools.map((tool) => tool.id));
    setformError("");
    setediting(role);
  };

  const toggleTool = (id: number) =>
    settoolIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  const submit = async () => {
    setbusy(true);
    setformError("");
    const payload = {
      name: name.trim(),
      description: description.trim(),
      system_prompt: prompt,
      tool_ids: toolIds,
    };
    try {
      if (editing) {
        await RolesApi.update(roles.ctx, editing.id, payload);
        toast({ title: `Saved ${payload.name}` });
      } else {
        await RolesApi.create(roles.ctx, payload);
        toast({ title: `Created ${payload.name}` });
      }
      setcreating(false);
      setediting(null);
      roles.reload();
    } catch (err: any) {
      setformError(err?.message ?? "Could not save that role.");
    } finally {
      setbusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setbusy(true);
    setdeleteError("");
    try {
      await RolesApi.remove(roles.ctx, deleting.id);
      toast({ title: `Deleted ${deleting.name}` });
      setdeleting(null);
      roles.reload();
    } catch (err: any) {
      // The server refuses while agents still use the role, and names them.
      // That message is far more useful than "could not delete".
      setdeleteError(err?.message ?? "Could not delete that role.");
    } finally {
      setbusy(false);
    }
  };

  return (
    <Page>
      <PageHeader
        title="Roles"
        description="A role is the system prompt an agent answers with, plus the tools it is allowed to call."
        action={
          <Button
            onClick={openCreate}
            className="gap-[5px] text-[12px] h-[35px] bg-black text-white hover:bg-black"
          >
            <IoMdAdd style={{ fontSize: "15px" }} />
            <span>New role</span>
          </Button>
        }
      />

      <ErrorNotice message={roles.error} onRetry={roles.reload} />

      {roles.loading ? (
        <Loading label="Loading roles" />
      ) : roles.data.length === 0 ? (
        <EmptyState
          title="No roles yet"
          description="A role gives an agent its instructions. Without one, an agent has nothing to answer with."
          action={
            <Button onClick={openCreate} className="mt-[6px] h-[34px] text-[13px] bg-black text-white hover:bg-black">
              New role
            </Button>
          }
        />
      ) : (
        <Grid>
          {roles.data.map((role) => (
            <Card key={role.id}>
              <div className="flex flex-row items-start gap-[8px]">
                <span className="text-[14px] font-semibold flex flex-1">{role.name}</span>
                <Badge>{role.agent_count} agent{role.agent_count === 1 ? "" : "s"}</Badge>
              </div>

              {role.description && (
                <span className="text-[12px] text-[#767676] line-clamp-2">{role.description}</span>
              )}

              <span className="text-[12px] text-[#4b5563] line-clamp-3 bg-[#f7f8fa] rounded-[6px] p-[8px] whitespace-pre-wrap">
                {role.system_prompt || "No system prompt set."}
              </span>

              <div className="flex flex-row flex-wrap gap-[5px]">
                {role.tools.length === 0 ? (
                  <span className="text-[12px] text-[#767676]">No tools</span>
                ) : (
                  role.tools.map((tool) => (
                    <Badge key={tool.id} tone={tool.is_enabled ? "good" : "warn"}>
                      {tool.name}
                      {tool.is_enabled ? "" : " (off)"}
                    </Badge>
                  ))
                )}
              </div>

              <div className="flex flex-row gap-[6px] pt-[4px]">
                <Button variant="outline" className="h-[30px] text-[12px]" onClick={() => openEdit(role)}>
                  Edit
                </Button>
                <div className="flex flex-1" />
                <Button
                  variant="outline"
                  className="h-[30px] text-[12px] text-[#c0392b]"
                  onClick={() => {
                    setdeleteError("");
                    setdeleting(role);
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </Grid>
      )}

      <FormDialog
        wide
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setcreating(false);
            setediting(null);
          }
        }}
        title={editing ? `Edit ${editing.name}` : "New role"}
        error={formError}
        submitLabel={editing ? "Save" : "Create"}
        submitting={busy}
        disabled={!name.trim() || !prompt.trim()}
        onSubmit={submit}
      >
        <Field label="Name">
          <Input value={name} autoFocus onChange={(e) => setname(e.target.value)} />
        </Field>

        <Field label="Description" hint="Optional. For your own reference.">
          <Input value={description} onChange={(e) => setdescription(e.target.value)} />
        </Field>

        <Field label="System prompt" hint="How the agent should behave, and what it should refuse.">
          <Textarea
            value={prompt}
            rows={8}
            placeholder="You are a support assistant for Acme. Answer only from the provided context…"
            onChange={(e) => setprompt(e.target.value)}
          />
        </Field>

        <Field
          label="Tools"
          hint={
            tools.data.length === 0
              ? "No tools defined yet. You can add them later."
              : "Only the tools you tick are offered to the model."
          }
        >
          <div className="flex flex-col gap-[4px] max-h-[180px] overflow-y-auto border-[1px] border-[#e5e6ea] rounded-[7px] p-[8px]">
            {tools.data.length === 0 ? (
              <span className="text-[12px] text-[#767676] px-[4px] py-[6px]">Nothing to choose yet.</span>
            ) : (
              tools.data.map((tool) => (
                <label
                  key={tool.id}
                  className="flex flex-row items-center gap-[8px] text-[13px] px-[4px] py-[4px] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={toolIds.includes(tool.id)}
                    onChange={() => toggleTool(tool.id)}
                  />
                  <span className="flex flex-1">{tool.name}</span>
                  {!tool.is_enabled && <Badge tone="warn">disabled</Badge>}
                </label>
              ))
            )}
          </div>
        </Field>

        {toolIds.some((id) => tools.data.find((tool) => tool.id === id && !tool.is_enabled)) && (
          <Notice>
            <span>
              A disabled tool stays attached but is never offered to the model. Enable it on the Tools
              screen when you want the agent to be able to call it.
            </span>
          </Notice>
        )}
      </FormDialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setdeleting(null)}
        title={`Delete ${deleting?.name}?`}
        confirmLabel="Delete"
        working={busy}
        error={deleteError}
        consequence={
          <span>
            {deleting && deleting.agent_count > 0
              ? `${deleting.agent_count} agent${deleting.agent_count === 1 ? " uses" : "s use"} this role. Reassign them first — an agent without a role has no instructions at all.`
              : "This removes the prompt and the tool assignments. It cannot be undone."}
          </span>
        }
        onConfirm={confirmDelete}
      />
    </Page>
  );
}

export default Roles;
