---
sidebar_label: 'Marketplace'
sidebar_position: 7
slug: /cloud/features/ai-ml/agents/marketplace
title: 'Agent marketplace'
description: 'Discover and use agents shared within your ClickHouse Cloud organization'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'marketplace', 'sharing', 'discovery']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

The Agent Marketplace is where you browse, search, and run agents that other people in your organization have shared with you. It also includes agents your admin has published organization-wide.

## Browse

Agents are grouped into categories — for example, *Analytics*, *Operations*, *Engineering*. Switch between categories with the tabs at the top of the marketplace. Each agent card shows the name, description, avatar, and a quick action to start a conversation.

Use the search bar to find an agent by name, description, or keyword across all categories.

## Open an agent

Click any agent card to see its full details: instructions, the model it uses, the tools it has attached, and who shared it. From the detail view you can:

- **Start a conversation** — open a new chat with the agent.
- **Save a copy** — if you have edit permission, clone the agent into your own list to modify it.

## Publish your own

To make an agent discoverable in the marketplace, share it with the right scope from the [sharing and access](/cloud/features/ai-ml/agents/sharing-and-access) panel. The visibility levels:

- **Private** — only you can see it. Not in the marketplace.
- **Shared with users or groups** — visible to those principals. Shows up in their marketplace.
- **Organization-wide** — visible to everyone in the org. Subject to your admin's marketplace permissions.

Categorize your agent and write a clear description before publishing — those fields drive both search and the categorized browse experience.

## Admin controls

Org admins can:

- Curate the set of categories shown in the marketplace.
- Promote individual agents to the organization-wide view.
- Allow or restrict marketplace access per role.

See [sharing and access](/cloud/features/ai-ml/agents/sharing-and-access) for the permission model.
