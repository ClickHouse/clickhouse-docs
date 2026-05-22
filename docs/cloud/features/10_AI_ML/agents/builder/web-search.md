---
sidebar_label: 'Web search'
sidebar_position: 3
slug: /cloud/features/ai-ml/agents/builder/web-search
title: 'Web search'
description: 'External web search tool for ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'web search']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

Web search lets an agent fetch information from the public web during a conversation. Use it for questions where the answer needs to be current — recent releases, documentation that lives outside your service, or a quick check against an authoritative source.

## Enable it

Toggle **Web search** in the Agent Builder's capabilities section. Once enabled, the agent decides when to issue a search based on the user's question and the agent's instructions. The search runs, results are scraped, and the most relevant content is passed back into the model context.

## How a search round works

Each search runs in three stages, managed for you in Cloud:

1. **Search** — the agent's query goes to a search provider that returns candidate URLs.
2. **Scrape** — relevant pages are fetched and the meaningful text is extracted.
3. **Rerank** — a reranker scores results so the model sees the most useful ones first.

The agent's response cites the URLs it actually used.

## When to use it

- Look up release notes or changelogs not in your service.
- Verify a fact against a source the model may not know.
- Pull a public blog post or doc into the conversation for analysis.

Skip it for questions that can be answered from your data or the model's own knowledge. Each search round adds latency.
