---
slug: /use-cases/observability/clickstack/sdks/ruby-on-rails
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack 的 Ruby on Rails SDK - ClickHouse 可观测性栈'
title: 'Ruby on Rails'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

本指南集成了：

<table>
  <tbody>
    <tr>
      <td className="pe-2">✖️ 日志</td>
      <td className="pe-2">✖️ ️️指标</td>
      <td className="pe-2">✅ 链路追踪</td>
    </tr>
  </tbody>
</table>

*要将日志发送到 ClickStack，请通过 [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) 发送日志。*

## 快速开始 \{#getting-started\}

### 安装 OpenTelemetry 软件包 \{#install-otel-packages\}

使用以下命令安装 OpenTelemetry 软件包。

```shell
bundle add opentelemetry-sdk opentelemetry-instrumentation-all opentelemetry-exporter-otlp
```

### 配置 OpenTelemetry 和日志格式化器 \{#configure-otel-logger-formatter\}

接下来，需要初始化 OpenTelemetry 的 tracing instrumentation，
并为 Rails logger 配置日志消息格式化器，以便日志可以自动与 trace 关联。
如果没有自定义格式化器，日志将无法在 ClickStack 中自动实现关联。

在 `config/initializers` 目录中创建一个名为 `hyperdx.rb` 的文件，并添加以下内容：

```ruby
# config/initializers/hyperdx.rb

require 'opentelemetry-exporter-otlp'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry/sdk'

OpenTelemetry::SDK.configure do |c|
  c.use_all() # enables all trace instrumentation!
end

Rails.application.configure do
  Rails.logger = Logger.new(STDOUT)
  # Rails.logger.log_level = Logger::INFO # default is DEBUG, but you might want INFO or above in production
  Rails.logger.formatter = proc do |severity, time, progname, msg|
    span_id = OpenTelemetry::Trace.current_span.context.hex_span_id
    trace_id = OpenTelemetry::Trace.current_span.context.hex_trace_id
    if defined? OpenTelemetry::Trace.current_span.name
      operation = OpenTelemetry::Trace.current_span.name
    else
      operation = 'undefined'
    end

    { "time" => time, "level" => severity, "message" => msg, "trace_id" => trace_id, "span_id" => span_id,
      "operation" => operation }.to_json + "\n"
  end

  Rails.logger.info "Logger initialized !! 🐱"
end
```

### 配置环境变量 \{#configure-environment-variables\}

接下来需要在 shell 中配置以下环境变量，用于通过 OpenTelemetry collector 将遥测数据发送到 ClickStack：

<Tabs groupId="service-type">
  <TabItem value="clickstack-managed" label="托管 ClickStack" default>
    ```shell
    export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
    OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
    OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
    ```
  </TabItem>

  <TabItem value="clickstack-oss" label="ClickStack 开源版">
    ```shell
    export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
    OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
    OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
    OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
    ```
  </TabItem>
</Tabs>

*`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识你的服务，可以是任意你想要的名称。*

`OTEL_EXPORTER_OTLP_HEADERS` 环境变量包含可通过 HyperDX 应用的 `Team Settings → API Keys` 获取的 API 密钥（API Key）。