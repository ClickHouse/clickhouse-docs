---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: '向 ClickStack 摄取数据'
sidebar_label: '概览'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: '向 ClickStack 摄取数据的概览'
doc_type: 'guide'
keywords: ['clickstack', '可观测性', '日志', '监控', '平台']
---

import Image from '@theme/IdealImage';
import oss_architecture_with_flow from '@site/static/images/use-cases/observability/clickstack-oss-architecture-with-flow.png';
import managed_architecture_with_flow from '@site/static/images/use-cases/observability/clickstack-managed-architecture-with-flow.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

所有数据都会通过一个 **OpenTelemetry (OTel) collector** 摄取到 ClickStack 开源版或托管版 ClickStack 中。该 collector 是日志、指标、跟踪和会话数据的主要入口。

这两种架构的关键区别在于组件的托管位置。在这两种情况下，你都会运行一个 OpenTelemetry Collector 来接收来自应用的遥测数据。使用 ClickStack 开源版时，你需要自行管理和托管 ClickHouse 以及 ClickStack UI（HyperDX）。使用托管版 ClickStack 时，ClickHouse 和 HyperDX UI 会托管并运行在 ClickHouse Cloud 中，并为你集成了认证与运维管理能力。

<Tabs groupId="architecture">
  <TabItem value="managed-clickstack" label="托管版 ClickStack" default>
    <Image img={managed_architecture_with_flow} alt="带数据流的托管架构图" size="md" />
  </TabItem>

  <TabItem value="oss-clickstack" label="开源版 ClickStack">
    <Image img={oss_architecture_with_flow} alt="带数据流的简单架构图" size="md" />
  </TabItem>
</Tabs>

在这两种部署模型中，collector 都会暴露两个 OTLP 端点：

* **HTTP** - 端口 `4318`
* **gRPC** - 端口 `4317`

你可以直接从[语言 SDKs](/use-cases/observability/clickstack/sdks) 或兼容 OTel 的数据采集代理（例如采集基础设施指标和日志的其他 OTel collectors）向这些端点发送数据。

更具体地说：

* [**语言 SDKs**](/use-cases/observability/clickstack/sdks) 负责从你的应用内部收集遥测数据——尤其是 **traces** 和 **logs**——并通过 OTLP 端点将这些数据导出到 OpenTelemetry collector，由其负责将数据摄取到 ClickHouse。有关 ClickStack 可用语言 SDKs 的更多详细信息，请参见 [SDKs](/use-cases/observability/clickstack/sdks)。

* **数据采集代理** 是部署在边缘的代理——例如在服务器、Kubernetes 节点上，或与应用一起部署。它们采集基础设施遥测数据（如日志、指标），或直接接收通过 SDKs 接入的应用发出的事件。在这种场景下，代理与应用运行在同一主机上，通常以 sidecar 或 DaemonSet 守护进程集的形式运行。这些代理将数据转发到中心 ClickStack OTel collector，该 collector 作为一个[网关](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)，通常在每个集群、数据中心或区域部署一份。[网关](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 从代理或应用接收 OTLP 事件，并负责将数据摄取到 ClickHouse。更多详情请参见 [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)。这些代理可以是其他实例的 OTel collector，或 [Fluentd](https://www.fluentd.org/) 和 [Vector](https://vector.dev/) 等替代技术。

:::note OpenTelemetry 兼容性
虽然 ClickStack 提供了自有的语言 SDKs 和定制版 OpenTelemetry，具备增强的遥测能力和特性，但你也可以无缝使用现有的 OpenTelemetry SDKs 和代理。
:::
