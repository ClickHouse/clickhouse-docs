---
'slug': '/use-cases/observability/clickstack/sdks'
'pagination_prev': null
'pagination_next': null
'description': '语言 SDK 用于 ClickStack - ClickHouse 观察性堆栈'
'title': '语言 SDK'
'doc_type': 'guide'
---

数据通常通过 **OpenTelemetry (OTel) 收集器** 发送到 ClickStack，数据可直接来自语言 SDK，或通过充当代理的中间 OpenTelemetry 收集器，例如收集基础设施指标和日志。

语言 SDK 负责从您的应用程序内部收集遥测数据，最显著的是 **跟踪（traces）** 和 **日志（logs）**，并通过 OTLP 端点将这些数据导出到 OpenTelemetry 收集器，该收集器处理数据的摄取到 ClickHouse。

在基于浏览器的环境中，SDK 还可能负责收集 **会话数据（session data）**，包括 UI 事件、点击和导航，从而使用户会话可以重放。

## 工作原理 {#how-it-works}

1. 您的应用程序使用 ClickStack SDK（例如，Node.js、Python、Go）。这些 SDK 基于 OpenTelemetry SDK，并具有额外的功能和可用性增强。
2. SDK 通过 OTLP（HTTP 或 gRPC）收集并导出跟踪和日志。
3. OpenTelemetry 收集器接收遥测数据并通过配置的导出器将其写入 ClickHouse。

## 支持的语言 {#supported-languages}

:::note OpenTelemetry 兼容性
虽然 ClickStack 提供了自己增强的遥测和功能的语言 SDK，但您也可以无缝使用他们现有的 OpenTelemetry SDK。
:::

<br/>

| 语言 | 描述 | 链接 |
|------|------|------|
| AWS Lambda | 监控您的 AWS Lambda 函数 | [文档](/use-cases/observability/clickstack/sdks/aws_lambda) |
| 浏览器 | 用于基于浏览器的应用程序的 JavaScript SDK | [文档](/use-cases/observability/clickstack/sdks/browser) |
| Elixir | Elixir 应用程序 | [文档](/use-cases/observability/clickstack/sdks/elixir) |
| Go | Go 应用程序和微服务 | [文档](/use-cases/observability/clickstack/sdks/golang) |
| Java | Java 应用程序 | [文档](/use-cases/observability/clickstack/sdks/java) |
| NestJS | NestJS 应用程序 | [文档](/use-cases/observability/clickstack/sdks/nestjs) |
| Next.js | Next.js 应用程序 | [文档](/use-cases/observability/clickstack/sdks/nextjs) |
| Node.js | 用于服务器端应用程序的 JavaScript 运行时 | [文档](/use-cases/observability/clickstack/sdks/nodejs) |
| Deno | Deno 应用程序 | [文档](/use-cases/observability/clickstack/sdks/deno) |
| Python | Python 应用程序和网络服务 | [文档](/use-cases/observability/clickstack/sdks/python) |
| React Native | React Native 移动应用 | [文档](/use-cases/observability/clickstack/sdks/react-native) |
| Ruby | Ruby on Rails 应用程序和网络服务 | [文档](/use-cases/observability/clickstack/sdks/ruby-on-rails) |

## 使用 API 密钥进行安全设置 {#securing-api-key}

为了通过 OTel 收集器将数据发送到 ClickStack，SDK 需要指定一个摄取 API 密钥。这可以通过 SDK 中的 `init` 函数或者 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量进行设置：

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

此 API 密钥由 HyperDX 应用生成，并且可以通过应用中的 `团队设置 → API 密钥` 获得。

对于大多数 [语言 SDK](/use-cases/observability/clickstack/sdks) 和支持 OpenTelemetry 的遥测库，您可以简单地在应用中设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量，或者在初始化 SDK 时指定它：

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

## Kubernetes 集成 {#kubernetes-integration}

所有 SDK 都支持在 Kubernetes 环境中自动关联 Kubernetes 元数据（pod 名称、命名空间等）。这使您能够：

- 查看与您的服务相关的 pod 和节点的 Kubernetes 指标
- 将应用日志和跟踪与基础设施指标相关联
- 跟踪 Kubernetes 集群中的资源使用和性能

要启用此功能，请配置 OpenTelemetry 收集器以将资源标签转发到 pods。请参见 [Kubernetes 集成指南](/use-cases/observability/clickstack/ingesting-data/kubernetes#forwarding-resouce-tags-to-pods) 获取详细的设置说明。
