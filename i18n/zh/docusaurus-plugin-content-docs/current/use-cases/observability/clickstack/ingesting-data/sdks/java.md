---
slug: /use-cases/observability/clickstack/sdks/java
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: '适用于 ClickStack 的 Java SDK - ClickHouse 可观测性栈'
title: 'Java'
doc_type: 'guide'
keywords: ['Java SDK（ClickStack）', 'Java OpenTelemetry（ClickStack）', 'Java 可观测性 SDK', 'ClickStack 与 Java 集成', 'Java 应用监控']
---

ClickStack 遵循 OpenTelemetry 标准来收集遥测数据（日志和追踪）。通过自动埋点自动生成追踪数据，因此即使不进行手动埋点，也能从追踪中获益。

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



## 入门指南 {#getting-started}

:::note
目前,该集成仅支持 **Java 8+**
:::

### 下载 OpenTelemetry Java 代理 {#download-opentelemtry-java-agent}

下载 [`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)
并将 JAR 文件放置在您选择的目录中。该 JAR 文件包含代理程序
和插桩库。您也可以使用以下命令
下载代理程序:

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### 配置环境变量 {#configure-environment-variables}

之后,您需要在 shell 中配置以下环境变量以将遥测数据发送到 ClickStack:

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识您的服务,可以是您想要的任何名称。_

`OTEL_EXPORTER_OTLP_HEADERS` 环境变量包含可通过 HyperDX 应用在 `Team Settings → API Keys` 中获取的 API 密钥。

### 使用 OpenTelemetry Java 代理运行应用程序 {#run-the-application-with-otel-java-agent}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```

<br />
在此处了解有关 Java OpenTelemetry 插桩的更多信息:
[https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
