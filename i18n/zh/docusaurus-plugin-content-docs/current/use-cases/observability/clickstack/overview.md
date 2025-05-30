---
'slug': '/use-cases/observability/clickstack/overview'
'title': 'ClickStack - ClickHouse 观察堆栈'
'sidebar_label': '概述'
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/getting-started'
'description': '关于 ClickStack - ClickHouse 观察堆栈的概述'
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-simple-architecture.png';
import landing_image from '@site/static/images/use-cases/observability/hyperdx-landing.png';

<Image img={landing_image} alt="Landing page" size="lg"/>

**ClickStack** 是一个基于 ClickHouse 的生产级可观察性平台，将日志、跟踪、指标和会话统一为一个高性能的解决方案。它旨在监控和调试复杂系统，使开发人员和 SRE 能够端到端地追踪问题，而无需在工具之间切换或手动使用时间戳或关联 ID 拼接数据。

ClickStack 的核心是一个简单而强大的理念：所有可观察性数据都应该作为宽广、丰富的事件进行摄取。这些事件按数据类型存储在 ClickHouse 表中——日志、跟踪、指标和会话——但在数据库层面上仍然可以完全查询和交叉关联。

ClickStack 通过利用 ClickHouse 的列式架构、本地 JSON 支持和完全并行的执行引擎，能够高效处理高基数工作负载。这使得对大数据集进行亚秒查询、快速的广时间范围聚合和对单个跟踪的深度检查成为可能。JSON 以压缩的列式格式存储，允许架构演变而无需手动干预或预先定义。

## 特性 {#features}

该堆栈包括几个旨在调试和根本原因分析的关键特性：

- 在一个地方关联/搜索日志、指标、会话重放和跟踪
- 无架构依赖，适用于现有的 ClickHouse 架构
- 针对 ClickHouse 优化的超快速搜索和可视化
- 直观的全文搜索和属性搜索语法（如 `level:err`），SQL 可选！
- 分析异常中的趋势和事件差异
- 只需几次点击即可设置警报
- 在没有复杂查询语言的情况下仪表盘高基数事件
- 本地 JSON 字符串查询
- 实时获取最新事件的日志和跟踪
- 开箱即用的 OpenTelemetry (OTel) 支持
- 监控从 HTTP 请求到数据库查询的健康和性能（APM）
- 用于识别异常和性能回归的事件差异
- 日志模式识别

## 组件 {#components}

ClickStack 由三个核心组件组成：

1. **HyperDX UI** – 专为探索和可视化可观察性数据而设计的前端
2. **OpenTelemetry collector** – 一个定制构建的、预配置的收集器，具有针对日志、跟踪和指标的立场导向架构
3. **ClickHouse** – 堆栈核心的高性能分析数据库

这些组件可以独立或一起部署。同时，还提供浏览器托管的 HyperDX UI 版本，允许用户在没有额外基础设施的情况下连接到现有的 ClickHouse 部署。

要开始使用，请访问 [入门指南](/use-cases/observability/clickstack/getting-started)，然后加载 [示例数据集](/use-cases/observability/clickstack/sample-datasets)。您还可以查阅 [部署选项](/use-cases/observability/clickstack/deployment) 和 [生产最佳实践](/use-cases/observability/clickstack/production) 的文档。

## 原则 {#clickstack-principles}

ClickStack 是根据一组核心原则设计的，这些原则优先考虑可观察性堆栈每一层的易用性、性能和灵活性：

### 数分钟内轻松设置 {#clickstack-easy-to-setup}

ClickStack 与任何 ClickHouse 实例和架构开箱即用，所需配置最少。无论您是全新启动还是与现有设置集成，您都可以在几分钟内启动和运行。

### 用户友好且专用 {#user-friendly-purpose-built}

HyperDX UI 同时支持 SQL 和 Lucene 风格的语法，让用户可以选择适合其工作流程的查询接口。专为可观察性而构建，UI 被优化为帮助团队快速识别根本原因，并轻松浏览复杂数据。

### 端到端可观察性 {#end-to-end-observability}

ClickStack 提供全栈可见性，从前端用户会话到后端基础设施指标、应用程序日志和分布式跟踪。这种统一视图使整个系统的深度关联和分析成为可能。

### 为 ClickHouse 构建 {#built-for-clickhouse}

堆栈的每一层都旨在充分发挥 ClickHouse 的能力。查询经过优化以利用 ClickHouse 的分析函数和列式引擎，确保在海量数据上快速搜索和聚合。

### 原生支持 OpenTelemetry {#open-telemetry-native}

ClickStack 与 OpenTelemetry 原生集成，通过 OpenTelemetry 收集器端点摄取所有数据。对于高级用户，它还支持使用本地文件格式、自定义管道或第三方工具（如 Vector）直接摄取到 ClickHouse。

### 开源且完全可定制 {#open-source-and-customizable}

ClickStack 完全开源，可以在任何地方部署。架构灵活且可用户修改，UI 被设计为可配置到自定义架构，无需更改。所有组件——包括收集器、ClickHouse 及 UI - 都可以独立扩展，以满足摄取、查询或存储需求。

## 架构概述 {#architectural-overview}

<Image img={architecture} alt="Simple architecture" size="lg"/>

ClickStack 由三个核心组件组成：

1. **HyperDX UI**  
   一个用户友好的界面，专为可观察性而构建。它支持 Lucene 风格和 SQL 查询、交互式仪表板、警报、跟踪探索等——所有这些都针对 ClickHouse 作为后端进行了优化。

2. **OpenTelemetry collector**  
   一个定制构建的收集器，配置有针对 ClickHouse 摄取优化的立场导向架构。它通过 OpenTelemetry 协议接收日志、指标和跟踪，并使用高效的批量插入直接写入 ClickHouse。

3. **ClickHouse**  
   高性能分析数据库，作为宽广事件的中央数据存储。ClickHouse 利用其列式引擎和对 JSON 的本地支持，强大驱动快速搜索、过滤和大规模聚合。

除了这三个组件，ClickStack 还使用 **MongoDB 实例** 来存储应用状态，例如仪表板、用户帐户和配置设置。

完整的架构图和部署细节可以在 [架构部分](/use-cases/observability/clickstack/architecture) 找到。
