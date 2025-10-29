---
'slug': '/use-cases/observability/clickstack/overview'
'title': 'ClickStack - The ClickHouse 可观察性栈'
'sidebar_label': '概述'
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/getting-started'
'description': 'ClickStack - The ClickHouse 可观察性栈的概述'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-simple-architecture.png';
import landing_image from '@site/static/images/use-cases/observability/hyperdx-landing.png';

<Image img={landing_image} alt="首页" size="lg"/>

**ClickStack** 是一个基于 ClickHouse 构建的生产级可观察性平台，将日志、追踪、指标和会话统一在一个高性能解决方案中。ClickStack 旨在监控和调试复杂系统，使开发人员和 SRE 能够在不切换工具或手动使用时间戳或关联 ID 拼接数据的情况下端到端地追踪问题。

ClickStack 的核心是一个简单但强大的理念：所有可观察性数据应以宽、丰富的事件形式进行摄取。这些事件按数据类型存储在 ClickHouse 表中——日志、追踪、指标和会话——但在数据库级别仍然是完全可查询和可交叉关联的。

ClickStack 构建于 ClickHouse 的列式架构、原生 JSON 支持和完全并行化的执行引擎之上，能够高效处理高基数工作负载。这使得在大规模数据集上的查询时间在毫秒级，快速聚合跨越宽时间范围，深入检查单个追踪成为可能。JSON 以压缩的列式格式存储，允许模式演变而无需手动干预或预先定义。

## 特性 {#features}

这个堆栈包含几个关键特性，旨在用于调试和根本原因分析：

- 关联/搜索日志、指标、会话回放和追踪，所有内容集中在一个地方
- 与模式无关，适用于现有的 ClickHouse 模式
- 针对 ClickHouse 优化的闪电般快速的搜索与可视化
- 直观的全文搜索和属性搜索语法（例如 `level:err`），SQL 可选
- 通过事件增量分析异常趋势
- 只需几次点击即可设置警报
- 在不复杂查询语言的情况下高效展示高基数事件
- 原生 JSON 字符串查询
- 实时尾随日志和追踪，以始终获取最新事件
- 开箱即用的 OpenTelemetry (OTel) 支持
- 从 HTTP 请求到数据库查询（APM）监控健康和性能
- 用于识别异常和性能回归的事件增量
- 日志模式识别

## 组件 {#components}

ClickStack 由三个核心组件组成：

1. **HyperDX UI** – 旨在探索和可视化可观察性数据的专用前端
2. **OpenTelemetry collector** – 预配置的自定义收集器，具有用于日志、追踪和指标的意见化模式
3. **ClickHouse** – 堆栈核心的高性能分析数据库

这些组件可以独立或一起部署。HyperDX UI 还提供浏览器托管版本，允许用户连接到现有的 ClickHouse 部署，而无需额外的基础设施。

要开始使用，请访问 [入门指南](/use-cases/observability/clickstack/getting-started)，然后加载 [示例数据集](/use-cases/observability/clickstack/sample-datasets)。您还可以查看有关 [部署选项](/use-cases/observability/clickstack/deployment) 和 [生产最佳实践](/use-cases/observability/clickstack/production) 的文档。

## 原则 {#clickstack-principles}

ClickStack 的设计遵循一套核心原则，以优先考虑易用性、性能和灵活性，贯穿可观察性堆栈的每一层：

### 几分钟内轻松设置 {#clickstack-easy-to-setup}

ClickStack 可以与任何 ClickHouse 实例和模式开箱即用，所需配置极少。无论您是从零开始还是与现有设置集成，都可以在几分钟内启动并运行。

### 用户友好，专为目的而建 {#user-friendly-purpose-built}

HyperDX UI 支持 SQL 和 Lucene 风格语法，允许用户选择适合其工作流的查询接口。专为可观察性设计，UI 优化为帮助团队快速识别根本原因，并无缝导航复杂的数据。

### 端到端可观察性 {#end-to-end-observability}

ClickStack 提供全面的可见度，从前端用户会话到后端基础设施指标、应用程序日志和分布式追踪。此统一视图实现了整个系统的深度关联和分析。

### 为 ClickHouse 而建 {#built-for-clickhouse}

堆栈的每一层都旨在充分利用 ClickHouse 的能力。查询经过优化，以利用 ClickHouse 的分析函数和列式引擎，确保在大规模数据上快速搜索和聚合。

### 原生 OpenTelemetry {#open-telemetry-native}

ClickStack 与 OpenTelemetry 原生集成，通过 OpenTelemetry collector 端点摄取所有数据。对于高级用户，它还支持使用原生文件格式、自定义管道或像 Vector 这样的第三方工具直接摄取到 ClickHouse。

### 开源且完全可定制 {#open-source-and-customizable}

ClickStack 完全开源，可以部署在任何地方。模式灵活且可用户修改，UI 可以配置为与自定义模式兼容，无需更改。所有组件——包括收集器、ClickHouse 和 UI——都可以独立扩展，以满足摄取、查询或存储需求。

## 架构概述 {#architectural-overview}

<Image img={architecture} alt="简单架构" size="lg"/>

ClickStack 由三个核心组件组成：

1. **HyperDX UI**  
   一个用户友好的可观察性界面。它支持 Lucene 风格和 SQL 查询、交互式仪表板、警报、追踪探索等——全部优化 ClickHouse 作为后端。

2. **OpenTelemetry collector**  
   一个自定义构建的收集器，配置了针对 ClickHouse 摄取优化的意见化模式。它通过 OpenTelemetry 协议接收日志、指标和追踪，并使用高效的批量插入直接写入 ClickHouse。

3. **ClickHouse**  
   作为宽事件中心数据存储的高性能分析数据库。ClickHouse 利用其列式引擎和原生支持 JSON，实现快速搜索、过滤和大规模聚合。

除了这三个组件，ClickStack 还使用 **MongoDB 实例** 存储应用程序状态，如仪表板、用户帐户和配置设置。

完整的架构图和部署细节可以在 [架构部分](/use-cases/observability/clickstack/architecture) 找到。

对于有兴趣将 ClickStack 部署到生产环境的用户，我们建议阅读 ["生产指南"](/use-cases/observability/clickstack/production)。
