---
slug: /use-cases/observability/clickstack/architecture
pagination_prev: null
pagination_next: null
description: 'ClickStack 的架构 - ClickHouse 可观测性栈'
title: '架构'
doc_type: 'reference'
keywords: ['ClickStack 架构', '可观测性架构', 'HyperDX', 'OpenTelemetry collector', 'MongoDB', '系统设计']
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-architecture.png';

ClickStack 的架构由三个核心组件组成：**ClickHouse**、**HyperDX** 和 **OpenTelemetry (OTel) Collector**。一个 **MongoDB** 实例用于存储应用程序状态。它们共同提供一个针对日志、指标和追踪进行优化的高性能开源可观测性技术栈。


## 架构概览 {#architecture-overview}

<Image img={architecture} alt="架构图" size="lg"/>

## ClickHouse：数据库引擎 {#clickhouse}

ClickStack 的核心是 ClickHouse，这是一款为大规模实时分析而设计的列式数据库。它负责可观测性数据的摄取与查询，实现以下能力：

- 在数 TB 级事件数据上实现亚秒级搜索
- 每天摄取数十亿条高基数记录
- 对可观测性数据实现至少 10 倍的高压缩率
- 原生支持半结构化 JSON 数据，允许动态演进的模式（schema）
- 功能强大的 SQL 引擎，内置数百个分析函数

ClickHouse 以“宽事件”的方式处理可观测性数据，从而在单一统一的数据结构中实现对日志、指标和链路追踪的深度关联。

## OpenTelemetry collector：数据摄取 {#open-telemetry-collector}

ClickStack 包含一个预配置的 OpenTelemetry（OTel）收集器，用于以开放、标准化的方式摄取遥测数据。用户可以通过 OTLP 协议发送数据，方式包括：

- gRPC（端口 `4317`）
- HTTP（端口 `4318`）

该收集器会以高效的批处理方式将遥测数据导出到 ClickHouse。它针对每个数据源提供经过优化的表结构，确保在所有信号类型上都具备良好的可扩展性和性能。

## HyperDX：用户界面 {#hyperdx}

HyperDX 是 ClickStack 的用户界面。它提供：

- 自然语言和类 Lucene 风格的搜索
- 用于实时调试的实时日志尾部（live tail）查看
- 日志、指标和链路追踪的统一视图
- 面向前端可观测性的会话回放功能
- 仪表板创建和告警配置
- 用于高级分析的 SQL 查询界面

HyperDX 专为 ClickHouse 设计，将强大的搜索能力与直观的工作流相结合，使你能够快速发现异常、排查问题并获取洞察。 

## MongoDB：应用状态 {#mongo}

ClickStack 使用 MongoDB 存储应用级状态，包括：

- 仪表盘
- 告警
- 用户配置
- 已保存的可视化

将状态与事件数据分离，既能确保性能与可扩展性，又能简化备份和配置工作。

这种模块化架构使 ClickStack 能够以开箱即用的方式提供快速、灵活且开源的可观测性平台。