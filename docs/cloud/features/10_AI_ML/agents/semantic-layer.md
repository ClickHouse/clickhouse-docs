---
sidebar_label: 'Semantic layer'
sidebar_position: 8
slug: /cloud/features/ai-ml/agents/semantic-layer
title: 'Customizing agents with a semantic layer'
description: 'Use AGENTS.md to encode business rules, schema conventions, and domain knowledge for ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'AGENTS.md', 'semantic layer', 'custom instructions']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

AGENTS.md is a saved query in the Cloud Console that acts as a semantic layer over every agent conversation against your service. The contents aren't SQL — they're natural-language instructions the agent loads at the start of each chat. Use AGENTS.md to teach agents about your business logic, schema conventions, and domain terminology so SQL generation and analysis stay accurate.

## How it works

When you save a query named exactly **AGENTS.md** (case-sensitive) in the Cloud Console:

1. Every agent conversation against that service loads AGENTS.md before the first response.
2. The content is wrapped in a structured tag and injected into the agent's system prompt.
3. The instructions stay in scope for the whole conversation, on top of any per-agent instructions and any active skills.

The file is service-scoped, not agent-scoped — every agent that touches the service picks it up.

## Create AGENTS.md

In the Cloud Console:

1. Open the query editor and create a new saved query.
2. Name it `AGENTS.md` (case-sensitive).
3. Write the instructions in the editor (it's plain text, not SQL — the body won't execute).
4. Save.

The next agent conversation against the service picks up the change.

## What to put in it

Lead with the things that consistently bite. Specifically:

- **Business definitions and calculated metrics** — formulas the agent must use rather than guess.
- **Schema quirks** — numeric status codes, JSON-blob columns, foreign-key conventions that aren't obvious.
- **Terminology mapping** — what your team means when they say "conversion," "DAU," "qualified lead."
- **Common patterns** — preferred filtering, joins, or aggregation idioms.

Skip the things the agent can infer. Don't restate the schema; the agent reads that from the system.

## Best practices

### Treat context as a finite resource

Every token in AGENTS.md is a token gone from the agent's working budget. Models degrade as context grows. Aim for the smallest set of high-signal instructions that gets the job done.

Minimal doesn't mean short — it means no filler. Cut anything that doesn't change the agent's behavior.

### Find the right altitude

Two failure modes:

- **Too specific** — hard-coded if/else rules turn brittle and need maintenance every time the data changes.
- **Too vague** — high-level guidance the model can't act on.

Aim for instructions that are concrete enough to shape behavior and abstract enough to generalize. Start with a minimal prompt on a strong model, then add instructions in response to specific failures you observe.

### Organize with structured sections

Use XML tags or Markdown headers to make the file scannable. Keep related rules together:

```xml
<background>
Context about your data and domain.
</background>

<calculations>
Specific formulas and business logic.
</calculations>

<terminology>
Mapping from team vocabulary to schema reality.
</terminology>
```

### Lead with canonical examples

A short, well-chosen example tells the agent more than three paragraphs of prose. Pick one or two examples per topic that exemplify the behavior you want, not every edge case.

## Example: calculated metrics

When a metric isn't a column, teach the agent the formula:

```xml
<metric_calculations>
"active_sessions" is NOT a column. Compute it as:

  COUNT(DISTINCT session_id || '|' || user_id) AS active_sessions

Whenever the user asks for "active sessions" or "session count", use this formula.
</metric_calculations>
```

## Example: business rules

```xml
<business_rules>
Revenue:
  - Exclude refunded transactions: WHERE transaction_status != 'refunded'
  - For subscription MRR:
      SUM(CASE
        WHEN billing_cycle = 'monthly' THEN amount
        WHEN billing_cycle = 'yearly'  THEN amount / 12
        ELSE 0
      END) AS mrr

Customer segments:
  - Enterprise:   annual_contract_value >= 100000
  - Mid-Market:   annual_contract_value BETWEEN 10000 AND 99999
  - SMB:          annual_contract_value < 10000

Always apply segmentation in revenue and customer-count reports.
</business_rules>
```

## Example: schema quirks

```xml
<data_structure>
user_status is numeric, not text:
  1 = 'active', 2 = 'inactive', 3 = 'suspended', 99 = 'deleted'

When filtering or displaying status, decode with CASE.

product_metadata is JSON text. Parse with JSONExtractString / JSONExtractInt
rather than treating it as structured.
</data_structure>
```

## Example: terminology

```xml
<terminology>
"Conversions" — purchases for e-commerce; active subscriptions for SaaS.
"Churn"       — users whose last_active_date is older than 90 days and
                 whose previous status was 'active'.
"DAU"         — distinct user_id with activity_date = today().
</terminology>
```

## Maintenance

Treat AGENTS.md like code: review it, prune entries that no longer apply, and add to it when you find an agent failing in a way a small instruction would have prevented. Don't let it accumulate dead rules — each one costs tokens on every conversation.
