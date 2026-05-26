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
import Image from '@theme/IdealImage';
import chat from '@site/static/images/cloud/agent-builder/chat/chat.png';
import conversation from '@site/static/images/cloud/agent-builder/chat/conversation.png';
import bookmark from '@site/static/images/cloud/agent-builder/chat/bookmark.png';
import fork from '@site/static/images/cloud/agent-builder/chat/fork.png';
import multiConversation from '@site/static/images/cloud/agent-builder/chat/multi-conversation.png';
import multiConversation2 from '@site/static/images/cloud/agent-builder/chat/multi-conversation-2.png';
import share from '@site/static/images/cloud/agent-builder/chat/share.png';
import shareModal from '@site/static/images/cloud/agent-builder/chat/share-modal.png';

<BetaBadge/>

The chat surface in ClickHouse Agents handles conversations, branching, side-by-side comparison, and sharing.

<Image img={chat} alt="ClickHouse Agent chat surface showing the left navigation, the agent identity header, and the message composer" size="lg"/>

## Conversations {#conversations}

Start a new conversation by clicking the compose icon in the left navigation, typing in the message composer, and pressing send. Each conversation is saved to your sidebar history and can be reopened, renamed, or deleted later.

<Image img={conversation} alt="Chat surface with the compose icon highlighted in the left navigation, the sidebar showing the Chats history with a saved Top 10 Tables Ranked conversation, and the composer with a sample question typed" size="lg"/>

You can edit any of your messages in place; the agent regenerates its response from that point. You can also regenerate just the agent's last response without re-sending your message.

## Bookmarks {#bookmarks}

Bookmark a message or a whole conversation to flag it for quick retrieval. Bookmarks are private to you and survive conversation renames.

<Image img={bookmark} alt="Chat header with the bookmark icon highlighted and an Add Bookmarks tooltip visible" size="lg"/>

## Forking {#forking}

Forking creates a new conversation branched from a specific message. Use it to explore an alternative path without disrupting the original thread. Three fork modes are available:

- **Visible messages only** — copy the direct path to the forked message.
- **Include related branches** — copy the main path plus any existing branches.
- **Include all to here** — copy everything up to the forked message.

Forked conversations are independent — changes don't sync back to the original.

<Image img={fork} alt="Select a fork option dialog showing three fork mode icons, Start fork here and Remember checkboxes, and the message action toolbar below" size="lg"/>

## Multi-conversation {#multi-conversation}

Multi-conversation runs two conversations side-by-side and sends the same prompt to both. Use it to compare responses across models or to A/B test different agent configurations.

Click the **+** button in the chat header to spawn a parallel conversation alongside the current one.

<Image img={multiConversation} alt="Chat header with the Add multi-conversation button highlighted, and a + ClickHouse Agent indicator above the composer" size="lg"/>

The two conversations then sit side-by-side and receive the same prompt:

<Image img={multiConversation2} alt="Multi-conversation view with two ClickHouse Agent conversations running side by side, both executing the same run_select_query tool calls" size="lg"/>

## Sharing chats {#sharing-chats}

Generate a shareable link for any conversation to send it to a teammate or save it for reference. Recipients see a read-only view, including artifacts and visible branches. You can revoke a link from the sharing dashboard at any time.

Edits to existing messages appear in the shared view; messages added after the link was generated do not.

To share a conversation, open its menu in the sidebar and select **Share**:

<Image img={share} alt="Conversation menu in the sidebar with Share, Rename, Duplicate, Archive, and Delete options visible" size="lg"/>

Then click **Create link** in the share dialog:

<Image img={shareModal} alt="Share link to chat dialog with the Create link button and a note that your name and any messages added after sharing stay private" size="md"/>
