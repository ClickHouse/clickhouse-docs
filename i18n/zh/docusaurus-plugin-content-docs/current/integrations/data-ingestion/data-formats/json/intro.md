---
'sidebar_label': '概览'
'sidebar_position': 10
'title': '使用 JSON'
'slug': '/integrations/data-formats/json/overview'
'description': '在 ClickHouse 中使用 JSON'
'keywords':
- 'json'
- 'clickhouse'
'score': 10
---


# JSON 概述

<div style={{width:'1024px', height: '576px'}}>
  <iframe src="//www.youtube.com/embed/gCg5ISOujtc"
    width="1024"
    height="576"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br/>
ClickHouse 提供了几种处理 JSON 的方法，每种方法都有其优缺点和使用场景。在本指南中，我们将讨论如何加载 JSON 并优化设计您的架构。本指南包含以下几个部分：

- [加载 JSON](/integrations/data-formats/json/loading) - 在 ClickHouse 中加载和查询结构化和半结构化 JSON 的简单架构。
- [JSON 架构推断](/integrations/data-formats/json/inference) - 使用 JSON 架构推断查询 JSON 并创建表架构。
- [设计 JSON 架构](/integrations/data-formats/json/schema) - 设计和优化您的 JSON 架构的步骤。
- [导出 JSON](/integrations/data-formats/json/exporting) - 如何导出 JSON。
- [处理其他 JSON 格式](/integrations/data-formats/json/other-formats) - 一些处理非换行分隔(JSON)格式的提示。
- [模型化 JSON 的其他方法](/integrations/data-formats/json/other-approaches) - 模型化 JSON 的旧方法。 **不推荐。**
