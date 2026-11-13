# Topic Architecture (Phase 2)

Independent SEO/AEO topic hubs. Does **not** change Category (flat) or `/courses/{slug}`.

## URLs

| Surface | Path |
|--------|------|
| Index | `/topics` |
| Hub | `/topics/{slug}` |
| Course | `/courses/{slug}` (unchanged) |
| Journal | `/journal/{slug}` (unchanged) |

## Models

- `Topic` — hub with optional `parentTopicId` (max depth 3: root → child → grandchild)
- `CourseTopic` / `JournalTopic` — many-to-many
- `TopicRelation` — semantic edges (`RELATED` used in admin v1; `PREREQUISITE` / `NEXT` / `ALTERNATIVE` API-ready)

**Decision:** Category stays flat. Hierarchy lives only on Topic. Parent delete is `RESTRICT` (reparent/delete children first). Junction deletes cascade when Topic/Course/Article is removed; Course/Article rows are never deleted by Topic ops.

## Migration

- File: `packages/database/prisma/migrations/20261113120000_topics/migration.sql`
- Additive only — no data rewrite of existing tables
- **Do not run on production without explicit approval**

### Apply (staging / local)

```bash
pnpm --filter @zharfa/database migrate:deploy
# or docker compose profile tools migrate
```

### Rollback / recovery

```sql
DROP TABLE IF EXISTS "TopicRelation";
DROP TABLE IF EXISTS "JournalTopic";
DROP TABLE IF EXISTS "CourseTopic";
DROP TABLE IF EXISTS "Topic";
DROP TYPE IF EXISTS "TopicRelationType";
DROP TYPE IF EXISTS "TopicPublicationStatus";
DELETE FROM "_prisma_migrations" WHERE migration_name = '20261113120000_topics';
```

Then redeploy previous app revision if needed.

## Public visibility

Only `status = PUBLISHED` topics appear on public API / pages. Sitemap includes published + `indexable = true` only. Draft/archived/noindex stay out of sitemap; noindex hubs still render with `robots: noindex` when published.
