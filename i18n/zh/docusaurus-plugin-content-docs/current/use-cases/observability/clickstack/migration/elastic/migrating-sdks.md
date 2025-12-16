---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-sdks
title: '从 Elastic 迁移 SDK'
pagination_prev: null
pagination_next: null
sidebar_label: '迁移 SDK'
sidebar_position: 6
description: '从 Elastic 迁移 SDK'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

Elastic Stack 为对应用进行埋点提供了两类语言 SDK：

1. **[Elastic Official APM agents](https://www.elastic.co/docs/reference/apm-agents/)** – 这些代理专为 Elastic Stack 构建。目前这些 SDK 没有直接的迁移方案。使用它们的应用需要改用相应的 [ClickStack SDKs](/use-cases/observability/clickstack/sdks) 重新进行埋点。

2. **[Elastic Distributions of OpenTelemetry (EDOT SDKs)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – 这些是 Elastic 基于标准 OpenTelemetry SDKs 发布的发行版，适用于 .NET、Java、Node.js、PHP 和 Python。如果你的应用已经在使用 EDOT SDK，则无需重新为代码埋点。你只需重新配置该 SDK，将遥测数据导出到 ClickStack 中随附的 OTLP Collector。更多详情请参见 [&quot;Migrating EDOT SDKs&quot;](#migrating-edot-sdks)。

:::note Use ClickStack SDKs where possible
虽然也支持标准 OpenTelemetry SDKs，但我们强烈建议为每种语言使用 [**ClickStack 分发的 SDKs**](/use-cases/observability/clickstack/sdks)。这些发行版内置了额外的埋点、增强的默认配置，以及为与 ClickStack 数据管道和 HyperDX UI 无缝协同而设计的自定义扩展。通过使用 ClickStack SDKs，你可以启用高级功能（例如异常堆栈跟踪），这些功能在原生 OpenTelemetry 或 EDOT SDKs 中不可用。
:::

## 迁移 EDOT SDKs {#migrating-edot-sdks}

与基于 ClickStack 的 OpenTelemetry SDKs 类似，Elastic Distributions of the OpenTelemetry SDKs（EDOT SDKs）是官方 OpenTelemetry SDKs 的定制发行版。比如，[EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/) 是在 [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/) 基础上由厂商定制的发行版，旨在与 Elastic Observability 无缝协同工作。

由于这些 SDKs 基于标准的 OpenTelemetry 库，迁移到 ClickStack 非常简便——无需重新埋点。只需调整配置，将遥测数据转发到 ClickStack OpenTelemetry Collector 即可。

配置遵循标准的 OpenTelemetry 机制。对于 Python，这通常是通过环境变量完成的，如 [OpenTelemetry Zero-Code Instrumentation 文档](https://opentelemetry.io/docs/zero-code/python/configuration/)中所述。

一个典型的 EDOT SDK 配置可能如下所示：

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

要迁移到 ClickStack，请将 endpoint 更新为指向本地 OTLP Collector 的地址，并修改 Authorization 头：

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

你的摄取 API key 是由 HyperDX 应用生成的，可以在 Team Settings → API Keys 中找到。

<Image img={ingestion_key} alt="Ingestion keys" size="lg" />
