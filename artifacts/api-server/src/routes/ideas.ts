import { Router, type IRouter } from "express";
import { db, ideasTable, preordersTable, companiesTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import {
  CreateIdeaBody,
  GetIdeaParams,
  VoteIdeaParams,
  PreorderIdeaParams,
  PreorderIdeaBody,
  ListIdeasQueryParams,
  ListIdeasResponse,
  GetIdeaResponse,
  CreateIdeaResponse,
  VoteIdeaResponse,
  PreorderIdeaResponse,
  GetIdeasSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type IdeaRow = typeof ideasTable.$inferSelect;
type IdeaStatus = "voting" | "preorder" | "producing";

function computeStatus(idea: IdeaRow): IdeaStatus {
  if (idea.preorderCount >= idea.preorderThreshold) {
    return "producing";
  }
  if (idea.voteCount >= idea.voteThreshold) {
    return "preorder";
  }
  return "voting";
}

function withStatus(idea: IdeaRow) {
  return { ...idea, status: computeStatus(idea) };
}

router.get("/ideas", async (req, res): Promise<void> => {
  const query = ListIdeasQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.companyId !== undefined) {
    conditions.push(eq(ideasTable.companyId, query.data.companyId));
  }

  const ideas = await db
    .select()
    .from(ideasTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(ideasTable.createdAt);

  let withComputedStatus = ideas.map(withStatus);
  if (query.data.status !== undefined) {
    withComputedStatus = withComputedStatus.filter(
      (idea) => idea.status === query.data.status,
    );
  }

  res.json(ListIdeasResponse.parse(withComputedStatus));
});

router.post("/ideas", async (req, res): Promise<void> => {
  const parsed = CreateIdeaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, parsed.data.companyId));

  if (!company) {
    res.status(400).json({ error: "Company not found" });
    return;
  }

  const [idea] = await db.insert(ideasTable).values(parsed.data).returning();

  res.status(201).json(CreateIdeaResponse.parse(withStatus(idea)));
});

router.get("/ideas/summary", async (_req, res): Promise<void> => {
  const [row] = await db
    .select({
      totalIdeas: sql<number>`count(*)::int`,
      totalVotes: sql<number>`coalesce(sum(${ideasTable.voteCount}), 0)::int`,
      totalPreorders: sql<number>`coalesce(sum(${ideasTable.preorderCount}), 0)::int`,
      ideasInProduction: sql<number>`count(*) filter (where ${ideasTable.preorderCount} >= ${ideasTable.preorderThreshold})::int`,
    })
    .from(ideasTable);

  res.json(
    GetIdeasSummaryResponse.parse(
      row ?? {
        totalIdeas: 0,
        totalVotes: 0,
        totalPreorders: 0,
        ideasInProduction: 0,
      },
    ),
  );
});

router.get("/ideas/:id", async (req, res): Promise<void> => {
  const params = GetIdeaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [idea] = await db
    .select()
    .from(ideasTable)
    .where(eq(ideasTable.id, params.data.id));

  if (!idea) {
    res.status(404).json({ error: "Idea not found" });
    return;
  }

  res.json(GetIdeaResponse.parse(withStatus(idea)));
});

router.post("/ideas/:id/vote", async (req, res): Promise<void> => {
  const params = VoteIdeaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [idea] = await db
    .update(ideasTable)
    .set({ voteCount: sql`${ideasTable.voteCount} + 1` })
    .where(eq(ideasTable.id, params.data.id))
    .returning();

  if (!idea) {
    res.status(404).json({ error: "Idea not found" });
    return;
  }

  res.json(VoteIdeaResponse.parse(withStatus(idea)));
});

router.post("/ideas/:id/preorder", async (req, res): Promise<void> => {
  const params = PreorderIdeaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = PreorderIdeaBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [idea] = await db
    .select()
    .from(ideasTable)
    .where(eq(ideasTable.id, params.data.id));

  if (!idea) {
    res.status(404).json({ error: "Idea not found" });
    return;
  }

  if (computeStatus(idea) === "voting") {
    res.status(400).json({
      error: "This idea has not reached the preorder phase yet",
    });
    return;
  }

  try {
    const updated = await db.transaction(async (tx) => {
      // Unique index on (ideaId, email) rejects a duplicate preorder from
      // the same email for the same idea, keeping preorderCount honest.
      await tx.insert(preordersTable).values({
        ideaId: idea.id,
        email: body.data.email,
      });

      const [row] = await tx
        .update(ideasTable)
        .set({ preorderCount: sql`${ideasTable.preorderCount} + 1` })
        .where(eq(ideasTable.id, params.data.id))
        .returning();

      return row;
    });

    res.json(PreorderIdeaResponse.parse(withStatus(updated)));
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "23505") {
      res.status(409).json({ error: "This email has already preordered this idea" });
      return;
    }
    throw err;
  }
});

export default router;

