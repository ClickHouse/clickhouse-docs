---
slug: /use-cases/observability/clickstack/architecture
pagination_prev: null
pagination_next: null
description: 'ClickStack 的架构 - ClickHouse 可观测性栈'
title: '架构'
toc_max_heading_level: 2
doc_type: 'reference'
keywords: ['ClickStack 架构', '可观测性架构', 'HyperDX', 'OpenTelemetry collector', 'MongoDB', '系统设计']
---

import Image from '@theme/IdealImage';
import oss_architecture from '@site/static/images/use-cases/observability/clickstack-oss-architecture.png';
import managed_architecture from '@site/static/images/use-cases/observability/clickstack-managed-architecture.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 的架构会根据部署方式而有所不同。**ClickStack Open Source** 中的所有组件均为自管理，而在 **Managed ClickStack** 中，ClickHouse 和 HyperDX UI 则托管并运行于 ClickHouse Cloud 中，两者在架构上存在重要差异。尽管这两种模型中的核心组件保持不变，但对各组件进行托管、扩展以及安全防护的职责划分不同。


## 架构概览 \{#architecture-overview\}

下文概述了托管版和开源版 ClickStack 的架构。

<Tabs groupId="architectures">
  <TabItem value="managed-clickstack" label="托管版 ClickStack" default>
    托管版 ClickStack 完全运行在 **ClickHouse Cloud** 中，在保留相同 ClickStack 数据模型和用户体验的同时，提供全托管的可观测性后端。

    在此模型中，**ClickHouse 和 ClickStack UI（HyperDX）** 由 ClickHouse Cloud 托管、运营并保障安全。用户只需负责运行一个 **OpenTelemetry (OTel) collector** 来将遥测数据发送到托管服务中。

    <Image img={managed_architecture} alt="Managed Architecture" size="lg" />

    ### ClickHouse Cloud：引擎

    托管版 ClickStack 的核心是 ClickHouse Cloud，它是 ClickHouse 的无服务器版本——一种为大规模实时分析而设计的列式数据库。它为可观测性数据提供摄取和查询能力，实现：

    * 跨 TB 级事件的亚秒级搜索
    * 每天摄取数十亿高基数记录
    * 对可观测性数据至少 10 倍的高压缩率
    * 对半结构化 JSON 数据的原生支持，允许模式（schema）动态演进
    * 功能强大的 SQL 引擎，内置数百个分析函数

    ClickHouse Cloud 将可观测性数据作为宽事件进行处理，从而在统一结构中实现跨日志、指标和追踪的深度关联。

    除了 ClickHouse 开源版本之外，它还为可观测性带来了多项优势：

    * 计算与存储解耦的自动扩缩
    * 基于对象存储的低成本、几乎无限期的保留
    * 能够使用 Warehouses 独立隔离读写负载
    * 集成身份验证
    * 自动化备份
    * 安全性与合规特性
    * 无缝升级

    ### OpenTelemetry collector：数据摄取

    托管版 ClickStack 包含一个预先配置好的 OpenTelemetry (OTel) collector，以开放、标准化的方式摄取遥测数据。你可以通过 OTLP 协议发送数据，支持：

    * gRPC（端口 `4317`）
    * HTTP（端口 `4318`）

    collector 以高效的批处理方式将遥测数据导出到 ClickHouse Cloud。它为每种数据源提供优化的表模式（schema），确保对所有信号类型具备可扩展的性能。

    **架构中的这一组件由用户负责管理**

    ### ClickStack UI（HyperDX）：界面层

    ClickStack UI（HyperDX）是 ClickStack 的用户界面。它提供：

    * 自然语言和基于 Lucene 风格的搜索
    * 面向实时调试的实时尾部日志查看（live tailing）
    * 日志、指标和追踪的统一视图
    * 用于前端可观测性的会话回放
    * 仪表板创建和告警配置
    * 面向高级分析的 SQL 查询界面

    HyperDX 专为 ClickHouse 设计，将强大的搜索能力与直观的工作流相结合，使你能够快速发现异常、排查问题并获取洞察。

    在托管版 ClickStack 中，UI 集成在 ClickHouse Cloud 控制台的身份验证系统中。
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack 开源版">
    ClickStack 开源架构围绕三个核心组件构建：**ClickHouse**、**HyperDX** 和 **OpenTelemetry (OTel) collector**。一个 **MongoDB** 实例为应用状态提供存储。它们共同构成了一个针对日志、指标和追踪优化的高性能开源可观测性技术栈。

    <Image img={oss_architecture} alt="Architecture" size="lg" />

    ### ClickHouse：数据库引擎

    ClickStack 的核心是 ClickHouse，这是一款为大规模实时分析而设计的列式数据库。它负责可观测性数据的摄取和查询，实现：

    * 在数 TB 事件数据上的亚秒级搜索
    * 每天摄取数十亿条高基数记录
    * 在可观测性数据上至少 10 倍的高压缩比
    * 对半结构化 JSON 数据的原生支持，允许 schema 动态演进
    * 拥有数百个内置分析函数的强大 SQL 引擎

    ClickHouse 将可观测性数据作为宽事件进行处理，使日志、指标和追踪能够在单一统一结构中实现深度关联。

    ### OpenTelemetry collector：数据摄取

    ClickStack 内置了预先配置好的 OpenTelemetry (OTel) collector，以开放、标准化的方式摄取遥测数据。可以通过 OTLP 协议发送数据，支持：

    * gRPC（端口 `4317`）
    * HTTP（端口 `4318`）

    collector 以高效批量的方式将遥测数据导出到 ClickHouse。它针对不同数据源提供了优化的表 schema，从而确保对所有信号类型都具备可扩展的性能。

    ### ClickStack UI（HyperDX）：用户界面

    ClickStack UI（HyperDX）是 ClickStack 的用户界面。它提供：

    * 自然语言和基于 Lucene 的搜索
    * 面向实时调试的实时尾部日志查看（live tailing）
    * 日志、指标和追踪的统一视图
    * 面向前端可观测性的会话回放
    * 仪表盘创建和告警配置
    * 用于高级分析的 SQL 查询界面

    HyperDX 专为 ClickHouse 设计，将强大的搜索能力与直观的工作流结合起来，帮助快速发现异常、排查问题并获得洞察。

    ### MongoDB：应用状态

    ClickStack 使用 MongoDB 存储应用级状态，包括：

    * 仪表盘
    * 告警
    * 用户配置文件
    * 已保存的可视化

    将状态与事件数据分离可以确保性能和可扩展性，同时简化备份和配置。

    这种模块化架构使 ClickStack 能够提供一个开箱即用的可观测性平台，兼具高性能、灵活性和开源特性。
  </TabItem>
</Tabs>