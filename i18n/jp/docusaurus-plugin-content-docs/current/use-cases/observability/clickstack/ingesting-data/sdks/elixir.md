---
slug: /use-cases/observability/clickstack/sdks/elixir
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'ClickStack 向け Elixir SDK - ClickHouse のオブザーバビリティスタック'
title: 'Elixir'
doc_type: 'guide'
keywords: ['Elixir ClickStack SDK', 'Elixir オブザーバビリティ', 'HyperDX Elixir', 'Elixir ロギング SDK', 'ClickStack Elixir 連携']
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
_🚧 OpenTelemetry のメトリクスおよびトレース用インストルメンテーションは近日公開予定です！_



## はじめに {#getting-started}

### ClickStack loggerバックエンドパッケージのインストール {#install-hyperdx-logger-backend-package}

`mix.exs`の依存関係リストに`hyperdx`を追加することで、このパッケージをインストールできます:

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```

### loggerの設定 {#configure-logger}

`config.exs`ファイルに以下を追加します:


```elixir
# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```

### 環境変数の設定 {#configure-environment-variables}

次に、テレメトリをClickStackに送信するため、シェルで以下の環境変数を設定する必要があります：

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_`OTEL_SERVICE_NAME`環境変数は、HyperDXアプリ内でサービスを識別するために使用されます。任意の名前を指定できます。_
