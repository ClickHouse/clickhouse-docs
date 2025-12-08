---
slug: /use-cases/AI_ML/AIChat
sidebar_label: 'AI chat'
title: 'Using AI Chat in ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'Guide to enabling and using the AI Chat feature in ClickHouse Cloud Console'
keywords: ['AI', 'ClickHouse Cloud', 'Chat', 'SQL Console', 'Agent', 'Docs AI']
show_related_blogs: true
sidebar_position: 2
doc_type: 'guide'
---

import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import img_open from '@site/static/images/use-cases/AI_ML/AIChat/1_open_chat.png';
import img_consent from '@site/static/images/use-cases/AI_ML/AIChat/2_consent.png';
import img_modes from '@site/static/images/use-cases/AI_ML/AIChat/3_modes.png';
import img_thinking from '@site/static/images/use-cases/AI_ML/AIChat/4_thinking.png';
import img_history from '@site/static/images/use-cases/AI_ML/AIChat/5_history.png';
import img_result_actions from '@site/static/images/use-cases/AI_ML/AIChat/6_result_actions.png';
import img_new_tab from '@site/static/images/use-cases/AI_ML/AIChat/7_open_in_editor.png';

# Using ai chat in ClickHouse Cloud

> This guide explains how to enable and use the AI Chat feature in the ClickHouse Cloud Console.

<VerticalStepper headerLevel="h2">

## Prerequisites {#prerequisites}

1. You must have access to a ClickHouse Cloud organization with AI features enabled (contact your org admin or support if unavailable).

## Open the ai chat panel {#open-panel}

1. Navigate to a ClickHouse Cloud service.
2. In the left sidebar, click the sparkle icon labeled “Ask AI”.
3. (Shortcut) Press <kbd>⌘</kbd> + <kbd>'</kbd> (macOS) or <kbd>Ctrl</kbd> + <kbd>'</kbd> (Linux/Windows) to toggle open.

<Image img={img_open} alt="Open AI Chat flyout" size="md"/>

## Accept the data usage consent (first run) {#consent}

1. On first use you are prompted with a consent dialog describing data handling and third‑party LLM sub-processors.
2. Review and accept to proceed. If you decline, the panel will not open.

<Image img={img_consent} alt="Consent dialog" size="md"/>

## Choose a chat mode {#modes}

AI Chat currently supports:

- **Agent**: Multi‑step reasoning over schema + metadata (service must be awake).
- **Docs AI (Ask)**: Focused Q&A grounded in official ClickHouse documentation and best‑practice references.

Use the mode selector at the bottom-left of the flyout to switch.

<Image img={img_modes} alt="Mode selection" size="sm"/>

## Compose and send a message {#compose}

1. Type your question (e.g. “Create a materialized view to aggregate daily events by user”).  
2. Press <kbd>Enter</kbd> to send (use <kbd>Shift</kbd> + <kbd>Enter</kbd> for a newline).  
3. While the model is processing you can click “Stop” to interrupt.

## Understanding “agent” thinking steps {#thinking-steps}

In Agent mode you may see expandable intermediate “thinking” or planning steps. These provide transparency into how the assistant forms its answer. Collapse or expand as needed.

<Image img={img_thinking} alt="Thinking steps" size="md"/>

## Starting new chats {#new-chats}

Click the “New Chat” button to clear context and begin a fresh session.

## Viewing chat history {#history}

1. The lower section lists your recent chats.
2. Select a previous chat to load its messages.
3. Delete a conversation using the trash icon.

<Image img={img_history} alt="Chat history list" size="md"/>

## Working with generated SQL {#sql-actions}

When the assistant returns SQL:

- Review for correctness.
- Click “Open in editor” to load the query into a new SQL tab.
- Modify and execute within the Console.

<Image img={img_result_actions} alt="Result actions" size="md"/>

<Image img={img_new_tab} alt="Open generated query in editor" size="md"/>

## Stopping or interrupting a response {#interrupt}

If a response is taking too long or diverging:

1. Click the “Stop” button (visible while processing).
2. The message is marked as interrupted; you can refine your prompt and resend.

## Keyboard shortcuts {#shortcuts}

| Action | Shortcut |
| ------ | -------- |
| Open AI Chat | `⌘ + '` / `Ctrl + '` |
| Send message | `Enter` |
| New line | `Shift + Enter` |

</VerticalStepper>