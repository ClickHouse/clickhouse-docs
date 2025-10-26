---
'slug': '/use-cases/AI/MCP/ollama'
'sidebar_label': 'Ollamaの統合'
'title': 'Ollamaを使用したClickHouse MCPサーバーの設定'
'pagination_prev': null
'pagination_next': null
'description': 'このガイドでは、ClickHouse MCPサーバーとOllamaの設定方法について説明します。'
'keywords':
- 'AI'
- 'Ollama'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';


# ClickHouse MCPサーバーとOllamaの使用法

> このガイドでは、ClickHouse MCPサーバーをOllamaと共に使用する方法を説明します。

<VerticalStepper headerLevel="h2">

## Ollamaのインストール {#install-ollama}

Ollamaは、自分のマシン上で大規模言語モデル（LLMs）を実行するためのライブラリです。
多様なモデルが利用可能で、使いやすいです。[モデルのライブラリ](https://ollama.com/library)を参照してください。

Mac、Windows、またはLinux用のOllamaを[ダウンロードページ](https://ollama.com/download)からダウンロードできます。

Ollamaを実行すると、バックグラウンドでローカルサーバーが起動し、モデルを実行するのに使用できます。
または、`ollama serve`を実行することでサーバーを手動で起動することもできます。

インストールが完了したら、次のようにモデルをローカルにプルすることができます：

```bash
ollama pull qwen3:8b
```

これは、モデルが存在しない場合にローカルマシンにモデルをプルします。
ダウンロードが完了すると、次のようにモデルを実行できます：

```bash
ollama run qwen3:8b
```

:::note
MCPサーバーで動作するのは、[ツールサポートがあるモデル](https://ollama.com/search?c=tools)のみです。
:::

ダウンロードしたモデルを次のようにリストできます：

```bash
ollama ls
```

```text
NAME                       ID              SIZE      MODIFIED
qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
```

ダウンロードしたモデルに関する詳しい情報を表示するためのコマンドは次のとおりです：

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

この出力から、デフォルトのqwen3モデルが80億以上のパラメータを持っていることがわかります。

## MCPHostのインストール {#install-mcphost}

執筆時点（2025年7月）では、OllamaをMCPサーバーで使用するためのネイティブ機能はありません。
しかし、[MCPHost](https://github.com/mark3labs/mcphost)を使用することで、MCPサーバーとOllamaモデルを実行できます。

MCPHostはGoアプリケーションであるため、マシンに[Goをインストール](https://go.dev/doc/install)する必要があります。
次のコマンドを実行してMCPHostをインストールできます：

```bash
go install github.com/mark3labs/mcphost@latest
```

バイナリは`~/go/bin`にインストールされるため、そのディレクトリがパスに含まれていることを確認する必要があります。

## ClickHouse MCPサーバーの構成 {#configure-clickhouse-mcp-server}

MCPHostではYAMLまたはJSONファイルを使用してMCPサーバーを構成できます。
MCPHostは、以下の順序でホームディレクトリ内の設定ファイルを検索します：

1. `.mcphost.yml`または`.mcphost.json`（推奨）
2. `.mcp.yml`または`.mcp.json`（後方互換性）

これは、標準MCP設定ファイルで使用される構文に似た構文を使用しています。
以下は、`~/.mcphost.json`ファイルに保存するClickHouse MCPサーバーの構成の例です：

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

標準MCP設定ファイルとの主な違いは、`type`を指定する必要があることです。
タイプは、MCPサーバーが使用するトランスポートタイプを示すために使用されます。

* `local` → stdioトランスポート
* `remote` → ストリーミングトランスポート
* `builtin` → プロセス内トランスポート

以下の環境変数も設定する必要があります：

```bash
export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
export CLICKHOUSE_USER=demo
export CLICKHOUSE_PASSWORD=""
```

:::note
理論的には、MCP設定ファイルの`environment`キーの下でこれらの変数を指定できるはずですが、機能しないことがわかりました。
:::

## MCPHostの実行 {#running-mcphost}

ClickHouse MCPサーバーを構成したら、次のコマンドを実行してMCPHostを実行できます：

```bash
mcphost --model ollama:qwen3
```

もしくは、特定の設定ファイルを使用する場合は：

```bash
mcphost --model ollama:qwen3 --config ~/.mcphost.json 
```

:::warning
`--model`を指定しないと、MCPHostは環境変数の`ANTHROPIC_API_KEY`を探し、`anthropic:claude-sonnet-4-20250514`モデルを使用します。
:::

次の出力が表示されるはずです：

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

`/servers`コマンドを使用してMCPサーバーをリストできます：

```text
┃                                                                                      ┃
┃  ## Configured MCP Servers                                                           ┃
┃                                                                                      ┃
┃  1. mcp-ch                                                                           ┃
┃   MCPHost System (10:00)                                                             ┃
┃
```

そして`/tools`を使って利用可能なツールをリストします：

```text
┃  ## Available Tools                                                                  ┃
┃                                                                                      ┃
┃  1. mcp-ch__list_databases                                                           ┃
┃  2. mcp-ch__list_tables                                                              ┃
┃  3. mcp-ch__run_select_query
```

その後、ClickHouse SQLプレイグラウンドに利用可能なデータベース/テーブルに関してモデルに質問できます。

私たちの経験では、小さなモデル（デフォルトのqwen3モデルは80億のパラメータを持つ）を使用する際には、さらに具体的に求める必要があります。
たとえば、特定のテーブルをクエリする代わりに、データベースとテーブルをリストするように明示的に求める必要があります。
この問題は大きなモデル（例えば、qwen3:14b）を使用することで部分的に解消できますが、消費者向けハードウェアでは遅く動作します。

</VerticalStepper>
