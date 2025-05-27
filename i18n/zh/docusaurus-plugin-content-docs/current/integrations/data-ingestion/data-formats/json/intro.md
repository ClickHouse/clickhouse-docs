---
'sidebar_label': '概述'
'sidebar_position': 10
'title': '处理 JSON'
'slug': '/integrations/data-formats/json/overview'
'description': '在 ClickHouse 中处理 JSON'
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
ClickHouse 提供了多种处理 JSON 的方法，每种方法都有各自的优缺点和使用场景。在本指南中，我们将讨论如何加载 JSON 并优化设计您的模式。本文包含以下章节：

- [加载 JSON](/integrations/data-formats/json/loading) - 在 ClickHouse 中使用简单模式加载和查询结构化和半结构化 JSON。
- [JSON 模式推断](/integrations/data-formats/json/inference) - 使用 JSON 模式推断查询 JSON 并创建表模式。
- [设计 JSON 模式](/integrations/data-formats/json/schema) - 设计和优化您的 JSON 模式的步骤。
- [导出 JSON](/integrations/data-formats/json/exporting) - 如何导出 JSON。
- [处理其他 JSON 格式](/integrations/data-formats/json/other-formats) - 关于处理非换行分隔 (NDJSON) 的 JSON 格式的一些提示。
- [建模 JSON 的其他方法](/integrations/data-formats/json/other-approaches) - 建模 JSON 的传统方法。 **不推荐使用。**
