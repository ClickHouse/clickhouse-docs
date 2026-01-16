---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: '适用于 ClickStack 的语言 SDKs - ClickHouse 可观测性栈'
title: '语言 SDKs'
doc_type: 'guide'
keywords: ['ClickStack SDKs', 'ClickStack language SDKs', 'OpenTelemetry SDKs ClickStack', 'application instrumentation SDKs
', 'telemetry collection SDKs']
---

数据通常通过 **OpenTelemetry (OTel) 收集器（collector）** 发送到 ClickStack，可以由语言 SDKs 直接发送，或者通过作为代理运行的中间 OpenTelemetry 收集器，例如收集基础设施指标和日志的收集器。

语言 SDKs 负责从您的应用程序内部收集遥测数据——主要是 **traces（跟踪）** 和 **logs（日志）**——并通过 OTLP 端点将这些数据导出到 OpenTelemetry 收集器，由收集器负责将数据摄取到 ClickHouse。

在基于浏览器的环境中，SDKs 也可能负责收集 **session data（会话数据）**，包括 UI 事件、点击和页面导航，从而支持对用户会话的回放。 

## 工作原理 \\{#how-it-works\\}

1. 应用程序使用 ClickStack SDK（例如 Node.js、Python、Go）。这些 SDK 基于 OpenTelemetry SDK，并在此基础上新增了一些功能并改进了易用性。
2. SDK 通过 OTLP（HTTP 或 gRPC）采集并导出跟踪和日志。
3. OpenTelemetry Collector 接收遥测数据，并通过已配置的导出器将其写入 ClickHouse。

## 支持的语言 \\{#supported-languages\\}

:::note OpenTelemetry 兼容性
尽管 ClickStack 提供了自研的语言 SDKs，内置了增强的遥测能力和功能，你也可以无缝继续使用现有的 OpenTelemetry SDKs。
:::

<br/>

| Language | Description | Link |
|----------|-------------|------|
| AWS Lambda | 为 AWS Lambda 函数接入遥测 | [Documentation](/use-cases/observability/clickstack/sdks/aws_lambda) |
| Browser | 面向浏览器应用的 JavaScript SDK | [Documentation](/use-cases/observability/clickstack/sdks/browser) |
| Elixir | Elixir 应用程序 | [Documentation](/use-cases/observability/clickstack/sdks/elixir) |
| Go | Go 应用程序和微服务 | [Documentation](/use-cases/observability/clickstack/sdks/golang) |
| Java | Java 应用程序 | [Documentation](/use-cases/observability/clickstack/sdks/java) |
| NestJS | NestJS 应用程序 | [Documentation](/use-cases/observability/clickstack/sdks/nestjs) |
| Next.js | Next.js 应用程序 | [Documentation](/use-cases/observability/clickstack/sdks/nextjs) |
| Node.js | 用于服务端应用的 JavaScript 运行时环境 | [Documentation](/use-cases/observability/clickstack/sdks/nodejs) |
| Deno | Deno 应用程序 | [Documentation](/use-cases/observability/clickstack/sdks/deno) |
| Python | Python 应用程序和 Web 服务 | [Documentation](/use-cases/observability/clickstack/sdks/python) |
| React Native | React Native 移动应用程序 | [Documentation](/use-cases/observability/clickstack/sdks/react-native) |
| Ruby | Ruby on Rails 应用程序和 Web 服务 | [Documentation](/use-cases/observability/clickstack/sdks/ruby-on-rails) |

## 使用 API key 进行安全防护 \\{#securing-api-key\\}

为了通过 OTel collector 将数据发送到 ClickStack，SDK 需要指定一个摄取 API key。可以通过在 SDK 中使用 `init` 函数进行设置，或者通过设置 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量来完成：

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

此 API 密钥由 HyperDX 应用程序生成，可在应用的 `Team Settings → API Keys` 中查看。

对于大多数支持 OpenTelemetry 的[语言 SDK](/use-cases/observability/clickstack/sdks) 和遥测库，你只需在应用程序中设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量，或者在初始化 SDK 时进行配置即可：

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

## Kubernetes 集成 \\{#kubernetes-integration\\}

所有 SDK 在 Kubernetes 环境中运行时，均支持自动关联 Kubernetes 元数据（pod 名称、命名空间等）。这使你可以：

- 查看与服务关联的 Pod（容器组）和节点的 Kubernetes 指标
- 将应用日志和链路追踪与基础设施指标进行关联
- 跨整个 Kubernetes 集群监控资源使用情况和性能

要启用此功能，请配置 OpenTelemetry Collector，将资源标签转发到 pod（容器组）。有关详细的配置步骤，请参阅 [Kubernetes 集成指南](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)。