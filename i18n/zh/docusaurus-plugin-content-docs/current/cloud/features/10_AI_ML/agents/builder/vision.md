---
sidebar_label: '视觉'
sidebar_position: 5
slug: /cloud/features/ai-ml/agents/builder/vision
title: '视觉'
description: 'ClickHouse agent中的图像输入和视觉理解'
keywords: ['AI', 'ClickHouse Cloud', 'agent', '视觉', '图像输入', '多模态']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import vision from '@site/static/images/cloud/agent-builder/vision/vision.png';

<BetaBadge />

视觉支持用户上传图片供agent分析。agent会将图片传递给具备视觉能力的模型，由其对图片内容进行描述、总结或回答相关问题。

## 启用视觉功能 \{#enable-it\}

视觉功能仅适用于支持图像输入的模型。如果所选模型不支持，消息输入框上的上传控件将被禁用。切换到支持视觉的模型以重新启用它。

## 使用视觉功能 \{#use-it\}

点击消息输入框左下角的回形针图标，然后选择 **上传到提供商** 以附上一张图片——截图、照片、图表或示意图。然后提出任何需要查看图片才能回答的问题：*&quot;这个查询计划哪里有问题？&quot;*、*&quot;把这张截图里的文字转写出来，&quot;* 或 *&quot;把这个仪表板和上周的做个比较。&quot;*

<Image img={vision} alt="消息输入框中已打开回形针菜单，显示“上传到提供商”“作为文本上传”和“上传到代码环境”选项" size="lg" />

agent 会将图片视为消息上下文的一部分，因此在同一轮中的后续问题可以直接引用它看到的内容，而无需重新上传。

## 将视觉与其他工具结合使用 \{#combine-with-other-tools\}

视觉可与[代码解释器](/cloud/features/ai-ml/agents/builder/code-interpreter)很好地配合，用于基于图像的分析——例如，agent可以先从屏幕截图中读取数字，再运行 Python 计算总计——如果图像中提到了模型需要进一步查找的内容，还可以结合[网页搜索](/cloud/features/ai-ml/agents/builder/web-search)使用。