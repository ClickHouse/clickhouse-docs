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
import Image from '@theme/IdealImage';
import memories from '@site/static/images/cloud/agent-builder/memory/memories.png';
import create from '@site/static/images/cloud/agent-builder/memory/create.png';
import createModal from '@site/static/images/cloud/agent-builder/memory/create-modal.png';
import edit from '@site/static/images/cloud/agent-builder/memory/edit.png';
import editModal from '@site/static/images/cloud/agent-builder/memory/edit-modal.png';
import deleteMemory from '@site/static/images/cloud/agent-builder/memory/delete.png';
import filter from '@site/static/images/cloud/agent-builder/memory/filter.png';
import toggle from '@site/static/images/cloud/agent-builder/memory/toggle.png';

<BetaBadge/>

Memory carries user-specific context across conversations. Rather than indexing entire chat histories, it stores compact structured entries — preferences, recurring facts, project details — that the agent can pull in when relevant.

## How it works {#how-it-works}

A small memory agent runs alongside the main conversation. It reads recent messages, decides what's worth remembering, and writes entries to a per-user store. On the next conversation, those entries are available as context the main agent can reference without you having to repeat yourself.

You see this as continuity: tell an agent once that you prefer SQL output in lowercase and that your fiscal year ends in March, and future conversations behave accordingly.

## Manage your memories {#manage-your-memories}

Open the memory panel from the **Memories** (brain) icon in the left navigation. The panel lists your stored memories with controls to create, edit, delete, and filter entries.

<Image img={memories} alt="Memories panel showing the brain icon highlighted in the left navigation, a filter input, an Add button, a Use memory checkbox, a memory entry with edit and delete controls, and an Admin Settings button" size="md"/>

Memory is private to your user. Other people's agents never see your entries, and your agents never see theirs.

### Create a memory {#create-memory}

Click the **+** button at the top of the panel to open the **Create Memory** dialog. Enter a **Key** (lowercase letters and underscores only) and a **Value**, then click **Create**.

<Image img={create} alt="Memory panel with the Create Memory + button highlighted" size="md"/>

### Filter memories {#filter-memories}

Use the **Filter memories** input at the top of the panel to find an entry by key.

<Image img={filter} alt="Memory panel with the Filter memories input highlighted and 'demo' typed in" size="md"/>

### Edit a memory {#edit-memory}

Click the pencil icon on a memory to open the **Edit Memory** dialog. Adjust the Key or Value and click **Save**.

<Image img={edit} alt="Memory entry with the Edit Memory pencil icon highlighted" size="md"/>

### Delete a memory {#delete-memory}

Click the trash icon on a memory to remove it.

<Image img={deleteMemory} alt="Memory entry with the Delete Memory trash icon highlighted" size="md"/>

## Toggle memory {#toggle-memory}

Turn memory on or off with the **Use memory** checkbox at the top of the memory panel. Disable it for sensitive topics you don't want stored, or for one-off conversations where personalization isn't helpful.

When memory is off, the agent neither reads from nor writes to your memory store.

<Image img={toggle} alt="Memory panel with the Use memory checkbox highlighted at the top" size="md"/>

## When memory helps {#when-memory-helps}

- Recurring conventions: preferred date formats, business definitions, naming patterns.
- Project context: which service or database you usually query, which dashboards you care about.
- Communication style: terse versus chatty, code-heavy versus prose-heavy responses.

## When memory doesn't help {#when-memory-doesnt-help}

Memory isn't a database. It's not a place to dump large reference material — use a [skill](/cloud/features/ai-ml/agents/builder/skills) or bake the material into the agent's instructions for that. It's also not retrieval over past chats; the conversation history itself plays that role.
