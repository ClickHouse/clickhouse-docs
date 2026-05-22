---
sidebar_label: 'Image generation'
sidebar_position: 4
slug: /cloud/features/ai-ml/agents/builder/image-generation
title: 'Image generation'
description: 'Generate and edit images inside ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'image generation', 'DALL-E', 'Flux', 'Stable Diffusion']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

Image generation lets an agent produce new images from a text prompt or edit images the user has uploaded. The agent picks between generation and editing based on what was asked and the available context.

## Enable it

Toggle the image-generation tool in the Agent Builder's capabilities section. Some agents have access to multiple image providers (for example DALL-E and Flux); the agent picks the appropriate one or you can restrict it in instructions.

## Generation

When the user asks for an image, the agent calls the generation tool with a prompt and returns the resulting image inline. The agent retains a reference to the image in its context so it can describe or reuse it within the same conversation.

## Editing

If the user uploads an image and asks for a modification — change a color, add an object, extend a composition — the agent invokes the editing variant of the tool. The output replaces the relevant region or extends the source as requested.

## Notes

- Generated images aren't fed into separate vision analysis automatically. If you need the agent to *interpret* an image, use [vision](/cloud/features/ai-ml/agents/builder/vision) with a user-uploaded image.
- Provider content policies apply. Prompts that violate the provider's policy return an error rather than an image.
