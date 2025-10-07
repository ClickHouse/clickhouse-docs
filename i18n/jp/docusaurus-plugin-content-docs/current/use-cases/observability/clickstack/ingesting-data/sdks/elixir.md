---
'slug': '/use-cases/observability/clickstack/sdks/elixir'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 1
'description': 'エリクサー SDK for ClickStack - The ClickHouse 可観測性スタック'
'title': 'エリクサー'
'doc_type': 'guide'
---

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ ログ</td>
      <td className="pe-2">✖️ メトリクス</td>
      <td className="pe-2">✖️ トレース</td>
    </tr>
  </tbody>
</table>
_🚧 OpenTelemetry メトリクスとトレースの計測は近日登場予定！_

## はじめに {#getting-started}

### ClickStack ロガーバックエンドパッケージのインストール {#install-hyperdx-logger-backend-package}

このパッケージは、`mix.exs` の依存関係リストに `hyperdx` を追加することでインストールできます。

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```

### ロガーの設定 {#configure-logger}

次の内容を `config.exs` ファイルに追加してください：

```elixir

# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```

### 環境変数の設定 {#configure-environment-variables}

その後、テレメトリーを ClickStack に送信するために、シェル内で以下の環境変数を設定する必要があります：

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_`OTEL_SERVICE_NAME` 環境変数は HyperDX アプリ内でサービスを識別するために使用されます。任意の名前を指定できます。_
