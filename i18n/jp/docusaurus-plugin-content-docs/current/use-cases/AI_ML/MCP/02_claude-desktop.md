---
'slug': '/use-cases/AI/MCP/claude-desktop'
'sidebar_label': 'Claude Desktopを統合する'
'title': 'Claude Desktopを使用してClickHouse MCPサーバーを設定する'
'pagination_prev': null
'pagination_next': null
'description': 'このガイドでは、ClickHouse MCPサーバーとClaude Desktopを設定する方法を説明します。'
'keywords':
- 'AI'
- 'Librechat'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import ClaudeDesktopConfig from '@site/static/images/use-cases/AI_ML/MCP/claude-desktop-config.png';
import FindMCPServers from '@site/static/images/use-cases/AI_ML/MCP/find-mcp-servers.gif';
import MCPPermission from '@site/static/images/use-cases/AI_ML/MCP/mcp-permission.png';
import ClaudeConversation from '@site/static/images/use-cases/AI_ML/MCP/claude-conversation.png';


# ClickHouse MCPサーバーをClaude Desktopで使用する

> このガイドでは、uvを使用してClickHouse MCPサーバーにClaude Desktopを設定し、ClickHouseのサンプルデータセットに接続する方法を説明します。

<iframe width="768" height="432" src="https://www.youtube.com/embed/y9biAm_Fkqw?si=9PP3-1Y1fvX8xy7q" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<VerticalStepper headerLevel="h2">

## uvのインストール {#install-uv}

このガイドの指示に従うには、[uv](https://docs.astral.sh/uv/)をインストールする必要があります。  
uvを使用したくない場合は、MCP Server構成を更新して代替のパッケージマネージャを使用する必要があります。

## Claude Desktopのダウンロード {#download-claude-desktop}

Claude Desktopアプリをインストールする必要もあり、[Claude Desktopのウェブサイト](https://claude.ai/desktop)からダウンロードできます。

## ClickHouse MCPサーバーの設定 {#configure-clickhouse-mcp-server}

Claude Desktopをインストールしたら、[ClickHouse MCPサーバー](https://github.com/ClickHouse/mcp-clickhouse)を設定する時間です。  
これは、[Claude Desktopの設定ファイル](https://claude.ai/docs/configuration)を介して行えます。

このファイルを見つけるには、まず設定ページに移動し（Macでは`Cmd+,`）、左側のメニューから`Developer`タブをクリックします。  
次に、`Edit config`ボタンをクリックする必要がある次の画面が表示されます：

<Image img={ClaudeDesktopConfig} alt="Claude Desktopの設定" size="md" />

これにより、設定ファイル（`claude_desktop_config.json`）が含まれているディレクトリに移動します。  
そのファイルを最初に開いたときは、以下の内容が含まれている可能性があります：

```json
{
  "mcpServers": {}
}
```

`mcpServers`辞書は、MCPサーバーの名前をキーとして受け取り、設定オプションの辞書を値として受け取ります。  
たとえば、ClickHouse Playgroundに接続するClickHouse MCPサーバーの設定は次のようになります：

```json
{
  "mcpServers": {
    "mcp-clickhouse": {
      "command": "uv",
      "args": [
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
      ],
      "env": {
        "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
        "CLICKHOUSE_PORT": "8443",
        "CLICKHOUSE_USER": "demo",
        "CLICKHOUSE_PASSWORD": "",
        "CLICKHOUSE_SECURE": "true",
        "CLICKHOUSE_VERIFY": "true",
        "CLICKHOUSE_CONNECT_TIMEOUT": "30",
        "CLICKHOUSE_SEND_RECEIVE_TIMEOUT": "30"
      }
    }
  }
}
```

設定を更新したら、変更を適用するためにClaude Desktopを再起動する必要があります。 

:::warning
`uv`をインストールした方法に応じて、Claude Desktopを再起動する際に次のエラーが発生することがあります：

```text
MCP mcp-clickhouse: spawn uv ENOENT
```

その場合、`command`を`uv`のフルパスに更新する必要があります。たとえば、Cargoを介してインストールした場合は、`/Users/<username>/.cargo/bin/uv`となります。
:::

## ClickHouse MCPサーバーを使用する {#using-clickhouse-mcp-server}

Claude Desktopを再起動したら、`Search and tools`アイコンをクリックしてClickHouse MCPサーバーを見つけることができます：

<Image img={FindMCPServers} alt="MCPサーバーを見つける" size="md" />
<br/>

次に、すべてまたは一部のツールを無効にするかどうかを選択できます。

これで、ClickHouse MCPサーバーを使用する結果をもたらすClaudeへの質問を行う準備が整いました。  
たとえば、`SQLプレイグラウンドで最も興味深いデータセットは何ですか？`と尋ねることができます。

Claudeは、MCPサーバーの各ツールを初めて呼び出す際に、その使用を確認するように求めます：

<Image img={MCPPermission} alt="list_databasesツールの使用許可を与える" size="md" />

以下は、ClickHouse MCPサーバーへのいくつかのツール呼び出しを含む会話の一部です：

<Image img={ClaudeConversation} alt="Claudeの会話" size="md" />

</VerticalStepper>
