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

# Claude Desktop で ClickHouse MCP サーバーを使う \{#using-clickhouse-mcp-server-with-claude-desktop\}

> このガイドでは、uv を使って Claude Desktop で ClickHouse MCP サーバーをセットアップし、
> ClickHouse のサンプルデータセットに接続する方法を説明します。

<iframe width="768" height="432" src="https://www.youtube.com/embed/y9biAm_Fkqw?si=9PP3-1Y1fvX8xy7q" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

<VerticalStepper headerLevel="h2">
  ## uv のインストール \{#install-uv\}

  このガイドの手順に従うには、[uv](https://docs.astral.sh/uv/) をインストールする必要があります。
  uv を使いたくない場合は、別のパッケージマネージャーを使うように MCP サーバーの設定を更新する必要があります。

  ## Claude Desktop のダウンロード \{#download-claude-desktop\}

  あわせて Claude Desktop アプリもインストールする必要があります。これは [Claude Desktop のウェブサイト](https://claude.ai/desktop) からダウンロードできます。

  ## ClickHouse MCP サーバーの設定 \{#configure-clickhouse-mcp-server\}

  Claude Desktop のインストールが完了したら、次は [ClickHouse MCP サーバー](https://github.com/ClickHouse/mcp-clickhouse) を設定します。
  これは [Claude Desktop の設定ファイル](https://claude.ai/docs/configuration) から行えます。

  このファイルを見つけるには、まず設定ページ (Mac の場合は `Cmd+,`) を開き、左側メニューの `Developer` タブをクリックします。
  すると次の画面が表示されるので、`Edit config` ボタンをクリックします。

  <Image img={ClaudeDesktopConfig} alt="Claude Desktop の設定" size="md" />

  この操作により、設定ファイル (`claude_desktop_config.json`) が格納されているディレクトリが開きます。
  初めてそのファイルを開いたときは、次のような内容が記載されているはずです。

  ```json
  {
    "mcpServers": {}
  }
  ```

  `mcpServers` 辞書は、キーとして MCP サーバー名を取り、値として設定オプションの辞書を受け取ります。
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

  その場合は、`uv` へのフルパスを指定するように `command` を更新する必要があります。たとえば Cargo 経由でインストールした場合は、`/Users/<username>/.cargo/bin/uv` となります。
  :::

  ## ClickHouse MCP サーバーを使う \{#using-clickhouse-mcp-server\}

  Claude Desktop を再起動したら、`Search and tools` アイコンをクリックして ClickHouse MCP サーバーを表示できます。

  <Image img={FindMCPServers} alt="MCP サーバーを見つける" size="md" />

  <br />

  その後、すべてのツールまたは一部のツールを無効にするかどうかを選択できます。

  これで、ClickHouse MCP サーバーを使うような質問を Claude にできる準備が整いました。
  たとえば、`What's the most interesting dataset in the SQL playground?` と質問できます。

  Claude は、MCP サーバー内の各ツールが初めて呼び出される際に、その使用を確認するよう求めます。

  <Image img={MCPPermission} alt="list_databases ツールの使用を許可する" size="md" />

  以下は、ClickHouse MCP サーバーへのツール呼び出しをいくつか含む会話の一部です。

  <Image img={ClaudeConversation} alt="Claude の会話" size="md" />
</VerticalStepper>