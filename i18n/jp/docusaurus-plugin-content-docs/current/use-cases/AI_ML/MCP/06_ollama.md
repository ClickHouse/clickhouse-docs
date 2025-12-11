---
slug: /use-cases/AI/MCP/ollama
sidebar_label: 'Ollama を統合する'
title: 'Ollama と連携した ClickHouse MCP サーバーのセットアップ'
pagination_prev: null
pagination_next: null
description: '本ガイドでは、ClickHouse MCP サーバーと Ollama を連携させる方法を説明します。'
keywords: ['AI', 'Ollama', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';

# ClickHouse MCP サーバーを Ollama と連携して利用する {#using-clickhouse-mcp-server-with-ollama}

> 本ガイドでは、ClickHouse MCP サーバーを Ollama と組み合わせて使用する方法を説明します。

<VerticalStepper headerLevel="h2">

## Ollama のインストール {#install-ollama}

Ollama は、大規模言語モデル (LLM) をローカル環境で実行するためのライブラリです。
[多様なモデルが提供されており](https://ollama.com/library)、簡単に利用できます。

Mac、Windows、Linux 向けの Ollama は [ダウンロードページ](https://ollama.com/download) から入手できます。

Ollama を起動すると、バックグラウンドでローカルサーバーが起動し、そのサーバーを使ってモデルを実行できます。
または、`ollama serve` を実行してサーバーを手動で起動することもできます。

インストールが完了したら、次のようにしてモデルをローカルマシンに取得できます。

```bash
ollama pull qwen3:8b
```

モデルがまだ存在しない場合は、ローカルマシンに自動的にダウンロードされます。
ダウンロードが完了したら、次のようにモデルを実行できます。

```bash
ollama run qwen3:8b
```

:::note
[ツールサポートがあるモデル](https://ollama.com/search?c=tools) のみが MCP サーバーで動作します。
:::

ダウンロード済みのモデルは、次のように一覧表示できます。

```bash
ollama ls
```

```text
名前                       ID              サイズ      更新日時
qwen3:latest               500a1f067a9f    5.2 GB    3日前
```

ダウンロードしたモデルに関する詳細情報を確認するには、次のコマンドを使用します。

```bash
ollama show qwen3
```

```text
  モデル
    アーキテクチャ        qwen3
    パラメータ数          8.2B
    コンテキスト長      40960
    埋め込み次元    4096
    量子化方式        Q4_K_M

  対応機能
    補完
    ツール呼び出し

  パラメータ
    repeat_penalty    1
    stop              "<|im_start|>"
    stop              "<|im_end|>"
    temperature       0.6
    top_k             20
    top_p             0.95

  ライセンス
    Apache ライセンス
    Version 2.0, January 2004
```

この出力から、デフォルトの qwen3 モデルにはおよそ80億個のパラメータがあることが分かります。

## MCPHost をインストールする {#install-mcphost}

この記事の執筆時点（2025 年 7 月）では、Ollama を MCP サーバーで使用するためのネイティブな機能はありません。
しかし、[MCPHost](https://github.com/mark3labs/mcphost) を利用することで、Ollama モデルを MCP サーバー上で実行できます。

MCPHost は Go で実装されたアプリケーションのため、事前にマシンに [Go をインストール](https://go.dev/doc/install) しておく必要があります。
その後、次のコマンドを実行して MCPHost をインストールできます。

```bash
go install github.com/mark3labs/mcphost@latest
```

バイナリは `~/go/bin` にインストールされるため、そのディレクトリが PATH に含まれていることを確認する必要があります。

## ClickHouse MCP サーバーの設定 {#configure-clickhouse-mcp-server}

MCPHost を使用して、YAML または JSON ファイルで MCP サーバーを構成できます。
MCPHost はホームディレクトリ内で、次の順序で設定ファイルを探します：

1. `.mcphost.yml` または `.mcphost.json`（推奨）
2. `.mcp.yml` または `.mcp.json`（後方互換性のため）

標準的な MCP 設定ファイルで使用されるものと似た構文を使用します。
以下は ClickHouse MCP サーバー設定の例で、`~/.mcphost.json` ファイルとして保存します：

```json
{
  "mcpServers": {
    "mcp-ch": {
      "type": "local",
      "command": ["uv",
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
      ]
    }
  }
}
```

標準的な MCP 設定ファイルとの主な違いは、`type` を指定する必要がある点です。
この `type` は、MCP Server が使用するトランスポートの種類を示します。

* `local` → stdio トランスポート
* `remote` → ストリーミング対応トランスポート
* `builtin` → インプロセス トランスポート

また、以下の環境変数を設定する必要があります。

```bash
export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
export CLICKHOUSE_USER=demo
export CLICKHOUSE_PASSWORD=""
```

:::note
理論上は、MCP 構成ファイル内の `environment` キーの下にこれらの変数を指定できるはずですが、実際にはその方法では動作しないことが分かっています。
:::

## MCPHost の実行 {#running-mcphost}

ClickHouse MCP サーバーの設定が完了したら、次のコマンドで MCPHost を起動できます:

```bash
mcphost --model ollama:qwen3
```

また、特定の設定ファイルを使用させたい場合は、次のように実行します:

```bash
mcphost --model ollama:qwen3 --config ~/.mcphost.json
```

:::warning
`--model` を指定しない場合、MCPHost は環境変数 `ANTHROPIC_API_KEY` を参照し、`anthropic:claude-sonnet-4-20250514` モデルを使用します。
:::

次のような出力が表示されます:

```text
  ┃                                                                                     ┃
  ┃  モデルを読み込みました: ollama (qwen3)                                             ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  ┃                                                                                     ┃
  ┃  モデルは GPU 上で正常に読み込まれました                                             ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  ┃                                                                                     ┃
  ┃  MCP サーバーから 3 個のツールを読み込みました                                      ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  プロンプトを入力してください（コマンド一覧は /help、終了は Ctrl+C、生成のキャンセルは ESC）
```

`/servers` コマンドを使用して、MCP サーバーの一覧を表示できます:

```text
  ┃                                                                                      ┃
  ┃  ## 設定済み MCP サーバー                                                           ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch                                                                           ┃
  ┃   MCPHost System (10:00)                                                             ┃
  ┃
```

また、`/tools` を使用して、利用可能なツールを一覧表示できます:

```text
  ┃  ## 利用可能なツール                                                                 ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch__list_databases                                                           ┃
  ┃  2. mcp-ch__list_tables                                                              ┃
  ┃  3. mcp-ch__run_select_query
```

その後、ClickHouse SQL playground で利用可能なデータベースやテーブルについて、モデルに質問できます。

弊社の経験では、小さいモデルを使用する場合（デフォルトの qwen3 モデルは 80 億パラメータ）、モデルに実行させたい内容をより具体的に指示する必要があります。
例えば、最初から特定のテーブルに対するクエリを依頼するのではなく、まずデータベースとテーブルの一覧を出すように明示的に依頼する必要があります。
より大きなモデル（例: qwen3:14b）を使用することで、この問題をある程度軽減できますが、コンシューマ向けハードウェア上では動作が遅くなります。

</VerticalStepper>
