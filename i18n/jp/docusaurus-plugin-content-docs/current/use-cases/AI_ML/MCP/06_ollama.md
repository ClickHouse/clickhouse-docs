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


# ClickHouse MCP サーバーを Ollama と連携して利用する \{#using-clickhouse-mcp-server-with-ollama\}

> 本ガイドでは、ClickHouse MCP サーバーを Ollama と組み合わせて使用する方法を説明します。

<VerticalStepper headerLevel="h2">
  ## Ollama のインストール

  Ollama は、自身のマシン上で大規模言語モデル（LLM）を実行するためのライブラリです。
  [幅広いモデルが利用可能](https://ollama.com/library)で、使いやすいのが特徴です。

  Mac、Windows、または Linux 用の Ollama は、[ダウンロードページ](https://ollama.com/download)からダウンロードできます。

  Ollama を起動すると、バックグラウンドでローカルサーバーが起動し、モデルの実行に利用できるようになります。
  または、`ollama serve` を実行してサーバーを手動で起動することもできます。

  インストール後、次のようにモデルをマシンにダウンロードできます:

  ```bash
  ollama pull qwen3:8b
  ```

  モデルがローカルマシンに存在しない場合、このコマンドによってモデルがプルされます。
  ダウンロードが完了したら、次のようにモデルを実行できます:

  ```bash
  ollama run qwen3:8b
  ```

  :::note
  [ツールサポートを持つモデル](https://ollama.com/search?c=tools)のみが MCP サーバーで動作します。
  :::

  ダウンロード済みのモデルは、次のように一覧表示できます:

  ```bash
  ollama ls
  ```

  ```text
  NAME                       ID              SIZE      MODIFIED
  qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
  ```

  次のコマンドを使用して、ダウンロードしたモデルに関する詳細情報を確認できます:

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

  この出力から、デフォルトの qwen3 モデルが 80 億強のパラメータを持つことがわかります。

  ## MCPHost のインストール

  本稿執筆時点(2025年7月)では、Ollama を MCP サーバーと併用するためのネイティブ機能は存在しません。
  ただし、[MCPHost](https://github.com/mark3labs/mcphost) を使用することで、Ollama モデルを MCP サーバーと連携して実行できます。

  MCPHost は Go アプリケーションであるため、マシンに [Go がインストール](https://go.dev/doc/install)されていることを確認する必要があります。
  その後、次のコマンドを実行して MCPHost をインストールできます:

  ```bash
  go install github.com/mark3labs/mcphost@latest
  ```

  バイナリは `~/go/bin` にインストールされるため、このディレクトリがパスに含まれていることを確認する必要があります。

  ## ClickHouse MCP サーバーの設定

  We can configure MCP Servers with MCPHost in YAML or JSON files.
  MCPHost は、ホームディレクトリ内の設定ファイルを次の順序で検索します:

  1. `.mcphost.yml` または `.mcphost.json`  (推奨)
  2. `.mcp.yml` または `.mcp.json`（後方互換性）

  標準の MCP 設定ファイルで使用される構文と類似した構文を使用します。
  以下は ClickHouse MCP サーバー設定の例で、`~/.mcphost.json` ファイルに保存します:

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
  type は、MCP サーバーが使用するトランスポートタイプを示すために使用されます。

  * `local` → stdio トランスポート方式
  * `remote` → ストリーミング対応トランスポート
  * `builtin` → プロセス内トランスポート

  また、次の環境変数を設定する必要があります:

  ```bash
  export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
  export CLICKHOUSE_USER=demo
  export CLICKHOUSE_PASSWORD=""
  ```

  :::note
  理論上は、MCP 設定ファイルの `environment` キー配下にこれらの変数を指定できるはずですが、弊社の検証ではこの方法は機能しませんでした。
  :::

  ## MCPHost の実行

  ClickHouse MCP サーバーの設定が完了したら、次のコマンドで MCPHost を起動できます:

  ```bash
  mcphost --model ollama:qwen3
  ```

  また、特定の設定ファイルを使用させたい場合は:

  ```bash
  mcphost --model ollama:qwen3 --config ~/.mcphost.json 
  ```

  :::warning
  `--model` を指定しない場合、MCPHost は環境変数 `ANTHROPIC_API_KEY` を参照し、`anthropic:claude-sonnet-4-20250514` モデルを使用します。
  :::

  次のような出力が表示されます:

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

  `/servers` コマンドを使用して、MCP サーバーの一覧を表示できます:

  ```text
    ┃                                                                                      ┃
    ┃  ## Configured MCP Servers                                                           ┃
    ┃                                                                                      ┃
    ┃  1. mcp-ch                                                                           ┃
    ┃   MCPHost System (10:00)                                                             ┃
    ┃
  ```

  また、`/tools` を使用して、利用可能なツールを一覧表示できます:

  ```text
    ┃  ## Available Tools                                                                  ┃
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