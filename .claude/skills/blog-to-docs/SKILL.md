---
name: blog-to-docs
description: >
  Convert ClickHouse blog content into docs pages. Use when porting a feature
  announcement, tutorial, or deep-dive from the blog into the docs site.
  Covers content extraction, asset handling, structural transformation, and
  voice conversion.
---

# Blog-to-Docs Skill

Convert blog posts (or blog sections) into docs pages. Blog content is
marketing-adjacent and narrative; docs content is task-oriented and
scannable. This skill covers the transformation process.

## When to use

- A Linear issue or request asks you to port blog content into docs
- A new feature was announced in a blog post and needs a docs page
- A blog post contains technical depth that belongs in the docs

## Process

### 1. Extract content from the blog

Fetch the blog URL and extract **all** content from the relevant section.
Request verbatim content, not a summary — you need every detail to avoid
losing information during the conversion.

After extraction, build an **exhaustive numbered checklist** of every
distinct technical claim, fact, setting, default value, behavioral detail,
caveat, and recommendation in the blog. This is the source-of-truth
inventory — you will check every item against the docs later in step 8.
Don't summarize; enumerate.

### 2. Download assets

Download all images and videos from the blog to
`static/images/clickstack/<feature-name>/` (or the appropriate path).

**Images:** Download as `.png` or `.jpg`. Name descriptively
(`service-map-overview.png`, not `screenshot-1.png`).

**Videos:** Download `.mp4` files. Keep them — MP4 at ~1MB is far better
than converting to GIF (which would be 5-15x larger and lower quality).

**Import pattern:** Import assets as webpack modules, not static paths.
Static paths (`/images/...`) don't work reliably with the dev server.

```jsx
// Images — use IdealImage
import Image from '@theme/IdealImage';
import overview from '@site/static/images/clickstack/feature/overview.png';
<Image img={overview} alt="Description" size="lg"/>

// Videos — import as module, self-closing tag
import demo from '@site/static/images/clickstack/feature/demo.mp4';
<video src={demo} autoPlay loop muted playsInline width="100%" />
```

**Do NOT use:**
```html
<!-- Static path — won't work in dev server -->
<video src="/images/clickstack/feature/demo.mp4" ... />

<!-- Nested source tag — doesn't render in MDX -->
<video>
  <source src={demo} type="video/mp4" />
</video>
```

### 3. Read sibling pages

Before writing, read 2-3 sibling pages in the target directory. Match:
- Frontmatter fields and conventions
- Section ordering patterns
- H2 header style (task-oriented, not explainer-style)
- Component usage (BetaBadge, VerticalStepper, Tabs, etc.)

### 4. Restructure: blog framing to docs framing

This is the critical transformation. Blog posts explain and narrate; docs
pages orient and instruct.

**Blog patterns to eliminate:**
- "How it works" explainer sections — fold technical detail into the intro
  or the section where it's actionable
- "Reading the map" / "Understanding X" headers — reframe as
  "Exploring X" or "Using X" (task-oriented)
- "Controls" as a standalone section — merge with the section that uses them
- Narrative buildup before the feature — lead with what it does, not the
  story of why it was built
- Inline numbered lists like "(1) ... (2) ... (3) ..." — convert to
  markdown bullet or numbered lists

**Docs patterns to apply:**
- Intro paragraph: what it is + where to find it + prerequisites
- H2s named after what you **do**, not what you **learn**
- Fewer H2s (2-3 for a feature page, not 5)
- Technical detail woven into context, not siloed in its own section

**Example transformation:**

Blog structure (5 sections):
```
- Intro
- Accessing service maps
- Reading the map
- Controls
- How it works
```

Docs structure (2 sections):
```
- Intro (what it is + how it works + where to find it + prereqs)
- Exploring the service map (nodes, edges, controls — all in one)
- Trace-level service maps (the contextual variant)
```

### 5. Convert voice

Blog posts often use third person, marketing language, and narrative
framing. Convert to docs voice per the **docs-drafting** skill:

- "Teams can visualize..." → "Service maps visualize..."
- "This highly requested feature..." → cut entirely
- "We're excited to announce..." → cut entirely
- "Users can explore..." → "Click **Service Map** to open..."

The blog is the **source of truth** for technical claims. Don't weaken
or second-guess what the blog says about how the feature works — but do
strip the marketing wrapper.

### 6. Handle beta/experimental status

Check sibling pages for how they mark beta features. Don't use `:::note`
admonitions for beta status — use the `<BetaBadge/>` component if that's
what siblings use.

```jsx
import BetaBadge from '@theme/badges/BetaBadge';
<BetaBadge/>
```

### 7. Add to sidebar

Add the page to `sidebars.js` in the appropriate position. Check the
logical ordering relative to sibling pages.

### 8. Verify coverage

After drafting, go back to the numbered checklist you built in step 1.
Check **every item** against the current state of the docs — not just your
draft, but also existing pages that may already cover it. For each item,
mark one of:

- **Covered** — already in docs (note where)
- **Added** — you added it in this pass
- **Blog-only** — intentionally left in blog (customer-specific, benchmark, narrative)
- **Gap** — generalizable content not yet in docs → fix it now

Present the results as a coverage table. Every item must be accounted for.
Don't move on until there are zero gaps.

**Generalizable technical content must be moved.** Every piece of
technical guidance in the blog — commands, configuration, process steps,
caveats, edge cases — belongs in the docs unless it is customer-specific.

**Do not move customer-specific benchmarks or metrics.** Performance
numbers, resource comparisons, and before/after metrics from a specific
customer deployment read as marketing in technical reference docs, imply
universal applicability they don't have, and belong in the blog only.
The test: would this number be true for a different customer on different
hardware? If not, leave it in the blog.

### 9. Run drafting skill and pre-ship review

Apply the **docs-drafting** skill for voice/style, then the
**docs-pre-ship-review** skill before shipping. These are separate passes.

## Link text should match the destination

When linking to another docs page, the link text should describe what the
reader will find at that destination — not the concept you're discussing.

- "you need [ingesting trace data](/path/to/ingesting-data)" — link text
  matches the destination (the ingestion guide)
- "you need [distributed tracing](/path/to/ingesting-data)" — link text
  describes a concept, but the destination is about ingestion. Misleading.

## Screenshots over hollow tables

If you have UI screenshots for controls or settings, use them instead of
(or alongside) a description table. A table of control names and
descriptions without visuals feels hollow. Individual screenshots with
a one-line description are more useful:

```markdown
**Source selector** — filter the map to a specific trace source.

<Image img={source_selector} alt="Source selector in toolbar" size="lg"/>
```

## Unused assets

Before committing, check the asset directory for unused files (screenshots
with default names, duplicates, `.DS_Store`). Clean them up.
