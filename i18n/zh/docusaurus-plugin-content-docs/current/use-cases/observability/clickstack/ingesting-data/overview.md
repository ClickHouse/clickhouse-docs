---
'slug': '/use-cases/observability/clickstack/ingesting-data/overview'
'title': '将数据导入 ClickStack'
'sidebar_label': '概述'
'sidebar_position': 0
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/ingesting-data/opentelemetry'
'description': '将数据导入 ClickStack 的概述'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import architecture_with_flow from '@site/static/images/use-cases/observability/simple-architecture-with-flow.png';

所有数据都通过一个 **OpenTelemetry (OTel) 收集器** 导入到 ClickStack 中，该收集器作为日志、指标、跟踪和会话数据的主要入口点。

<Image img={architecture_with_flow} alt="简单架构与数据流" size="md"/>

该收集器暴露了两个 OTLP 端点：

- **HTTP** - 端口 `4318`
- **gRPC** - 端口 `4317`

用户可以直接从 [语言 SDKs](/use-cases/observability/clickstack/sdks) 或 OTel 兼容的数据收集代理（例如，收集基础设施指标和日志的其他 OTel 收集器）将数据发送到这些端点。

更具体地说：

- [**语言 SDKs**](/use-cases/observability/clickstack/sdks) 负责从您的应用程序内部收集遥测数据，最显著的是 **跟踪** 和 **日志**，并通过 OTLP 端点将这些数据导出到 OpenTelemetry 收集器，该收集器处理导入到 ClickHouse 的数据。如需了解 ClickStack 提供的语言 SDKs 的更多详细信息，请参见 [SDKs](/use-cases/observability/clickstack/sdks)。

- **数据收集代理** 是在边缘部署的代理——在服务器、Kubernetes 节点或与应用程序并行运行。它们收集基础设施遥测（例如，日志、指标）或直接从使用 SDK 的应用程序接收事件。在这种情况下，代理在与应用程序相同的主机上运行，通常作为一个边车或 DaemonSet。这些代理将数据转发到中央 ClickStack OTel 收集器，该收集器充当 [网关](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)，通常在每个集群、数据中心或区域中部署一次。[网关](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 从代理或应用程序接收 OTLP 事件并处理导入到 ClickHouse 的数据。有关更多详细信息，请参见 [OTel 收集器](/use-cases/observability/clickstack/ingesting-data/otel-collector)。这些代理可以是其他 OTel 收集器的实例或替代技术，如 [Fluentd](https://www.fluentd.org/) 或 [Vector](https://vector.dev/)。

:::note OpenTelemetry 兼容性
虽然 ClickStack 提供了自己的语言 SDKs 和自定义的 OpenTelemetry，具有增强的遥测和功能，但用户也可以无缝使用现有的 OpenTelemetry SDKs 和代理。
:::
