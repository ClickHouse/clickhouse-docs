---
name: docs-pre-ship-review
description: >
  Review a ClickHouse docs page before shipping. Runs the self-review
  checklist, Vale linting, and PR review rubric. Use when doing a final
  check, running Vale, or when asked "is this ready to ship."
---

# Docs Pre-Ship Review Skill

## Context

This skill covers the review and verification workflow for docs pages before
shipping. For the underlying voice, style, and content rules applied during
writing, see the **docs-drafting** skill.

## Self-Review Checklist (Before Opening a PR)

Run this before requesting review. Target: 30–45 minutes.

### Technical Accuracy

- [ ] Tested every command in a clean environment
- [ ] Clicked every link (internal anchors and external URLs)
- [ ] Code blocks execute without modification (no placeholder values left)
- [ ] Config files are valid (YAML, JSON, etc.)
- [ ] Environment variable names are consistent throughout the page
- [ ] Verified technical claims against source code (see below)

#### Source Verification

Any time the page lists valid config values, enum options, CLI flags, or
describes what an option does, verify against the ClickHouse source code or
the relevant upstream library (e.g., ClickHouse's Poco fork). Don't trust
other docs pages or LLM knowledge alone.

**Scale effort to the claim.** Not every check needs a research agent. For
simple factual claims (version numbers, dates, feature names), a quick web
search or `grep` of the source is enough. Reserve deep research agents for
claims that are central to the page and hard to verify (e.g., how a feature
works under the hood, or whether a config option behaves as described).

Present a verification summary:
- What was verified and against which source
- What was corrected
- Confidence: high (source code), medium (docs/examples), low (LLM only)
- Gaps that couldn't be verified

#### Scope

- Only edit English source files under `docs/`. Files under `i18n/` (jp, ko,
  ru, zh) sync automatically — never edit them directly.

### Structure and Consistency

- [ ] Section order matches the standard skeleton for the page type
- [ ] TL;DR block (if present) is concise, not a bullet list restating headings
- [ ] Frontmatter has all required fields (slug, title, sidebar_label,
      pagination_prev, pagination_next, description, doc_type, keywords)
- [ ] Keywords are specific and search-worthy (see docs-drafting skill)
- [ ] Heading anchors are present on all H2/H3 (`{#anchor-name}`)
- [ ] Code blocks have language tags (```bash, ```yaml, ```python, ```sql)
- [ ] File paths and config values use backticks
- [ ] Consistent line wrapping — don't mix hard-wrapped and unwrapped
      paragraphs in the same file. Pick one style and apply it throughout.

### Voice and Polish

- [ ] Read aloud — does it sound like a person wrote it?
- [ ] Uses "you" not "users," "the user," "organizations," or "one"
- [ ] No bold-bullet lists (use prose with inline formatting)
- [ ] Ran Vale locally: `vale docs/path/to/file.md`
- [ ] Scanned for and removed AI-isms (see docs-drafting skill)
- [ ] Applied prose tightening rules (see docs-drafting skill)
- [ ] Scanned for em dash issues: binary contrast pattern and overall density (see docs-drafting skill)
- [ ] Checked linking on first mention (see docs-drafting skill)
- [ ] Checked content integrity (see docs-drafting skill)
- [ ] Checked marketing site alignment if applicable (see docs-drafting skill)

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
   - "and so on" → use "like" with examples, or remove — **but skip in table cells** where the fix would add more words than it removes and the meaning is already clear
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

Use the `Edit` tool to apply fixes. Group related fixes into a single
edit where possible. Always re-read the file before editing to get
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
- `.mdx` files may produce false positives from JSX syntax, but Vale can
  still be run on them. Review results with that caveat.
- Changelog files

### Vale Fix Notes

- Always preserve technical accuracy. If a "wordy" phrase is needed for
  clarity in a technical context, skip the fix and note why.
- Never change content inside code blocks, YAML frontmatter, or
  admonition markers (:::note, :::warning, etc.).
- **Never change ` ```bash ` to ` ```shell `** based on the `CodeblockFences`
  suggestion. `bash` is more specific and widely recognized. Only change a
  code fence language if it's genuinely wrong (e.g., SQL tagged as `bash`).
- **Evaluate every suggestion before applying.** If the fix is longer or more
  awkward than the original, skip it. The test: does it make the prose clearer
  and shorter? If not, skip and note why.
- Don't change product names, function names, or ClickHouse-specific
  terminology even if they look like style violations.
- When fixing contractions, be careful in formal/legal contexts (e.g.,
  compliance docs, SLA descriptions) where contractions may be
  intentionally avoided.
- The `Headings.yml` exceptions list is enormous. When in doubt about
  whether a word in a heading is a proper noun or product name, leave it
  as-is and flag it.

## Reviewing others' work

For reviewing PRs from other authors, use the **docs-pr-review** skill instead.
It covers triage, comment writing, and scope discipline for reviewing someone
else's work.
