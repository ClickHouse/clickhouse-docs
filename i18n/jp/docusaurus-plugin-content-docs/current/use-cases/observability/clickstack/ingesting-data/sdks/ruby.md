---
slug: /use-cases/observability/clickstack/sdks/ruby-on-rails
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'Ruby on Rails SDK for ClickStack - The ClickHouse Observability Stack'
title: 'Ruby on Rails'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

このガイドで統合される機能:

<table>
  <tbody>
    <tr>
      <td className="pe-2">✖️ ログ</td>
      <td className="pe-2">✖️ ️️メトリクス</td>
      <td className="pe-2">✅ トレース</td>
    </tr>
  </tbody>
</table>

_ログを ClickStack に送信するには、[OpenTelemetry Collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) を経由してください。_



## はじめに {#getting-started}

### OpenTelemetryパッケージのインストール {#install-otel-packages}

以下のコマンドを使用してOpenTelemetryパッケージをインストールします。

```shell
bundle add opentelemetry-sdk opentelemetry-instrumentation-all opentelemetry-exporter-otlp
```

### OpenTelemetry + ロガーフォーマッターの設定 {#configure-otel-logger-formatter}

次に、OpenTelemetryトレーシング計装を初期化し、Railsロガーのログメッセージフォーマッターを設定して、ログを自動的にトレースに関連付ける必要があります。カスタムフォーマッターがない場合、ログはClickStackで自動的に相関付けられません。

`config/initializers`フォルダ内に`hyperdx.rb`というファイルを作成し、以下の内容を追加します:


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

### 環境変数の設定 {#configure-environment-variables}

次に、テレメトリをClickStackに送信するため、シェルで以下の環境変数を設定する必要があります:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

_`OTEL_SERVICE_NAME`環境変数は、HyperDXアプリケーション内でサービスを識別するために使用されます。任意の名前を指定できます。_

`OTEL_EXPORTER_OTLP_HEADERS`環境変数には、HyperDXアプリケーションの`Team Settings → API Keys`から取得できるAPIキーを指定します。
