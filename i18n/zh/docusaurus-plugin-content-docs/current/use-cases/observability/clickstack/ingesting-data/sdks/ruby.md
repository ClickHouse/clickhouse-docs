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

本指南集成了：

<table>
  <tbody>
    <tr>
      <td className="pe-2">✖️ 日志</td>
      <td className="pe-2">✖️ ️️指标</td>
      <td className="pe-2">✅ 跟踪</td>
    </tr>
  </tbody>
</table>

_要将日志发送到 ClickStack，请通过 [OpenTelemetry Collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) 进行转发。_



## 入门 {#getting-started}

### 安装 OpenTelemetry 包 {#install-otel-packages}

使用以下命令安装 OpenTelemetry 包。

```shell
bundle add opentelemetry-sdk opentelemetry-instrumentation-all opentelemetry-exporter-otlp
```

### 配置 OpenTelemetry + 日志格式化器 {#configure-otel-logger-formatter}

接下来,您需要初始化 OpenTelemetry 追踪检测工具,
并为 Rails 日志记录器配置日志消息格式化器,以便日志能够
自动关联到追踪。如果没有自定义格式化器,日志将无法
在 ClickStack 中自动关联。

在 `config/initializers` 文件夹中,创建一个名为 `hyperdx.rb` 的文件并添加以下内容:


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

### 配置环境变量 {#configure-environment-variables}

之后,您需要在 shell 中配置以下环境变量,以将遥测数据发送到 ClickStack:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

_`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识您的服务,可以是任意名称。_

`OTEL_EXPORTER_OTLP_HEADERS` 环境变量包含 API 密钥,可通过 HyperDX 应用在 `团队设置 → API 密钥` 中获取。
