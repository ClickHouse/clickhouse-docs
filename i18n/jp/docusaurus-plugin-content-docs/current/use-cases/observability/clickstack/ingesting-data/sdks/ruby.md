---
slug: /use-cases/observability/clickstack/sdks/ruby-on-rails
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack 用 Ruby on Rails SDK - ClickHouse Observability Stack'
title: 'Ruby on Rails'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

このガイドで扱う統合対象は次のとおりです:

<table>
  <tbody>
    <tr>
      <td className="pe-2">✖️ ログ</td>
      <td className="pe-2">✖️ ️️メトリクス</td>
      <td className="pe-2">✅ トレース</td>
    </tr>
  </tbody>
</table>

_ClickStack にログを送信するには、[OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) を経由して送信してください。_

## はじめに \{#getting-started\}

### OpenTelemetry パッケージをインストールする \{#install-otel-packages\}

次のコマンドで OpenTelemetry パッケージをインストールします。

```shell
bundle add opentelemetry-sdk opentelemetry-instrumentation-all opentelemetry-exporter-otlp
```

### OpenTelemetry とロガーフォーマッタを設定する \{#configure-otel-logger-formatter\}

次に、OpenTelemetry のトレーシング用インストルメンテーションを初期化し、
Rails の logger 用のログメッセージフォーマッタを設定して、ログが自動的に
トレースにひも付けられるようにする必要があります。カスタムフォーマッタがない場合、
ログは ClickStack 上で自動的に相関付けられません。

`config/initializers` ディレクトリ内に `hyperdx.rb` というファイルを作成し、
次の内容を追加します。

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

### 環境変数を設定する \{#configure-environment-variables\}

以降、ClickStack にテレメトリデータを送信するために、シェルで次の環境変数を設定します。

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

*`OTEL_SERVICE_NAME` 環境変数は、HyperDX アプリ内で自分のサービスを識別するために使用されます。任意の名前を設定できます。*

`OTEL_EXPORTER_OTLP_HEADERS` 環境変数には、HyperDX アプリの `Team Settings → API Keys` から取得できる API キーを設定します。
