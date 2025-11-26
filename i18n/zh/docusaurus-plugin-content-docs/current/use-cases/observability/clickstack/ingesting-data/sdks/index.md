---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'ClickStack 语言 SDK - ClickHouse 可观测性栈'
title: '语言 SDK'
doc_type: 'guide'
keywords: ['ClickStack SDKs', 'ClickStack language SDKs', 'OpenTelemetry SDKs ClickStack', 'application instrumentation SDKs
', 'telemetry collection SDKs']
---

数据通常通过 **OpenTelemetry（OTel）Collector** 发送到 ClickStack，可以由语言 SDK 直接发送，也可以通过作为代理运行的中间 OpenTelemetry Collector（例如用于收集基础设施指标和日志）进行转发。

语言 SDK 负责从您的应用程序内部收集遥测数据——主要是 **traces** 和 **logs**——并通过 OTLP endpoint 将这些数据导出到 OpenTelemetry Collector，由其负责将数据摄取到 ClickHouse 中。

在浏览器环境中，SDK 还可能负责收集 **session data**，包括 UI 事件、点击和导航等，从而支持对用户会话进行回放。 



## 工作原理 {#how-it-works}

1. 应用程序使用 ClickStack SDK（例如 Node.js、Python、Go）。这些 SDK 基于 OpenTelemetry SDK，并在此基础上提供了额外功能和易用性增强。
2. SDK 通过 OTLP（HTTP 或 gRPC）协议收集并导出跟踪（traces）和日志（logs）。
3. OpenTelemetry 收集器接收遥测数据，并通过已配置的导出器将其写入 ClickHouse。



## 支持的语言 {#supported-languages}

:::note OpenTelemetry 兼容性
虽然 ClickStack 提供了带有增强遥测能力和功能的自有语言 SDKs，也可以无缝使用现有的 OpenTelemetry SDKs。
:::

<br/>

| 语言 | 说明 | 链接 |
|----------|-------------|------|
| AWS Lambda | 为 AWS Lambda 函数接入监控 | [文档](/use-cases/observability/clickstack/sdks/aws_lambda) |
| Browser | 面向浏览器应用的 JavaScript SDK | [文档](/use-cases/observability/clickstack/sdks/browser) |
| Elixir | Elixir 应用程序 | [文档](/use-cases/observability/clickstack/sdks/elixir) |
| Go | Go 应用程序和微服务 | [文档](/use-cases/observability/clickstack/sdks/golang) |
| Java | Java 应用程序 | [文档](/use-cases/observability/clickstack/sdks/java) |
| NestJS | NestJS 应用程序 | [文档](/use-cases/observability/clickstack/sdks/nestjs) |
| Next.js | Next.js 应用程序 | [文档](/use-cases/observability/clickstack/sdks/nextjs) |
| Node.js | 面向服务端应用程序的 JavaScript 运行时环境 | [文档](/use-cases/observability/clickstack/sdks/nodejs) |
| Deno | Deno 应用程序 | [文档](/use-cases/observability/clickstack/sdks/deno) |
| Python | Python 应用程序和 Web 服务 | [文档](/use-cases/observability/clickstack/sdks/python) |
| React Native | React Native 移动应用程序 | [文档](/use-cases/observability/clickstack/sdks/react-native) |
| Ruby | Ruby on Rails 应用程序和 Web 服务 | [文档](/use-cases/observability/clickstack/sdks/ruby-on-rails) |



## 使用 API key 进行安全防护

为了通过 OTel collector 向 ClickStack 摄取数据，SDK 需要指定一个摄取 API key。可以通过在 SDK 中的 `init` 函数中设置，或者通过 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量进行配置：

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<您的摄取_API_密钥>'
```

此 API key 由 HyperDX 应用生成，可在应用的 `Team Settings → API Keys` 中获取。

对于大多数支持 OpenTelemetry 的[语言 SDK](/use-cases/observability/clickstack/sdks)和遥测库，你只需在应用中设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量，或在初始化 SDK 时指定该变量即可：

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```


## Kubernetes 集成 {#kubernetes-integration}

所有 SDKS 在 Kubernetes 环境中运行时，都支持自动关联 Kubernetes 元数据（pod 名称、命名空间等）。这样你可以：

- 查看与你的服务关联的 pod（容器组）和节点的 Kubernetes 指标
- 将应用日志和追踪与基础设施指标进行关联
- 在整个 Kubernetes 集群中跟踪资源使用和性能

要启用此功能，请配置 OpenTelemetry 收集器，将资源标签转发到 pod（容器组）。有关详细的设置说明，请参阅 [Kubernetes 集成指南](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)。
