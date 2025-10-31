---
'slug': '/use-cases/observability/clickstack/sdks/java'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 3
'description': 'Java SDK用于ClickStack - ClickHouse可观察性堆栈'
'title': 'Java'
'doc_type': 'guide'
---

ClickStack 使用 OpenTelemetry 标准来收集遥测数据（日志和跟踪）。跟踪是通过自动仪表化自动生成的，因此不需要手动仪表化即可从跟踪中获得价值。

**本指南集成：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✅ 指标</td>
      <td className="pe-2">✅ 跟踪</td>
    </tr>
  </tbody>
</table>

## 开始使用 {#getting-started}

:::note
目前，该集成仅与 **Java 8+** 兼容
:::

### 下载 OpenTelemetry Java 代理 {#download-opentelemtry-java-agent}

下载 [`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)
并将 JAR 文件放在您首选的目录中。JAR 文件包含代理和仪表化库。您还可以使用以下命令下载代理：

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### 配置环境变量 {#configure-environment-variables}

之后，您需要在您的 shell 中配置以下环境变量，以将遥测数据发送到 ClickStack：

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中识别您的服务，可以是您想要的任何名称。_

`OTEL_EXPORTER_OTLP_HEADERS` 环境变量包含通过 HyperDX 应用在 `团队设置 → API 密钥` 中提供的 API 密钥。

### 使用 OpenTelemetry Java 代理运行应用 {#run-the-application-with-otel-java-agent}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```
<br/>
有关 Java OpenTelemetry 仪表化的更多信息，请参阅：[https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
