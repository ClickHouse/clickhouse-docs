---
slug: /use-cases/observability/clickstack/sdks/ruby-on-rails
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: '适用于 ClickStack 的 Ruby on Rails SDK - ClickHouse 可观测性栈'
title: 'Ruby on Rails'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', '日志记录', '集成', '应用监控']
---

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

_如需将日志发送到 ClickStack，请通过 [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) 转发日志。_



## 开始使用

### 安装 OpenTelemetry 软件包

使用以下命令安装 OpenTelemetry 软件包。

```shell
bundle add opentelemetry-sdk opentelemetry-instrumentation-all opentelemetry-exporter-otlp
```

### 配置 OpenTelemetry 与日志格式化器

接下来，需要初始化 OpenTelemetry 链路追踪插桩，并为 Rails logger
配置日志格式化器，使日志可以自动关联回对应的链路追踪。
如果不使用自定义格式化器，日志将无法在 ClickStack 中自动实现关联。

在 `config/initializers` 文件夹中创建一个名为 `hyperdx.rb` 的文件，
并在其中添加以下内容：


```ruby
# config/initializers/hyperdx.rb

require 'opentelemetry-exporter-otlp'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry/sdk'

OpenTelemetry::SDK.configure do |c|
  c.use_all() # 启用所有追踪插桩!
end

Rails.application.configure do
  Rails.logger = Logger.new(STDOUT)
  # Rails.logger.log_level = Logger::INFO # 默认为 DEBUG,但生产环境中可能需要 INFO 或更高级别
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

  Rails.logger.info "日志记录器已初始化 !! 🐱"
end
```

### 配置环境变量

接下来，你需要在 Shell 环境中配置以下环境变量，以将遥测数据发送到 ClickStack：

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

*`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识您的服务，可以是任意您想要的名称。*

`OTEL_EXPORTER_OTLP_HEADERS` 环境变量包含 API Key，可在 HyperDX 应用的 `Team Settings → API Keys` 中获取。
