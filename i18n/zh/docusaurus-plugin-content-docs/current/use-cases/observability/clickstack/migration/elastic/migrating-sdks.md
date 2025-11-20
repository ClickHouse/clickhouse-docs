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

Elastic Stack 为应用插桩提供两类语言 SDK：

1. **[Elastic Official APM agents](https://www.elastic.co/docs/reference/apm-agents/)** – 这些代理是专门为 Elastic Stack 构建的。目前这些 SDK 尚无直接的迁移路径。使用它们的应用需要使用相应的 [ClickStack SDKs](/use-cases/observability/clickstack/sdks) 重新进行插桩。

2. **[Elastic Distributions of OpenTelemetry (EDOT SDKs)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – 这些是 Elastic 发布的标准 OpenTelemetry SDK 的发行版，适用于 .NET、Java、Node.js、PHP 和 Python。如果你的应用已经在使用 EDOT SDK，则无需重新插桩代码。你只需重新配置该 SDK，将遥测数据导出到 ClickStack 中包含的 OTLP Collector。有关更多详情，请参阅 [&quot;Migrating EDOT SDKs&quot;](#migrating-edot-sdks)。

:::note 尽可能使用 ClickStack SDKs
虽然标准 OpenTelemetry SDK 也受支持，但我们强烈建议在各个语言中优先使用 [**ClickStack-distributed SDKs**](/use-cases/observability/clickstack/sdks)。这些发行版包含额外的插桩、增强的默认配置，以及为与 ClickStack 管道和 HyperDX UI 无缝协作而设计的自定义扩展。通过使用 ClickStack SDKs，你可以启用高级功能，例如原生 OpenTelemetry 或 EDOT SDK 中不提供的异常堆栈跟踪。
:::


## 迁移 EDOT SDK {#migrating-edot-sdks}

与基于 OpenTelemetry 的 ClickStack SDK 类似,Elastic Distributions of the OpenTelemetry SDKs(EDOT SDK)是官方 OpenTelemetry SDK 的定制版本。例如,[EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/) 是 [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/) 的供应商定制发行版,专为与 Elastic Observability 无缝集成而设计。

由于这些 SDK 基于标准 OpenTelemetry 库,迁移到 ClickStack 非常简单——无需重新进行插桩。您只需调整配置,将遥测数据发送到 ClickStack OpenTelemetry Collector 即可。

配置遵循标准 OpenTelemetry 机制。对于 Python,通常通过环境变量完成,详见 [OpenTelemetry 零代码插桩文档](https://opentelemetry.io/docs/zero-code/python/configuration/)。

典型的 EDOT SDK 配置如下所示:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

要迁移到 ClickStack,请更新端点以指向本地 OTLP Collector 并修改授权标头:

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

您的数据摄取 API 密钥由 HyperDX 应用程序生成,可在团队设置 → API 密钥下找到。

<Image img={ingestion_key} alt='数据摄取密钥' size='lg' />
