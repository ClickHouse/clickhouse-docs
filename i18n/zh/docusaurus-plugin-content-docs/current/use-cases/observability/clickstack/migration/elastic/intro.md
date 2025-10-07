---
'slug': '/use-cases/observability/clickstack/migration/elastic/intro'
'title': '从 Elastic 迁移到 ClickStack'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '概述'
'sidebar_position': 0
'description': '从 Elastic 迁移到 ClickHouse 可观察性堆栈的概述'
'show_related_blogs': true
'keywords':
- 'Elasticsearch'
'doc_type': 'guide'
---

## 从 Elastic 迁移到 ClickStack {#migrating-to-clickstack-from-elastic}

本指南旨在帮助从 Elastic Stack 迁移的用户——特别是那些使用 Kibana 监控通过 Elastic Agent 收集并存储在 Elasticsearch 中的日志、追踪和指标的用户。它概述了 ClickStack 中的等效概念和数据类型，解释了如何将基于 Kibana Lucene 的查询转换为 HyperDX 的语法，并提供有关迁移数据和代理的指导，以确保顺利过渡。

在开始迁移之前，了解 ClickStack 与 Elastic Stack 之间的权衡是很重要的。

如果您考虑迁移到 ClickStack，可以考虑以下因素：

- 您正在摄取大量的可观察性数据，并发现由于低效的压缩和糟糕的资源利用，Elastic 的成本高昂。ClickStack 可以显著降低存储和计算成本——提供至少 10 倍的原始数据压缩。
- 您在大规模搜索性能较差或面临摄取瓶颈。
- 您希望使用 SQL 将可观察性信号与业务数据相关联，从而统一可观察性和分析工作流。
- 您致力于 OpenTelemetry，并希望避免厂商锁定。
- 您希望利用 ClickHouse Cloud 中存储和计算的分离，实现几乎无限的扩展——在闲置期间仅为摄取计算和对象存储付款。

然而，如果以下情况适用，则 ClickStack 可能不适合您：

- 您主要将可观察性数据用于安全用例，并需要侧重于 SIEM 的产品。
- 通用分析是您的工作流程中的关键部分。
- 您需要一个商业智能（BI）仪表盘平台。ClickStack 有意为 SRE 和开发人员设计了意见明确的可视化工作流，并未被设计为商业智能（BI）工具。对于具有等效功能的情况，我们建议使用 [Grafana with the ClickHouse plugin](/integrations/grafana) 或 [Superset](/integrations/superset)。
