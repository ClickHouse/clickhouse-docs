---
sidebar_label: 'Chat'
sidebar_position: 2
slug: /cloud/features/ai-ml/agents/chat
title: 'Chat'
description: 'Conversations, bookmarks, forking, multi-conversation, and sharing chats in ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'chat', 'conversations', 'bookmarks', 'fork', 'share', 'multi-conversation']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

The chat surface in ClickHouse Agents handles conversations, branching, side-by-side comparison, and sharing.

## Conversations {#conversations}

Start a new conversation by typing in the message composer and pressing send. Each conversation is saved to your sidebar history and can be reopened, renamed, or deleted later.

You can edit any of your messages in place; the agent regenerates its response from that point. You can also regenerate just the agent's last response without re-sending your message.

## Bookmarks {#bookmarks}

Bookmark a message or a whole conversation to flag it for quick retrieval. Bookmarks are private to you and survive conversation renames.

## Forking {#forking}

Forking creates a new conversation branched from a specific message. Use it to explore an alternative path without disrupting the original thread. Three fork modes are available:

- **Visible messages only** — copy the direct path to the forked message.
- **Include related branches** — copy the main path plus any existing branches.
- **Include all to here** — copy everything up to the forked message.

Forked conversations are independent — changes don't sync back to the original.

## Multi-conversation {#multi-conversation}

Multi-conversation runs two conversations side-by-side and sends the same prompt to both. Use it to compare responses across models or to A/B test different agent configurations.

Click the **+** button in the chat header to spawn a parallel conversation alongside the current one.

## Sharing chats {#sharing-chats}

Generate a shareable link for any conversation to send it to a teammate or save it for reference. Recipients see a read-only view, including artifacts and visible branches. You can revoke a link from the sharing dashboard at any time.

Edits to existing messages appear in the shared view; messages added after the link was generated do not.
