---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: 'リモートMCPサーバーを有効にする'
title: 'ClickHouse Cloud リモートMCPサーバーを有効にして接続する'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse Cloud Remote MCP を有効にして使用する方法を説明します'
keywords: ['AI', 'ClickHouse Cloud', 'MCP']
show_related_blogs: true
sidebar_position: 1
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import img1 from '@site/static/images/use-cases/AI_ML/MCP/1connectmcpmodal.png';
import img2 from '@site/static/images/use-cases/AI_ML/MCP/2enable_mcp.png';
import img3 from '@site/static/images/use-cases/AI_ML/MCP/3oauth.png';
import img4 from '@site/static/images/use-cases/AI_ML/MCP/4oauth_success.png';
import img5 from '@site/static/images/use-cases/AI_ML/MCP/5connected_mcp_claude.png';
import img6 from '@site/static/images/use-cases/AI_ML/MCP/6slash_mcp_claude.png';
import img7 from '@site/static/images/use-cases/AI_ML/MCP/7usage_mcp.png';

このガイドでは、ClickHouse Cloud リモートMCPサーバー を有効にし、一般的な開発ツールで使用できるようにセットアップする方法を説明します。

**前提条件**

* 稼働中の [ClickHouse Cloud サービス](/getting-started/quick-start/cloud)
* 任意の IDE または AI エージェント型開発ツール


## Cloud 向けのリモートMCPサーバーを有効にする \{#enable-remote-mcp-server\}

リモートMCPサーバーを有効にする対象の ClickHouse Cloud サービスに接続し、左側のメニューにある `Connect` ボタンをクリックします。
接続の詳細が表示されたボックスが開きます。

&quot;Connect with MCP&quot; を選択します:

<Image img={img1} alt="ConnectモーダルでMCPを選択" size="md" />

ボタンをオンに切り替えて、そのサービスの MCP を有効にします:

<Image img={img2} alt="MCPサーバーを有効化" size="md" />

表示された URL をコピーします。これは以下のものと同じです:

```bash
https://mcp.clickhouse.cloud/mcp
```


## 開発用にリモートMCPをセットアップする \{#setup-clickhouse-cloud-remote-mcp-server\}

以下から使用するIDEまたはツールを選択し、該当するセットアップ手順に従ってください。

### Claude Code \{#claude-code\}

作業ディレクトリで次のコマンドを実行し、ClickHouse Cloud MCP Server の設定を Claude Code に追加します。

```bash
claude mcp add --transport http clickhouse-cloud https://mcp.clickhouse.cloud/mcp
```

次に、Claude Code を起動します。

```bash
claude
```

次のコマンドを実行して、MCPサーバーを一覧表示します。

```bash
/mcp
```

`clickhouse-cloud` を選択し、ClickHouse Cloud の認証情報を使用して OAuth で認証します。

### Claude Web UI \{#claude-web\}

1. **Customize** &gt; **Connectors** に移動します
2. 「+」アイコンをクリックし、**Add custom connector** を選択します
3. カスタムコネクタに `clickhouse-cloud` などの名前を付けて追加します
4. 新しく追加した `clickhouse-cloud` コネクタをクリックし、**Connect** をクリックします
5. OAuth 経由で ClickHouse Cloud の認証情報を使用して認証します

### Cursor \{#cursor\}

1. [Cursor Marketplace](https://cursor.com/marketplace) でMCPサーバーを探してインストールします。
2. ClickHouseを検索し、任意のサーバーで「Add to Cursor」をクリックしてインストールします
3. OAuthで認証します。

### Visual Studio Code \{#visual-studio-code\}

次の設定を `.vscode/mcp.json` に追加してください。

```json
{
  "servers": {
    "clickhouse-cloud": {
      "type": "http",
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

詳細は、[Visual Studio Code のドキュメント](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)を参照してください


### Windsurf \{#windsurf\}

以下の設定で `mcp_config.json` ファイルを編集します。

```json
{
  "mcpServers": {
    "clickhouse-cloud": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.clickhouse.cloud/mcp"]
    }
  }
}
```

詳細については、[Windsurf ドキュメント](https://docs.windsurf.com/windsurf/cascade/mcp#adding-a-new-mcp)を参照してください。

### Zed \{#zed\}

ClickHouse をカスタムサーバーとして追加します。
Zed の設定の **context&#95;servers** に、次の内容を追加します。

```json
{
  "context_servers": {
    "clickhouse-cloud": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

Zed は、初めてサーバーに接続すると、OAuth による認証を求めるプロンプトを表示するはずです。
詳細については、[Zed のドキュメント](https://zed.dev/docs/ai/mcp#as-custom-servers)を参照してください


### Codex \{#codex\}

CLI を使用して ClickHouse Cloud MCP サーバーを追加するには、次のコマンドを実行します。

```bash
codex mcp add clickhouse-cloud --url https://mcp.clickhouse.cloud/mcp
```


## 関連コンテンツ \{#related-content\}

* [ClickHouse agent のスキル](https://github.com/ClickHouse/agent-skills)