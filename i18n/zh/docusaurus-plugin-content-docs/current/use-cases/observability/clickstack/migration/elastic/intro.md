---
slug: /use-cases/observability/clickstack/migration/elastic/intro
title: '从 Elastic 迁移到 ClickStack'
pagination_prev: null
pagination_next: null
sidebar_label: '概览'
sidebar_position: 0
description: '从 Elastic 迁移到 ClickHouse 可观测性栈的概览'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: '指南'
---



## 从 Elastic 迁移到 ClickStack {#migrating-to-clickstack-from-elastic}

本指南面向从 Elastic Stack 迁移的用户——特别是那些使用 Kibana 监控通过 Elastic Agent 收集并存储在 Elasticsearch 中的日志、追踪和指标的用户。本指南概述了 ClickStack 中的等效概念和数据类型,说明了如何将基于 Kibana Lucene 的查询转换为 HyperDX 的语法,并提供了数据和代理迁移的指导,以确保平稳过渡。

在开始迁移之前,了解 ClickStack 和 Elastic Stack 之间的权衡取舍非常重要。

在以下情况下,您应该考虑迁移到 ClickStack:

- 您正在摄取大量可观测性数据,并且发现 Elastic 由于压缩效率低下和资源利用率不佳而成本过高。ClickStack 可以显著降低存储和计算成本——对原始数据提供至少 10 倍的压缩率。
- 您在大规模场景下遇到搜索性能不佳或面临数据摄取瓶颈。
- 您希望使用 SQL 将可观测性信号与业务数据关联起来,统一可观测性和分析工作流。
- 您致力于采用 OpenTelemetry 并希望避免供应商锁定。
- 您希望利用 ClickHouse Cloud 中存储和计算的分离,实现几乎无限的扩展能力——在空闲期间仅需为数据摄取计算和对象存储付费。

但是,在以下情况下 ClickStack 可能不适合:

- 您主要将可观测性数据用于安全用例,并且需要专注于 SIEM 的产品。
- 通用性能分析(Universal profiling)是您工作流程中的关键部分。
- 您需要商业智能(BI)仪表板平台。ClickStack 有意为 SRE 和开发人员提供特定的可视化工作流,并非设计为商业智能(BI)工具。对于等效功能,我们建议使用 [Grafana 配合 ClickHouse 插件](/integrations/grafana) 或 [Superset](/integrations/superset)。
