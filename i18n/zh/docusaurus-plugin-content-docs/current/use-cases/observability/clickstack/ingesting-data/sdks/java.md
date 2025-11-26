---
slug: /use-cases/observability/clickstack/sdks/java
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'ClickStack 的 Java SDK - ClickHouse 可观测性栈'
title: 'Java'
doc_type: 'guide'
keywords: ['Java SDK ClickStack', 'Java OpenTelemetry ClickStack', 'Java observability SDK', 'ClickStack Java integration', 'Java application monitoring']
---

ClickStack 使用 OpenTelemetry 标准来收集遥测数据（日志和
链路追踪）。通过自动埋点即可自动生成链路追踪，因此无需手动埋点也能从链路追踪中获益。

**本指南将集成：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✅ 指标</td>
      <td className="pe-2">✅ 链路追踪</td>
    </tr>
  </tbody>
</table>



## 入门

:::note
目前，该集成仅支持 **Java 8 及以上版本**
:::

### 下载 OpenTelemetry Java agent

下载 [`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)
并将该 JAR 文件放置在你首选的目录中。该 JAR 文件包含 agent
和插桩库。你也可以使用以下命令来下载该 agent：

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### 配置环境变量

接下来，你需要在 shell 环境中配置以下环境变量，以便将遥测数据发送到 ClickStack：

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<您的摄取_API_密钥>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<您的应用或服务的名称>'
```

*`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识你的服务，服务名称可以自定义为任意字符串。*

`OTEL_EXPORTER_OTLP_HEADERS` 环境变量包含 API Key，你可以在 HyperDX 应用的 `Team Settings → API Keys` 中获取。

### 使用 OpenTelemetry Java 代理运行应用程序

```shell
java -jar target/<APPLICATION_JAR_FILE>
```

<br />

有关 Java OpenTelemetry 插桩的更多内容，请参阅：[https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
