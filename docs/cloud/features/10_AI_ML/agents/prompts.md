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
import Image from '@theme/IdealImage';
import prompts from '@site/static/images/cloud/agent-builder/prompts/prompts.png';
import createPrompt from '@site/static/images/cloud/agent-builder/prompts/create-prompt.png';
import preview from '@site/static/images/cloud/agent-builder/prompts/preview.png';
import usePromptModal from '@site/static/images/cloud/agent-builder/prompts/use-prompt-modal.png';

<BetaBadge/>

The Prompts library is a place to save and reuse natural-language prompts you find yourself typing repeatedly. Think of it as snippets for your chat composer — useful when the same analytical question or formatting instruction comes up across conversations.

## Create a prompt {#create-a-prompt}

Open the Prompts panel from the **Prompts** icon in the left navigation and click the **+** button to open the **Create Prompt** form. Fill in the fields:

- **Prompt Name** (required) — what shows up in the picker. Be descriptive: *"Weekly active users by region"* beats *"WAU"*.
- **Text** (required) — the actual text that will be inserted into the composer.
- **Special variables** — click the **Special variables** button to insert placeholders, or type `{{name}}` style markers directly. The picker prompts you for values before inserting.
- **Category**, **Description**, **Command** (optional) — for organizing the library, picker preview text, and a quick-invoke shortcut.

Then click **Create Prompt** at the bottom right.

<Image img={createPrompt} alt="Prompts panel with the + button highlighted on the left and the Create Prompt form open on the right showing Prompt Name, Text, Category, Special variables, Description, and Command fields, with a Create Prompt button" size="lg"/>

## Use a prompt {#use-a-prompt}

In the Prompts panel, open the **...** menu on a prompt card and choose **Preview**:

<Image img={preview} alt="Prompts panel with a prompt selected, its details visible on the right, and a context menu showing Preview and Edit options" size="lg"/>

The preview shows the prompt's text along with its author and date. Click **Use Prompt** to insert the body into the composer. If the prompt has variables, fill them in first.

<Image img={usePromptModal} alt="Prompt preview modal showing the prompt title, author, date, body text, and a Use Prompt button" size="md"/>

## Share prompts {#share-prompts}

Prompts have the same access model as agents: private by default, can be shared with specific users or groups, can be made organization-wide. See [sharing and access](/cloud/features/ai-ml/agents/sharing-and-access).

## Prompts vs. skills vs. instructions {#prompts-vs-skills-vs-instructions}

- **Prompts** are one-shot text snippets for the user to insert and edit. The user is in the loop.
- **[Skills](/cloud/features/ai-ml/agents/builder/skills)** are instruction packs the agent activates on its own.
- **Agent instructions** are the agent's persistent system prompt.

Use a prompt when you want to reuse phrasing but stay in control of the wording each time.
