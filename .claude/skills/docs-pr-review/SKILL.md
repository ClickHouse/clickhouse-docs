---
name: docs-pr-review
description: >
  Review a docs PR from someone else. Triage issues by severity, draft
  comments with rationale, and focus on what matters. Use when reviewing
  a PR, not when checking your own work (use docs-pre-ship-review for that).
---

# Docs PR Review Skill

## Invocation

```
Review PR #[number] using the docs-pr-review skill.
```

Pass 1 runs first (diff-scoped, 13 checks). Pass 2 runs second (full file,
pre-existing quality issues).

---

Review someone else's docs PR. Your job is to triage and communicate.
**This skill is read-only — do not edit files, stage changes, or commit.**
Output a list of comments, suggestions, and questions. The user decides
what to act on.

**Scope note:** Changes to files under `i18n/` (jp, ko, ru, zh) are not
worth flagging — translations sync automatically from the English source.

This is different from pre-ship review (checking your own work). Here you're
balancing thoroughness with respect for the author's time.

## Review standard

**No shortcuts. No laziness. Catch every problem, every time.**

A different session reviewing the same PR must produce the same findings,
the same line numbers, and the same severity tiers. This is the quality
bar — reviews that miss issues or report wrong line numbers are failures,
not approximations. Every check runs completely, every finding is verified
before it is reported, and every line number is mechanically computed. No
step is skipped because the PR is large, because the content looks fine at
a glance, or because a similar check already passed.

## Process

This review has two distinct passes with different scopes.

### Pass 1: PR review (scoped to the diff)

1. **Get the diff.** Use `gh pr diff` to see only what the contributor changed.
   All review comments must be scoped to lines in the diff.

   **Line numbers — compute them mechanically, never estimate:**

   Every line number in the review output must be exact and deterministic.
   A different session reviewing the same PR must produce identical line
   numbers. Never use `~` prefixes, never round, never eyeball.

   1. Run `gh pr diff N | grep -nE '^\+\+\+ b/|^@@ '` to get the
      diff-output line number of every file boundary and `@@` hunk header.
   2. Run `gh pr diff N | grep -n '^+#.*{#'` (or similar targeted greps)
      to find the diff-output line number of the content you need to cite.
   3. Compute the file line number:
      - Each `@@` header shows the target file line where the hunk starts
        (e.g., `@@ -0,0 +1,42 @@` → file line 1; `@@ -85,7 +89,10 @@` →
        file line 89).
      - For new files: `file_line = diff_output_line - @@_header_line`
      - For modified files: `file_line = hunk_start + (diff_output_line - @@_line - 1)`
        (only counting `+` and context lines, not `-` lines).

   **Content between hunks (gaps):** The `@@` start line tells you where
   the *hunk* begins, not where unchanged content between hunks lives.
   For content in a gap:
   1. Find the previous hunk's end: `prev_hunk_start + new_count - 1`.
   2. Find the next hunk's start from its `@@` header.
   3. Count forward from the previous hunk's end through the unchanged
      lines to locate the target. The gap contains exactly
      `next_hunk_start - prev_hunk_end - 1` unchanged lines.
   4. Never assume a gap line is "at or near" the adjacent `@@` start —
      compute its exact position by counting.

   **Verification step:** Before including any line number in the review
   output, confirm it was computed (not estimated) and trace back to the
   `@@` header or Read tool output that produced it. If you cannot trace
   a number back to a mechanical computation, recompute it before
   proceeding.

   For Pass 2 (local file reads), the Read tool prints `N→ content` —
   cite N verbatim.

   **Never estimate line numbers by reading the diff and guessing.**
   Always compute from `@@` headers. Never write awk scripts or custom
   tooling either.
2. **Read the local copies of changed files** for context. Do not checkout the
   PR branch — it fails on forks and risks disrupting local git state.
3. **Collect Pass 2 inputs.** Do both of these now — results go in Pass 2,
   not Pass 1.
   - **Run Vale** on the local copy of changed `.md` files. CI already runs
     Vale on the PR's diff, so don't report Vale issues on diff lines —
     focus on issues **outside the diff** that CI won't catch. Run `vale`
     directly on the local file path. Cross-reference Vale line numbers
     against the diff's `@@` hunk headers — issues on lines outside the
     diff are pre-existing and go in Pass 2. If the PR renames or moves a
     file, skip Vale — the old path still has the content locally, but
     line numbers won't match the post-merge state.
   - **Read through the full file** for issues Vale won't catch. Focus on
     grammar errors, missing punctuation, typos, and voice violations
     (third person in second-person docs). Cross-reference against the
     diff the same way — only flag lines outside the diff.
4. **Run the checklist below in order.** Check every item; only report
   items that fail. This is the complete list — do not invent additional
   review categories.
5. **Triage** findings into the three severity tiers below.
6. **Draft comments** following the comment style guidelines.
7. **Summarize** your review: what you'd block on, what you'd suggest, and
   what you'd let go.

#### Pass 1 checklist (run in this order)

| #  | Check | Tier if failed |
|----|-------|----------------|
| 1  | **Frontmatter complete** — `slug`, `title`, `sidebar_label`, `description`, `keywords` present | Block |
| 2  | **MDX/build safety** — imports exist, no broken JSX, images referenced exist | Block |
| 3  | **Technical accuracy** — commands, SQL, column/table names, config keys are correct | Block |
| 4  | **No secrets** — no hardcoded credentials, internal URLs, or API keys | Block |
| 5  | **Product terminology** — correct product names (ClickStack vs HyperDX, etc.) | Block |
| 6  | **Grammar, spelling, typos** — misspellings, wrong verb forms, missing words, wrong articles | Block |
| 7  | **Sentence casing** — headings must use sentence case, not Title Case | Block |
| 8  | **Vale errors in diff** — CI covers these; only flag if CI is not running on this PR | Block/Suggest |
| 9  | **Voice/style in diff** — "you" not "users," active voice, no AI-isms (see watchlist in check procedure below) | Suggest |
| 10 | **First-mention links** — ClickHouse features/concepts link to their docs on first use | Suggest |
| 11 | **Component opportunities** — numbered steps → VerticalStepper, variants → Tabs, etc. | Suggest |
| 12 | **Structure and flow** — sections in logical order, prerequisites before procedures, page organization matches sibling pages | Suggest |
| 13 | **Screenshot utility** — screenshots used as shortcuts ("refer to the screenshot") without sufficient prose context | Suggest |

#### Blocking check procedures

Block-tier checks (#1–#7) must be **exhaustive** — every instance found,
not sampled. Some checks have deterministic patterns that grep can catch;
others require careful reading. Run the two modes separately, in order:
grep-based checks first (fast, mechanical), then a reading pass (slower,
requires comprehension). Do not try to do both in a single pass through
the diff — that's how things get missed.

**Mode 1: Pattern-based checks (run first, via grep)**

These checks have deterministic patterns. Grep the diff to get a complete
list, then verify each result.

*Sentence casing (#7):*
Run `gh pr diff N | grep -n '^+#.*{#'` to extract every added heading
with its diff-output line number. Check **each** heading: only the first
word and proper nouns may be capitalized. Compute the file line for every
violation using the `@@`-header method above.

Common proper nouns in this codebase: ClickHouse, ClickStack, HyperDX,
Helm, Kubernetes, MongoDB, OpenTelemetry Collector, OTEL, AWS, GKE, EKS,
AKS, API, SQL, TLS, DNS, JSON, YAML, ConfigMap, Secret (K8s resource types).

*Frontmatter (#1):*
For every changed or new `.md` file, verify the frontmatter block in the
diff contains all required fields: `slug`, `title`, `sidebar_label`,
`description`, `keywords`. Integration guides also need `pagination_prev`,
`pagination_next`, and `doc_type`.

**Mode 2: Comprehension checks (reading pass)**

These checks require understanding the content — grep can't catch them.
Read through the diff content carefully, file by file.

*Technical accuracy (#3):*

A reviewer's job is not to re-run every command — that's the author's
responsibility (covered by `docs-pre-ship-review`). Your job is to catch
what looks wrong and flag what you can't verify. Use this hierarchy:

**Verify yourself (fast, do these):**
- Internal links and slug paths: `find docs/ -name '*.md' | xargs grep -l 'slug:' | head -20` to spot-check that a referenced page exists.
- Table and function names: grep the docs for the referenced name (`grep -r 'MergeTree' docs/ --include='*.md' -l`) to confirm it's real and consistently spelled.
- YAML code blocks: scan for duplicate keys at the same nesting level — YAML parsers silently discard earlier duplicates, so readers who copy the example lose configuration.
- Frontmatter field values: check `doc_type` is one of `guide`, `reference`, `changelog`, `landing-page` — anything else is wrong.
- Shell flag names: if a flag looks unfamiliar, check it against the ClickHouse docs page for that binary (e.g., `clickhouse-client --help` output is documented in `docs/interfaces/cli.md`).

**Ask the author (you cannot verify these without running the system):**
- Whether commands execute without error in a clean environment.
- Whether config values produce the described behavior.
- Whether SQL queries return the expected result.
- Whether port numbers, endpoints, and environment variable names are correct for their setup.

When asking the author, be specific: "Can you confirm this command runs without error against a fresh install?" is more useful than "Please verify this is correct."

**Flag as Block if:**
- A referenced table, function, or page clearly does not exist (you confirmed via grep).
- A YAML block has duplicate keys.
- A SQL statement has a visible syntax error (wrong clause order, missing FROM, unclosed quote).
- A shell command uses a flag that doesn't match the documented interface.

**Flag as Suggest (ask author) if:**
- A config value or behavior description is plausible but you cannot confirm it locally.
- A command is correct syntactically but you're uncertain about the flag semantics.

**Do not flag** claims you have no specific reason to doubt. Skepticism without evidence is noise.

*Grammar, spelling, typos (#6):*
Read the prose in added lines. Watch for wrong articles, missing words,
subject-verb disagreement, and misspellings that pass spellcheck (e.g.,
"form" for "from").

*No secrets (#4), product terminology (#5), MDX/build safety (#2):*
These surface during reading. Flag hardcoded credentials, wrong product
names, and missing imports as you encounter them.

*Voice/style and AI-isms (#9):*

Check the `doc_type` in frontmatter before running this check. The
watchlist and thresholds differ by type.

**Full watchlist (all categories):**

**Transitions:** moreover, furthermore, notably, importantly, crucially,
interestingly, surprisingly, it's worth noting that, it bears mentioning

**Framing:** let's be clear, let's be honest, here's the reality,
the truth is, in today's fast-paced, in an era of, at the end of the day

**Sentence patterns:** "it's not X — it's Y" contrast,
question-then-immediate-answer, "in other words" / "put simply"
re-explanation, tricolon negation lists (no X, no Y, no Z)

**Buzzwords:** seamless, groundbreaking, revolutionary, game-changing,
robust, cutting-edge, unlock, leverage, empower, powerful, elegant

**Metaphor:** landscape, ecosystem, tapestry, mosaic, fabric,
paradigm shift, north star

**Hedging:** one could argue, some might say, while X is beyond the scope,
without further ado

**Thanking:** thank you for reading, thanks for following along

**High-severity-only subset** (for reference and landing-page types):
tapestry, mosaic, fabric, paradigm shift, seamless, groundbreaking,
revolutionary, game-changing, landscape, ecosystem, north star,
unlock, leverage, empower, in today's fast-paced, in an era of,
thank you for reading, thanks for following along

These are patterns that don't belong in any doc type. The full watchlist
includes patterns that are suspect in guides but tolerable in structured
reference content (e.g., moreover, topic-sentence openers, parallel
phrasing).

**Applying the check by doc_type:**

`guide`:
Run the full watchlist. Guides are procedural and conversational —
AI-isms actively hurt readability. Also watch for general voice issues:
third person ("the user," "users") in second-person docs, passive voice
where active is clearer, and em-dash overuse (3+ in a single page).

- **Zero hits** — move on, no comment needed.
- **1–2 hits** — flag them in a single batched comment with a suggested
  rewrite. No need to load external references.
- **3+ hits or a pattern cluster** (hits from 3+ categories) — load the
  `ai-style-review` catalogue for remediation guidance and severity
  context. Draft the comment using the catalogue's specific remediation
  advice rather than generic suggestions. Note the clustering: "This
  diff has several AI-generated patterns — worth a revision pass."

`reference` and `landing-page`:
Run the high-severity-only subset. Reference pages are structured by
nature — parallel lists, topic sentences, and some formality are
expected. Landing pages are short enough that marginal patterns aren't
worth flagging. Still check for general voice issues (third person,
passive voice).

- **Fewer than 3 hits** — move on, no comment needed.
- **3+ hits** — flag them in a batched comment. Load the `ai-style-review`
  catalogue only if 5+ hits or patterns from 3+ categories.

If `doc_type` is missing from frontmatter, default to `guide` thresholds.

*Screenshot utility (#13):*
Scan for crutch phrases like "refer to the screenshot", "see screenshot",
"as shown in the screenshot below", or "see the image above." These
indicate the author is relying on a visual instead of explaining the step
in prose.

Apply this litmus test: **could the reader succeed with the task based
only on the prose description, without looking at the screenshot?**

- If **yes** — the screenshot may be redundant. Flag it: "The prose covers
  this fully — is the screenshot adding anything the text doesn't?"
- If **no** — the screenshot is load-bearing, but the prose should still
  explain what to look for. Flag: "This step relies on the screenshot to
  explain itself. Add a sentence describing what the reader should see or
  do, so the screenshot supplements rather than replaces the instruction."

Screenshots earn their place by showing the result of a step
(confirmation), orienting the reader in a complex UI, or surfacing a
non-obvious option. They don't earn their place when they substitute for
writing a clear instruction.

*Structure and flow (#12):*
Read the full file (not just the diff) to evaluate page organization.
Check that sections follow a logical progression — context before
procedures, prerequisites before steps, conceptual overview before
reference detail. Read 2–3 sibling files in the same directory to see
whether the page matches the section ordering conventions around it.
Flag cases where a reader would need to scroll back to understand
something, where procedural steps are buried after reference tables, or
where the page structure diverges from its neighbors without reason.
Don't flag structure that is clear and works even if you'd organize it
differently — this check targets disorienting layouts, not style
preferences.

### Pass 2: Pre-existing quality issues (scoped to the full file)

This pass uses the Vale output and manual read-through you collected in
Pass 1 step 3. Both are required — Vale catches mechanical issues
(spelling, contractions, wordy phrases) while the manual read catches
grammar errors, voice violations, and formatting problems that Vale misses.

**Always** scan the full files touched by the PR for pre-existing quality
issues — regardless of how small the diff is. Even a one-line change is
an opportunity to catch issues in the surrounding page. These are tracked
separately, never raised as PR comments.

**Flag only these categories:**
- Grammar errors, missing punctuation, typos
- Voice violations: third person ("the user") in second-person docs,
  AI-ism clusters (3+ patterns from the watchlist in check #9)
- Broken formatting: malformed tables, broken list rendering, missing
  blank lines that affect rendering

**Do NOT flag:**
- Cosmetic preferences (code fence languages, minor whitespace)
- Phrasing you'd word differently but that is clear and correct
- Style drift that matches the rest of the page
- Isolated AI-isms (1–2 instances in a full page are not worth a ticket)

**Observations** (no ticket, reported separately):
- Potential technical inaccuracies or claims worth verifying
- Content gaps where missing context could mislead readers

Nothing in Pass 2 blocks the PR. It's all informational for the human
reviewer to decide what to act on.

**Edge case — renamed/moved files:** If the PR renames or moves a file,
pre-existing issues will reference a path that doesn't exist yet (before
merge) or no longer exists (after merge). In this case, flag the issues
in the review output but **do not draft a Linear ticket** — note that
the file is being moved and the issues can be addressed after merge.

**Output:** Present findings in two groups:
1. **Quality issues** (ticket candidates) — grammar, formatting, voice.
   Draft a Linear ticket preview using the **Historical Docs Quality Fixes - PRs** project,
   low priority, with file path and bullet-form issues. Do not
   create the ticket without the user confirming the preview. Format:

   ```
   Title: Quality fixes: <page name>
   Description:
   Pre-existing quality issues found during review of PR #XXXX.

   `path/to/file.md`

   * Line X: description of issue
   * Lines X, Y: description of repeated issue (N occurrences)
   * Line X: description of issue
   ```

2. **Observations** (no ticket) — potential inaccuracies, gaps, or concerns
   the reviewer should be aware of. Flag them so the human can decide
   whether to raise with the contributor or investigate further.

## Limits

- **10 items max per file** across both passes combined. If you find more
  than 10, keep all Blocks, then rank Suggests by reader impact and cut
  the rest. Pass 2 quality issues count toward the cap; observations do not.
- Do not invent review categories beyond the Pass 1 checklist and the
  Pass 2 flag list above. If an issue doesn't fit a listed category, it's
  Ignore.

## Severity tiers

### Block (request changes)

These prevent the PR from shipping. The author must address them.

- **Technical inaccuracy** — wrong command, incorrect behavior, SQL that
  won't run, wrong column or table names
- **Broken build** — missing frontmatter, bad MDX syntax, broken import,
  missing image file
- **Security issue** — hardcoded credentials, exposed internal URLs, API keys
- **Factual errors** — incorrect claims about ClickHouse behavior
- **Terminology confusion** — using the wrong product name (e.g., HyperDX
  where ClickStack is correct) in a way that will confuse readers
- **Broken or missing critical links** — linking to a page that doesn't
  exist, or not linking to essential context the reader needs
- **Grammar, spelling, and typos** — misspellings, wrong verb forms,
  missing words, incorrect articles ("an" vs "a")
- **Sentence casing** — headings must use sentence case ("Tuning performance"),
  not Title Case ("Tuning Performance"). This is a hard site-wide requirement.

### Suggest (approve with comments)

These are real issues but shouldn't block the PR. The author can address
them in this PR or a follow-up.

- **Voice and style violations** — AI-isms, passive voice, "users" instead
  of "you," em dash overuse
- **Missing first-mention links** — ClickHouse features or concepts that
  should link to their docs
- **Weak frontmatter keywords** — generic terms that won't help search
- **Component opportunities** — a numbered list that should be VerticalStepper,
  variant content that should be Tabs, supporting detail that should be
  collapsible
- **Structure and flow** — sections in illogical order, prerequisites after
  procedures, page organization that diverges from sibling pages without
  reason, or layouts where the reader must scroll back to understand context
- **Minor inconsistencies** — formatting differences from the current standard
  that don't affect comprehension

### Ignore (don't comment)

Don't leave comments on these. They create noise and slow down the review.

- **If the author's phrasing is clear, grammatically correct, and
  technically accurate, it is Ignore** — even if you'd write it differently.
  This is the single most important triage rule.
- Slightly verbose explanations that aren't wrong
- Formatting choices that match the rest of the page even if they don't
  match the latest standard
- Vale suggestions in code-adjacent prose where the "wordy" phrasing is
  actually clearer
- Implementation details that are accurate today (e.g., retry counts,
  timeout values) — don't flag these as "might go stale"
- **Concepts that link to their explanation.** If the author uses a term
  and links to a page that defines it, don't suggest inlining the
  definition. The link is doing its job.
- **Sentence-level style preferences.** Multiple links in one sentence,
  slightly long sentences, or phrasing you'd restructure — if the meaning
  is clear, it's Ignore. A suggestion should be clearly worth the
  author's time, not a marginal polish.

## Writing comments

Every comment should help the author understand *what* to change and *why*.

### Structure

- **Lead with the issue**, not the rule. "This column name might be wrong"
  is more useful than "Per our style guide, column names should be verified."
- **Include the why.** "Readers will copy this query and get an error if the
  column is actually `TimestampTime`" tells the author what's at stake.
- **Suggest a fix when you have one.** Don't just flag problems. If you know
  the answer, include it. If you don't, say what you'd check.
- **Batch minor issues.** If you have 5 Vale fixes, leave one comment listing
  them all instead of 5 separate comments.

### Tone

- Name what needs to change. Acknowledge what's solid. Keep it short.
- Frame suggestions as options, lead with the strongest: "I'd go with Option 1."
- Flag specific patterns: "two consecutive 'You can' openers" is actionable;
  "could flow better" is not.
- Catch voice/tone consistency: third-person slips in second-person docs,
  inconsistent punctuation on list items, formality mismatches.
- Ask about things you're unsure of. "Is HyperDX correct here, or should
  this be ClickStack?" is better than "Change HyperDX to ClickStack."
- Don't prescribe rewrites for style preferences. "This could be tighter"
  without a suggested rewrite isn't actionable.
- Acknowledge what's good. If the examples are well-crafted or the structure
  is clean, say so. Reviews that only flag problems are demoralizing.

### Scope discipline

- **PR comments must be scoped to the diff.** Never block a contributor's PR
  for issues they didn't introduce. Pre-existing problems go in Pass 2.
- Review what's in the PR, not what's missing from the section. If the page
  doesn't cover topic X, that's a separate issue, not a PR comment.
- Don't request a full rewrite. If the page needs fundamental restructuring,
  that's a conversation, not a review comment.
- Don't pile on. If a pattern repeats (e.g., missing contractions throughout),
  flag it once with "this pattern appears throughout" instead of commenting
  on every instance.

## When to verify yourself vs ask the author

- **Verify yourself:** link targets (glob for the file), column/table names
  (check the schema docs), frontmatter fields (check required fields list)
- **Ask the author:** product naming decisions (ClickStack vs HyperDX),
  whether a feature works as described (they may have tested it), whether
  omitted content is intentional

## Output format

When drafting review comments for the user, format each as:

```
**Line X** (block/suggest): <comment text>
```

Group by severity — blocks first, then suggestions. End with a one-line
summary of your recommendation (approve, approve with suggestions, or
request changes).

## Register: Internal Communication

When drafting Slack messages, PR descriptions, or Linear comments:

- Same directness, casual layer. Fragments and informal phrasing fine.
- Open with context: "Ran into an issue with X" — not "Hi everyone!"
- Acknowledge mistakes plainly: "I had this wrong."
- Close with a clear next action: "Let me know if I'm still off!"