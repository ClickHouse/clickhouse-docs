---
sidebar_label: '概览'
sidebar_position: 10
title: '处理 JSON'
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

ClickHouse 提供了多种处理 JSON 的方法，每种方法都有各自的优缺点和适用场景。本指南将介绍如何加载 JSON，并以最优方式设计 JSON schema。本文包括以下部分：

- [加载 JSON](/integrations/data-formats/json/loading) - 在 ClickHouse 中使用简单 schema 加载和查询结构化与半结构化 JSON。
- [JSON schema 推断](/integrations/data-formats/json/inference) - 使用 JSON schema 推断来查询 JSON 并创建表的 schema。
- [设计 JSON schema](/integrations/data-formats/json/schema) - 设计和优化 JSON schema 的步骤。
- [导出 JSON](/integrations/data-formats/json/exporting) - 如何导出 JSON。
- [处理其他 JSON 格式](/integrations/data-formats/json/other-formats) - 关于处理非换行分隔（NDJSON）的其他 JSON 格式的一些建议。
- [建模 JSON 的其他方法](/integrations/data-formats/json/other-approaches) - 旧版 JSON 建模方法。**不推荐使用。**