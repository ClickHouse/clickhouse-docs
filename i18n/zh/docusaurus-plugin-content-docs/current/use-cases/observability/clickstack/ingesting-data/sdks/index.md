---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'ClickStack 的语言 SDK - ClickHouse 可观测性栈'
title: '语言 SDK'
doc_type: 'guide'
keywords: ['ClickStack SDKs', 'ClickStack language SDKs', 'OpenTelemetry SDKs ClickStack', 'application instrumentation SDKs
', 'telemetry collection SDKs']
---

数据通常通过 **OpenTelemetry (OTel) collector** 发送到 ClickStack，可以由语言 SDK 直接发送，也可以通过作为代理运行的中间层 OpenTelemetry collector 发送，例如用于收集基础设施指标和日志的场景。

语言 SDK 负责从你的应用程序内部收集遥测数据——尤其是 **traces** 和 **logs**——并通过 OTLP endpoint 将这些数据导出到 OpenTelemetry collector，再由后者负责将数据写入 ClickHouse。

在浏览器环境中，SDK 还可能负责收集 **session data**，包括 UI 事件、点击和导航等，从而支持用户会话回放。 



## 工作原理 {#how-it-works}

1. 您的应用程序使用 ClickStack SDK(例如 Node.js、Python、Go)。这些 SDK 基于 OpenTelemetry SDK 构建,并提供了额外的功能和易用性增强。
2. SDK 通过 OTLP(HTTP 或 gRPC)收集并导出链路追踪和日志数据。
3. OpenTelemetry 收集器接收遥测数据,并通过配置的导出器将其写入 ClickHouse。


## 支持的语言 {#supported-languages}

:::note OpenTelemetry 兼容性
虽然 ClickStack 提供了具有增强遥测和功能的自有语言 SDK,但您也可以无缝使用其现有的 OpenTelemetry SDK。
:::

<br />

| 语言     | 描述                                     | 链接                                                                    |
| ------------ | ----------------------------------------------- | ----------------------------------------------------------------------- |
| AWS Lambda   | 为 AWS Lambda 函数添加监测            | [文档](/use-cases/observability/clickstack/sdks/aws_lambda)    |
| Browser      | 用于浏览器应用的 JavaScript SDK   | [文档](/use-cases/observability/clickstack/sdks/browser)       |
| Elixir       | Elixir 应用程序                             | [文档](/use-cases/observability/clickstack/sdks/elixir)        |
| Go           | Go 应用程序和微服务               | [文档](/use-cases/observability/clickstack/sdks/golang)        |
| Java         | Java 应用程序                               | [文档](/use-cases/observability/clickstack/sdks/java)          |
| NestJS       | NestJS 应用程序                             | [文档](/use-cases/observability/clickstack/sdks/nestjs)        |
| Next.js      | Next.js 应用程序                            | [文档](/use-cases/observability/clickstack/sdks/nextjs)        |
| Node.js      | 用于服务端应用的 JavaScript 运行时 | [文档](/use-cases/observability/clickstack/sdks/nodejs)        |
| Deno         | Deno 应用程序                               | [文档](/use-cases/observability/clickstack/sdks/deno)          |
| Python       | Python 应用程序和 Web 服务            | [文档](/use-cases/observability/clickstack/sdks/python)        |
| React Native | React Native 移动应用                | [文档](/use-cases/observability/clickstack/sdks/react-native)  |
| Ruby         | Ruby on Rails 应用程序和 Web 服务     | [文档](/use-cases/observability/clickstack/sdks/ruby-on-rails) |


## 使用 API 密钥保护安全 {#securing-api-key}

要通过 OTel 收集器向 ClickStack 发送数据,SDK 需要指定数据摄取 API 密钥。可以通过 SDK 中的 `init` 函数或 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量进行设置:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

此 API 密钥由 HyperDX 应用程序生成,可在应用程序的 `Team Settings → API Keys` 中获取。

对于大多数支持 OpenTelemetry 的[语言 SDK](/use-cases/observability/clickstack/sdks) 和遥测库,您只需在应用程序中设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量,或在 SDK 初始化时指定:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```


## Kubernetes 集成 {#kubernetes-integration}

所有 SDK 在 Kubernetes 环境中运行时都支持自动关联 Kubernetes 元数据(如 Pod 名称、命名空间等)。这使您能够:

- 查看与您的服务关联的 Pod 和节点的 Kubernetes 指标
- 将应用程序日志和追踪与基础设施指标关联
- 跟踪整个 Kubernetes 集群的资源使用情况和性能

要启用此功能,请配置 OpenTelemetry 采集器将资源标签转发到 Pod。详细的设置说明请参阅 [Kubernetes 集成指南](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)。
