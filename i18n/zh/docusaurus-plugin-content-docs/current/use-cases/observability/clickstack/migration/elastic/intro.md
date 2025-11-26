---
slug: /use-cases/observability/clickstack/migration/elastic/intro
title: '从 Elastic 迁移到 ClickStack'
pagination_prev: null
pagination_next: null
sidebar_label: '概览'
sidebar_position: 0
description: '从 Elastic 迁移到 ClickHouse Observability Stack（ClickStack）的概览'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'guide'
---



## 从 Elastic 迁移到 ClickStack {#migrating-to-clickstack-from-elastic}

本指南面向从 Elastic Stack 迁移的用户——尤其是那些使用 Kibana 监控由 Elastic Agent 收集并存储在 Elasticsearch 中的日志、追踪和指标的用户。本文将概述在 ClickStack 中与之等价的概念和数据类型，说明如何将基于 Kibana Lucene 的查询转换为 HyperDX 的语法，并就数据和 Agent 的迁移提供指导，以实现平滑过渡。

在开始迁移之前，理解 ClickStack 与 Elastic Stack 之间的权衡非常重要。

如果满足以下条件，您应当考虑迁移到 ClickStack：

- 您正在摄取大量可观测性数据，并且由于压缩效率低和资源利用率差而发现 Elastic 成本过高。ClickStack 可以显著降低存储和计算成本——对原始数据提供至少 10 倍压缩比。
- 您在大规模场景下面临查询性能较差或摄取瓶颈问题。
- 您希望使用 SQL 将可观测性信号与业务数据关联，从而统一可观测性与分析工作流。
- 您已经投入使用 OpenTelemetry，并希望避免被特定厂商锁定。
- 您希望利用 ClickHouse Cloud 中存储和计算分离的优势，实现几乎无限的扩展能力——在空闲期间仅为摄取计算和对象存储付费。

然而，在以下情况下，ClickStack 可能并不适合您：

- 您主要将可观测性数据用于安全相关场景，并需要以 SIEM 为核心的产品。
- 通用 Profiling 是您的工作流中至关重要的一部分。
- 您需要一个商业智能（BI）看板平台。ClickStack 有意为 SRE 和开发者提供带有明确设计取向的可视化工作流，而并非设计为一款 Business Intelligence（BI）工具。若需要等价能力，我们推荐使用 [Grafana with the ClickHouse plugin](/integrations/grafana) 或 [Superset](/integrations/superset)。
