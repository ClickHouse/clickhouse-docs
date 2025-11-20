---
slug: /use-cases/observability/clickstack/migration/elastic
title: '从 Elastic 迁移到 ClickStack'
pagination_prev: null
pagination_next: null
description: '从 Elastic 迁移到 ClickHouse Observability Stack 的落地页'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'landing-page'
---

本指南提供了从 Elastic Stack 迁移到 ClickStack 的完整方法。我们重点介绍一种并行运行策略，在充分发挥 ClickHouse 在可观测性工作负载方面优势的同时，将风险降到最低。 

| Section | Description |
|---------|-------------|
| [Introduction](/use-cases/observability/clickstack/migration/elastic/intro) | 迁移流程与关键注意事项概览 |
| [Concepts](/use-cases/observability/clickstack/migration/elastic/concepts) | 理解 Elastic 与 ClickStack 之间的等价概念 |
| [Types](/use-cases/observability/clickstack/migration/elastic/types) | 将 Elasticsearch 类型映射到 ClickHouse 中的对应类型 |
| [Search](/use-cases/observability/clickstack/migration/elastic/search) | 比较搜索能力与查询语法 |
| [Migrating Data](/use-cases/observability/clickstack/migration/elastic/migrating-data) | 数据迁移与并行运行策略 |
| [Migrating Agents](/use-cases/observability/clickstack/migration/elastic/migrating-agents) | 从 Elastic 代理迁移到 OpenTelemetry 的过程 |
| [Migrating SDKs](/use-cases/observability/clickstack/migration/elastic/migrating-sdks) | 使用 OpenTelemetry SDK 替换 Elastic APM 代理 |