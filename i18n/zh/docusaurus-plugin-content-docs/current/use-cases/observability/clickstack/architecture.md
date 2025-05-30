---
'slug': '/use-cases/observability/clickstack/architecture'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack 的架构 - ClickHouse 可观测性堆栈'
'title': '架构'
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-architecture.png';

The ClickStack architecture is built around three core components: **ClickHouse**, **HyperDX**, and a **OpenTelemetry (OTel) collector**. A **MongoDB** instance provides storage for the application state. Together, they provide a high-performance, open-source observability stack optimized for logs, metrics, and traces.

## Architecture Overview {#architecture-overview}

<Image img={architecture} alt="Architecture" size="lg"/>

## ClickHouse: The database engine {#clickhouse}

在 ClickStack 的核心是 ClickHouse，一个专为实时分析而设计的列式数据库。它支持观察数据的摄取和查询，使得：

- 在数 TB 事件中进行亚秒级搜索
- 每天摄取数十亿高基数记录
- 在观察数据上实现至少 10 倍的高压缩率
- 原生支持半结构化 JSON 数据，允许动态模式演变
- 拥有数百个内置分析函数的强大 SQL 引擎

ClickHouse 将观察数据处理为宽事件，允许在单一统一结构中深入关联日志、指标和追踪。

## OpenTelemetry collector: data ingestion {#open-telemetry-collector}

ClickStack 包含一个预配置的 OpenTelemetry (OTel) 收集器，以开放且标准化的方式摄取遥测数据。用户可以通过以下方式使用 OTLP 协议发送数据：

- gRPC（端口 `4317`）
- HTTP（端口 `4318`）

收集器以高效批量方式将遥测数据导出到 ClickHouse。它支持每个数据源的优化表模式，确保所有信号类型的可伸缩性能。

## HyperDX: The interface {#hyperdx}

HyperDX 是 ClickStack 的用户界面。它提供：

- 自然语言和 Lucene 风格的搜索
- 实时调试的实时尾部跟踪
- 日志、指标和追踪的统一视图
- 前端可观察性的会话重放
- 仪表板创建和警报配置
- 用于高级分析的 SQL 查询接口

HyperDX 专为 ClickHouse 设计，将强大的搜索与直观的工作流程结合在一起，使用户能够快速发现异常、调查问题及获得洞察。

## MongoDB: application state {#mongo}

ClickStack 使用 MongoDB 存储应用级状态，包括：

- 仪表板
- 警报
- 用户配置文件
- 已保存的可视化

这种将状态与事件数据分开的设计确保了性能和可扩展性，同时简化了备份和配置。

这种模块化架构使 ClickStack 能够提供一个开箱即用的可观察性平台，快速、灵活且开源。
