---
slug: /use-cases/observability/clickstack/sdks/elixir
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'Elixir 向け ClickStack SDK - ClickHouse オブザーバビリティスタック'
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

_🚧 OpenTelemetry のメトリクスおよびトレース向け計装は近日対応予定です！_

## はじめに \{#getting-started\}

### ClickStack logger backend パッケージをインストールする \{#install-hyperdx-logger-backend-package\}

`mix.exs` の依存関係リストに `hyperdx` を追加することで、パッケージをインストールできます。

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```

### ロガーの設定 \{#configure-logger\}

次の内容を `config.exs` ファイルに追加してください。

```elixir
# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```

### 環境変数を設定する \{#configure-environment-variables\}

ClickStack にテレメトリを送信するために、シェル環境で次の環境変数を設定します。

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

*`OTEL_SERVICE_NAME` 環境変数は、HyperDX アプリケーション内でサービスを識別するために使用されます。任意の名前を指定できます。*
