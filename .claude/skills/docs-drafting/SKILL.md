---
name: docs-drafting
description: >
  Voice, style, and content rules for writing ClickHouse docs. Use when
  drafting new pages, rewriting sections, or applying editorial polish.
  Covers identity, voice, pacing, sentence habits, anti-patterns, AI-ism
  removal, prose tightening, editorial instinct, linking, keywords, content
  integrity, and marketing site alignment.
---

# Docs Drafting Skill

## Identity

Write like an engineer who tested it first and is now telling the reader what
worked. No ceremony. Open with what matters. Stop when done. The reader is
technical and capable — don't hand-hold, but sequence clearly and flag rough
edges honestly.

## Voice

The docs voice prioritizes: accuracy over speed, conciseness over
comprehensiveness, "you" over "the user," prose over bullet lists, and tested
commands over theoretical examples. Back claims with data, benchmarks, or
examples — show rather than assert.

- "You" — never "the user," "users," or "one."
- Contractions: "you'll," "don't," "it's," "won't."
- Active voice. Passive only when the actor is irrelevant.
- Imperative mood for instructions: "Verify Redis logging" — not "You should
  verify." Reserve "you can" for genuinely optional steps.
- Vary sentence openers. Two consecutive "You can" sentences sound robotic.
- Write for global audiences: avoid idioms ("hit the ground running,"
  "low-hanging fruit"), cultural references, and colloquialisms.
- Use they/them/their when gender is unknown.

## Grammar and Mechanics

- **Oxford comma** — always, in lists of three or more.
- **Sentence case** for all headings, button labels, menu items, and
  frontmatter fields (`title`, `sidebar_label`). Capitalize only the
  first word and proper nouns.
- **Product names**: follow official capitalization. Match the casing
  from the product's own UI and docs — don't normalize to your
  preference. Feature names are lowercase unless officially capitalized.
  Don't use product names as verbs. Reference:
  [Google developer style guide — product names](https://developers.google.com/style/product-names).
- **Spelling**: "ClickHouse" (not Clickhouse or Click House), "dataset"
  (not data set).
- **Plural acronyms** don't take apostrophes: APIs, URLs, not API's.
- **Abbreviations**: lowercase `e.g.` and `i.e.`, no comma after.
  Spell out "and" — don't use `&`.
- **Numbers**: use letter abbreviations for large numbers ($100M, $4K).
  Western format: 1,000,000.00. Round large numbers for readability
  (1.3B rows, not 1,312,456,789).
- **Dates**: three-letter month + day + four-digit year (Apr 20, 2024).
- **Times**: lowercase a.m./p.m. with spaces (2:00 p.m.).
- **Lists**: capital letters and end punctuation for complete sentences.
  No punctuation for fragments. Don't mix sentences and fragments in
  one list. Never use inline numbered lists like "(1) ... (2) ... (3) ..."
  — use markdown bullet or numbered lists instead.

## Inclusive Language

- primary/replica — not master/slave.
- allowlist/blocklist — not whitelist/blacklist.
- "spot check" — not "sanity check."
- "expert" or "specialist" — not "rockstar," "ninja," "guru."
- Use gender-neutral job titles: "sales representative" not "salesman,"
  "team" or "folks" not "guys."

## Pacing

**Paragraphs are 1–3 sentences.** Rarely 4. Never 5+.

**One context sentence, then the code block.** Not a full paragraph before the
code explaining what the code will do:

> Create a file named `redis-metrics.yaml` with the following configuration:
>
> ```yaml
> receivers:
>   redis:
>     endpoint: "localhost:6379"
>     collection_interval: 10s
> ```

**After a code block: short bullet gloss OR move to the next step.** Bullets
explain what's non-obvious. One line each, fragments fine:

> This configuration:
> - Connects to Redis on `localhost:6379` (adjust endpoint for your setup)
> - Collects metrics every 10 seconds
> - Sets the required `service.name` resource attribute per OpenTelemetry conventions

**Between steps: zero to one transition sentence.** The heading is the transition.

**On feature/concept pages:** prose can run 2–3 short paragraphs before a visual
break, but each paragraph is still 1–3 sentences:

> Session replay captures and reconstructs user interactions in your web application.
> Rather than video recording, the SDK records DOM changes, mouse movements, clicks,
> console logs, and network requests — then reconstructs the experience in the browser.
>
> Because session replays are stored in ClickHouse alongside your logs, traces, and
> metrics, you can go from watching a user's experience to inspecting the backend
> traces that powered it — all in a few clicks.

**FAQ/reference answers:** lead with the direct answer, then context. Don't warm up.

**Verification steps:** one sentence, then the screenshot. Don't describe what the
screenshot shows.

## Sentence-Level Habits

- **Lead with the point.** "ClickStack uses OTLP for ingestion" — not "In order to
  understand how ClickStack handles data ingestion, it's important to note..."
- **Em dashes for asides** over parentheses: "High-cardinality aggregations kill
  performance through memory exhaustion — not row scanning."
- **One-line hooks after headings.** The first sentence orients, not restates.
- **Implicit transitions.** No "Now that we've covered X, let's move on to Y."
- **Clean paragraph endings.** No dangling segues. Complete sentences.

## Anti-Patterns

- **No emoji.** Zero.
- **No AI-formatted structure.** No bold-label paragraphs (`**Key Insight:** ...`),
  no inline `**Note:**`, no "Here's what you need to know:" wrappers.
- **No excessive bolding.** Bold for UI element names and rare emphasis only.
- **No filler.** Cut: "It's worth noting," "Let's dive in," "In this section we will,"
  "As mentioned earlier," "There are several ways to."
- **No hedging.** "This configuration forwards logs" — not "should forward."
- **No marketing voice.** No "powerful," "robust," "seamless," "cutting-edge."

## AI-Isms to Remove

These words and phrases signal AI-generated prose. Replace or remove them:

- "leverage" → "use" (but OK when literal, e.g., "leverage cloud object storage" meaning to make use of it as a resource — flag only when it's corporate jargon like "leverage our platform")
- "delve" → "look at" or just remove
- "comprehensive" → usually unnecessary, cut it
- "robust" → "reliable" or cut it
- "utilize" → "use"
- "facilitate" → "enable" or "let"
- "streamline" → "simplify" or be specific
- "in this guide, we will" → just start the guide
- "it's important to note that" → cut it, just state the thing
- "as mentioned above/below" → link to the section or restate briefly
- "in order to" → "to"
- "a wide range of" → cut or be specific
- "plays a crucial role" → cut, explain what it actually does
- "whether you're a beginner or expert" → cut entirely
- "compelling choice" → cut, just explain what it does
- "lightning-fast" / "unmatched" / "exceptional" → marketing copy, cut or replace with specifics
- "wholesale replacement" → "replacing the entire system" or similar

### Word Choices

| Avoid | Prefer |
|---|---|
| leverage / utilize / exploit | use |
| in order to | to |
| as well as | and |
| due to the fact that | because |
| prior to / subsequent to | before / after |
| the user / users | you |

## Prose Tightening

Tighten prose without stripping it of personality or context. Every statement
should include both the **what** and the **why** — cutting filler doesn't mean
cutting the reason something matters. If a sentence only states a fact without
explaining why the reader should care, it's incomplete. If it only sells without
specifics, it's filler. Good prose has both.

Always prefer industry-standard terminology over generic phrasing. Terms like
"ACID transactions," "data swamp," "separation of storage and compute," and
"interoperable storage" are how practitioners search for and discuss these
concepts. Don't simplify them away — conciseness and domain precision aren't
in conflict.

Check for these common problems:

- **"organizations" as subject** → rewrite with "you." Docs speak directly
  to the reader, not about abstract third parties. Exception: when describing
  a technical entity like a role, policy, or config object, use its proper
  name as the subject (e.g., "the role can't view" is correct in RBAC docs
  because it describes what the role permits, not the reader).
- **Redundant introductions** → Don't introduce what something is and then
  separately say why it matters. Combine into one direct statement.
- **Overly formal phrasing** → Prefer plain verbs. "It handles the physical
  persistence of data" → "It persists data." "Functions as a specialized
  processing layer that can flexibly interact with" → "works as a processing
  layer that interacts with."
- **Definite articles implying exclusivity** → Watch for "the" suggesting
  something is the only option when it isn't (e.g., "the solution for X").
  But "the" is fine when describing a role within a specific architecture
  (e.g., "serves as the query engine in a data lake architecture").
- **Ambiguous pronouns** → "unlike many data warehouses, where they scale
  together" — "they" is unclear. Name the subject: "that scale them together."
- **Colons and em dashes as crutches** → If you need a colon or em dash to
  introduce a list or elaboration, try rephrasing as a natural sentence first.
  "This lets you choose the right tools: store data, pick compute, swap
  components" → "You can store your data in object storage, pick the compute
  engine that fits your needs, and swap out components as they evolve." Write
  sentences you'd say out loud. Reserve colons for definitions and em dashes
  for genuine asides.
- **Em dash binary contrasts** → Watch for "not X — Y" or "no X — they Z"
  patterns where an em dash bridges two opposing statements. One is fine for
  emphasis, but repeating this structure makes prose feel formulaic. Rephrase
  most instances: "No flexibility for unexpected fields — they are silently
  dropped" → "Unexpected fields are silently dropped." State what happens
  directly instead of negating then correcting. Em dashes are fine for
  genuine asides and parenthetical inserts; the problem is using them as a
  pivot between binary claims.
- **Em dash density** → Even when each individual em dash is justified, too
  many on a page creates a monotonous rhythm. After drafting, scan the page.
  If a section has more than two, rephrase some with commas, periods, or
  subordinate clauses.
- **Compound modifiers** → Hyphenate before a noun (`database-grade`,
  `cost-effective`, `sub-second`). Don't hyphenate after ("the storage is
  cost effective"). Check that no unnecessary hyphens crept in.
- **Repetitive sentence openers** → If multiple rows in a table or
  paragraphs in a section start with the same subject (e.g., "Table
  formats provide...", "Table formats enforce...", "Table formats use..."),
  vary the openers. Lead with the concept, not the subject.
- **Vague performance claims** → Replace generic claims like "consistent
  performance regardless of data volume" with what the feature actually
  does (e.g., "optimizations for repeated and latency-sensitive queries").
  Be specific about *which* queries or workloads benefit.
- **Empty adjectives** → Words like "seamless," "extensive," "easy" add
  no information. Replace with concrete verbs or cut. "Makes data
  transformations seamless" → "automates data transformations."
- **Generic opener sentences** → If a sentence just says "X makes it easy
  to do Y" and the next sentence explains how, cut the opener. Let the
  specific sentence do the work.
- **Repetitive phrasing in adjacent sentences** → Watch for the same
  phrase appearing in back-to-back sentences (e.g., "storage and compute"
  twice in two sentences). Rephrase one instance.
- **Partner and provider neutrality** → Don't single out one cloud
  provider or partner tool. Use multiple examples: "S3 or GCS" not just
  "S3," "Tableau and Looker" not just one. The partnerships team cares
  about this.

## Editorial Instinct

**Honest about limitations — without undermining the product.** Frame what the
product IS optimized for, not what it's bad at:

> ClickHouse is not recommended as a source for this layout. Dictionary lookups
> require random point reads, which are not the access pattern ClickHouse is
> optimized for.

Not: "Do not use ClickHouse as a source, because it is slow."

**Name what IS supported before what isn't:**

> ClickStack supports custom dropdown filters on dashboards, populated by data
> queried from ClickHouse. [...] ClickStack does not currently support reusable
> dashboard variables in the style of Grafana template variables.

**State unsupported features in one sentence.** No hedging, no apology:

> Multi-level drill-downs from one custom dashboard to another are not currently supported.

**Don't oversell features.** If a capability is table stakes (e.g., separation
of storage and compute), acknowledge it's standard rather than presenting it as
a unique advantage. Reframe with what *is* distinctive (e.g., "open formats let
you choose *which* compute engine scales with your data").

**Be precise about technical claims.** Don't imply full database-style ACID if
the architecture only provides atomic commits to table state. Use precise language
that matches what the technology actually delivers.

**Collapse awkward comparisons.** If a comparison table reads like you're avoiding
naming the thing you're comparing against (e.g., "lakehouse"), drop the comparison
framing. Instead, describe what the architecture delivers as a single benefits
table. Let the reader draw their own conclusions.

**Cut rows that don't hold up.** If a benefit in a table is vague, applies to
everything, or doesn't make sense in context (e.g., "AI/ML integration" when
there's nothing AI-specific on the page), remove it rather than trying to justify it.

**Don't duplicate information.** If two table rows or paragraphs say the same thing
differently (e.g., "open formats" and "cost-effective storage" both describing
Parquet on object storage), merge them.

**Verify before removing.** Before cutting a table row, section, or paragraph, map
every distinct claim it makes to where that claim is covered elsewhere. If a claim
isn't covered, weave it into an existing section rather than losing it silently.

**When in doubt, shorter is better.** If the draft reads cleanly aloud and hits
no anti-patterns, it's done. Over-polishing makes it worse.

## Source Verification

When documenting config options, valid values, CLI flags, or behavioral
descriptions, verify claims against source code — not just other docs or LLM
knowledge. This applies to any statement of the form "these are the valid
values" or "this option does X."

**Where to verify:**
- Config parsing: search the ClickHouse/ClickHouse repo and ClickHouse/poco
  fork for the code that reads the setting
- Valid enum values: find the actual enum, switch statement, or if-chain
- CLI flags: check the `programs/` directory in the ClickHouse repo
- Upstream libraries (Poco, etc.): check ClickHouse's fork, not upstream —
  they may diverge (e.g., ConsoleCertificateHandler was removed from the fork)

**Run verification separately from drafting.** Use a dedicated research agent
so the verification is independent — avoids confirmation bias where the
drafter "verifies" their own assumptions.

**Blog posts as sources:** When porting content from a ClickHouse blog post,
treat the blog as the source of truth for technical claims — it was written
by the team that built the feature. Confidence level: high (same as source
code). Don't weaken or second-guess blog claims about how a feature works.

**Present a verification summary** after drafting technical content:
- What was verified and against which source (file path or repo)
- What was corrected based on verification
- Confidence level: high (source code or blog), medium (docs/examples),
  low (LLM knowledge only)
- Any gaps that couldn't be fully verified

## Linking

Every ClickHouse-specific term, feature, or integration mentioned in prose
should link to its docs page on first mention. This helps readers navigate
and improves SEO.

- ClickHouse features link to their docs (e.g., MergeTree, materialized
  views, projections, query cache, sparse indexes, RBAC)
- Table formats link to their engine pages (e.g., Iceberg, Delta Lake, Hudi)
- Data catalogs link to their reference pages (e.g., AWS Glue Catalog,
  Unity Catalog, Iceberg REST)
- Integrations link to their docs (e.g., Tableau, Looker, dbt, ClickPipes)
- Interfaces link to their docs (e.g., MySQL interface, REST)
- Data formats link to their docs on first mention (e.g., Parquet)
- Don't double-link — link on first mention only. Second mentions of
  the same term don't need a link.
- Descriptive link text that explains the destination — never "click here"
  or "this page."
- **Link text must match the destination.** If the link goes to an
  ingestion guide, the text should say "ingesting trace data," not
  "distributed tracing." Readers expect the link text to describe what
  they'll find when they click.
- Verify link targets are correct — table engines vs table functions
  are different pages (e.g., `/engines/table-engines/integrations/s3`
  is the engine, `/sql-reference/table-functions/s3` is the function).

## Structural Consistency

- **Check sibling pages before adding structural sections.** Before adding
  an Overview, Prerequisites, or similar framing section, check 3–5 sibling
  pages in the same directory. If none of them use that pattern, don't
  introduce it — fold the context into the intro paragraph instead. An
  Overview that just previews the TOC wastes space; an intro paragraph that
  orients the reader and summarizes the mental model earns its keep.
- **Don't rename UI concepts.** If the product UI calls something "Webhooks,"
  the docs call it "Webhooks." Add clarifying context inline (e.g., "Webhooks
  — outbound notification destinations that alerts deliver to") but don't
  substitute your own terminology. Readers need to match docs to what they
  see on screen.
- **Use UI tooltips as authoritative source material.** When documenting UI
  features, check screenshots for tooltip text. Tooltips are written by the
  product team and are often more precise than inferences. Quote or
  paraphrase them directly rather than guessing what a UI element does.

## Structure and Accessibility

- Don't skip heading levels (H1 → H2 → H3, never H1 → H3).
- Avoid directional language ("the right sidebar," "the button below") —
  layouts change across devices.
- Include alt text for images. For charts, describe the key data point.
- Bold UI element names in instructions: "Click **Save**."

## Frontmatter Keywords

Keywords drive search ranking. Generic keywords like `'use cases'` don't help
anyone find the page. Apply these rules:

- **Be specific** — use the actual technologies, formats, and concepts
  discussed on the page (e.g., `'Iceberg'`, `'Parquet'`, `'Delta Lake'`).
- **Think like a searcher** — what would someone type into the docs search
  or Google to land on this page?
- **Include synonyms and related terms** — if the page covers data
  warehousing, also include `'lakehouse'` and `'data lake'`.
- **Skip filler** — don't include `'use cases'`, `'guide'`, `'tutorial'`,
  or `'ClickHouse'` (every page is about ClickHouse).
- **5–10 keywords** is a good range. Fewer means missed searches; more
  dilutes relevance.

## Marketing Site Alignment

For use case and product pages, check that the docs page aligns with the
corresponding marketing site page (e.g., clickhouse.com/use-cases/*).

- If the marketing site has section descriptions (e.g., interactive
  feature tabs), preserve their verbiage in the docs version. Adapt
  for docs voice but don't lose key phrases and claims.
- If the marketing site has specific performance claims (e.g.,
  "hundreds of millions of rows per second"), carry them through.
- If the marketing site has a diagram, the docs content should align
  with what the diagram shows.
- After condensing marketing copy for docs, do a side-by-side check
  to ensure no meaningful claims or differentiators were dropped.
