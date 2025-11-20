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

<Image img={landing_image} alt="Landing page" size="lg" />

**ClickStack** 是一款基于 ClickHouse 构建的生产级可观测性平台，将日志、追踪、指标和会话统一到单一的高性能解决方案中。它专为监控和调试复杂系统而设计，使开发人员和 SRE 能够在无需频繁切换工具、也不用依赖时间戳或关联 ID 手动拼接数据的情况下，对问题进行端到端追踪。

ClickStack 的核心是一个简单但强大的理念：所有可观测性数据都应作为宽而丰富的事件进行采集。这些事件会根据数据类型（日志、追踪、指标和会话）存储在不同的 ClickHouse 表中，但在数据库层面仍然可以被完全查询，并且可以相互关联分析。

ClickStack 利用 ClickHouse 的列式架构、原生 JSON 支持以及全并行执行引擎，高效处理高基数工作负载。这使得在海量数据集上实现亚秒级查询、对长时间范围进行快速聚合，以及对单条追踪进行深度分析成为可能。JSON 以压缩的列式格式存储，从而在无需人工干预或预先定义模式的情况下支持模式演进。


## 功能特性 {#features}

该技术栈包含多项专为调试和根因分析设计的核心功能:

- 在统一平台中关联/搜索日志、指标、会话回放和追踪数据
- 架构无关,可在现有 ClickHouse 架构之上运行
- 针对 ClickHouse 优化的极速搜索和可视化
- 直观的全文搜索和属性搜索语法(例如 `level:err`),SQL 可选
- 通过事件增量分析异常趋势
- 只需几次点击即可设置告警
- 无需复杂查询语言即可对高基数事件进行仪表板展示
- 原生 JSON 字符串查询
- 实时追踪日志和追踪数据以始终获取最新事件
- 开箱即用支持 OpenTelemetry (OTel)
- 监控从 HTTP 请求到数据库查询的健康状况和性能 (APM)
- 通过事件增量识别异常和性能衰退
- 日志模式识别


## 组件 {#components}

ClickStack 由三个核心组件组成:

1. **HyperDX UI** – 专为探索和可视化可观测性数据而构建的前端界面
2. **OpenTelemetry collector** – 定制构建的预配置采集器,为日志、追踪和指标提供了预定义的模式
3. **ClickHouse** – 作为技术栈核心的高性能分析数据库

这些组件可以独立部署或组合部署。还提供了浏览器托管版本的 HyperDX UI,允许用户无需额外基础设施即可连接到现有的 ClickHouse 部署。

要开始使用,请先访问[入门指南](/use-cases/observability/clickstack/getting-started),然后加载[示例数据集](/use-cases/observability/clickstack/sample-datasets)。您还可以查阅有关[部署选项](/use-cases/observability/clickstack/deployment)和[生产最佳实践](/use-cases/observability/clickstack/production)的文档。


## 设计原则 {#clickstack-principles}

ClickStack 的设计遵循一套核心原则,在可观测性技术栈的每一层都优先考虑易用性、性能和灵活性:

### 几分钟内快速部署 {#clickstack-easy-to-setup}

ClickStack 可与任何 ClickHouse 实例和 schema 开箱即用,仅需最少配置。无论是全新部署还是集成到现有环境,都可以在几分钟内完成启动运行。

### 用户友好且专为可观测性打造 {#user-friendly-purpose-built}

HyperDX UI 同时支持 SQL 和 Lucene 风格的查询语法,用户可以选择适合自己工作流程的查询界面。该 UI 专为可观测性场景打造,经过优化可帮助团队快速定位根因并流畅地处理复杂数据。

### 端到端可观测性 {#end-to-end-observability}

ClickStack 提供全栈可见性,覆盖从前端用户会话到后端基础设施指标、应用日志和分布式追踪。这种统一视图支持对整个系统进行深度关联分析。

### 为 ClickHouse 深度优化 {#built-for-clickhouse}

技术栈的每一层都旨在充分发挥 ClickHouse 的能力。查询经过优化以充分利用 ClickHouse 的分析函数和列式存储引擎,确保对海量数据进行快速搜索和聚合。

### 原生支持 OpenTelemetry {#open-telemetry-native}

ClickStack 原生集成 OpenTelemetry,通过 OpenTelemetry collector 端点采集所有数据。对于高级用户,还支持使用原生文件格式、自定义数据管道或 Vector 等第三方工具直接写入 ClickHouse。

### 开源且完全可定制 {#open-source-and-customizable}

ClickStack 完全开源,可部署在任何环境。Schema 灵活且支持用户修改,UI 设计为可配置自定义 schema 而无需修改代码。所有组件——包括 collector、ClickHouse 和 UI——都可以独立扩展以满足数据采集、查询或存储需求。


## 架构概览 {#architectural-overview}

<Image img={architecture} alt='简单架构' size='lg' />

ClickStack 由三个核心组件组成：

1. **HyperDX UI**  
   专为可观测性打造的用户友好界面。支持 Lucene 风格和 SQL 查询、交互式仪表板、告警、链路追踪探索等功能——所有功能均针对 ClickHouse 后端进行了优化。

2. **OpenTelemetry collector**  
   定制化的采集器，配置了针对 ClickHouse 数据摄取优化的预设架构。通过 OpenTelemetry 协议接收日志、指标和追踪数据，并使用高效的批量插入方式直接写入 ClickHouse。

3. **ClickHouse**  
   高性能分析数据库，作为宽事件的中央数据存储。ClickHouse 利用其列式存储引擎和原生 JSON 支持，提供大规模的快速搜索、过滤和聚合能力。

除了这三个组件外，ClickStack 还使用 **MongoDB 实例**存储应用程序状态，如仪表板、用户账户和配置设置。

完整的架构图和部署详情请参阅[架构部分](/use-cases/observability/clickstack/architecture)。

对于有意将 ClickStack 部署到生产环境的用户，我们建议阅读["生产环境"](/use-cases/observability/clickstack/production)指南。
