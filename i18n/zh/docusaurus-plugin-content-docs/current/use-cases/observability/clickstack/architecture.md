---
'slug': '/use-cases/observability/clickstack/architecture'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack 的架构 - ClickHouse 观察性堆栈'
'title': '架构'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-architecture.png';

ClickStack 架构围绕三个核心组件构建：**ClickHouse**、**HyperDX** 和 **OpenTelemetry (OTel) 收集器**。一个 **MongoDB** 实例为应用状态提供存储。它们共同提供了一个高性能、开源的可观察性栈，优化用于日志、指标和追踪。

## 架构概述 {#architecture-overview}

<Image img={architecture} alt="Architecture" size="lg"/>

## ClickHouse: 数据库引擎 {#clickhouse}

ClickStack 的核心是 ClickHouse，这是一款面向实时分析的大规模列式数据库。它支持可观察性数据的摄取和查询，使得：

- 以亚秒级的速度搜索数TB的事件
- 每天摄取数十亿的高基数记录
- 可观察性数据的压缩率至少达到10倍
- 对半结构化 JSON 数据的原生支持，允许动态架构演变
- 具有数百个内置分析函数的强大 SQL 引擎

ClickHouse 将可观察性数据视为宽事件，允许在单一统一结构中对日志、指标和追踪进行深度关联。

## OpenTelemetry 收集器：数据摄取 {#open-telemetry-collector}

ClickStack 包含一个预配置的 OpenTelemetry (OTel) 收集器，以开放、标准化的方式摄取遥测数据。用户可以通过以下方式使用 OTLP 协议发送数据：

- gRPC（端口 `4317`）
- HTTP（端口 `4318`）

收集器以高效的批量方式将遥测数据导出到 ClickHouse。它支持每个数据源的优化表架构，确保所有信号类型间可扩展的性能。

## HyperDX: 界面 {#hyperdx}

HyperDX 是 ClickStack 的用户界面。它提供：

- 自然语言和 Lucene 风格的搜索
- 实时调试的实时尾追
- 日志、指标和追踪的统一视图
- 前端可观察性的会话回放
- 仪表板创建和警报配置
- 用于高级分析的 SQL 查询接口

HyperDX 专为 ClickHouse 设计，将强大的搜索功能与直观的工作流程结合在一起，使用户能够快速发现异常、调查问题并获得洞见。

## MongoDB: 应用状态 {#mongo}

ClickStack 使用 MongoDB 来存储应用级状态，包括：

- 仪表板
- 警报
- 用户资料
- 保存的可视化

将状态与事件数据分离确保了性能和可扩展性，同时简化了备份和配置。

这种模块化架构使 ClickStack 能够提供一个即插即用的可观察性平台，快速、灵活且开源。
