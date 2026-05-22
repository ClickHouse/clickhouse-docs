---
sidebar_label: 'Prompts'
sidebar_position: 5
slug: /cloud/features/ai-ml/agents/prompts
title: 'Prompts'
description: 'Saved prompt library for ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'prompts', 'templates']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

The Prompts library is a place to save and reuse natural-language prompts you find yourself typing repeatedly. Think of it as snippets for your chat composer — useful when the same analytical question or formatting instruction comes up across conversations.

## Create a prompt

Open the Prompts panel and click **New prompt**. Give it:

- **A title** — what shows up in the picker. Be descriptive: *"Weekly active users by region"* beats *"WAU"*.
- **The body** — the actual text that will be inserted into the composer.
- **Optional variables** — placeholders in the body that you fill in at insertion time. Use `{{name}}` style markers; the picker prompts you for values before inserting.

Group related prompts under categories or tags to keep the library navigable as it grows.

## Use a prompt

In a conversation, open the prompts picker from the composer and search or browse to the prompt you want. If the prompt has variables, fill them in. The body is inserted into the composer, where you can edit it before sending.

## Share prompts

Prompts have the same access model as agents: private by default, can be shared with specific users or groups, can be made organization-wide. See [sharing and access](/cloud/features/ai-ml/agents/sharing-and-access).

## Prompts vs. skills vs. instructions

- **Prompts** are one-shot text snippets for the user to insert and edit. The user is in the loop.
- **[Skills](/cloud/features/ai-ml/agents/builder/skills)** are instruction packs the agent activates on its own.
- **Agent instructions** are the agent's persistent system prompt.

Use a prompt when you want to reuse phrasing but stay in control of the wording each time.
