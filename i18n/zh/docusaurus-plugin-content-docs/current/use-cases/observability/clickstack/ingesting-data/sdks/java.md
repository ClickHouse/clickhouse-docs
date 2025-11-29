---
slug: /use-cases/observability/clickstack/sdks/java
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: '适用于 ClickStack 的 Java SDK - ClickHouse 可观测性栈'
title: 'Java'
doc_type: 'guide'
keywords: ['适用于 ClickStack 的 Java SDK', '适用于 ClickStack 的 Java OpenTelemetry', 'Java 可观测性 SDK', 'ClickStack Java 集成', 'Java 应用监控']
---

ClickStack 使用 OpenTelemetry 标准来收集遥测数据（日志和追踪）。追踪数据通过自动埋点自动生成，因此即使不进行手动埋点，也可以从追踪中获得价值。

**本指南集成：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✅ 指标</td>
      <td className="pe-2">✅ 追踪</td>
    </tr>
  </tbody>
</table>

## 入门 {#getting-started}

:::note
目前，该集成仅支持 **Java 8 及更高版本**
:::

### 下载 OpenTelemetry Java 代理 {#download-opentelemtry-java-agent}

下载 [`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)，并将该 JAR 文件放置在您首选的目录中。该 JAR 文件包含代理和插桩库。您也可以使用以下命令来下载该代理：

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```


### 配置环境变量 {#configure-environment-variables}

然后，你需要在 shell 环境中配置以下环境变量，以便将遥测数据上报到 ClickStack：

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

*`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识您的服务，其值可以是任意名称。*

`OTEL_EXPORTER_OTLP_HEADERS` 环境变量中包含 API Key，您可以在 HyperDX 应用的 `Team Settings → API Keys` 中获取。


### 使用 OpenTelemetry Java Agent 运行应用程序 {#run-the-application-with-otel-java-agent}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```

<br />

在此处了解更多关于 Java OpenTelemetry 插桩的信息：[https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
