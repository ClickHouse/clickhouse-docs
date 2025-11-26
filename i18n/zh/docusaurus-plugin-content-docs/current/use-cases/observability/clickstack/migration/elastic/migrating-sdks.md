---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-sdks
title: '将 SDKs 从 Elastic 迁移'
pagination_prev: null
pagination_next: null
sidebar_label: 'SDK 迁移'
sidebar_position: 6
description: '将 SDKs 从 Elastic 迁移'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

Elastic Stack 为对应用进行埋点提供了两种类型的语言 SDK：

1. **[Elastic Official APM agents](https://www.elastic.co/docs/reference/apm-agents/)** – 这些 Agent 是专门为 Elastic Stack 构建的。目前，这些 SDK 没有直接的迁移路径。使用它们的应用需要使用相应的 [ClickStack SDKs](/use-cases/observability/clickstack/sdks) 重新进行埋点。

2. **[Elastic Distributions of OpenTelemetry (EDOT SDKs)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – 这些是 Elastic 基于标准 OpenTelemetry SDKs 提供的发行版，可用于 .NET、Java、Node.js、PHP 和 Python。如果您的应用已经在使用 EDOT SDK，则无需重新对代码进行埋点。您只需重新配置该 SDK，即可将遥测数据导出到 ClickStack 随附的 OTLP Collector。有关更多详情，请参见 [&quot;Migrating EDOT SDKs&quot;](#migrating-edot-sdks)。

:::note Use ClickStack SDKs where possible
虽然标准的 OpenTelemetry SDKs 也受支持，但我们强烈建议在各语言中使用 [**ClickStack-distributed SDKs**](/use-cases/observability/clickstack/sdks)。这些发行版包含额外的埋点能力、增强的默认配置，以及专为与 ClickStack 管道和 HyperDX UI 无缝协作而设计的自定义扩展。通过使用 ClickStack SDKs，您可以启用诸如异常堆栈追踪等高级特性，而这些特性在原生 OpenTelemetry 或 EDOT SDKs 中不可用。
:::


## 迁移 EDOT SDKs

与基于 ClickStack OpenTelemetry 的 SDKs 类似，Elastic 发布的 OpenTelemetry SDKs（EDOT SDKs）是官方 OpenTelemetry SDKs 的定制版本。例如，[EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/) 是 [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/) 的厂商定制发行版，旨在与 Elastic Observability 无缝配合使用。

由于这些 SDKs 基于标准的 OpenTelemetry 库，因此迁移到 ClickStack 非常简单——无需重新插桩（re-instrumentation）。只需调整配置，将遥测数据发送到 ClickStack 的 OpenTelemetry Collector 即可。

配置方式遵循标准的 OpenTelemetry 机制。对于 Python，这通常通过环境变量完成，如 [OpenTelemetry Zero-Code Instrumentation 文档](https://opentelemetry.io/docs/zero-code/python/configuration/)中所述。

一个典型的 EDOT SDK 配置可能如下所示：

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

要迁移到 ClickStack，请将 endpoint 更新为指向本地 OTLP Collector 的地址，并修改 Authorization 请求头：

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

你的摄取 API key 由 HyperDX 应用生成，可以在 Team Settings → API Keys 中找到。

<Image img={ingestion_key} alt="Ingestion keys" size="lg" />
