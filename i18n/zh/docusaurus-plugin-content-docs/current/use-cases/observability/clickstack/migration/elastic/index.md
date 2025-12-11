---
slug: /use-cases/observability/clickstack/migration/elastic
title: '从 Elastic 迁移到 ClickStack'
pagination_prev: null
pagination_next: null
description: '从 Elastic 迁移到 ClickHouse 可观测性栈的着陆页'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'landing-page'
---

本指南提供了从 Elastic Stack 迁移到 ClickStack 的完整方法。我们重点介绍一种并行运行策略，在最大限度降低风险的同时，充分发挥 ClickHouse 在可观测性工作负载方面的优势。 

| Section | Description |
|---------|-------------|
| [Introduction](/use-cases/observability/clickstack/migration/elastic/intro) | 迁移流程概览及关键注意事项 |
| [Concepts](/use-cases/observability/clickstack/migration/elastic/concepts) | 理解 Elastic 与 ClickStack 之间的对应概念 |
| [Types](/use-cases/observability/clickstack/migration/elastic/types) | 将 Elasticsearch 类型映射到 ClickHouse 中的对应类型 |
| [Search](/use-cases/observability/clickstack/migration/elastic/search) | 搜索能力与查询语法对比 |
| [Migrating Data](/use-cases/observability/clickstack/migration/elastic/migrating-data) | 数据迁移与并行运行策略 |
| [Migrating Agents](/use-cases/observability/clickstack/migration/elastic/migrating-agents) | 从 Elastic Agent 迁移到 OpenTelemetry 的过程 |
| [Migrating SDKs](/use-cases/observability/clickstack/migration/elastic/migrating-sdks) | 使用 OpenTelemetry SDKS 替换 Elastic APM Agent |