---
'slug': '/use-cases/observability/clickstack/sdks/ruby-on-rails'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 7
'description': 'Ruby on Rails SDK for ClickStack - ClickHouseの可観測性スタック'
'title': 'Ruby on Rails'
'doc_type': 'guide'
---

このガイドは以下を統合しています：

<table>
  <tbody>
    <tr>
      <td className="pe-2">✖️ ログ</td>
      <td className="pe-2">✖️ メトリクス</td>
      <td className="pe-2">✅ トレース</td>
    </tr>
  </tbody>
</table>

_ログを ClickStack に送信するには、[OpenTelemetry コレクター](/use-cases/observability/clickstack/ingesting-data/otel-collector)経由でログを送信してください。_

## はじめに {#getting-started}

### OpenTelemetry パッケージのインストール {#install-otel-packages}

次のコマンドを使用して OpenTelemetry パッケージをインストールします。

```shell
bundle add opentelemetry-sdk opentelemetry-instrumentation-all opentelemetry-exporter-otlp
```

### OpenTelemetry + ロガーフォーマッターの設定 {#configure-otel-logger-formatter}

次に、OpenTelemetry トレース計測を初期化し、Rails logger のログメッセージフォーマッターを設定して、ログがトレースに自動的に関連付けられるようにする必要があります。カスタムフォーマッターがない場合、ログは ClickStack 内で自動的に相関されません。

`config/initializers` フォルダー内に `hyperdx.rb` というファイルを作成し、以下を追加してください：

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

その後、Telemetry を ClickStack に送信するために、シェル内で以下の環境変数を設定する必要があります：

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

_`OTEL_SERVICE_NAME` 環境変数は、HyperDX アプリ内でサービスを識別するために使用されます。任意の名前を付けることができます。_

`OTEL_EXPORTER_OTLP_HEADERS` 環境変数には、`Team Settings → API Keys` で HyperDX アプリを介して取得できる API キーが含まれています。
