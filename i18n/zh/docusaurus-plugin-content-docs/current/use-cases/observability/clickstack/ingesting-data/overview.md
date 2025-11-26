---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: '数据摄取到 ClickStack'
sidebar_label: '概览'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: '关于将数据摄取到 ClickStack 的概览'
doc_type: 'guide'
keywords: ['clickstack', 'observability', 'logs', 'monitoring', 'platform']
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

所有数据均通过一个 **OpenTelemetry (OTel) collector** 摄取到 ClickStack 中，它是日志、指标、追踪和会话数据的主要入口。

<Image img={architecture_with_flow} alt="带有数据流的简单架构" size="md" />

该 collector 暴露了两个 OTLP 端点：

* **HTTP** - 端口 `4318`
* **gRPC** - 端口 `4317`

用户可以直接从[语言 SDKs](/use-cases/observability/clickstack/sdks) 或兼容 OTel 的数据采集代理发送数据到这些端点，例如其他用于收集基础设施指标和日志的 OTel collectors。

更具体来说：

* [**Language SDKs**](/use-cases/observability/clickstack/sdks) 负责从你的应用程序内部收集遥测数据——主要是 **traces（追踪）** 和 **logs（日志）**——并通过 OTLP 端点将这些数据导出到 OpenTelemetry collector，由后者负责将数据摄取到 ClickHouse 中。有关 ClickStack 所提供语言 SDKs 的更多详细信息，请参阅 [SDKs](/use-cases/observability/clickstack/sdks)。

* **数据采集代理（Data collection agents）** 是部署在边缘的代理——位于服务器、Kubernetes 节点或与应用程序一同部署。它们收集基础设施遥测数据（例如日志、指标），或直接接收使用 SDKs 插桩的应用程序发出的事件。在这种情况下，代理运行在与应用程序相同的主机上，通常作为 sidecar 或 DaemonSet 守护进程集。这些代理将数据转发到中心的 ClickStack OTel collector。该 collector 作为一个[网关](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)，通常在每个集群、数据中心或区域部署一份。[网关](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 从代理或应用程序接收 OTLP 事件，并负责将其摄取到 ClickHouse 中。更多详情请参阅 [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)。这些代理可以是其他 OTel collector 实例，或 [Fluentd](https://www.fluentd.org/) 和 [Vector](https://vector.dev/) 等替代技术。

:::note OpenTelemetry 兼容性
虽然 ClickStack 提供了自有的语言 SDKs 和定制的 OpenTelemetry，具备增强的遥测能力和特性，但用户也可以无缝使用其现有的 OpenTelemetry SDKs 和代理。
:::
