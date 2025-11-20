---
slug: /use-cases/AI/MCP/claude-desktop
sidebar_label: 'Claude Desktop を統合する'
title: 'Claude Desktop と ClickHouse MCP サーバーをセットアップする'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse MCP サーバーと連携して Claude Desktop をセットアップする方法を説明します。'
keywords: ['AI', 'Librechat', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import ClaudeDesktopConfig from '@site/static/images/use-cases/AI_ML/MCP/claude-desktop-config.png';
import FindMCPServers from '@site/static/images/use-cases/AI_ML/MCP/find-mcp-servers.gif';
import MCPPermission from '@site/static/images/use-cases/AI_ML/MCP/mcp-permission.png';
import ClaudeConversation from '@site/static/images/use-cases/AI_ML/MCP/claude-conversation.png';


# Claude DesktopでClickHouse MCPサーバーを使用する

> このガイドでは、uvを使用してClaude DesktopにClickHouse MCPサーバーをセットアップし、
> ClickHouseのサンプルデータセットに接続する方法を説明します。

<iframe
  width='768'
  height='432'
  src='https://www.youtube.com/embed/y9biAm_Fkqw?si=9PP3-1Y1fvX8xy7q'
  title='YouTube動画プレーヤー'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

<VerticalStepper headerLevel="h2">


## uvのインストール {#install-uv}

本ガイドの手順を実行するには、[uv](https://docs.astral.sh/uv/)をインストールする必要があります。
uvを使用しない場合は、別のパッケージマネージャーを使用するようMCP Serverの設定を更新する必要があります。


## Claude Desktopのダウンロード {#download-claude-desktop}

Claude Desktopアプリのインストールも必要です。[Claude Desktopウェブサイト](https://claude.ai/desktop)からダウンロードできます。


## ClickHouse MCPサーバーの設定 {#configure-clickhouse-mcp-server}

Claude Desktopのインストールが完了したら、[ClickHouse MCPサーバー](https://github.com/ClickHouse/mcp-clickhouse)を設定します。
設定は[Claude Desktopの設定ファイル](https://claude.ai/docs/configuration)を使用して行います。

このファイルを見つけるには、まず設定ページ(Macでは`Cmd+,`)を開き、左側のメニューから`Developer`タブをクリックします。
次の画面が表示されるので、`Edit config`ボタンをクリックします:

<Image img={ClaudeDesktopConfig} alt='Claude Desktop configuration' size='md' />

これにより、設定ファイル(`claude_desktop_config.json`)を含むディレクトリが開きます。
初めてこのファイルを開くと、おそらく次の内容が含まれています:

```json
{
  "mcpServers": {}
}
```

`mcpServers`ディクショナリは、MCPサーバーの名前をキーとし、設定オプションのディクショナリを値として受け取ります。
例えば、ClickHouse Playgroundに接続するClickHouse MCPサーバーの設定は次のようになります:

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

設定を更新したら、変更を反映するためにClaude Desktopを再起動する必要があります。

:::warning
`uv`のインストール方法によっては、Claude Desktopの再起動時に次のエラーが表示される場合があります:

```text
MCP mcp-clickhouse: spawn uv ENOENT
```

その場合は、`command`を`uv`のフルパスに更新する必要があります。例えば、Cargo経由でインストールした場合は`/Users/<username>/.cargo/bin/uv`になります。
:::


## ClickHouse MCPサーバーの使用 {#using-clickhouse-mcp-server}

Claude Desktopを再起動したら、`Search and tools`アイコンをクリックしてClickHouse MCPサーバーを見つけることができます:

<Image img={FindMCPServers} alt='MCPサーバーを見つける' size='md' />
<br />

その後、すべてのツールまたは一部のツールを無効にするかどうかを選択できます。

これで、ClickHouse MCPサーバーを使用する質問をClaudeに尋ねる準備が整いました。
例えば、`SQLプレイグラウンドで最も興味深いデータセットは何ですか?`と尋ねることができます。

Claudeは、MCPサーバー内の各ツールが初めて呼び出されるときに、その使用を確認するよう求めてきます:

<Image
  img={MCPPermission}
  alt='list_databasesツールの使用を許可する'
  size='md'
/>

以下は、ClickHouse MCPサーバーへのツール呼び出しを含む会話の一部です:

<Image img={ClaudeConversation} alt='Claudeとの会話' size='md' />

</VerticalStepper>
