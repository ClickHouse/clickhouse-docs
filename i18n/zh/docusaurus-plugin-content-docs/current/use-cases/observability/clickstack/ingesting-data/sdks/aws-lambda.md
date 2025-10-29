---
'slug': '/use-cases/observability/clickstack/sdks/aws_lambda'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 6
'description': 'AWS Lambda 用于 ClickStack - ClickHouse 可观察性堆栈'
'title': 'AWS Lambda'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**本指南集成了：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✅ 指标</td>
      <td className="pe-2">✅ 跟踪</td>
    </tr>
  </tbody>
</table>

## 安装 OpenTelemetry Lambda 层 {#installing-the-otel-lambda-layers}

OpenTelemetry 项目提供了单独的 Lambda 层，以：

1. 使用 OpenTelemetry 自动仪器化自动仪器化您的 Lambda 函数代码。
2. 将收集到的日志、指标和跟踪转发到 ClickStack。

### 添加特定语言的自动仪器化层 {#adding-language-specific-auto-instrumentation}

特定语言的自动仪器化 Lambda 层自动使用适用于您特定语言的 OpenTelemetry 自动仪器化包来仪器化您的 Lambda 函数代码。

每种语言和区域都有其自己的层 ARN。

如果您的 Lambda 已经使用 OpenTelemetry SDK 进行了仪器化，您可以跳过此步骤。

**开始使用**：

1. 在 Layers 部分点击“添加层”
2. 选择指定 ARN，并根据语言选择正确的 ARN，确保将 `<region>` 替换为您的区域（例如 `us-east-2`）：

<Tabs groupId="install-language-options">
<TabItem value="javascript" label="Javascript" default>

```shell
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-nodejs-0_7_0:1
```

</TabItem>
<TabItem value="python" label="Python" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-python-0_7_0:1
```

</TabItem>

<TabItem value="java" label="Java" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-javaagent-0_6_0:1
```

</TabItem>

<TabItem value="ruby" label="Ruby" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-ruby-0_1_0:1
```

</TabItem>

</Tabs>

_最新的层释放可以在 [OpenTelemetry Lambda Layers GitHub 仓库](https://github.com/open-telemetry/opentelemetry-lambda/releases) 中找到。_

3. 在您的 Lambda 函数的“配置” > “环境变量”下配置以下环境变量。

<Tabs groupId="install-language-env">
<TabItem value="javascript" label="Javascript" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>
<TabItem value="python" label="Python" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-instrument
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

<TabItem value="java" label="Java" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

<TabItem value="ruby" label="Ruby" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

</Tabs>

### 安装 OpenTelemetry 收集器 Lambda 层 {#installing-the-otel-collector-layer}

收集器 Lambda 层允许您将日志、指标和跟踪从您的 Lambda 函数转发到 ClickStack，而不会受到出口延迟的影响，影响响应时间。

**要安装收集器层**：

1. 在 Layers 部分点击“添加层”
2. 选择指定 ARN，并根据架构选择正确的 ARN，确保将 `<region>` 替换为您的区域（例如 `us-east-2`）：

<Tabs groupId="install-language-layer">

<TabItem value="x86_64" label="x86_64" default>

```shell
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-collector-amd64-0_8_0:1
```

</TabItem>

<TabItem value="arm64" label="arm64" default>

```shell
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-collector-arm64-0_8_0:1
```

</TabItem>

</Tabs>

3. 将以下 `collector.yaml` 文件添加到您的项目中，以配置收集器将数据发送到 ClickStack：

```yaml

# collector.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

processors:
  batch:
  decouple:

exporters:
  otlphttp:
    endpoint: "<YOU_OTEL_COLLECTOR_HTTP_ENDPOINT>
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp]
    metrics:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp]
    logs:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp]
```

4. 添加以下环境变量：

```shell
OPENTELEMETRY_COLLECTOR_CONFIG_FILE=/var/task/collector.yaml
```

## 检查安装 {#checking-the-installation}

在部署层之后，您现在应该能够在 HyperDX 中看到自动收集的来自您的 Lambda 函数的跟踪。`decouple` 和 `batching` 处理器可能会在遥测收集过程中引入延迟，因此跟踪的显示可能会延迟。要发出自定义日志或指标，您需要使用特定于语言的 OpenTelemetry SDK 对您的代码进行仪器化。

## 故障排除 {#troubleshoting}

### 自定义仪器化未发送 {#custom-instrumentation-not-sending}

如果您没有看到手动定义的跟踪或其他遥测，您可能正在使用不兼容版本的 OpenTelemetry API 包。确保您的 OpenTelemetry API 包版本至少与 AWS Lambda 中包含的版本相同或更低。

### 启用 SDK 调试日志 {#enabling-sdk-debug-logs}

将 `OTEL_LOG_LEVEL` 环境变量设置为 `DEBUG` 以启用来自 OpenTelemetry SDK 的调试日志。这将帮助确保自动仪器化层正在正确仪器化您的应用程序。

### 启用收集器调试日志 {#enabling-collector-debug-logs}

要调试收集器问题，您可以通过修改收集器配置文件来启用调试日志，添加 `logging` 导出器并将遥测日志级别设置为 `debug`，以启用来自收集器 Lambda 层的更详细日志记录。

```yaml

# collector.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

exporters:
  logging:
    verbosity: detailed
  otlphttp:
    endpoint: "https://in-otel.hyperdx.io"
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

service:
  telemetry:
    logs:
      level: "debug"
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
    metrics:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
    logs:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
```
