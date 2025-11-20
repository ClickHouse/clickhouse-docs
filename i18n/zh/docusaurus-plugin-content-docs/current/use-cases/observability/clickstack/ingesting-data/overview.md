---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: '向 ClickStack 导入数据'
sidebar_label: '概览'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: '向 ClickStack 导入数据的概览'
doc_type: 'guide'
keywords: ['clickstack', 'observability', 'logs', 'monitoring', 'platform']
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

所有数据都通过 **OpenTelemetry (OTel) collector** 写入 ClickStack，该 collector 是日志、指标、追踪以及会话数据的主要入口。

<Image img={architecture_with_flow} alt="Simple architecture with flow" size="md" />

该 collector 暴露了两个 OTLP 端点：

* **HTTP** - 端口 `4318`
* **gRPC** - 端口 `4317`

用户可以从 [language SDKs](/use-cases/observability/clickstack/sdks) 或兼容 OTel 的数据采集代理直接向这些端点发送数据，例如负责收集基础设施指标和日志的其他 OTel collectors。

更具体地说：

* [**Language SDKs**](/use-cases/observability/clickstack/sdks) 负责从应用程序内部收集遥测数据——尤其是 **traces** 和 **logs**——并通过 OTLP 端点将这些数据导出到 OpenTelemetry collector，由后者负责将数据写入 ClickHouse。有关 ClickStack 可用 language SDKs 的更多信息，请参阅 [SDKs](/use-cases/observability/clickstack/sdks)。

* **Data collection agents** 是部署在边缘的代理，位于服务器、Kubernetes 节点或应用程序旁边。它们收集基础设施遥测数据（例如日志、指标），或直接从使用 SDK 进行埋点的应用程序接收事件。在这种情况下，agent 与应用运行在同一主机上，通常以 sidecar 或 DaemonSet 形式部署。这些 agents 会将数据转发到中央 ClickStack OTel collector，该 collector 充当一个[网关](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)，通常每个集群、数据中心或区域部署一份。[网关](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 从 agents 或应用接收 OTLP 事件，并负责将数据写入 ClickHouse。更多详情请参见 [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)。这些 agents 既可以是其他 OTel collector 实例，也可以是其他技术，例如 [Fluentd](https://www.fluentd.org/) 或 [Vector](https://vector.dev/)。

:::note OpenTelemetry 兼容性
尽管 ClickStack 提供了自有的 language SDKs 和具备增强遥测能力与附加功能的定制 OpenTelemetry，用户同样可以无缝继续使用现有的 OpenTelemetry SDKs 和 agents。
:::
