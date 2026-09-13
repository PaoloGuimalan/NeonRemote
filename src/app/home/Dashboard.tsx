/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * What to do next.
 *
 * Replaces the IoT marketing page this app was forked with. It is a checklist
 * rather than a set of tiles because the steps have a real order - an agent
 * with no role has no instructions, a role's tools do nothing while disabled,
 * and knowledge indexes nothing without an embedding key - and every one of
 * those failures is silent at runtime. Saying so here is cheaper than
 * debugging an agent that answers blandly for a week.
 */
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useOrganization } from "@/app/context/OrganizationContext";
import { Badge, Card, Loading, Page, PageHeader } from "@/app/widgets/Shell";
import { Button } from "@/components/ui/button";
import { Agents as AgentsApi, Credentials, Knowledge, Roles } from "@/hooks/api/resources";
import {
  IAgent,
  IEmbeddingStatus,
  IKnowledgeDocument,
  IProviderCredential,
  IRole,
} from "@/hooks/api/types";
import { AuthStateInterface } from "@/hooks/interfaces";
import { useResource } from "@/hooks/useResource";

function Step({
  done,
  title,
  description,
  action,
  onGo,
}: {
  done: boolean;
  title: string;
  description: string;
  action: string;
  onGo: () => void;
}) {
  return (
    <Card className="flex-row items-center gap-[14px]">
      <div
        className={`w-[26px] h-[26px] rounded-[26px] flex items-center justify-center shrink-0 ${
          done ? "bg-[#e7f6ec] text-[#1f7a3f]" : "bg-[#f0f1f4] text-[#9ca3af]"
        }`}
      >
        {done ? <FiCheck style={{ fontSize: "14px" }} /> : <span className="text-[12px]">•</span>}
      </div>
      <div className="flex flex-col flex-1 gap-[2px] min-w-0">
        <span className="text-[14px] font-semibold">{title}</span>
        <span className="text-[12px] text-[#767676]">{description}</span>
      </div>
      <Button variant="outline" className="gap-[5px] h-[32px] text-[12px] shrink-0" onClick={onGo}>
        <span>{action}</span>
        <FiArrowRight style={{ fontSize: "13px" }} />
      </Button>
    </Card>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication);
  const { active } = useOrganization();

  const credentials = useResource<IProviderCredential[]>((ctx) => Credentials.list(ctx), []);
  const embedding = useResource<IEmbeddingStatus>((ctx) => Credentials.embeddingStatus(ctx), {
    configured: false,
    reason: "",
  });
  const roles = useResource<IRole[]>((ctx) => Roles.list(ctx), []);
  const agents = useResource<IAgent[]>((ctx) => AgentsApi.list(ctx), []);
  const documents = useResource<IKnowledgeDocument[]>((ctx) => Knowledge.list(ctx), []);

  const loading =
    credentials.loading || roles.loading || agents.loading || documents.loading;

  const hasKey = credentials.data.some((row) => row.has_api_key);
  const hasRole = roles.data.length > 0;
  const activeAgents = agents.data.filter((agent) => agent.is_active);
  const indexed = documents.data.filter((document) => document.status === "indexed");
  const failed = documents.data.filter((document) => document.status === "failed");

  return (
    <Page>
      <PageHeader
        title={`Welcome back, ${authentication.user.first_name || authentication.user.username}`}
        description={
          active
            ? `You are working in ${active.name}.`
            : "Choose an organization to get started."
        }
      />

      {loading ? (
        <Loading label="Checking your setup" />
      ) : (
        <>
          <div className="w-full flex flex-row flex-wrap gap-[10px]">
            <Card className="flex-1 min-w-[150px] gap-[2px]">
              <span className="text-[24px] font-semibold leading-none">{activeAgents.length}</span>
              <span className="text-[12px] text-[#767676]">
                active agent{activeAgents.length === 1 ? "" : "s"}
              </span>
            </Card>
            <Card className="flex-1 min-w-[150px] gap-[2px]">
              <span className="text-[24px] font-semibold leading-none">{roles.data.length}</span>
              <span className="text-[12px] text-[#767676]">
                role{roles.data.length === 1 ? "" : "s"}
              </span>
            </Card>
            <Card className="flex-1 min-w-[150px] gap-[2px]">
              <span className="text-[24px] font-semibold leading-none">{indexed.length}</span>
              <span className="text-[12px] text-[#767676]">indexed documents</span>
            </Card>
            <Card className="flex-1 min-w-[150px] gap-[2px]">
              <div className="flex flex-row items-center gap-[6px]">
                <span className="text-[24px] font-semibold leading-none">
                  {credentials.data.length}
                </span>
                {!hasKey && <Badge tone="bad">none usable</Badge>}
              </div>
              <span className="text-[12px] text-[#767676]">provider keys</span>
            </Card>
          </div>

          {failed.length > 0 && (
            <Card className="border-[#f3c6c4] bg-[#fdf3f2] flex-row items-center gap-[12px]">
              <span className="text-[13px] text-[#8c2f27] flex flex-1">
                {failed.length} document{failed.length === 1 ? "" : "s"} failed to index, so
                nothing in {failed.length === 1 ? "it" : "them"} can be retrieved.
              </span>
              <Button
                variant="outline"
                className="h-[30px] text-[12px] shrink-0"
                onClick={() => navigate("/knowledge")}
              >
                Review
              </Button>
            </Card>
          )}

          <div className="w-full flex flex-col gap-[8px]">
            <span className="text-[15px] font-semibold">Getting set up</span>

            <Step
              done={hasKey}
              title="Add a provider key"
              description="Nothing can answer until this organization has an API key for a model provider."
              action={hasKey ? "Manage" : "Add one"}
              onGo={() => navigate("/organization")}
            />
            <Step
              done={hasRole}
              title="Write a role"
              description="The system prompt and tools an agent answers with. An agent without one has no instructions."
              action={hasRole ? "Manage" : "Create one"}
              onGo={() => navigate("/roles")}
            />
            <Step
              done={activeAgents.length > 0}
              title="Create an agent"
              description="Give it the role, then try it in the playground."
              action={activeAgents.length > 0 ? "Manage" : "Create one"}
              onGo={() => navigate("/agents")}
            />
            <Step
              done={embedding.data.configured && indexed.length > 0}
              title="Add knowledge"
              description={
                embedding.data.configured
                  ? "Documents your agents can answer from, instead of only what the model already knows."
                  : "Needs an OpenAI key marked as the embedding default — retrieval does nothing without one."
              }
              action={indexed.length > 0 ? "Manage" : "Upload"}
              onGo={() => navigate("/knowledge")}
            />
            <Step
              done={false}
              title="Try it out"
              description="Send a message to an agent and watch it answer."
              action="Open playground"
              onGo={() => navigate("/playground")}
            />
          </div>
        </>
      )}
    </Page>
  );
}

export default Dashboard;
