---
sidebar_label: '网页搜索'
sidebar_position: 3
slug: /cloud/features/ai-ml/agents/builder/web-search
title: '网页搜索'
description: '供 ClickHouse 智能体使用的外部网页搜索工具'
keywords: ['AI', 'ClickHouse Cloud', '智能体', '网页搜索']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import webSearch from '@site/static/images/cloud/agent-builder/web-search/web-search.png';

<BetaBadge />

网页搜索允许 agent 在对话过程中从公共网络获取信息。当问题的答案需要最新信息时，请使用它——例如近期发布的版本、服务外部的文档，或对权威来源进行快速核实。

## 启用此功能 \{#enable-it\}

在智能体构建器的 **功能** 部分启用 **网页搜索**。启用后，agent 会根据用户的问题和 agent 的指令决定何时发起搜索。搜索执行后，系统会抓取结果，并将最相关的内容传回模型上下文。

<Image img={webSearch} alt="功能面板中突出显示了网页搜索部分，并显示网页搜索复选框" size="sm" />

## 一轮搜索的工作原理 \{#how-a-search-round-works\}

每次搜索都会经过三个阶段，这些阶段在 Cloud 中均由系统代为管理：

1. **搜索** - agent 的查询会发送到搜索提供商，由其返回候选 URL。
2. **抓取** - 抓取相关页面，并提取其中有价值的文本。
3. **重排** - 重排器会为结果评分，让模型优先看到最有用的内容。

agent 的响应会标注其实际使用的 URL。

## 何时使用它 \{#when-to-use-it\}

* 查找你的服务中没有的发行说明或更新日志。
* 针对模型可能不了解的内容，根据资料来源核实事实。
* 将公开的博客文章或文档引入对话进行分析。

如果问题可以根据你的数据或模型自身的知识来回答，就跳过这一步。每一轮搜索都会增加延迟。