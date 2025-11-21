---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: '将数据接入 ClickStack'
sidebar_label: '概览'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: '将数据接入 ClickStack 的概览'
doc_type: 'guide'
keywords: ['clickstack', '可观测性', '日志', '监控', '平台']
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

所有数据都通过 **OpenTelemetry (OTel) collector** 导入 ClickStack，该组件作为日志、指标、追踪和会话数据的主要入口。

<Image img={architecture_with_flow} alt="带有数据流的简单架构" size="md" />

该 collector 暴露了两个 OTLP 端点：

* **HTTP** - 端口 `4318`
* **gRPC** - 端口 `4317`

用户可以直接通过[语言 SDK](/use-cases/observability/clickstack/sdks)，或通过兼容 OTel 的数据采集代理（例如其他用于采集基础设施指标和日志的 OTel collectors）向这些端点发送数据。

更具体地说：

* [**语言 SDK**](/use-cases/observability/clickstack/sdks) 负责从应用程序内部收集遥测数据——尤其是 **traces** 和 **logs**——并通过 OTLP 端点将这些数据导出到 OpenTelemetry collector，由后者负责将数据写入 ClickHouse。有关 ClickStack 支持的语言 SDK 的更多详细信息，请参阅 [SDKs](/use-cases/observability/clickstack/sdks)。

* **数据采集代理** 是部署在边缘的代理——例如在服务器、Kubernetes 节点上，或与应用程序并行部署。它们负责收集基础设施遥测数据（如日志、指标），或直接从使用 SDK 进行埋点的应用程序接收事件。在这种情况下，代理与应用运行在同一主机上，通常以 sidecar 或 DaemonSet 形式运行。这些代理将数据转发到中心化的 ClickStack OTel collector，该 collector 作为一个[网关](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)，通常按每个集群、数据中心或区域部署一份。[网关](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 从代理或应用程序接收 OTLP 事件，并负责将数据写入 ClickHouse。更多详情请参阅 [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)。这些代理可以是其他 OTel collector 实例，或 [Fluentd](https://www.fluentd.org/) 和 [Vector](https://vector.dev/) 等替代技术。

:::note OpenTelemetry 兼容性
尽管 ClickStack 提供了自有语言 SDK 和定制的 OpenTelemetry（具备增强的遥测能力和特性），用户仍然可以无缝使用其现有的 OpenTelemetry SDK 和代理。
:::
