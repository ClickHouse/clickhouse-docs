---
sidebar_label: 'Chat'
sidebar_position: 2
slug: /cloud/features/ai-ml/agents/chat
title: 'Chat'
description: 'Conversations, bookmarks, forking, and sharing chats in ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'chat', 'conversations', 'bookmarks', 'fork', 'share']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import chat from '@site/static/images/cloud/agent-builder/chat/chat.png';
import conversation from '@site/static/images/cloud/agent-builder/chat/conversation.png';
import bookmark from '@site/static/images/cloud/agent-builder/chat/bookmark.png';
import fork from '@site/static/images/cloud/agent-builder/chat/fork.png';
import share from '@site/static/images/cloud/agent-builder/chat/share.png';
import shareModal from '@site/static/images/cloud/agent-builder/chat/share-modal.png';

<BetaBadge/>

The chat surface in ClickHouse Agents handles conversations, branching, and sharing.

<Image img={chat} alt="ClickHouse Agent chat surface showing the left navigation, the agent identity header, and the message composer" size="lg"/>

## Conversations {#conversations}

Start a new conversation by clicking the compose icon in the left navigation. 
Select the agent you wish to use from the Agent selector dialogue at the top left of the conversation window - by default the **ClickHouse Agent** is selected.
You can now type your message in the composer, and press send. Each conversation is saved to your sidebar history and can be reopened, renamed, or deleted later.

<Image img={conversation} alt="Chat surface with the compose icon highlighted in the left navigation, the sidebar showing the Chats history with a saved Top 10 Tables Ranked conversation, and the composer with a sample question typed" size="lg"/>

You can edit any of your messages in place, and the agent will regenerate its response from that point in the conversation history.
You can also regenerate the agent's last response only, without re-sending your message.

## Bookmarks {#bookmarks}

Bookmark a message or a whole conversation to flag it for quick retrieval. Bookmarks are private to you and survive conversation renames.

<Image img={bookmark} alt="Chat header with the bookmark icon highlighted and an Add Bookmarks tooltip visible" size="lg"/>

## Forking {#forking}

Forking creates a new conversation branched from a specific message. You can use it to explore an alternative path without disrupting the original thread.
There are three fork modes available:

- **Visible messages only** - lets you copy the direct path to the forked message.
- **Include related branches** - lets you copy the main path plus any existing branches.
- **Include all to here** - lets you copy everything up to the forked message.

Forked conversations are independent, so changes don't sync back to the original.

<Image img={fork} alt="Select a fork option dialog showing three fork mode icons, Start fork here and Remember checkboxes, and the message action toolbar below" size="lg"/>

## Sharing chats {#sharing-chats}

Generate a shareable link for any conversation to send it to a teammate or save it for reference. Recipients see a read-only view, including artifacts and visible branches. You can revoke a link from the sharing dashboard at any time.

Edits to existing messages appear in the shared view; messages added after the link was generated do not.

To share a conversation, open its menu in the sidebar and select **Share**:

<Image img={share} alt="Conversation menu in the sidebar with Share, Rename, Duplicate, Archive, and Delete options visible" size="lg"/>

Then click **Create link** in the share dialog:

<Image img={shareModal} alt="Share link to chat dialog with the Create link button and a note that your name and any messages added after sharing stay private" size="md"/>
