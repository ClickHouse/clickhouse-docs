---
title: '{Page title}'
sidebar_label: '{Nav label}'
slug: /{path/to/page}
description: '{One-sentence summary for search and link previews}'
keywords: ['{keyword}', '{keyword}']
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# {Page title}

{One or two sentences: what this guide does and the outcome the reader will have by the end.}

## Before you begin {#before-you-begin}

{What the reader needs in place first.}

- {Prerequisite}
- {Prerequisite}

## How it works {#how-it-works}

{Build the reader's mental model of the end-to-end flow — as a numbered sequence (example below) or a short paragraph, whichever fits best.}

1. {What happens first}
2. {What happens next}
3. {And so on}

## {First task — e.g. "Configure X"} {#task-1}

{/* One "## {Task}" section per major part of the setup. Deep tasks use a stepper; simple ones a plain numbered list. */}

<VerticalStepper headerLevel="h3">

### {First step, phrased as an action} {#step-1}

{Step detail.}

### {Second step, phrased as an action} {#step-2}

{/* When a step differs by variant (provider, OS, deployment), branch with Tabs instead of repeating the step. */}

<Tabs groupId="{variant}">
<TabItem value="{option-a}" label="{Option A}">

{Step detail for Option A.}

</TabItem>
<TabItem value="{option-b}" label="{Option B}">

{Step detail for Option B.}

</TabItem>
</Tabs>

</VerticalStepper>

## {Second task — e.g. "Configure network access"} {#task-2}

1. {Step}
2. {Step}

## Verify {#verify}

{How to confirm it worked.}

| Action | Expected result |
|---|---|
| {What the reader does} | {What they should see} |
| {What the reader does} | {What they should see} |

## Best practices {#best-practices}

### {Practice, phrased as an imperative} {#practice-1}

{Why it matters and what to do.}

### {Practice, phrased as an imperative} {#practice-2}

{Why it matters and what to do.}

## Troubleshooting {#troubleshooting}

<details id="{symptom-1}">
<summary>{Symptom, phrased as the reader would describe it}</summary>

{Cause and fix.}

</details>

<details id="{symptom-2}">
<summary>{Symptom}</summary>

{Cause and fix.}

</details>

## Frequently asked questions {#faq}

<details id="{faq-1}">
<summary>{Question}</summary>

{Answer.}

</details>

<details id="{faq-2}">
<summary>{Question}</summary>

{Answer.}

</details>

## Next steps {#next-steps}

{Where to go from here — related guides or the next thing to do.}

- {Link}
- {Link}
