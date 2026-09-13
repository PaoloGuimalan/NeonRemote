/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tools: HTTP endpoints an agent can call mid-conversation.
 *
 * TWO THINGS THIS SCREEN IS CAREFUL ABOUT
 * ---------------------------------------
 * 1. The credential is write-only. The API never returns it, so this screen
 *    cannot show it - only whether one is stored. The field is left blank on
 *    edit and an empty value means "leave it alone", because a form that
 *    cannot display a secret must not be able to silently erase it either.
 *
 * 2. The parameters schema is validated before it is sent. A malformed schema
 *    makes the model provider reject the whole completion, so one broken tool
 *    takes out every conversation in the organization - not just the tool.
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
  Select,
} from "@/app/widgets/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ToolPayload, Tools as ToolsApi } from "@/hooks/api/resources";
import { ITool } from "@/hooks/api/types";
import { useResource } from "@/hooks/useResource";

const prettyJson = (value: unknown) => (value ? JSON.stringify(value, null, 2) : "");

function Tools() {
  const { toast } = useToast();
  const tools = useResource<ITool[]>((ctx) => ToolsApi.list(ctx), []);

  const [creating, setcreating] = useState(false);
  const [editing, setediting] = useState<ITool | null>(null);
  const [deleting, setdeleting] = useState<ITool | null>(null);

  const [name, setname] = useState("");
  const [description, setdescription] = useState("");
  const [endpoint, setendpoint] = useState("");
  const [method, setmethod] = useState<"GET" | "POST">("POST");
  const [paramType, setparamType] = useState<"query" | "route" | "body">("query");
  const [schema, setschema] = useState("");
  const [headers, setheaders] = useState("");
  const [authentication, setauthentication] = useState("");
  const [enabled, setenabled] = useState(false);
  const [busy, setbusy] = useState(false);
  const [formError, setformError] = useState("");
  const [schemaError, setschemaError] = useState("");

  const openCreate = () => {
    setname("");
    setdescription("");
    setendpoint("");
    setmethod("POST");
    setparamType("query");
    setschema("");
    setheaders("");
    setauthentication("");
    setenabled(false);
    setformError("");
    setschemaError("");
    setcreating(true);
  };

  const openEdit = (tool: ITool) => {
    setname(tool.name);
    setdescription(tool.description);
    setendpoint(tool.api_endpoint ?? "");
    setmethod(tool.http_method);
    setparamType(tool.param_type);
    setschema(prettyJson(tool.parameters_schema));
    setheaders(prettyJson(tool.headers_schema));
    // Deliberately blank. The server never sends the stored credential, so
    // there is nothing to prefill with, and a placeholder would imply there is.
    setauthentication("");
    setenabled(tool.is_enabled);
    setformError("");
    setschemaError("");
    setediting(tool);
  };

  const parseJsonField = (raw: string, label: string): Record<string, unknown> | null => {
    if (!raw.trim()) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error(`${label} must be a JSON object, not an array or a value.`);
    }
    return parsed as Record<string, unknown>;
  };

  const submit = async () => {
    setschemaError("");
    setformError("");

    let parameters_schema: Record<string, unknown> | null;
    let headers_schema: Record<string, unknown> | null;
    try {
      parameters_schema = parseJsonField(schema, "The parameters schema");
      headers_schema = parseJsonField(headers, "The headers schema");
    } catch (err: any) {
      setschemaError(err?.message ?? "That is not valid JSON.");
      return;
    }

    const payload: ToolPayload = {
      name: name.trim(),
      description: description.trim(),
      api_endpoint: endpoint.trim() || null,
      http_method: method,
      param_type: paramType,
      requires_auth: Boolean(authentication.trim()) || (editing?.has_authentication ?? false),
      is_enabled: enabled,
      parameters_schema,
      headers_schema,
    };
    // Only sent when the user actually typed one, so editing a tool's name
    // cannot wipe the credential it already has.
    if (authentication.trim()) payload.authentication = authentication.trim();

    setbusy(true);
    try {
      if (editing) {
        await ToolsApi.update(tools.ctx, editing.id, payload);
        toast({ title: `Saved ${payload.name}` });
      } else {
        await ToolsApi.create(tools.ctx, payload);
        toast({ title: `Created ${payload.name}` });
      }
      setcreating(false);
      setediting(null);
      tools.reload();
    } catch (err: any) {
      setformError(err?.message ?? "Could not save that tool.");
    } finally {
      setbusy(false);
    }
  };

  const toggleEnabled = async (tool: ITool) => {
    try {
      await ToolsApi.update(tools.ctx, tool.id, { is_enabled: !tool.is_enabled });
      tools.reload();
    } catch (err: any) {
      toast({ title: "Could not change that", description: err?.message, variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setbusy(true);
    try {
      await ToolsApi.remove(tools.ctx, deleting.id);
      toast({ title: `Deleted ${deleting.name}` });
      setdeleting(null);
      tools.reload();
    } catch (err: any) {
      toast({ title: "Could not delete", description: err?.message, variant: "destructive" });
    } finally {
      setbusy(false);
    }
  };

  return (
    <Page>
      <PageHeader
        title="Tools"
        description="An HTTP endpoint the model can call mid-conversation. The model chooses the arguments; your server answers."
        action={
          <Button
            onClick={openCreate}
            className="gap-[5px] text-[12px] h-[35px] bg-black text-white hover:bg-black"
          >
            <IoMdAdd style={{ fontSize: "15px" }} />
            <span>New tool</span>
          </Button>
        }
      />

      <ErrorNotice message={tools.error} onRetry={tools.reload} />

      {tools.loading ? (
        <Loading label="Loading tools" />
      ) : tools.data.length === 0 ? (
        <EmptyState
          title="No tools yet"
          description="Tools let an agent look something up or take an action instead of only answering from text."
          action={
            <Button onClick={openCreate} className="mt-[6px] h-[34px] text-[13px] bg-black text-white hover:bg-black">
              New tool
            </Button>
          }
        />
      ) : (
        <Grid>
          {tools.data.map((tool) => (
            <Card key={tool.id}>
              <div className="flex flex-row items-start gap-[8px]">
                <span className="text-[14px] font-semibold flex flex-1">{tool.name}</span>
                <Badge tone={tool.is_enabled ? "good" : "neutral"}>
                  {tool.is_enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              {tool.description && (
                <span className="text-[12px] text-[#767676] line-clamp-2">{tool.description}</span>
              )}

              <div className="flex flex-row items-center gap-[6px] text-[12px]">
                <Badge>{tool.http_method}</Badge>
                <span className="text-[#4b5563] truncate flex flex-1">
                  {tool.api_endpoint || "No endpoint set"}
                </span>
              </div>

              <div className="flex flex-row gap-[5px]">
                <Badge>{tool.param_type}</Badge>
                {tool.has_authentication && <Badge tone="good">credential stored</Badge>}
              </div>

              <div className="flex flex-row gap-[6px] pt-[4px]">
                <Button variant="outline" className="h-[30px] text-[12px]" onClick={() => openEdit(tool)}>
                  Edit
                </Button>
                <Button variant="outline" className="h-[30px] text-[12px]" onClick={() => toggleEnabled(tool)}>
                  {tool.is_enabled ? "Disable" : "Enable"}
                </Button>
                <div className="flex flex-1" />
                <Button
                  variant="outline"
                  className="h-[30px] text-[12px] text-[#c0392b]"
                  onClick={() => setdeleting(tool)}
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
        title={editing ? `Edit ${editing.name}` : "New tool"}
        error={formError}
        submitLabel={editing ? "Save" : "Create"}
        submitting={busy}
        disabled={!name.trim()}
        onSubmit={submit}
      >
        <Field label="Name" hint="What the model sees. Short and descriptive, like `search_orders`.">
          <Input value={name} autoFocus onChange={(e) => setname(e.target.value)} />
        </Field>

        <Field
          label="Description"
          hint="The model decides whether to call the tool from this. Say what it does and when to use it."
        >
          <Textarea value={description} rows={2} onChange={(e) => setdescription(e.target.value)} />
        </Field>

        <Field label="Endpoint">
          <Input
            value={endpoint}
            placeholder="https://api.example.com/orders/search"
            onChange={(e) => setendpoint(e.target.value)}
          />
        </Field>

        <div className="flex flex-row gap-[12px]">
          <Field label="Method">
            <Select value={method} onChange={(value) => setmethod(value as "GET" | "POST")}>
              <option value="POST">POST</option>
              <option value="GET">GET</option>
            </Select>
          </Field>
          <Field label="Arguments sent as">
            <Select
              value={paramType}
              onChange={(value) => setparamType(value as "query" | "route" | "body")}
            >
              <option value="query">Query string</option>
              <option value="body">JSON body</option>
              <option value="route">Route path</option>
            </Select>
          </Field>
        </div>

        <Field
          label="Parameters schema"
          hint="JSON Schema describing the arguments. Leave blank for a tool that takes none."
          error={schemaError}
        >
          <Textarea
            value={schema}
            rows={7}
            className="font-mono text-[12px]"
            placeholder={'{\n  "type": "object",\n  "properties": {\n    "order_id": { "type": "string" }\n  },\n  "required": ["order_id"]\n}'}
            onChange={(e) => setschema(e.target.value)}
          />
        </Field>

        <Field label="Extra headers" hint="Optional JSON object sent with every call.">
          <Textarea
            value={headers}
            rows={3}
            className="font-mono text-[12px]"
            onChange={(e) => setheaders(e.target.value)}
          />
        </Field>

        <Field
          label="Credential"
          hint={
            editing?.has_authentication
              ? "A credential is stored. Leave blank to keep it, or type a new one to replace it."
              : "Sent as the Authorization header when the tool is called."
          }
        >
          <Input
            type="password"
            value={authentication}
            placeholder={editing?.has_authentication ? "•••••••• (unchanged)" : "Bearer …"}
            onChange={(e) => setauthentication(e.target.value)}
          />
        </Field>

        <label className="flex flex-row items-center gap-[8px] text-[13px] cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={(e) => setenabled(e.target.checked)} />
          <span>Enabled — offer this tool to the model</span>
        </label>

        {enabled && !endpoint.trim() && (
          <Notice>
            <span>
              An enabled tool needs an endpoint. Without one the model will choose it and the call
              will fail, which looks like a broken agent rather than an unfinished tool.
            </span>
          </Notice>
        )}

        <Notice>
          <span>
            The credential is stored server-side and never sent back to this screen — not in the
            listing, and not into the model's prompt.
          </span>
        </Notice>
      </FormDialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setdeleting(null)}
        title={`Delete ${deleting?.name}?`}
        confirmLabel="Delete"
        working={busy}
        consequence={
          <span>
            Any role using this tool simply stops offering it. The stored credential is deleted too
            and cannot be recovered.
          </span>
        }
        onConfirm={confirmDelete}
      />
    </Page>
  );
}

export default Tools;
