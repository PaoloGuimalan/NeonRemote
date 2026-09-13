/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The model catalogue. Read-only, and that is deliberate.
 *
 * "OpenAI" and "gpt-4o-mini" mean the same thing to every organization, so
 * these are platform data rather than tenant data - letting one organization
 * rename or delete a model would change it for everybody. The useful thing
 * this screen does is connect the catalogue to your own keys: a model whose
 * provider you have no key for cannot be used, and nothing else says so.
 */
import { useOrganization } from "@/app/context/OrganizationContext";
import {
  Badge,
  Card,
  EmptyState,
  ErrorNotice,
  Loading,
  Notice,
  Page,
  PageHeader,
} from "@/app/widgets/Shell";
import { Catalogue, Credentials } from "@/hooks/api/resources";
import { IModel, IProviderCredential } from "@/hooks/api/types";
import { useResource } from "@/hooks/useResource";

function Models() {
  const { active } = useOrganization();
  const models = useResource<IModel[]>((ctx) => Catalogue.models(ctx), []);
  const credentials = useResource<IProviderCredential[]>((ctx) => Credentials.list(ctx), []);

  const configured = new Set(
    credentials.data.filter((row) => row.has_api_key).map((row) => row.service_name.toLowerCase()),
  );

  const grouped = models.data.reduce<Record<string, IModel[]>>((acc, model) => {
    const key = model.service_name || "Unknown provider";
    (acc[key] ||= []).push(model);
    return acc;
  }, {});

  return (
    <Page>
      <PageHeader
        title="Models"
        description="The models available on the platform, and whether this organization has a key for them."
      />

      <ErrorNotice message={models.error} onRetry={models.reload} />

      {models.loading ? (
        <Loading label="Loading models" />
      ) : models.data.length === 0 ? (
        <EmptyState
          title="No models in the catalogue"
          description="Models are platform data. Ask an administrator to add one."
        />
      ) : (
        <div className="w-full flex flex-col gap-[16px]">
          {Object.entries(grouped).map(([service, rows]) => {
            const usable = configured.has(service.toLowerCase());
            return (
              <div key={service} className="flex flex-col gap-[8px]">
                <div className="flex flex-row items-center gap-[8px]">
                  <span className="text-[15px] font-semibold">{service}</span>
                  <Badge tone={usable ? "good" : "warn"}>
                    {usable ? "key configured" : "no key"}
                  </Badge>
                </div>
                <Card className="gap-0 p-0 overflow-hidden">
                  {rows.map((model, index) => (
                    <div
                      key={model.uuid}
                      className={`flex flex-row items-center gap-[12px] p-[11px] ${
                        index > 0 ? "border-t-[1px] border-[#f0f1f4]" : ""
                      }`}
                    >
                      <span className="text-[13px] font-mono flex flex-1 truncate">
                        {model.model}
                      </span>
                      {!usable && (
                        <span className="text-[12px] text-[#8a6100]">
                          unusable without a {service} key
                        </span>
                      )}
                    </div>
                  ))}
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {!credentials.loading && configured.size === 0 && (
        <Notice>
          <span>
            {active?.name ?? "This organization"} has no provider keys, so none of these models can
            be used yet. Add one under Organization → Provider keys.
          </span>
        </Notice>
      )}
    </Page>
  );
}

export default Models;
