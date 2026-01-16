---
slug: /use-cases/observability/clickstack/overview
title: 'ClickStack - ClickHouse 可观测性栈'
sidebar_label: '概览'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/getting-started
description: 'ClickStack - ClickHouse 可观测性栈概览'
doc_type: 'guide'
keywords: ['clickstack', 'observability', 'logs', 'monitoring', 'platform']
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-simple-architecture.png';
import landing_image from '@site/static/images/use-cases/observability/hyperdx-landing.png';

<Image img={landing_image} alt="首页" size="lg" />

**ClickStack** 是一个基于 ClickHouse 构建的生产级可观测性平台，将日志、追踪、指标和会话统一到单一的高性能解决方案中。ClickStack 专为监控和调试复杂系统而设计，使开发人员和 SRE 能够在无需在不同工具间来回切换、也无需借助时间戳或关联 ID 手动拼接数据的情况下，对问题进行端到端追踪。

ClickStack 的核心理念简单但强大：所有可观测性数据都应以宽而信息丰富的事件形式进行摄取。这些事件按数据类型（日志、追踪、指标和会话）分别存储在 ClickHouse 表中，但在数据库层面依然可以被完全查询并进行交叉关联。

ClickStack 利用 ClickHouse 的列式架构、原生 JSON 支持以及完全并行化的执行引擎，高效处理高基数工作负载。这使得在海量数据集上实现亚秒级查询、对大时间范围进行快速聚合，以及对单条追踪进行深度检查成为可能。JSON 以压缩的列式格式存储，从而允许在无需手动干预或预先定义模式的情况下进行模式演进。


## 功能 \\{#features\\}

该技术栈包含多个专为调试和根因分析设计的关键功能：

- 在同一界面中关联和搜索日志、指标、会话回放和追踪数据
- 与数据模式无关，可直接作用于您现有的 ClickHouse schema 之上
- 为 ClickHouse 优化的高速搜索与可视化
- 直观的全文搜索和属性搜索语法（例如 `level:err`），SQL 为可选
- 使用事件差异（event deltas）分析异常趋势
- 只需几次点击即可完成告警配置
- 无需复杂查询语言即可在仪表板中展示高基数事件
- 原生 JSON 字符串查询
- 实时流式查看日志和追踪，始终获取最新事件
- 开箱即用的 OpenTelemetry (OTel) 支持
- 从 HTTP 请求到数据库查询（APM）全链路监控健康状况和性能
- 使用事件差异（event deltas）识别异常和性能回归
- 日志模式识别

## 组件 \\{#components\\}

ClickStack 由三个核心组件组成：

1. **HyperDX UI** – 专用于探索和可视化可观测性数据的前端界面
2. **OpenTelemetry collector** – 自定义构建并预先配置的采集器，对日志、链路追踪和指标采用标准化的模式
3. **ClickHouse** – 整个技术栈的核心高性能分析型数据库

这些组件可以独立部署，也可以组合部署。还提供了浏览器托管版本的 HyperDX UI，用户无需额外基础设施即可连接到现有的 ClickHouse 部署。

开始之前，请先访问[入门指南](/use-cases/observability/clickstack/getting-started)，然后加载[示例数据集](/use-cases/observability/clickstack/sample-datasets)。你还可以查阅关于[部署选项](/use-cases/observability/clickstack/deployment)和[生产环境最佳实践](/use-cases/observability/clickstack/production)的文档。

## 原则 \\{#clickstack-principles\\}

ClickStack 的设计基于一套核心原则，在可观测性栈的各个层面优先兼顾易用性、性能和灵活性：

### 几分钟内即可轻松完成设置 \\{#clickstack-easy-to-setup\\}

ClickStack 能与任意 ClickHouse 实例和 schema 开箱即用，仅需极少配置。无论是全新部署，还是集成到现有环境，都可以在几分钟内完成并投入使用。

### 易用且为可观测性量身打造 \\{#user-friendly-purpose-built\\}

HyperDX UI 同时支持 SQL 和类 Lucene 语法，使用户可以选择最契合其工作流的查询界面。该 UI 专为可观测性打造，并经过优化，可帮助团队快速定位根因，顺畅地浏览和分析复杂数据。

### 端到端可观测性 \\{#end-to-end-observability\\}

ClickStack 提供从前端用户会话到后端基础设施指标、应用日志以及分布式追踪的全栈可见性。这一统一视图有助于在整个系统范围内开展深度的关联分析。

### 专为 ClickHouse 设计 \\{#built-for-clickhouse\\}

该技术栈的每一层都旨在充分发挥 ClickHouse 的能力。查询经过优化，以充分利用 ClickHouse 的分析函数和列式引擎，从而在海量数据上实现高速搜索与聚合。

### 原生支持 OpenTelemetry \\{#open-telemetry-native\\}

ClickStack 与 OpenTelemetry 原生集成，通过 OpenTelemetry Collector 端点摄取全部数据。对于高级用户，它还支持使用原生文件格式、自定义管道或 Vector 等第三方工具将数据直接摄取到 ClickHouse 中。

### 开源且完全可自定义 \\{#open-source-and-customizable\\}

ClickStack 完全开源，可部署在任何环境中。其 schema 灵活且可由用户修改，UI 在设计时就考虑了对自定义 schema 的支持，可在无需修改的情况下进行适配。所有组件——包括 collectors、ClickHouse 和 UI——都可以独立伸缩，以满足摄取、查询或存储方面的需求。

## 架构概览 \\{#architectural-overview\\}

<Image img={architecture} alt="简化架构" size="lg"/>

ClickStack 由三个核心组件组成：

1. **HyperDX UI**  
   为可观测性构建的用户友好型界面。它同时支持 Lucene 风格查询和 SQL 查询、交互式仪表盘、告警、链路追踪分析等功能——并针对以 ClickHouse 作为后端进行了优化。

2. **OpenTelemetry collector**  
   一个自定义构建的收集器，使用为 ClickHouse 摄取优化的约定式 schema 进行配置。它通过 OpenTelemetry 协议接收日志、指标和链路追踪数据，并使用高效的批量写入方式将它们直接写入 ClickHouse。

3. **ClickHouse**  
   作为宽事件数据的中心数据存储的高性能分析型数据库。ClickHouse 依托其列式引擎和对 JSON 的原生支持，为大规模的快速搜索、过滤和聚合提供支撑。

除了这三个组件之外，ClickStack 还使用一个 **MongoDB 实例** 来存储应用状态，例如仪表盘、用户账户和配置信息。

完整的架构图和部署细节可以在[架构部分](/use-cases/observability/clickstack/architecture)中找到。

对于计划在生产环境中部署 ClickStack 的用户，我们建议阅读["生产环境"](/use-cases/observability/clickstack/production)指南。