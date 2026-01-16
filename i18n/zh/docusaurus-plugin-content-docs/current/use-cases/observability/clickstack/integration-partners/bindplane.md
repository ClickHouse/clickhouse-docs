---
slug: /use-cases/observability/clickstack/integration-partners/bindplane
title: '使用 Bindplane 将 OpenTelemetry 发送到 ClickStack'
sidebar_label: 'Bindplane'
pagination_prev: null
pagination_next: null
description: '使用 Bindplane 将遥测数据路由到 ClickStack，实现采集器的集中管理'
doc_type: 'guide'
keywords: ['Bindplane', 'OTEL', 'ClickStack', 'OpenTelemetry', '采集器管理']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import bindplane_hyperdx from '@site/static/images/clickstack/bindplane/bindplane-hyperdx.png';
import bindplane_configuration from '@site/static/images/clickstack/bindplane/bindplane-configuration.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# 使用 Bindplane 将 OpenTelemetry 发送到 ClickStack \\{#bindplane-clickstack\\}

<PartnerBadge/>

:::note[摘要]
本指南介绍如何使用 Bindplane 的原生 ClickStack 目标，将遥测数据路由到 ClickStack。你将学习如何：

- 在 Bindplane 中将 ClickStack 配置为目标
- 创建用于处理和路由遥测数据的配置
- 将配置远程部署到 OTel collector 并开始采集数据
- 在 ClickStack 中查看遥测数据

此集成将 ClickStack 的高性能摄取能力与 Bindplane 的集中式 collector 管理相结合，使你能够在不增加运维开销的情况下，更轻松地扩展可观测性。

所需时间：10–15 分钟
:::

## 什么是 Bindplane？ \\{#what-is-bindplane\\}

Bindplane 是一个原生支持 OpenTelemetry 的遥测管道，用于对 OpenTelemetry Collector 进行集中化管理。它通过提供可视化配置编辑、安全的逐步发布（rollout）以及管道智能等能力，简化了大规模 Collector 集群的运维管理。

## 为什么选择 Bindplane + ClickStack？ \\{#why-bindplane-clickstack\\}

在大规模场景下，管理大批量的 OpenTelemetry Collector 会成为运维瓶颈。ClickStack 已经证明其可以处理极端的摄取规模——客户以每秒数 GB 的速率摄取遥测数据，并存储数百 PB 的数据。此时，挑战从查询性能转变为如何可靠地运行向 ClickHouse 提供数据的 Collector 基础设施。

Bindplane 通过以下方式解决这一问题：

- 为数量从数千到上百万的 OpenTelemetry Collector 提供集中管理
- 通过可视化配置编辑实现安全的一键式发布
- 在数据到达 ClickStack 之前，自动进行资源检测和丰富，并保证统一执行
- 支持扇出路由，使同一条遥测数据流可以同时发送到 ClickStack 和其他目标
- 提供完整的管道可见性，包括 Collector 健康状态、吞吐量和端到端性能

:::tip 关键要点

- **ClickStack 负责处理极端的摄取规模、海量存储以及快速分析型查询**
- **Bindplane 管理摄取管道，并解决运行大规模 Collector 机群的运维复杂度**
:::

## 前置条件 \\{#prerequisites\\}

- 已运行的 ClickStack 实例（本地、服务器或 ClickHouse Cloud）
- Bindplane 账号（[在 `app.bindplane.com` 创建账号](https://app.bindplane.com))
- 已安装 Bindplane OTel Collector（参见 [Install Your First Collector](https://docs.bindplane.com/readme/install-your-first-collector)）
- Bindplane collector 与 ClickStack OTLP 端点之间的网络连通性
- ClickStack API 摄取密钥（可在 ClickStack Team Settings > API Keys 中找到，[参考文档见此处](/docs/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)）
- 已开放相应的网络端口（`4318` 用于 HTTP(S)，`4317` 用于 gRPC）

## 将 ClickStack 与 Bindplane 集成 \\{#integrate-bindplane-clickstack\\}

<VerticalStepper headerLevel="h4">

#### 将 ClickStack 配置为目标 \\{#configure-destination\\}

1. 登录你的 Bindplane 账号
2. 进入 **Library**
3. 点击 **Add Destination**
4. 从可用目标列表中选择 **ClickStack**
5. 配置连接：
   - **Protocol**：选择 HTTP 或 gRPC（默认：HTTP，端口为 `4318`）
   - **Hostname**：输入你的 ClickStack OTLP 端点主机名或 IP 地址
   - **Port**：输入端口（HTTP 使用 `4318`，gRPC 使用 `4317`）
   - **API Ingestion Key**：输入你的 ClickStack API 摄取密钥
6. 为该目标命名（例如：“ClickStack Production”）
7. 点击 **Save** 创建该目标

:::tip 关键要点
ClickStack 目标支持 HTTP 和 gRPC 两种协议。对于高流量场景，推荐使用带压缩（gzip、zstd 或 snappy）的 gRPC 以获得更好的性能。
:::

#### 创建配置 \\{#create-configuration\\}

在完成 ClickStack 目标配置后，创建一个配置来处理并路由遥测数据：

1. 前往 **Configurations** → **Create Configuration**
2. 为该配置命名（例如：“ClickStack Pipeline”）
3. 为你的部署选择 **Collector Type** 和 **Platform**
4. 添加源（sources）：
   - 点击 **Add Source**，从 80+ 个可用源中进行选择
   - 在测试环境中，你可以添加一个 telemetry generator 源来模拟流量
   - 在生产环境中，为你的实际遥测数据（logs、metrics、traces）添加源
5. 添加 ClickStack 目标：
   - 点击 **Add Destination**
   - 选择你在上一步创建的 ClickStack 目标
   - 选择要发送的遥测类型（Logs、Metrics、Traces，或全部）

:::tip 关键要点
你可以添加处理器，用于过滤、采样、脱敏/掩码、增强、批处理等，在遥测数据到达 ClickStack 之前对其进行整形。这可以确保进入 ClickHouse 的数据保持一致且结构化。
:::

#### 添加处理器（可选） \\{#add-processors\\}

Bindplane 提供 pipeline 智能能力和处理器推荐。你可以添加处理器来：

- **Filter**：通过排除不必要的遥测数据来减少数据量
- **Sample**：对高流量 traces 应用采样策略
- **Enrich**：添加资源属性、标签或元数据
- **Transform**：修改遥测数据的结构或内容
- **Batch**：优化批次大小以提高传输效率

这些处理器会在数据到达 ClickStack 之前，一致地应用到你的整个 collector 集群上。

#### 部署 collectors 并开始滚动发布 \\{#deploy-collectors\\}

1. 向你的配置中添加一个 collector（BDOT Collector）：
   - 在 Bindplane 中进入 **Agents**
   - 在目标系统上安装 Bindplane collector，[遵循 Bindplane 的安装说明](https://docs.bindplane.com/readme/install-your-first-collector)
   - collector 连接成功后会出现在你的 collector 列表中

2. 将配置分配给你的 collectors：
   - 选择你要使用的 collectors
   - 将你的 ClickStack 配置分配给它们

3. 启动滚动发布：
   - 点击 **Start Rollout** 以部署配置
   - Bindplane 会在发布前验证该配置
   - 在 Bindplane UI 中监控发布状态

:::tip 关键要点
Bindplane 提供安全的一键滚动发布与验证。你可以通过 Bindplane 界面实时监控 collector 的健康状况、吞吐量以及任何错误。
:::

<Image img={bindplane_configuration} alt="通过 Bindplane 进入 ClickStack 的遥测信号" size="lg"/>

#### 在 ClickStack 中验证遥测数据 \\{#verify-telemetry\\}

配置滚动发布完成后，遥测数据会从受管的 collector 集群流入 ClickStack：

1. 登录你的 ClickStack 实例（HyperDX UI）
2. 前往 **Logs**、**Metrics** 或 **Traces** 探索器
3. 你应当能看到来自 Bindplane 管理的 collectors 的遥测数据
4. 到达 ClickStack 的数据已经经过 Bindplane 处理器的增强和结构化处理

<Image img={bindplane_hyperdx} alt="通过 Bindplane 进入 ClickStack 的遥测信号" size="lg"/>

</VerticalStepper>

## 高级配置 \\{#advanced-configuration\\}

### 扇出路由 \\{#fan-out-routing\\}

Bindplane 支持扇出（fan-out）路由，允许你将同一遥测数据流同时发送到多个目标。你可以：

- 将日志、指标和追踪发送到 ClickStack 进行长期存储和分析
- 将相同的数据路由到其他可观测性平台，用于实时告警
- 将特定遥测数据转发到 SIEM 平台进行安全分析

这是通过在 Bindplane 配置中添加多个目标来实现的。

### 压缩和性能 \\{#compression\\}

对于高流量场景，请为 ClickStack 目标配置压缩：

- **HTTP**：支持 gzip、deflate、snappy、zstd 或 none（默认：gzip）
- **gRPC**：支持 gzip、snappy、zstd 或 none（默认：gzip）

压缩在向 ClickStack 发送遥测数据时可以减少带宽占用，在大规模场景下尤为重要。

## 后续步骤 \\{#next-steps\\}

现在你已经将遥测数据从 Bindplane 传输到 ClickStack，可以：

- **构建仪表盘**：在 ClickStack（HyperDX）中为日志、指标和链路追踪创建可视化
- **设置告警**：在 ClickStack 中为关键条件配置告警
- **扩展部署**：随着可观测性需求的增长，添加更多采集器和数据源
- **优化管道**：利用 Bindplane 的管道智能功能识别优化机会

## 延伸阅读 \{#read-more\}

* [Bindplane 文档中的 ClickStack 集成](https://docs.bindplane.com/integrations/destinations/clickstack)

{/* - [《Bindplane + ClickStack 集成：将 OpenTelemetry (OTel) 发送到 ClickStack》（Bindplane 博客）](tbd) -- 发布后添加链接 */ }
