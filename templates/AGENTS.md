# Writing a ClickHouse guide

Guidance for authoring or restructuring a how-to / setup guide — for humans, and for
agents (e.g. Claude Code) pointed here to "build a guide with this template."

## Start from the template

Copy `templates/guide-template.md` and fill in the `{placeholders}`. It carries the
canonical section order and a working example of every component pattern (stepper, tabs,
table, collapsibles). Keep the section order; drop a section only if it genuinely doesn't
apply. The main procedure may be **one or several `## {Task}` sections**.

For a filled-in reference, see
`docs/cloud/guides/security/01_cloud_access_management/07c_scim-setup-entra.md`.

## Frontmatter

Required: `title`, `sidebar_label`, `slug`, `description`, `keywords`, `doc_type: 'guide'`.

## What each section is for

- **Intro** — one or two sentences: what the guide does and the outcome. Lead with the outcome, not the tooling.
- **Before you begin** — prerequisites, as a bullet list.
- **How it works** — a concise mental model of the end-to-end *flow*, placed **before** the steps. This is *what happens, in order* — not behavioral or reference detail. Reference detail belongs in FAQ, or the section becomes a catch-all.
- **{Task}** — the core procedure(s). Use a descriptive action header ("Configure X", "Install X"), not the bare word "Steps". Split into multiple `## {Task}` sections for multi-part setups.
- **Verify** — how the reader confirms it worked.
- **Best practices** — advisory recommendations, read in full.
- **Troubleshooting** — the issues a reader hits, each independently findable.
- **FAQ** — standalone questions.
- **Next steps** — where to go next.

Verify, Best practices, and FAQ are **prompts** as much as sections: even when a guide omits them, the scaffold makes you ask "how does the reader confirm success? what breaks in production? what will they ask?" **Don't fabricate content to fill them** — leave a section out if there's nothing real to say. For guide families that centralize (e.g. a shared FAQ page), Troubleshooting/FAQ may **link to the shared page** instead of being inline.

## Format rules — match the mechanic to the content shape

Classify the content's *shape*; the shape dictates the form. This is what keeps guides consistent instead of drifting as each is cloned from the last.

- **Procedure with depth** (screenshots, code, sub-steps) → `<VerticalStepper headerLevel="h3">` with `### {#anchor}` steps. A trivial one-line list can stay a plain numbered list.
- **A step or section that differs by variant** (provider, OS, deployment) → `<Tabs>` / `<TabItem>`. Not repeated prose, and not `<details>` accordions. **When the variants are deep-link targets** (linked from elsewhere on the page or from another page), use `<Tabs queryString="x">` under a single section anchor and link with `?x=value#anchor` — plain tabs destroy per-variant anchors.
- **Selective-consult content** the reader dips into for one item (Troubleshooting, FAQ) → collapsible `<details id="stable-id">`. Keep the ids stable — they're deep-link and support-link targets.
- **Advisory list read in full** (Best practices) → `### {#anchor}` subheadings, one per item. Not a table, not collapsed.
- **Table** → only when the reader scans a column *down* to compare values across rows (verification action→result, required-flags, source→target mappings). If each row is just "label + freeform description," it's a list, not a matrix — use subheadings or collapsibles.
- **Don't over-collapse.** Reserve `<details>` for selective-consult content. Never collapse the primary procedure or anything you want read in full.

## Components

- **Global — no import:** `VerticalStepper`, `Details` / `details`, admonitions (`:::note`, `:::tip`, `:::warning`).
- **Need imports:** `Tabs` / `TabItem` (from `@theme/Tabs`, `@theme/TabItem`), `Image` (from `@theme/IdealImage`).
- Every `##` / `###` needs a unique `{#anchor}` (enforced by markdownlint).

## When restructuring an existing guide

- **Grep for inbound links to any anchor you remove or rename** — in-page *and* cross-page — before changing it. Broken anchors are the most common conversion regression.
- **Preserve substantive content; relocate rather than drop** (behavioral detail → FAQ; a catch-all "Additional information" section → distributed into the sections it belongs to).
- After converting, diff against the original to confirm nothing substantive was lost.

## Platform

Syntax here is Docusaurus (current docs). Mintlify equivalents for the migration: `<details>` → `<Accordion>`, `<VerticalStepper>` → `<Steps>`, `<Tabs>` maps directly; the TOC is managed automatically. Don't optimize structure for Algolia heading granularity — search is moving to Inkeep (semantic retrieval that ingests full page content, collapsed sections included).

## Before shipping

- `vale <file>`
- `npx markdownlint-cli2 --config scripts/.markdownlint-cli2.yaml <file>` → 0 errors
- Run the `docs-pre-ship-review` skill for voice and prose.
