/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The organization: who is in it, and the provider keys its agents run on.
 *
 * OWNERSHIP IS NARROW AND THE SCREEN SAYS SO
 * ------------------------------------------
 * The only ownership the schema expresses is who created the organization, so
 * exactly one person can rename it, manage members and manage keys. Rather
 * than hiding those controls and leaving a member wondering, they are shown
 * disabled with the reason - a member still needs to see that a key EXISTS to
 * understand why retrieval works.
 *
 * KEYS ARE WRITE-ONLY
 * -------------------
 * The API returns the last four characters and nothing else, so this screen
 * cannot display a key even to its owner. Editing one means replacing it.
 */
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";

import { useOrganization } from "@/app/context/OrganizationContext";
import { ConfirmDialog, FormDialog } from "@/app/widgets/Modal";
import {
  Badge,
  Card,
  ErrorNotice,
  Field,
  Loading,
  Notice,
  Page,
  PageHeader,
  Select,
} from "@/app/widgets/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Catalogue, Credentials, Members } from "@/hooks/api/resources";
import { IMember, IProviderCredential, IService } from "@/hooks/api/types";
import { formatToWords } from "@/hooks/reusables";
import { useResource } from "@/hooks/useResource";

function Organization() {
  const { toast } = useToast();
  const { active, reload: reloadOrganizations } = useOrganization();

  const members = useResource<IMember[]>((ctx) => Members.list(ctx), []);
  const credentials = useResource<IProviderCredential[]>((ctx) => Credentials.list(ctx), []);
  const services = useResource<IService[]>((ctx) => Catalogue.services(ctx), []);

  const isOwner = active?.is_owner ?? false;

  const [addingMember, setaddingMember] = useState(false);
  const [email, setemail] = useState("");
  const [removingMember, setremovingMember] = useState<IMember | null>(null);

  const [addingKey, setaddingKey] = useState(false);
  const [editingKey, seteditingKey] = useState<IProviderCredential | null>(null);
  const [removingKey, setremovingKey] = useState<IProviderCredential | null>(null);
  const [serviceId, setserviceId] = useState("");
  const [apiKey, setapiKey] = useState("");
  const [keyName, setkeyName] = useState("");
  const [isDefault, setisDefault] = useState(false);
  const [isEmbeddingDefault, setisEmbeddingDefault] = useState(false);

  const [busy, setbusy] = useState(false);
  const [formError, setformError] = useState("");

  const addMember = async () => {
    setbusy(true);
    setformError("");
    try {
      await Members.add(members.ctx, { email: email.trim() });
      toast({ title: "Member added" });
      setaddingMember(false);
      setemail("");
      members.reload();
      reloadOrganizations();
    } catch (err: any) {
      setformError(err?.message ?? "Could not add that member.");
    } finally {
      setbusy(false);
    }
  };

  const confirmRemoveMember = async () => {
    if (!removingMember) return;
    setbusy(true);
    try {
      await Members.remove(members.ctx, removingMember.id);
      toast({ title: `Removed ${removingMember.username}` });
      setremovingMember(null);
      members.reload();
      reloadOrganizations();
    } catch (err: any) {
      toast({ title: "Could not remove", description: err?.message, variant: "destructive" });
    } finally {
      setbusy(false);
    }
  };

  const openAddKey = () => {
    setserviceId(services.data[0] ? String(services.data[0].uuid) : "");
    setapiKey("");
    setkeyName("");
    setisDefault(false);
    setisEmbeddingDefault(false);
    setformError("");
    setaddingKey(true);
  };

  const openEditKey = (credential: IProviderCredential) => {
    setapiKey("");
    setkeyName(credential.name ?? "");
    setisDefault(credential.is_default);
    setisEmbeddingDefault(credential.is_embedding_default);
    setformError("");
    seteditingKey(credential);
  };

  const saveKey = async () => {
    setbusy(true);
    setformError("");
    try {
      if (editingKey) {
        await Credentials.update(credentials.ctx, editingKey.id, {
          // Blank means "leave it alone" - the form cannot show the existing
          // key, so it must not be able to erase it by omission either.
          ...(apiKey.trim() ? { api_key: apiKey.trim() } : {}),
          ...(keyName.trim() ? { name: keyName.trim() } : {}),
          is_default: isDefault,
          is_embedding_default: isEmbeddingDefault,
        });
        toast({ title: "Key saved" });
      } else {
        const service = services.data.find((row) => row.uuid === serviceId);
        if (!service) throw new Error("Choose a provider.");
        await Credentials.create(credentials.ctx, {
          // The numeric pk, not the uuid: a credential's foreign key is on
          // Service.id. The catalogue exposes both for exactly this reason.
          service: service.id,
          api_key: apiKey.trim(),
          ...(keyName.trim() ? { name: keyName.trim() } : {}),
          is_default: isDefault,
          is_embedding_default: isEmbeddingDefault,
        });
        toast({ title: "Key added" });
      }
      setaddingKey(false);
      seteditingKey(null);
      credentials.reload();
    } catch (err: any) {
      setformError(err?.message ?? "Could not save that key.");
    } finally {
      setbusy(false);
    }
  };

  const confirmRemoveKey = async () => {
    if (!removingKey) return;
    setbusy(true);
    try {
      await Credentials.remove(credentials.ctx, removingKey.id);
      toast({ title: "Key deleted" });
      setremovingKey(null);
      credentials.reload();
    } catch (err: any) {
      toast({ title: "Could not delete", description: err?.message, variant: "destructive" });
    } finally {
      setbusy(false);
    }
  };

  const ownerHint = isOwner ? undefined : "Only the organization's owner can change this.";

  return (
    <Page>
      <PageHeader
        title={active?.name ?? "Organization"}
        description={
          active
            ? `${active.member_count} member${active.member_count === 1 ? "" : "s"} · /${active.slug}`
            : undefined
        }
      />

      {!isOwner && (
        <Notice>
          <span>
            You are a member of this organization. Its owner manages members and provider keys.
          </span>
        </Notice>
      )}

      {/* ------------------------------------------------------- members -- */}
      <div className="w-full flex flex-col gap-[10px]">
        <div className="flex flex-row items-center gap-[10px]">
          <span className="text-[15px] font-semibold flex flex-1">Members</span>
          <Button
            disabled={!isOwner}
            title={ownerHint}
            onClick={() => {
              setemail("");
              setformError("");
              setaddingMember(true);
            }}
            className="gap-[5px] text-[12px] h-[32px] bg-black text-white hover:bg-black"
          >
            <IoMdAdd style={{ fontSize: "14px" }} />
            <span>Add member</span>
          </Button>
        </div>

        <ErrorNotice message={members.error} onRetry={members.reload} />

        {members.loading ? (
          <Loading label="Loading members" />
        ) : (
          <Card className="gap-0 p-0 overflow-hidden">
            {members.data.map((member, index) => (
              <div
                key={member.id}
                className={`flex flex-row items-center gap-[12px] p-[12px] ${
                  index > 0 ? "border-t-[1px] border-[#f0f1f4]" : ""
                }`}
              >
                <div className="flex flex-col flex-1 gap-[1px] min-w-0">
                  <div className="flex flex-row items-center gap-[6px]">
                    <span className="text-[13px] font-semibold truncate">
                      {member.full_name || member.username}
                    </span>
                    {member.is_owner && <Badge tone="good">owner</Badge>}
                  </div>
                  <span className="text-[12px] text-[#767676] truncate">
                    @{member.username} · {member.email}
                  </span>
                </div>
                <span className="text-[12px] text-[#767676] hidden md:flex">
                  {member.date_joined ? formatToWords(member.date_joined) : ""}
                </span>
                {!member.is_owner && isOwner && (
                  <Button
                    variant="outline"
                    className="h-[28px] text-[12px] text-[#c0392b]"
                    onClick={() => setremovingMember(member)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* --------------------------------------------------- provider keys -- */}
      <div className="w-full flex flex-col gap-[10px]">
        <div className="flex flex-row items-center gap-[10px]">
          <span className="text-[15px] font-semibold flex flex-1">Provider keys</span>
          <Button
            disabled={!isOwner}
            title={ownerHint}
            onClick={openAddKey}
            className="gap-[5px] text-[12px] h-[32px] bg-black text-white hover:bg-black"
          >
            <IoMdAdd style={{ fontSize: "14px" }} />
            <span>Add key</span>
          </Button>
        </div>

        <Notice>
          <span>
            You can hold several keys for one provider and assign them per bot — useful when one
            bot's spend has to be billed separately, or rate-limited on its own. A bot with no key
            of its own uses the provider's <strong>default</strong>.
          </span>
          <span>
            Embeddings are a separate choice, and OpenAI-only: mark an OpenAI key as the embedding
            default or Knowledge retrieval does nothing at all.
          </span>
        </Notice>

        <ErrorNotice message={credentials.error} onRetry={credentials.reload} />

        {credentials.loading ? (
          <Loading label="Loading keys" />
        ) : credentials.data.length === 0 ? (
          <Card>
            <span className="text-[13px] text-[#767676]">
              No provider keys yet. Agents cannot answer until one is configured.
            </span>
          </Card>
        ) : (
          <Card className="gap-0 p-0 overflow-hidden">
            {credentials.data.map((credential, index) => (
              <div
                key={credential.id}
                className={`flex flex-row items-center gap-[12px] p-[12px] ${
                  index > 0 ? "border-t-[1px] border-[#f0f1f4]" : ""
                }`}
              >
                <div className="flex flex-col flex-1 gap-[1px] min-w-0">
                  <div className="flex flex-row items-center gap-[6px] flex-wrap">
                    <span className="text-[13px] font-semibold">{credential.label}</span>
                    <Badge>{credential.service_name}</Badge>
                    {credential.is_default && <Badge tone="good">default</Badge>}
                    {credential.bot_count > 0 && (
                      <Badge>
                        {credential.bot_count} bot{credential.bot_count === 1 ? "" : "s"}
                      </Badge>
                    )}
                    {credential.is_embedding_default && <Badge tone="good">embeddings</Badge>}
                    {!credential.has_api_key && <Badge tone="bad">no key set</Badge>}
                    {credential.api_key_hint === "unreadable" && (
                      <Badge tone="bad">unreadable — replace it</Badge>
                    )}
                  </div>
                  <span className="text-[12px] text-[#767676] font-mono">
                    {credential.has_api_key ? credential.api_key_hint : "—"}
                  </span>
                </div>
                {isOwner && (
                  <>
                    <Button
                      variant="outline"
                      className="h-[28px] text-[12px]"
                      onClick={() => openEditKey(credential)}
                    >
                      Replace
                    </Button>
                    <Button
                      variant="outline"
                      className="h-[28px] text-[12px] text-[#c0392b]"
                      onClick={() => setremovingKey(credential)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>

      <FormDialog
        open={addingMember}
        onOpenChange={setaddingMember}
        title="Add a member"
        description="They need a Neon account already — sign-in is handled by Chatterloop, so Neon cannot create one."
        error={formError}
        submitLabel="Add"
        submitting={busy}
        disabled={!email.trim()}
        onSubmit={addMember}
      >
        <Field label="Email" hint="The address on their Neon account.">
          <Input
            value={email}
            autoFocus
            type="email"
            placeholder="teammate@example.com"
            onChange={(e) => setemail(e.target.value)}
          />
        </Field>
      </FormDialog>

      <FormDialog
        open={addingKey || editingKey !== null}
        onOpenChange={(open) => {
          if (!open) {
            setaddingKey(false);
            seteditingKey(null);
          }
        }}
        title={editingKey ? `Replace the ${editingKey.service_name} key` : "Add a provider key"}
        error={formError}
        submitLabel="Save"
        submitting={busy}
        disabled={!editingKey && !apiKey.trim()}
        onSubmit={saveKey}
      >
        <Field
          label="Name"
          hint="Optional. How you tell this key from the others — it is named after the provider if you leave it blank."
        >
          <Input
            value={keyName}
            placeholder="Billing: Acme Corp"
            onChange={(e) => setkeyName(e.target.value)}
          />
        </Field>

        {!editingKey && (
          <Field label="Provider">
            <Select value={serviceId} onChange={setserviceId}>
              {services.data.map((service) => (
                <option key={service.uuid} value={service.uuid}>
                  {service.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field
          label="API key"
          hint={
            editingKey
              ? "Leave blank to keep the existing key and only change the embedding setting."
              : "Stored encrypted. It is never shown again after this."
          }
        >
          <Input
            type="password"
            autoFocus
            value={apiKey}
            placeholder={editingKey ? "•••••••• (unchanged)" : "sk-…"}
            onChange={(e) => setapiKey(e.target.value)}
          />
        </Field>

        <label className="flex flex-row items-center gap-[8px] text-[13px] cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setisDefault(e.target.checked)}
          />
          <span>Default for this provider</span>
        </label>
        <span className="text-[12px] text-[#767676] -mt-[8px]">
          Used by every bot that has not been given a key of its own. Only one key per provider
          can be the default.
        </span>

        <label className="flex flex-row items-center gap-[8px] text-[13px] cursor-pointer">
          <input
            type="checkbox"
            checked={isEmbeddingDefault}
            onChange={(e) => setisEmbeddingDefault(e.target.checked)}
          />
          <span>Use this key for embeddings</span>
        </label>
        <span className="text-[12px] text-[#767676] -mt-[8px]">
          Only one key can be the embedding default. Ticking this unsets whichever one holds it now.
        </span>
      </FormDialog>

      <ConfirmDialog
        open={removingMember !== null}
        onOpenChange={(open) => !open && setremovingMember(null)}
        title={`Remove ${removingMember?.username}?`}
        confirmLabel="Remove"
        working={busy}
        consequence={
          <span>
            They lose access to this organization's agents, tools and conversations. Anything they
            created stays.
          </span>
        }
        onConfirm={confirmRemoveMember}
      />

      <ConfirmDialog
        open={removingKey !== null}
        onOpenChange={(open) => !open && setremovingKey(null)}
        title={`Delete ${removingKey?.label}?`}
        confirmLabel="Delete"
        working={busy}
        consequence={
          <>
            <span>
              Agents using {removingKey?.service_name} stop working immediately, and the key cannot
              be recovered — you would need the original from the provider.
            </span>
            {removingKey && removingKey.bot_count > 0 && (
              <span>
                {removingKey.bot_count} bot{removingKey.bot_count === 1 ? "" : "s"} assigned to
                this key will fall back to the provider's default — a billing change, so worth
                checking first.
              </span>
            )}
            {removingKey?.is_embedding_default && (
              <span className="font-semibold">
                This is the embedding key. Deleting it stops all knowledge retrieval, silently.
              </span>
            )}
          </>
        }
        onConfirm={confirmRemoveKey}
      />
    </Page>
  );
}

export default Organization;
