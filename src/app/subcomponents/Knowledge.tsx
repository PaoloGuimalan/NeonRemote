/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Knowledge: documents an agent can answer from.
 *
 * THE EMBEDDING GAP IS SHOWN FIRST, ON PURPOSE
 * --------------------------------------------
 * Embeddings are OpenAI-only. An organization running chat on Groq has a
 * perfectly working agent and completely empty retrieval, and nothing about
 * that is visible from anywhere else - the agent just never cites anything.
 * So this screen asks the server whether embedding is configured before
 * showing an upload box, and says what to do if it is not.
 *
 * INDEXING IS ASYNCHRONOUS
 * ------------------------
 * The upload returns before the vectors exist, so a document arrives as
 * `pending` and becomes `indexed` or `failed` on a worker. This polls while
 * anything is still in flight - without that, the screen would show "pending"
 * forever and look stuck when it is merely working.
 */
import { useEffect, useRef, useState } from "react";
import { FiRefreshCw, FiUpload } from "react-icons/fi";

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
import { Credentials, Knowledge as KnowledgeApi } from "@/hooks/api/resources";
import { IEmbeddingStatus, IKnowledgeDocument, KnowledgeStatus } from "@/hooks/api/types";
import { formatToWords } from "@/hooks/reusables";
import { useResource } from "@/hooks/useResource";

const TONES: Record<KnowledgeStatus, "neutral" | "good" | "warn" | "bad"> = {
  pending: "warn",
  indexing: "warn",
  indexed: "good",
  failed: "bad",
};

const readableSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function Knowledge() {
  const { toast } = useToast();

  const documents = useResource<IKnowledgeDocument[]>((ctx) => KnowledgeApi.list(ctx), []);
  const embedding = useResource<IEmbeddingStatus>((ctx) => Credentials.embeddingStatus(ctx), {
    configured: true,
    reason: "",
  });

  const [adding, setadding] = useState(false);
  const [deleting, setdeleting] = useState<IKnowledgeDocument | null>(null);
  const [title, settitle] = useState("");
  const [content, setcontent] = useState("");
  const [busy, setbusy] = useState(false);
  const [formError, setformError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  // Poll only while something is actually in flight, and stop as soon as
  // nothing is. A screen that polls forever is a screen that keeps a tab
  // busy all day for no reason.
  const inFlight = documents.data.some(
    (document) => document.status === "pending" || document.status === "indexing",
  );
  useEffect(() => {
    if (!inFlight) return;
    const timer = setInterval(() => documents.reload(), 4000);
    return () => clearInterval(timer);
  }, [inFlight, documents.ctx.organizationId]);

  const submitText = async () => {
    setbusy(true);
    setformError("");
    try {
      await KnowledgeApi.createFromText(documents.ctx, {
        title: title.trim() || "Untitled document",
        content,
      });
      toast({ title: "Queued for indexing" });
      setadding(false);
      settitle("");
      setcontent("");
      documents.reload();
    } catch (err: any) {
      setformError(err?.message ?? "Could not index that document.");
    } finally {
      setbusy(false);
    }
  };

  const upload = async (file: File) => {
    try {
      await KnowledgeApi.upload(documents.ctx, file);
      toast({ title: `${file.name} queued for indexing` });
      documents.reload();
    } catch (err: any) {
      // The server explains refusals precisely - a PDF, a file that is not
      // UTF-8, one over the size limit - so it is shown rather than replaced.
      toast({ title: "Could not index that file", description: err?.message, variant: "destructive" });
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const reindex = async (document: IKnowledgeDocument) => {
    try {
      await KnowledgeApi.reindex(documents.ctx, document.id);
      toast({ title: `Re-indexing ${document.title}` });
      documents.reload();
    } catch (err: any) {
      toast({ title: "Could not re-index", description: err?.message, variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setbusy(true);
    try {
      await KnowledgeApi.remove(documents.ctx, deleting.id);
      toast({ title: `Deleted ${deleting.title}` });
      setdeleting(null);
      documents.reload();
    } catch (err: any) {
      toast({ title: "Could not delete", description: err?.message, variant: "destructive" });
    } finally {
      setbusy(false);
    }
  };

  const blocked = !embedding.loading && !embedding.data.configured;

  return (
    <Page>
      <PageHeader
        title="Knowledge"
        description="Documents your agents can answer from. Each one is split into chunks and indexed for retrieval."
        action={
          <div className="flex flex-row gap-[6px]">
            <input
              ref={fileInput}
              type="file"
              hidden
              accept=".txt,.md,.markdown,.csv,.json,.rst,.log,text/plain,text/markdown,text/csv,application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
              }}
            />
            <Button
              variant="outline"
              disabled={blocked}
              className="gap-[5px] text-[12px] h-[35px]"
              onClick={() => fileInput.current?.click()}
            >
              <FiUpload style={{ fontSize: "14px" }} />
              <span>Upload file</span>
            </Button>
            <Button
              disabled={blocked}
              onClick={() => {
                settitle("");
                setcontent("");
                setformError("");
                setadding(true);
              }}
              className="text-[12px] h-[35px] bg-black text-white hover:bg-black"
            >
              Paste text
            </Button>
          </div>
        }
      />

      {blocked && (
        <Notice>
          <span className="font-semibold">Retrieval is not configured yet.</span>
          <span>{embedding.data.reason}</span>
          <span>
            Embeddings are OpenAI-only, so an organization using another provider for chat still
            needs an OpenAI key here. Add one under Organization → Provider keys and mark it as the
            embedding default. Until then agents answer without any of your documents, silently.
          </span>
        </Notice>
      )}

      <ErrorNotice message={documents.error} onRetry={documents.reload} />

      {documents.loading ? (
        <Loading label="Loading documents" />
      ) : documents.data.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description="Upload a text, Markdown, CSV or JSON file, or paste text directly. PDFs need converting to text first."
        />
      ) : (
        <Grid>
          {documents.data.map((document) => (
            <Card key={document.id}>
              <div className="flex flex-row items-start gap-[8px]">
                <span className="text-[14px] font-semibold flex flex-1 line-clamp-2">
                  {document.title}
                </span>
                <Badge tone={TONES[document.status]}>{document.status}</Badge>
              </div>

              <div className="flex flex-row flex-wrap gap-[10px] text-[12px] text-[#767676]">
                {document.source_name && <span className="truncate">{document.source_name}</span>}
                <span>{readableSize(document.size_bytes)}</span>
                {document.status === "indexed" && (
                  <span>
                    {document.chunk_count} chunk{document.chunk_count === 1 ? "" : "s"}
                  </span>
                )}
                <span>{formatToWords(document.created_at)}</span>
              </div>

              {document.status === "failed" && document.error && (
                <span className="text-[12px] text-[#8c2f27] bg-[#fdf3f2] rounded-[6px] p-[8px] line-clamp-3">
                  {document.error}
                </span>
              )}

              <div className="flex flex-row gap-[6px] pt-[4px]">
                <Button
                  variant="outline"
                  disabled={blocked || document.status === "indexing"}
                  className="gap-[5px] h-[30px] text-[12px]"
                  onClick={() => reindex(document)}
                >
                  <FiRefreshCw style={{ fontSize: "13px" }} />
                  <span>Re-index</span>
                </Button>
                <div className="flex flex-1" />
                <Button
                  variant="outline"
                  className="h-[30px] text-[12px] text-[#c0392b]"
                  onClick={() => setdeleting(document)}
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
        open={adding}
        onOpenChange={setadding}
        title="Add a document"
        description="Paste the text you want your agents to be able to answer from."
        error={formError}
        submitLabel="Index it"
        submitting={busy}
        disabled={!content.trim()}
        onSubmit={submitText}
      >
        <Field label="Title" hint="What this appears as in the list.">
          <Input
            value={title}
            autoFocus
            placeholder="Refund policy"
            onChange={(e) => settitle(e.target.value)}
          />
        </Field>
        <Field label="Content">
          <Textarea
            value={content}
            rows={14}
            placeholder="Refunds are available within 30 days of purchase…"
            onChange={(e) => setcontent(e.target.value)}
          />
        </Field>
      </FormDialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setdeleting(null)}
        title={`Delete ${deleting?.title}?`}
        confirmLabel="Delete"
        working={busy}
        consequence={
          <>
            <span>Your agents stop being able to answer from it.</span>
            <span>
              The indexed chunks are removed in the background, so retrieval may still cite this
              document for a short while afterwards.
            </span>
          </>
        }
        onConfirm={confirmDelete}
      />
    </Page>
  );
}

export default Knowledge;
