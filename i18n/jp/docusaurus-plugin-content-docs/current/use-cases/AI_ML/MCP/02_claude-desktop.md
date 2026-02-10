---
slug: /use-cases/AI/MCP/claude-desktop
sidebar_label: 'Claude Desktop と統合する'
title: 'Claude Desktop を使って ClickHouse MCP サーバーをセットアップする'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、Claude Desktop を使用して ClickHouse MCP サーバーをセットアップし、連携させる方法を説明します。'
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

# Claude DesktopでClickHouse MCPサーバーを使用する \{#using-clickhouse-mcp-server-with-claude-desktop\}

> 本ガイドでは、uvを使用してClaude DesktopにClickHouse MCPサーバーを設定し、
> ClickHouseのサンプルデータセットに接続する方法について説明します。

<iframe
  width='768'
  height='432'
  src='https://www.youtube.com/embed/y9biAm_Fkqw?si=9PP3-1Y1fvX8xy7q'
  title='YouTube video player'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

<VerticalStepper headerLevel="h2">

## uv をインストールする \{#install-uv\}

このガイドの手順に従うには、[uv](https://docs.astral.sh/uv/) をインストールする必要があります。
uv を使用したくない場合は、別のパッケージマネージャーを使用するように MCP サーバーの設定を更新する必要があります。

## Claude Desktop のダウンロード \{#download-claude-desktop\}

[Claude Desktop のウェブサイト](https://claude.ai/desktop) からダウンロードできる Claude Desktop アプリもインストールする必要があります。

## ClickHouse MCP サーバーの設定 \{#configure-clickhouse-mcp-server\}

Claude Desktop のインストールが完了したら、次は [ClickHouse MCP サーバー](https://github.com/ClickHouse/mcp-clickhouse) を設定します。
これは [Claude Desktop の設定ファイル](https://claude.ai/docs/configuration) から行えます。

このファイルを見つけるには、まず設定ページ（Mac の場合は `Cmd+,`）を開き、左側メニューの `Developer` タブをクリックします。
すると次の画面が表示されるので、`Edit config` ボタンをクリックします。

<Image img={ClaudeDesktopConfig} alt="Claude Desktop の設定" size="md" />

この操作により、設定ファイル（`claude_desktop_config.json`）が格納されているディレクトリが開きます。
初めてそのファイルを開いたときは、次のような内容が記載されているはずです。

```json
{
  "mcpServers": {}
}
```

`mcpServers` 辞書は、キーとして MCP サーバー名を取り、値として設定オプションの辞書を受け取ります。\
たとえば、ClickHouse Playground に接続する ClickHouse MCP サーバーの構成は次のようになります。

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

設定を更新したら、変更を反映するために Claude Desktop を再起動する必要があります。

:::warning
`uv` のインストール方法によっては、Claude Desktop を再起動した際に次のエラーが表示されることがあります。

```text
MCP mcp-clickhouse: spawn uv ENOENT
```

その場合は、`uv` へのフルパスを指定するように `command` を更新する必要があります。たとえば Cargo 経由でインストールした場合は、`/Users/&lt;username&gt;/.cargo/bin/uv` となります。
:::

## Using ClickHouse MCP server \{#using-clickhouse-mcp-server\}

Claude Desktopを再起動後、`Search and tools`アイコンをクリックすることでClickHouse MCPサーバーを確認できます:

<Image img={FindMCPServers} alt='Find MCP servers' size='md' />
<br />

その後、すべてのツールまたは一部のツールを無効化するかどうかを選択できます。

これで、ClickHouse MCPサーバーを使用する質問をClaudeに投げかける準備が整いました。
例えば、`What's the most interesting dataset in the SQL playground?`と質問できます。

Claudeは、MCPサーバー内の各ツールが初回呼び出し時に、その使用の確認を求めます:

<Image
  img={MCPPermission}
  alt='list_databasesツールの使用許可'
  size='md'
/>

以下は、ClickHouse MCPサーバーへのツール呼び出しを含む会話の一部です:

<Image img={ClaudeConversation} alt='Claudeとの会話' size='md' />

</VerticalStepper>
