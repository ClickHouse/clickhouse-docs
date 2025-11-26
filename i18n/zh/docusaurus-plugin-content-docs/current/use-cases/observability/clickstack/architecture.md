---
slug: /use-cases/observability/clickstack/architecture
pagination_prev: null
pagination_next: null
description: 'ClickStack 架构 - ClickHouse 可观测性栈'
title: '架构'
doc_type: 'reference'
keywords: ['ClickStack 架构', '可观测性架构', 'HyperDX', 'OpenTelemetry collector', 'MongoDB', '系统设计']
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-architecture.png';

ClickStack 的架构围绕三个核心组件构建：**ClickHouse**、**HyperDX**，以及一个 **OpenTelemetry (OTel) 收集器**。一个 **MongoDB** 实例为应用状态提供存储。它们共同组成了一套针对日志、指标和链路追踪进行了优化的高性能开源可观测性技术栈。


## 架构概览 {#architecture-overview}

<Image img={architecture} alt="架构图" size="lg"/>



## ClickHouse：数据库引擎 {#clickhouse}

ClickStack 的核心是 ClickHouse，这是一款列式数据库，专为大规模实时分析而设计。它为可观测性数据提供摄取与查询能力，从而实现：

- 在数 TB 级事件数据上实现亚秒级检索
- 每天摄取数十亿条高基数记录
- 对可观测性数据实现至少 10 倍的压缩率
- 原生支持半结构化 JSON 数据，允许模式（schema）动态演进
- 功能强大的 SQL 引擎，内置数百种分析函数

ClickHouse 以宽事件（wide event）的形式处理可观测性数据，从而能够在单一统一结构中对日志、指标和链路追踪进行深度关联。



## OpenTelemetry collector：数据摄取 {#open-telemetry-collector}

ClickStack 包含一个预先配置好的 OpenTelemetry (OTel) collector，用于以开放、标准化的方式摄取遥测数据。用户可以通过 OTLP 协议发送数据，方式包括：

- gRPC（端口 `4317`）
- HTTP（端口 `4318`）

该 collector 以高效的批处理方式将遥测数据导出到 ClickHouse，并针对不同数据源提供优化的表结构设计，从而确保在所有信号类型上的可扩展性能。



## HyperDX：界面 {#hyperdx}

HyperDX 是 ClickStack 的用户界面。它提供：

- 自然语言和 Lucene 风格的搜索
- 实时日志尾部跟踪（live tailing），用于实时调试
- 日志、指标和追踪的统一视图
- 面向前端可观测性的会话回放
- 仪表盘创建和告警配置
- 面向高级分析的 SQL 查询界面

HyperDX 专为 ClickHouse 设计，将强大的搜索能力与直观的工作流程相结合，使用户能够快速发现异常、排查问题并获取洞察。 



## MongoDB：应用程序状态 {#mongo}

ClickStack 使用 MongoDB 存储应用程序级别的状态，包括：

- 仪表板
- 告警
- 用户配置
- 已保存的可视化

将状态与事件数据相分离，有助于确保性能和可扩展性，同时简化备份和配置管理。

这种模块化架构使 ClickStack 能够提供开箱即用、快速、灵活且开源的可观测性平台。
