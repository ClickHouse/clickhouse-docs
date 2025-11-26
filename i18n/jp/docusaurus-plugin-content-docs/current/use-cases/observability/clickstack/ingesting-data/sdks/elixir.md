---
slug: /use-cases/observability/clickstack/sdks/elixir
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'ClickStack 向け Elixir SDK - ClickHouse オブザーバビリティスタック'
title: 'Elixir'
doc_type: 'guide'
keywords: ['Elixir 用 ClickStack SDK', 'Elixir のオブザーバビリティ', 'HyperDX Elixir', 'Elixir ログ SDK', 'ClickStack の Elixir 連携']
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
_🚧 OpenTelemetry のメトリクスおよびトレースの計装は近日中に提供予定です！_



## はじめに

### ClickStack Logger バックエンドパッケージのインストール

このパッケージは、`mix.exs` の依存関係リストに `hyperdx` を追加することでインストールできます。

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```

### ロガーを設定する

`config.exs` ファイルに次の内容を追加します：


```elixir
# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```

### 環境変数を設定する

次に、ClickStack にテレメトリを送信するために、シェル環境で次の環境変数を設定する必要があります。

```shell
export HYPERDX_API_KEY='<あなたの取り込みAPIキー>' \
OTEL_SERVICE_NAME='<アプリまたはサービスの名前>'
```

*`OTEL_SERVICE_NAME` 環境変数は、HyperDX アプリ内でサービスを識別するために使用されます。任意の名前を指定できます。*
