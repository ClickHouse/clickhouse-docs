---
sidebar_label: '概览'
sidebar_position: 10
title: 'JSON 操作'
slug: /integrations/data-formats/json/overview
description: '在 ClickHouse 中处理 JSON'
keywords: ['json', 'clickhouse']
score: 10
doc_type: 'guide'
---

# JSON 概览

<iframe src="//www.youtube.com/embed/gCg5ISOujtc"
frameborder="0"
allow="autoplay;
fullscreen;
picture-in-picture"
allowfullscreen>
</iframe>

<br/>

ClickHouse 提供了多种处理 JSON 的方法，每种方法都有各自的优缺点和适用场景。在本指南中，我们将介绍如何加载 JSON 并对表结构进行最优设计。本指南包含以下部分：

- [加载 JSON](/integrations/data-formats/json/loading) - 在 ClickHouse 中基于简单表结构加载并查询结构化与半结构化 JSON。
- [JSON 模式推断](/integrations/data-formats/json/inference) - 使用 JSON 模式推断来查询 JSON 并创建数据表结构。
- [设计 JSON 模式](/integrations/data-formats/json/schema) - 设计和优化 JSON 模式的步骤。
- [导出 JSON](/integrations/data-formats/json/exporting) - 如何导出 JSON。
- [处理其他 JSON 格式](/integrations/data-formats/json/other-formats) - 处理除换行分隔（NDJSON）以外的 JSON 格式的一些技巧。
- [用于建模 JSON 的其他方法](/integrations/data-formats/json/other-approaches) - 传统的 JSON 建模方法。**不推荐使用。**