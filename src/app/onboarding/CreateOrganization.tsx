/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The first screen a new account sees.
 *
 * An organization owns agents, tools, knowledge and the provider keys they run
 * on, so until one exists every other route answers 403 - there is literally
 * nothing else to show. That is why this blocks rather than sitting in a menu.
 *
 * Only the name is asked for. The slug is derived server-side and collisions
 * are resolved there, so there is no second field and no "that name is taken".
 */
import { useState } from "react";
import { useSelector } from "react-redux";

import { useOrganization } from "@/app/context/OrganizationContext";
import { ErrorNotice, Field } from "@/app/widgets/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextareaAutosize } from "@/components/ui/autosize-textarea";
import { Organizations } from "@/hooks/api/resources";
import { AuthStateInterface } from "@/hooks/interfaces";

function CreateOrganization() {
  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication);
  const { reload } = useOrganization();

  const [name, setname] = useState("");
  const [description, setdescription] = useState("");
  const [submitting, setsubmitting] = useState(false);
  const [error, seterror] = useState("");

  const submit = async () => {
    if (!name.trim()) return;
    setsubmitting(true);
    seterror("");
    try {
      await Organizations.create(
        { token: authentication.user.token as string },
        { name: name.trim(), description: description.trim() },
      );
      // The provider re-reads the list and selects the new organization, which
      // is what unblocks the rest of the app.
      await reload();
    } catch (err: any) {
      seterror(err?.message ?? "Could not create that organization.");
      setsubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center font-Inter p-[20px]">
      <div className="w-full max-w-[440px] flex flex-col gap-[16px] border-[1px] border-[#e5e6ea] rounded-[12px] bg-white p-[24px]">
        <div className="flex flex-col gap-[4px]">
          <span className="text-[20px] font-semibold">Create your organization</span>
          <span className="text-[13px] text-[#767676]">
            Agents, tools, knowledge and provider keys all belong to an organization. You need one
            before you can build anything.
          </span>
        </div>

        <ErrorNotice message={error} />

        <Field label="Name">
          <Input
            value={name}
            autoFocus
            placeholder="Acme Support"
            onChange={(e) => setname(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
        </Field>

        <Field label="Description" hint="Optional.">
          <TextareaAutosize
            value={description}
            placeholder="What this organization does."
            onChange={(e) => setdescription(e.target.value)}
          />
        </Field>

        <Button
          disabled={!name.trim() || submitting}
          onClick={submit}
          className="h-[40px] text-[13px] bg-black text-white hover:bg-black"
        >
          {submitting ? "Creating…" : "Create organization"}
        </Button>

        <span className="text-[12px] text-[#767676]">
          Signed in as @{authentication.user.username}. If you expected to join an existing
          organization, ask its owner to add {authentication.user.email} instead.
        </span>
      </div>
    </div>
  );
}

export default CreateOrganization;
