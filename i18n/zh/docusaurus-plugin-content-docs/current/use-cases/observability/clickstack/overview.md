---
slug: /use-cases/observability/clickstack/overview
title: 'ClickStack - ClickHouse 可观测性技术栈'
sidebar_label: '概览'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/getting-started
description: 'ClickStack - ClickHouse 可观测性技术栈概览'
doc_type: 'guide'
keywords: ['clickstack', '可观测性', '日志', '监控', '平台']
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-simple-architecture.png';
import landing_image from '@site/static/images/use-cases/observability/hyperdx-landing.png';

<Image img={landing_image} alt="Landing page" size="lg" />

**ClickStack** 是一个基于 ClickHouse 构建的生产级可观测性平台，将日志、追踪、指标和会话统一到单一的高性能解决方案中。ClickStack 专为监控和调试复杂系统而设计，使开发人员和 SRE 能够在无需在不同工具之间来回切换、也无需通过时间戳或关联 ID 手动拼接数据的情况下，对问题进行端到端追踪。

ClickStack 的核心理念既简单又强大：所有可观测性数据都应以宽且信息丰富的事件形式进行摄取。根据数据类型（日志、追踪、指标和会话），这些事件被存储到相应的 ClickHouse 表中，但在数据库层面仍然可以被完整查询并进行交叉关联。

ClickStack 利用 ClickHouse 的列式架构、原生 JSON 支持以及完全并行化的执行引擎，高效处理高基数工作负载。这使得在海量数据集上实现亚秒级查询、在宽时间范围内进行快速聚合以及对单个追踪进行深度检查成为可能。JSON 以压缩的列式格式存储，从而支持模式演进，无需人工干预或预先定义模式。


## 功能 {#features}

该栈包含多项专为调试和根因分析设计的关键功能：

- 在同一界面关联并搜索日志、指标、会话回放和链路追踪
- 与模式无关，可在你现有的 ClickHouse schema 之上工作
- 针对 ClickHouse 优化的极速搜索与可视化
- 直观的全文搜索与属性搜索语法（如 `level:err`），SQL 为可选
- 利用事件增量分析异常趋势
- 几次点击即可完成告警配置
- 无需复杂查询语言即可在仪表盘中查看高基数事件
- 原生支持 JSON 字符串查询
- 实时 Live Tail 日志与链路追踪，始终获取最新事件
- 开箱即用地支持 OpenTelemetry (OTel)
- 从 HTTP 请求到数据库查询（APM）全面监控健康状况与性能
- 通过事件增量识别异常与性能回退
- 日志模式识别



## 组件 {#components}

ClickStack 由三个核心组件组成：

1. **HyperDX UI** – 专为探索和可视化可观测性数据构建的前端界面
2. **OpenTelemetry collector** – 一个定制开发、预先配置的 collector，为日志、追踪和指标提供了约定式的 schema
3. **ClickHouse** – 该技术栈核心的高性能分析型数据库

这些组件可以独立部署，也可以组合部署。还提供了基于浏览器托管的 HyperDX UI 版本，使用户能够在无需额外基础设施的情况下连接到现有的 ClickHouse 部署。

开始之前，请先访问[快速入门指南](/use-cases/observability/clickstack/getting-started)，然后加载[示例数据集](/use-cases/observability/clickstack/sample-datasets)。你还可以查看[部署选项](/use-cases/observability/clickstack/deployment)和[生产环境最佳实践](/use-cases/observability/clickstack/production)相关文档。



## 原则 {#clickstack-principles}

ClickStack 基于一组核心原则设计，在可观测性技术栈的每一层都优先考虑易用性、性能和灵活性：

### 几分钟内即可完成部署 {#clickstack-easy-to-setup}

ClickStack 可直接与任意 ClickHouse 实例和 schema 协同工作，只需极少配置。无论是全新部署还是集成到现有环境，都可以在几分钟内完成启动并投入使用。

### 友好易用且为场景而生 {#user-friendly-purpose-built}

HyperDX UI 同时支持 SQL 和类 Lucene 的语法，允许用户选择最契合其工作流的查询界面。作为为可观测性场景专门打造的界面，它经过优化，可帮助团队快速定位根因，并在复杂数据中高效、顺畅地完成导航。

### 端到端可观测性 {#end-to-end-observability}

ClickStack 提供从前端用户会话，到后端基础设施指标、应用日志和分布式追踪在内的全栈可见性。这个统一视图支持在整个系统范围内进行深度关联与分析。

### 为 ClickHouse 而生 {#built-for-clickhouse}

技术栈的每一层都旨在充分利用 ClickHouse 的能力。查询经过优化，以发挥 ClickHouse 的分析函数和列式引擎优势，从而在海量数据上实现高速搜索和聚合。

### 原生 OpenTelemetry 集成 {#open-telemetry-native}

ClickStack 与 OpenTelemetry 原生集成，通过 OpenTelemetry collector 端点摄取所有数据。对于高级用户，它同样支持使用原生文件格式、自定义管道或如 Vector 等第三方工具，将数据直接摄取到 ClickHouse 中。

### 开源且完全可定制 {#open-source-and-customizable}

ClickStack 完全开源且可在任意环境部署。其 schema 灵活且可由用户修改，UI 也被设计为无需变更即可适配自定义 schema。所有组件——包括 collector、ClickHouse 和 UI——都可以独立扩展，以满足摄取、查询或存储方面的需求。



## 架构概览 {#architectural-overview}

<Image img={architecture} alt="Simple architecture" size="lg"/>

ClickStack 由三个核心组件组成：

1. **HyperDX UI**  
   为可观测性打造的易用界面。它支持 Lucene 风格和 SQL 查询、交互式仪表盘、告警、追踪探索等功能——并针对以 ClickHouse 作为后端的场景进行了优化。

2. **OpenTelemetry collector**  
   自定义构建的 collector，使用为 ClickHouse 摄取优化的、预先约定的 schema。它通过 OpenTelemetry 协议接收日志、指标和追踪数据，并通过高效的批量插入将数据直接写入 ClickHouse。

3. **ClickHouse**  
   高性能分析型数据库，作为宽事件记录的中心数据存储。ClickHouse 借助其列式引擎和对 JSON 的原生支持，为大规模场景提供快速搜索、过滤和聚合能力。

除了上述三个组件之外，ClickStack 还使用一个 **MongoDB 实例** 来存储应用状态，例如仪表盘、用户账户和配置信息。

完整的架构图和部署细节请参见 [架构章节](/use-cases/observability/clickstack/architecture)。

对于希望在生产环境中部署 ClickStack 的用户，建议阅读 ["Production"](/use-cases/observability/clickstack/production) 指南。
