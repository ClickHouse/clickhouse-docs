---
name: docs-pre-ship-review
description: >
  Review and fix a ClickHouse docs page for quality, structure, voice, and
  technical accuracy before shipping. Use when doing a final polish pass,
  checking for AI-isms, running Vale, fixing style issues, cleaning up prose,
  or when asked "is this ready to ship."
---

# Docs Pre-Ship Review Skill

## Context

This skill covers reviewing and fixing a docs page before shipping. It includes
a quality checklist, voice and style rules, and a Vale fix workflow.

Authoritative style references:

- [ClickHouse voice and tone](https://clickhouse.design/brand/guidelines/voice-and-tone) — core personality, writing principles, prohibited language
- [ClickHouse grammar and mechanics](https://clickhouse.design/brand/guidelines/grammar-and-mechanics) — capitalization, punctuation, Oxford commas, numbers, dates
- [ClickHouse writing for product](https://clickhouse.design/brand/guidelines/writing-for-product) — be direct, be specific, be brief
- [ClickHouse accessibility](https://clickhouse.design/brand/guidelines/accessibility) — plain language, inclusive terms, heading structure, alt text
- [Google second person](https://developers.google.com/style/person) — use "you" to address the reader, not "users," "organizations," or "one"

The docs voice prioritizes: accuracy over speed, conciseness over
comprehensiveness, "you" over "the user," prose over bullet lists, and tested
commands over theoretical examples.

## Self-Review Checklist (Before Opening a PR)

### Technical Accuracy

- [ ] Tested every command in a clean environment
- [ ] Clicked every link (internal anchors and external URLs)
- [ ] Code blocks execute without modification (no placeholder values left)
- [ ] Config files are valid (YAML, JSON, etc.)
- [ ] Environment variable names are consistent throughout the page

### Structure and Consistency

- [ ] Section order matches the standard skeleton for the page type
- [ ] TL;DR block (if present) is concise, not a bullet list restating headings
- [ ] Frontmatter has all required fields (slug, title, sidebar_label,
      pagination_prev, pagination_next, description, doc_type, keywords)
- [ ] Keywords are specific and search-worthy (see keyword rules below)
- [ ] Heading anchors are present on all H2/H3 (`{#anchor-name}`)
- [ ] Code blocks have language tags (```bash, ```yaml, ```python, ```sql)
- [ ] File paths and config values use backticks

### Voice and Polish

- [ ] Read aloud — does it sound like a person wrote it?
- [ ] Uses "you" not "users," "the user," "organizations," or "one"
- [ ] No bold-bullet lists (use prose with inline formatting)
- [ ] Ran Vale locally: `vale docs/path/to/file.md`
- [ ] Scanned for and removed AI-isms (see list below)
- [ ] Applied prose tightening rules (see list below)

### AI-Isms to Remove

These words and phrases signal AI-generated prose. Replace or remove them:

- "leverage" → "use"
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

### Prose Tightening

Beyond AI-isms, check for these common prose problems and fix them:

- **"organizations" as subject** → rewrite with "you." Docs speak directly
  to the reader, not about abstract third parties.
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
- **Stacked em dashes** → One parenthetical em dash pair per paragraph is
  fine. Two or more makes prose hard to follow — restructure the sentence.
- **Compound modifiers** → Hyphenate before a noun (`database-grade`,
  `cost-effective`, `sub-second`). Don't hyphenate after ("the storage is
  cost effective"). Check that no unnecessary hyphens crept in.

### Frontmatter Keywords

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

## Vale Fix Workflow

When asked to lint a file, fix Vale warnings, clean up prose, or as part of
the pre-ship review, apply this workflow.

Vale is configured at `.vale.ini` and checks only `.md` files under `docs/`.
The style rules live in `styles/ClickHouse/`.

### Step 1: Read the File

Read the target file to understand its content, then apply the Vale rules
listed below. If the user has Vale output already, use that instead.

### Step 2: Categorize and Fix

Group issues by type. Fix in this priority order:

**Auto-fixable (apply without asking):**

1. **British spelling → US spelling** (`British.yml`, level: warning)
   - Common swaps: colour→color, analyse→analyze, behaviour→behavior,
     optimise→optimize, organisation→organization, centre→center,
     licence→license, favourite→favorite, etc.
   - Full swap list is in `styles/ClickHouse/British.yml`

2. **Wordy phrases** (`Wordy.yml`, level: suggestion)
   - "a number of" → specify the number or remove
   - "as well as" → "and"
   - "note that" → remove
   - "in order to" → "to"
   - "quite" → remove
   - "and so on" → use "like" with examples, or remove
   - "please" → remove unless we've inconvenienced the user

3. **Duplicate words** (`Repetition.yml`, level: warning)
   - "the the" → "the", "and and" → "and", etc.

4. **Contractions** (`Contractions.yml`, level: suggestion)
   - "do not" → "don't", "is not" → "isn't", "cannot" → "can't",
     "it is" → "it's", "we are" → "we're", etc.
   - Note: contractions are the ClickHouse style. Use them.

5. **Heading capitalization** (`Headings.yml`, level: warning)
   - Use sentence-style capitalization for all headings
   - Exception: proper nouns, product names, acronyms (extensive
     exceptions list in Headings.yml — ClickHouse, MergeTree, SQL,
     OpenTelemetry, Docker, Kafka, etc. are all excepted)

6. **Ability language** (`Ability.yml`, level: suggestion)
   - "able to" → rephrase: "you can" or just state the action
   - "ability to" → rephrase: "lets you" or "supports"

**Judgment-required (flag to user, suggest fix):**

7. **Heading punctuation** (`HeadingPunctuation.yml`) — headings shouldn't
   end with punctuation (except `?`)
8. **Ordinal suffixes** (`Ordinal.yml`) — check context before fixing
9. **Exclamation marks** (`Exclamation.yml`) — remove unless truly warranted
10. **Backtick formatting** (`BackTicks*.yml`) — ClickHouse functions,
    settings, table engines, formats should be in backticks, but flag
    rather than blindly apply

### Step 3: Apply Fixes

Use the `edit_file` tool to apply fixes. Group related fixes into a single
edit call where possible. Always re-read the file before editing to get
exact text matches.

### Step 4: Report

After fixing, provide a brief summary:
- How many issues were auto-fixed, by category
- Any issues that need human judgment (with line context and suggestion)
- Any issues skipped and why

### Vale Rules Disabled in Config

These rules exist but are turned off in `.vale.ini` — do NOT flag these:
- `SentenceLength` (disabled: `ClickHouse.SentenceLength = NO`)
- `FutureTense` (disabled: `ClickHouse.FutureTense = NO`)

### Files Excluded from Vale

Don't lint these:
- `docs/whats-new/**/*.md`
- `docs/releases/**/*.md`
- Any `.mdx` files (Vale can't parse them without mdx2vast)
- Changelog files

### Vale Fix Notes

- Always preserve technical accuracy. If a "wordy" phrase is needed for
  clarity in a technical context, skip the fix and note why.
- Never change content inside code blocks, YAML frontmatter, or
  admonition markers (:::note, :::warning, etc.).
- Don't change product names, function names, or ClickHouse-specific
  terminology even if they look like style violations.
- When fixing contractions, be careful in formal/legal contexts (e.g.,
  compliance docs, SLA descriptions) where contractions may be
  intentionally avoided.
- The `Headings.yml` exceptions list is enormous. When in doubt about
  whether a word in a heading is a proper noun or product name, leave it
  as-is and flag it.
