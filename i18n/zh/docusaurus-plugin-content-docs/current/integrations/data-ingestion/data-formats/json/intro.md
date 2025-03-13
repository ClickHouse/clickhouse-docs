---
sidebar_label: 概览
sidebar_position: 10
title: 使用 JSON
slug: /integrations/data-formats/json/overview
description: 在 ClickHouse 中使用 JSON
keywords: [json, clickhouse]
---


# 概览

<div style={{width:'640px', height: '360px'}}>
  <iframe src="//www.youtube.com/embed/gCg5ISOujtc"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br />

ClickHouse 提供了几种处理 JSON 的方法，每种方法都有其各自的优缺点和使用场景。在本指南中，我们将介绍如何加载 JSON 并优化设计您的架构。本指南包括以下几个部分：

- [加载 JSON](/integrations/data-formats/json/loading) - 在 ClickHouse 中加载和查询 JSON（具体来说是 [NDJSON](https://github.com/ndjson/ndjson-spec)）以及简单架构。
- [JSON 架构推断](/integrations/data-formats/json/inference) - 使用 JSON 架构推断来查询 JSON 和创建表架构。
- [设计 JSON 架构](/integrations/data-formats/json/schema) - 设计和优化您的 JSON 架构的步骤。
- [导出 JSON](/integrations/data-formats/json/exporting) - 如何导出 JSON。
- [处理其他 JSON 格式](/integrations/data-formats/json/other-formats) - 处理除 NDJSON 以外的 JSON 格式的一些提示。
- [模型化 JSON 的其他方法](/integrations/data-formats/json/other-approaches) - 模型化 JSON 的高级方法。**不推荐。**

:::note 重要提示：新的 JSON 类型现已处于测试阶段
本指南考虑了处理 JSON 的现有技术。一个新的 JSON 类型现已处于测试阶段。更多详情请见 [这里](/sql-reference/data-types/newjson)。
:::
