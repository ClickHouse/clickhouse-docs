---
slug: /use-cases/observability/clickstack/sdks/ruby-on-rails
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'Ruby on Rails SDK for ClickStack - The ClickHouse Observability Stack'
title: 'Ruby on Rails'
doc_type: 'how-to'
---

This guide integrates:

<table>
  <tbody>
    <tr>
      <td className="pe-2">✖️ Logs</td>
      <td className="pe-2">✖️ ️️Metrics</td>
      <td className="pe-2">✅ Traces</td>
    </tr>
  </tbody>
</table>

_To send logs to ClickStack, please send logs via the [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)._

## Getting started {#getting-started}

### Install OpenTelemetry packages {#install-otel-packages}

Use the following command to install the OpenTelemetry package.

```shell
bundle add opentelemetry-sdk opentelemetry-instrumentation-all opentelemetry-exporter-otlp
```

### Configure OpenTelemetry + logger formatter {#configure-otel-logger-formatter}

Next, you'll need to initialize the OpenTelemetry tracing instrumentation
and configure the log message formatter for Rails logger so that logs can be
tied back to traces automatically. Without the custom formatter, logs will not
be automatically correlated together in ClickStack.

In `config/initializers` folder, create a file called `hyperdx.rb` and add the
following to it:

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

### Configure environment variables {#configure-environment-variables}

Afterwards you'll need to configure the following environment variables in your shell to ship telemetry to ClickStack:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

_The `OTEL_SERVICE_NAME` environment variable is used to identify your service
in the HyperDX app, it can be any name you want._

The `OTEL_EXPORTER_OTLP_HEADERS` environment variable contains the API Key available via HyperDX app in `Team Settings → API Keys`.
