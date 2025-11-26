---
slug: /use-cases/observability/clickstack/sdks/aws_lambda
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: '适用于 ClickStack 的 AWS Lambda - ClickHouse 可观测性技术栈'
title: 'AWS Lambda'
doc_type: 'guide'
keywords: ['ClickStack', 'observability', 'aws-lambda', 'lambda-layers']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**本指南集成以下内容：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✅ 指标</td>
      <td className="pe-2">✅ 链路追踪</td>
    </tr>
  </tbody>
</table>


## 安装 OpenTelemetry Lambda 层 {#installing-the-otel-lambda-layers}

OpenTelemetry 项目提供了独立的 Lambda 层，用于：

1. 使用 OpenTelemetry 自动埋点（auto-instrumentation）自动对你的 Lambda 函数代码进行埋点。
2. 将采集到的日志、指标和追踪数据转发到 ClickStack。

### 添加特定语言的自动埋点层 {#adding-language-specific-auto-instrumentation}

特定语言的自动埋点 Lambda 层会使用适用于该语言的 OpenTelemetry 自动埋点包，自动对你的 Lambda 函数代码进行埋点。

每种语言和每个区域都有各自对应的层 ARN。

如果你的 Lambda 已经使用 OpenTelemetry SDK 完成了埋点，可以跳过此步骤。

**开始使用**：

1. 在 “Layers” 部分点击 “Add a layer”
2. 选择 “Specify an ARN”，并根据语言选择正确的 ARN，确保将 `<region>` 替换为你的区域（例如 `us-east-2`）：

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

_各个层的最新发行版本可以在 [OpenTelemetry Lambda Layers 的 GitHub 仓库](https://github.com/open-telemetry/opentelemetry-lambda/releases) 中找到。_

3. 在 Lambda 函数的 “Configuration” > “Environment variables” 中配置以下环境变量。

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

### 安装 OpenTelemetry Collector Lambda 层 {#installing-the-otel-collector-layer}

Collector Lambda 层允许你将 Lambda 函数中的日志、指标和追踪数据转发到 ClickStack，而不会因为导出器延迟而影响响应时间。

**安装 collector 层**：

1. 在 “Layers” 部分点击 “Add a layer”
2. 选择 “Specify an ARN”，并根据架构选择正确的 ARN，确保将 `<region>` 替换为你的区域（例如 `us-east-2`）：

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

3. 将以下 `collector.yaml` 文件添加到您的项目中,以配置收集器向 ClickStack 发送数据:


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

4. 添加如下环境变量：

```shell
OPENTELEMETRY_COLLECTOR_CONFIG_FILE=/var/task/collector.yaml
```


## 检查安装情况 {#checking-the-installation}

在部署这些层之后，你现在应该可以在 HyperDX 中看到从 Lambda 函数自动收集到的跟踪数据（traces）。`decouple` 和 `batching` 
processor 可能会在遥测数据采集中引入延迟，因此跟踪数据的显示可能会有所滞后。若要生成自定义日志或指标，你需要使用与你所用编程语言对应的 
OpenTelemetry SDKs 对代码进行插桩（instrumentation）。



## 故障排查 {#troubleshoting}

### 自定义埋点未发送数据 {#custom-instrumentation-not-sending}

如果你没有看到手动定义的跟踪数据（trace）或其他遥测数据，可能是因为你使用了不兼容版本的 OpenTelemetry API 包。请确保你的 OpenTelemetry API 包版本不高于 AWS Lambda 中所包含的版本。

### 启用 SDK 调试日志 {#enabling-sdk-debug-logs}

将环境变量 `OTEL_LOG_LEVEL` 设置为 `DEBUG`，以启用来自 OpenTelemetry SDK 的调试日志。这样有助于确认自动埋点层是否已正确为你的应用进行埋点。

### 启用 collector 调试日志 {#enabling-collector-debug-logs}

要调试 collector 相关问题，可以通过修改 collector 配置文件来启用调试日志：添加 `logging` exporter，并将 telemetry 日志级别设置为 `debug`，以从 collector Lambda 层获取更详细的日志输出。



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
      authorization: <您的摄取_API_密钥>
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
