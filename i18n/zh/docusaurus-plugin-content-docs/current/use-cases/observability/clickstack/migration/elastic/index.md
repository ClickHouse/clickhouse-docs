---
slug: /use-cases/observability/clickstack/migration/elastic
title: '从 Elastic 迁移到 ClickStack'
pagination_prev: null
pagination_next: null
description: '从 Elastic 迁移到 ClickHouse 可观测性技术栈的指南页面'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'landing-page'
---

本指南提供了从 Elastic Stack 迁移到 ClickStack 的完整方案。我们采用并行运行策略,在充分发挥 ClickHouse 在可观测性工作负载方面的优势的同时,将迁移风险降至最低。

| 章节 | 说明 |
|---------|-------------|
| [简介](/use-cases/observability/clickstack/migration/elastic/intro) | 迁移流程概述及关键注意事项 |
| [概念](/use-cases/observability/clickstack/migration/elastic/concepts) | 理解 Elastic 与 ClickStack 之间的对应概念 |
| [类型](/use-cases/observability/clickstack/migration/elastic/types) | Elasticsearch 类型到 ClickHouse 类型的映射关系 |
| [搜索](/use-cases/observability/clickstack/migration/elastic/search) | 搜索功能与查询语法对比 |
| [数据迁移](/use-cases/observability/clickstack/migration/elastic/migrating-data) | 数据迁移策略与并行运行方案 |
| [Agent 迁移](/use-cases/observability/clickstack/migration/elastic/migrating-agents) | 从 Elastic Agent 过渡到 OpenTelemetry |
| [SDK 迁移](/use-cases/observability/clickstack/migration/elastic/migrating-sdks) | 将 Elastic APM Agent 替换为 OpenTelemetry SDK |