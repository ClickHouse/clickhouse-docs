---
slug: /use-cases/AI/MCP/ollama
sidebar_label: 'Ollama と連携する'
title: 'ClickHouse MCP サーバーを Ollama と連携してセットアップする'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse MCP サーバーと Ollama を連携してセットアップする方法を説明します。'
keywords: ['AI', 'Ollama', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';


# OllamaでClickHouse MCPサーバーを使用する

> このガイドでは、OllamaでClickHouse MCPサーバーを使用する方法を説明します。

<VerticalStepper headerLevel="h2">


## Ollamaのインストール {#install-ollama}

Ollamaは、自身のマシン上で大規模言語モデル（LLM）を実行するためのライブラリです。
[幅広いモデルが利用可能](https://ollama.com/library)で、使いやすいのが特徴です。

Ollamaは、Mac、Windows、またはLinux向けに[ダウンロードページ](https://ollama.com/download)から入手できます。

Ollamaを実行すると、バックグラウンドでローカルサーバーが起動し、モデルの実行に使用できます。
または、`ollama serve`を実行して手動でサーバーを起動することもできます。

インストール後、次のようにしてモデルをマシンにダウンロードできます:

```bash
ollama pull qwen3:8b
```

これにより、モデルが存在しない場合はローカルマシンにダウンロードされます。
ダウンロードが完了したら、次のようにしてモデルを実行できます:

```bash
ollama run qwen3:8b
```

:::note
MCPサーバーで動作するのは、[ツールサポートを持つモデル](https://ollama.com/search?c=tools)のみです。
:::

ダウンロード済みのモデルは、次のようにして一覧表示できます:

```bash
ollama ls
```

```text
NAME                       ID              SIZE      MODIFIED
qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
```

ダウンロードしたモデルの詳細情報を確認するには、次のコマンドを使用します:

```bash
ollama show qwen3
```

```text
  Model
    architecture        qwen3
    parameters          8.2B
    context length      40960
    embedding length    4096
    quantization        Q4_K_M

  Capabilities
    completion
    tools

  Parameters
    repeat_penalty    1
    stop              "<|im_start|>"
    stop              "<|im_end|>"
    temperature       0.6
    top_k             20
    top_p             0.95

  License
    Apache License
    Version 2.0, January 2004
```

この出力から、デフォルトのqwen3モデルが82億個のパラメータを持つことがわかります。


## MCPHostのインストール {#install-mcphost}

本稿執筆時点(2025年7月)では、OllamaをMCPサーバーと併用するネイティブ機能は提供されていません。
ただし、[MCPHost](https://github.com/mark3labs/mcphost)を使用することで、OllamaモデルをMCPサーバーで実行できます。

MCPHostはGoアプリケーションのため、マシンに[Goがインストール](https://go.dev/doc/install)されていることを確認してください。
その後、以下のコマンドを実行してMCPHostをインストールします:

```bash
go install github.com/mark3labs/mcphost@latest
```

バイナリは`~/go/bin`にインストールされるため、このディレクトリがパスに含まれていることを確認する必要があります。


## ClickHouse MCPサーバーの設定 {#configure-clickhouse-mcp-server}

MCPHostを使用して、YAMLまたはJSONファイルでMCPサーバーを設定できます。
MCPHostは、ホームディレクトリ内の設定ファイルを以下の順序で検索します:

1. `.mcphost.yml` または `.mcphost.json` (推奨)
2. `.mcp.yml` または `.mcp.json` (後方互換性)

標準のMCP設定ファイルと同様の構文を使用します。
以下は、`~/.mcphost.json` ファイルに保存するClickHouse MCPサーバー設定の例です:

```json
{
  "mcpServers": {
    "mcp-ch": {
      "type": "local",
      "command": [
        "uv",
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

標準のMCP設定ファイルとの主な違いは、`type` を指定する必要がある点です。
typeは、MCPサーバーが使用するトランスポートタイプを指定します。

- `local` → stdioトランスポート
- `remote` → streamableトランスポート
- `builtin` → inprocessトランスポート

また、以下の環境変数を設定する必要があります:

```bash
export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
export CLICKHOUSE_USER=demo
export CLICKHOUSE_PASSWORD=""
```

:::note
理論上は、MCP設定ファイルの `environment` キー配下でこれらの変数を指定できるはずですが、実際には機能しないことが確認されています。
:::


## MCPHostの実行 {#running-mcphost}

ClickHouse MCPサーバーを設定したら、以下のコマンドでMCPHostを実行できます:

```bash
mcphost --model ollama:qwen3
```

特定の設定ファイルを使用する場合は、以下のようにします:

```bash
mcphost --model ollama:qwen3 --config ~/.mcphost.json
```

:::warning
`--model`を指定しない場合、MCPHostは環境変数から`ANTHROPIC_API_KEY`を検索し、`anthropic:claude-sonnet-4-20250514`モデルを使用します。
:::

以下のような出力が表示されます:

```text
  ┃                                                                                     ┃
  ┃  Model loaded: ollama (qwen3)                                                       ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  ┃                                                                                     ┃
  ┃  Model loaded successfully on GPU                                                   ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  ┃                                                                                     ┃
  ┃  Loaded 3 tools from MCP servers                                                    ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  Enter your prompt (Type /help for commands, Ctrl+C to quit, ESC to cancel generation)
```

`/servers`コマンドを使用してMCPサーバーの一覧を表示できます:

```text
  ┃                                                                                      ┃
  ┃  ## Configured MCP Servers                                                           ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch                                                                           ┃
  ┃   MCPHost System (10:00)                                                             ┃
  ┃
```

また、`/tools`コマンドで利用可能なツールの一覧を表示できます:

```text
  ┃  ## Available Tools                                                                  ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch__list_databases                                                           ┃
  ┃  2. mcp-ch__list_tables                                                              ┃
  ┃  3. mcp-ch__run_select_query
```

これで、ClickHouse SQLプレイグラウンドで利用可能なデータベースやテーブルについて、モデルに質問できるようになります。

小規模なモデルを使用する場合（デフォルトのqwen3モデルは80億パラメータ）、実行してほしい内容をより具体的に指示する必要があります。
例えば、特定のテーブルに対してすぐにクエリを実行するよう依頼するのではなく、まずデータベースとテーブルの一覧を表示するよう明示的に依頼する必要があります。
大規模なモデル（例: qwen3:14b）を使用することでこの問題を部分的に軽減できますが、コンシューマー向けハードウェアでは実行速度が遅くなります。

</VerticalStepper>
