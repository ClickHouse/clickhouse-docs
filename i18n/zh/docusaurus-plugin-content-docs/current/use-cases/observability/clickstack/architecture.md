---
slug: /use-cases/observability/clickstack/architecture
pagination_prev: null
pagination_next: null
description: 'ClickStack 架构 - ClickHouse 可观测性技术栈'
title: '架构'
doc_type: 'reference'
keywords: ['ClickStack 架构', '可观测性架构', 'HyperDX', 'OpenTelemetry collector', 'MongoDB', '系统设计']
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-architecture.png';

ClickStack 架构由三个核心组件构成：**ClickHouse**、**HyperDX** 和 **OpenTelemetry (OTel) 收集器**。一个 **MongoDB** 实例用于存储应用程序状态。它们共同提供了一个面向日志、指标和追踪进行优化的高性能开源可观测性技术栈。


## 架构概述 {#architecture-overview}

<Image img={architecture} alt='架构' size='lg' />


## ClickHouse：数据库引擎 {#clickhouse}

ClickStack 的核心是 ClickHouse，这是一个专为大规模实时分析而设计的列式数据库。它为可观测性数据的摄取和查询提供支持，具备以下能力：

- 在 TB 级事件数据中实现亚秒级搜索
- 每天摄取数十亿条高基数记录
- 对可观测性数据实现至少 10 倍的高压缩率
- 原生支持半结构化 JSON 数据，支持动态模式演进
- 强大的 SQL 引擎，内置数百个分析函数

ClickHouse 将可观测性数据作为宽事件处理，支持在单一统一结构中对日志、指标和追踪进行深度关联分析。


## OpenTelemetry 采集器:数据接入 {#open-telemetry-collector}

ClickStack 包含一个预配置的 OpenTelemetry (OTel) 采集器,以开放、标准化的方式接入遥测数据。用户可以通过 OTLP 协议发送数据,支持以下方式:

- gRPC(端口 `4317`)
- HTTP(端口 `4318`)

该采集器以高效批处理方式将遥测数据导出到 ClickHouse。它支持针对每个数据源优化的表结构,确保所有信号类型都具有可扩展的性能。


## HyperDX:界面 {#hyperdx}

HyperDX 是 ClickStack 的用户界面。它提供:

- 自然语言和 Lucene 风格搜索
- 实时日志追踪用于实时调试
- 日志、指标和追踪的统一视图
- 前端可观测性的会话回放
- 仪表板创建和告警配置
- 用于高级分析的 SQL 查询界面

HyperDX 专为 ClickHouse 设计,将强大的搜索功能与直观的工作流程相结合,使用户能够快速发现异常、调查问题并获取洞察。


## MongoDB：应用状态 {#mongo}

ClickStack 使用 MongoDB 存储应用级状态，包括：

- 仪表板
- 告警
- 用户配置
- 已保存的可视化内容

将状态与事件数据分离可确保性能和可扩展性，同时简化备份和配置。

这种模块化架构使 ClickStack 能够提供开箱即用的可观测性平台，具有快速、灵活和开源的特点。
