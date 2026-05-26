---
sidebar_label: 'Memory'
sidebar_position: 6
slug: /cloud/features/ai-ml/agents/memory
title: 'Memory'
description: 'Memory and personalization in ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'memory', 'personalization']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

Memory carries user-specific context across conversations. Rather than indexing entire chat histories, it stores compact structured entries — preferences, recurring facts, project details — that the agent can pull in when relevant.

## How it works {#how-it-works}

A small memory agent runs alongside the main conversation. It reads recent messages, decides what's worth remembering, and writes entries to a per-user store. On the next conversation, those entries are available as context the main agent can reference without you having to repeat yourself.

You see this as continuity: tell an agent once that you prefer SQL output in lowercase and that your fiscal year ends in March, and future conversations behave accordingly.

## Manage your memories {#manage-your-memories}

Open the memory panel from your account menu to:

- **View** entries the agent has stored about you.
- **Edit** any entry to correct or refine it.
- **Delete** entries you don't want carried forward.

Memory is private to your user. Other people's agents never see your entries, and your agents never see theirs.

## Toggle memory {#toggle-memory}

Each conversation has a memory toggle in the chat header. Turn it off for sensitive topics you don't want stored, or for one-off conversations where personalization isn't helpful.

When memory is off, the agent neither reads from nor writes to your memory store for that conversation.

## When memory helps {#when-memory-helps}

- Recurring conventions: preferred date formats, business definitions, naming patterns.
- Project context: which service or database you usually query, which dashboards you care about.
- Communication style: terse versus chatty, code-heavy versus prose-heavy responses.

## When memory doesn't help {#when-memory-doesnt-help}

Memory isn't a database. It's not a place to dump large reference material — use a [skill](/cloud/features/ai-ml/agents/builder/skills) or bake the material into the agent's instructions for that. It's also not retrieval over past chats; the conversation history itself plays that role.
