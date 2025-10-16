---
'slug': '/use-cases/observability/clickstack/migration/elastic'
'title': '迁移到 ClickStack 从 Elastic'
'pagination_prev': null
'pagination_next': null
'description': '着陆页迁移到 ClickHouse 可观察性栈 从 Elastic'
'show_related_blogs': true
'keywords':
- 'Elasticsearch'
'doc_type': 'landing-page'
---

该指南提供了从 Elastic Stack 迁移到 ClickStack 的综合方法。我们专注于一种并行操作策略，旨在降低风险，同时利用 ClickHouse 在可观察性工作负载中的优势。

| 部分 | 描述 |
|------|------|
| [简介](/use-cases/observability/clickstack/migration/elastic/intro) | 迁移过程和关键考虑因素的概述 |
| [概念](/use-cases/observability/clickstack/migration/elastic/concepts) | 理解 Elastic 和 ClickStack 之间的等效概念 |
| [类型](/use-cases/observability/clickstack/migration/elastic/types) | 将 Elasticsearch 类型映射到 ClickHouse 等效项 |
| [搜索](/use-cases/observability/clickstack/migration/elastic/search) | 比较搜索能力和查询语法 |
| [数据迁移](/use-cases/observability/clickstack/migration/elastic/migrating-data) | 数据迁移和并行操作的策略 |
| [迁移代理](/use-cases/observability/clickstack/migration/elastic/migrating-agents) | 从 Elastic 代理过渡到 OpenTelemetry |
| [迁移 SDK](/use-cases/observability/clickstack/migration/elastic/migrating-sdks) | 用 OpenTelemetry SDK 替换 Elastic APM 代理 |
