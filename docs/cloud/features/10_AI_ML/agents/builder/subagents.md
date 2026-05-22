---
sidebar_label: 'Subagents'
sidebar_position: 10
slug: /cloud/features/ai-ml/agents/builder/subagents
title: 'Subagents'
description: 'Delegating work to child agents in ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'subagents', 'delegation']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

Subagents let a parent agent delegate a task to a child agent that runs in an isolated context window. Covers when to use subagents, how parent and child contexts interact, recursion limits (default 25, max 100), and patterns for composing multi-agent workflows.
