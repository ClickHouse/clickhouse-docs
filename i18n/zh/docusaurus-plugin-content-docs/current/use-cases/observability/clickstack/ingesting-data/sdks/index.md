---
'slug': '/use-cases/observability/clickstack/sdks'
'pagination_prev': null
'pagination_next': null
'description': '编程语言 SDKs 用于 ClickStack - ClickHouse 可观察性栈'
'title': '编程语言 SDKs'
---

用户通常通过 **OpenTelemetry (OTel) 收集器** 将数据发送到 ClickStack，数据可以直接来自语言 SDK 或通过充当代理的中间 OpenTelemetry 收集器，例如收集基础设施指标和日志。

语言 SDK 负责从您的应用程序内部收集遥测数据，尤其是 **跟踪** 和 **日志**，并通过 OTLP 端点将这些数据导出到 OpenTelemetry 收集器，该收集器负责将数据摄取到 ClickHouse 中。

在基于浏览器的环境中，SDK 还可能负责收集 **会话数据**，包括用户界面事件、点击和导航，从而实现用户会话的重放。

## 工作原理 {#how-it-works}

1. 您的应用程序使用 ClickStack SDK（例如，Node.js、Python、Go）。这些 SDK 基于 OpenTelemetry SDK，并具有额外的功能和可用性增强。
2. SDK 通过 OTLP（HTTP 或 gRPC）收集并导出跟踪和日志。
3. OpenTelemetry 收集器接收遥测数据，并通过配置的导出程序将其写入 ClickHouse。

## 支持的语言 {#supported-languages}

:::note OpenTelemetry 兼容性
虽然 ClickStack 提供其自己的语言 SDK，附带增强的遥测和功能，但用户也可以无缝使用现有的 OpenTelemetry SDK。
:::

<br/>

| 语言       | 描述                                       | 链接                                                              |
|------------|------------------------------------------|-------------------------------------------------------------------|
| 浏览器     | 用于基于浏览器应用程序的 JavaScript SDK | [文档](/use-cases/observability/clickstack/sdks/browser)         |
| Elixir     | Elixir 应用程序                          | [文档](/use-cases/observability/clickstack/sdks/elixir)         |
| Go         | Go 应用程序和微服务                     | [文档](/use-cases/observability/clickstack/sdks/golang)         |
| Java       | Java 应用程序                            | [文档](/use-cases/observability/clickstack/sdks/java)           |
| NestJS     | NestJS 应用程序                         | [文档](/use-cases/observability/clickstack/sdks/nestjs)         |
| Next.js    | Next.js 应用程序                        | [文档](/use-cases/observability/clickstack/sdks/nextjs)         |
| Node.js    | 用于服务器端应用程序的 JavaScript 运行时 | [文档](/use-cases/observability/clickstack/sdks/nodejs)        |
| Deno       | Deno 应用程序                            | [文档](/use-cases/observability/clickstack/sdks/deno)           |
| Python     | Python 应用程序和 Web 服务               | [文档](/use-cases/observability/clickstack/sdks/python)         |
| React Native| React Native 移动应用程序              | [文档](/use-cases/observability/clickstack/sdks/react-native)   |
| Ruby       | Ruby on Rails 应用程序和 Web 服务      | [文档](/use-cases/observability/clickstack/sdks/ruby-on-rails) |

## 使用 API 密钥进行安全保护 {#securing-api-key}

为了通过 OTel 收集器将数据发送到 ClickStack，SDK 需要指定一个摄取 API 密钥。可以通过 SDK 中的 `init` 函数或 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量进行设置：

```bash
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

该 API 密钥由 HyperDX 应用生成，可以在应用中的 `团队设置 → API 密钥` 中找到。

对于大多数支持 OpenTelemetry 的 [语言 SDK](/use-cases/observability/clickstack/sdks) 和遥测库，用户只需在应用程序中设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量，或在初始化 SDK 时指定：

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

## Kubernetes 集成 {#kubernetes-integration}

所有 SDK 支持在 Kubernetes 环境中运行时与 Kubernetes 元数据（如 pod 名称、命名空间等）的自动关联。这使您能够：

- 查看与您的服务相关联的 Pods 和节点的 Kubernetes 指标
- 将应用程序日志和跟踪与基础设施指标关联
- 跟踪整个 Kubernetes 集群的资源使用情况和性能

要启用此功能，请配置 OpenTelemetry 收集器以将资源标签转发至 Pods。有关详细设置说明，请参阅 [Kubernetes 集成指南](/use-cases/observability/clickstack/ingesting-data/kubernetes#forwarding-resouce-tags-to-pods)。
