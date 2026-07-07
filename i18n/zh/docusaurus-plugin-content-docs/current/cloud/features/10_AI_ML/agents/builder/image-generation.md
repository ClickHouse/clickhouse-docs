---
sidebar_label: '图像生成'
sidebar_position: 4
slug: /cloud/features/ai-ml/agents/builder/image-generation
title: '图像生成'
description: '在 ClickHouse Agents 中生成和编辑图像'
keywords: ['AI', 'ClickHouse Cloud', 'agent', '图像生成', 'DALL-E', 'Flux', 'Stable Diffusion']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import toolsModal from '@site/static/images/cloud/agent-builder/tools-modal.png';

<BetaBadge />

图像生成功能允许agent根据文本提示词生成新图像，或编辑用户上传的图像。agent会根据用户的请求以及可用的上下文，在生成和编辑之间进行选择。

## 启用图像生成 \{#enable-it\}

图像生成功能需通过 agent 构建器中的 **Add Tools** 弹窗添加 (而不是在 **Capabilities** 部分) 。点击 agent 构建器面板底部的 **Add Tools**，然后添加一个图像模型工具，例如 **OpenAI Image Tools**、**DALL-E-3** 或 **Stable Diffusion**。agent 会根据请求自动选择合适的工具，你也可以在指令中限制它使用特定工具。

<Image img={toolsModal} alt="显示图像模型集成的agent工具弹窗，包括 OpenAI Image Tools、DALL-E-3、Stable Diffusion 以及其他第三方工具" size="md" />

## 生成 \{#generation\}

当用户请求生成图像时，agent会使用提示词调用生成工具，并以内嵌方式返回生成的图像。agent会在其上下文中保留该图像的引用，以便在同一对话中对其进行描述或再次使用。

## 编辑 \{#editing\}

如果用户上传图片并请求修改——例如更改颜色、添加对象或扩展构图——agent会调用该工具的编辑版本。输出会替换相关区域，或按要求扩展原图。

## 注意事项 \{#notes\}

* 生成的图像不会自动送入单独的视觉分析流程。如果你需要智能体*理解*图像，请使用用户上传的图像，并结合 [视觉](/cloud/features/ai-ml/agents/builder/vision) 功能。
* 提供商的内容政策同样适用。违反提供商政策的提示词不会返回图像，而是返回错误。