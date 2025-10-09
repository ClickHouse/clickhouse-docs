---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-sdks'
'title': '从 Elastic 迁移 SDKs'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '迁移 SDKs'
'sidebar_position': 6
'description': '从 Elastic 迁移 SDKs'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

The Elastic Stack 提供两种语言 SDK 用于对应用进行监控：

1. **[Elastic 官方 APM 代理](https://www.elastic.co/docs/reference/apm-agents/)** – 这些是专门为 Elastic Stack 构建的 SDK。目前尚无直接的迁移路径。使用这些 SDK 的应用需要使用相应的 [ClickStack SDKs](/use-cases/observability/clickstack/sdks) 重新进行监控。

2. **[Elastic OpenTelemetry 发行版 (EDOT SDKs)](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/)** – 这些是 Elastic 的标准 OpenTelemetry SDK 的发行版，支持 .NET、Java、Node.js、PHP 和 Python。如果您的应用已经在使用 EDOT SDK，则无需重新进行监控。相反，您只需重新配置 SDK 以将遥测数据导出到 ClickStack 中包含的 OTLP Collector。有关更多详细信息，请参见 ["迁移 EDOT SDKs"](#migrating-edot-sdks)。

:::note 尽量使用 ClickStack SDKs
虽然支持标准的 OpenTelemetry SDK，但我们强烈建议使用每种语言的 [**ClickStack 分发的 SDKs**](/use-cases/observability/clickstack/sdks)。这些发行版包含额外的监控、增强的默认值和设计与 ClickStack 管道和 HyperDX UI 无缝协作的自定义扩展。通过使用 ClickStack SDKs，您可以解锁一些高级功能，例如异常堆栈跟踪，这些在标准的 OpenTelemetry 或 EDOT SDK 中不可用。
:::

## 迁移 EDOT SDKs {#migrating-edot-sdks}

与基于 ClickStack 的 OpenTelemetry SDK 类似，Elastic OpenTelemetry SDK 发行版（EDOT SDKs）是官方 OpenTelemetry SDK 的定制版本。例如，[EDOT Python SDK](https://www.elastic.co/docs/reference/opentelemetry/edot-sdks/python/) 是 [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/) 的供应商定制分发，旨在与 Elastic Observability 无缝协作。

由于这些 SDK 基于标准的 OpenTelemetry 库，迁移到 ClickStack 十分简单 - 无需重新监控。您只需调整配置，将遥测数据指向 ClickStack OpenTelemetry Collector。

配置遵循标准的 OpenTelemetry 机制。对于 Python，通常通过环境变量来完成，如 [OpenTelemetry 零代码监控文档](https://opentelemetry.io/docs/zero-code/python/configuration/) 中所述。

一个典型的 EDOT SDK 配置可能如下所示：

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=https://my-deployment.ingest.us-west1.gcp.cloud.es.io
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=ApiKey P....l"
```

要迁移到 ClickStack，请更新端点以指向本地 OTLP Collector，并更改授权头：

```shell
export OTEL_RESOURCE_ATTRIBUTES=service.name=<app-name>
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>"
```

您的数据摄取 API 密钥由 HyperDX 应用生成，可以在团队设置 → API 密钥下找到。

<Image img={ingestion_key} alt="数据摄取密钥" size="lg"/>
