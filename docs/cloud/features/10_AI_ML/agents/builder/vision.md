---
sidebar_label: 'Vision'
sidebar_position: 5
slug: /cloud/features/ai-ml/agents/builder/vision
title: 'Vision'
description: 'Image inputs and visual understanding in ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'vision', 'image input', 'multimodal']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

Vision lets users upload images for an agent to analyze. The agent passes the image to a vision-capable model, which describes, summarizes, or answers questions about what's in it.

## Enable it {#enable-it}

Toggle the vision capability in the Agent Builder. Vision only works with models that support image inputs; if the selected model can't, the upload control is disabled. Switch to a vision-capable model in [model parameters](/cloud/features/ai-ml/agents/builder/model-parameters) to re-enable it.

## Use it {#use-it}

Users attach an image to a message — a screenshot, a photo, a chart, a diagram. They can ask any question that requires reading the image: *"What's wrong with this query plan?"*, *"Transcribe the text in this screenshot,"* or *"Compare this dashboard to last week's."*

The agent treats the image as part of the message context, so follow-up questions in the same turn can reference what it saw without re-uploading.

## Combine with other tools {#combine-with-other-tools}

Vision pairs well with the [code interpreter](/cloud/features/ai-ml/agents/builder/code-interpreter) for image-driven analysis — for example, the agent reads numbers off a screenshot and then runs Python to compute totals — and with [web search](/cloud/features/ai-ml/agents/builder/web-search) when an image references something the model needs to look up.
