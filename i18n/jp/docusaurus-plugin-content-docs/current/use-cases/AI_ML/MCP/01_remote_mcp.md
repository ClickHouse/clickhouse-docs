---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: 'ClickHouse Cloud リモート MCP'
title: 'ClickHouse Cloud リモート MCP サーバーの有効化'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse Cloud リモート MCP を有効化して使用する方法について説明します。'
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


# ClickHouse Cloud リモート MCP サーバーを有効にする {#enabling-the-clickhouse-cloud-remote-mcp-server}

> このガイドでは、ClickHouse Cloud リモート MCP サーバーの有効化と使用方法について説明します。この例では MCP クライアントとして Claude Code を使用しますが、MCP をサポートする LLM クライアントであればどれでも使用できます。

<VerticalStepper headerLevel="h2">


## ClickHouse Cloud サービスでリモート MCP サーバーを有効化する {#enable-remote-mcp-server}

1. ClickHouse Cloud サービスに接続し、「Connect」ボタンをクリックして、そのサービスのリモート MCP サーバーを有効にします

<Image img={img1} alt="Connect モーダルで MCP を選択" size="md" />

<Image img={img2} alt="MCP Server を有効化" size="md" />

2. 「Connect」ビューから、または以下に表示されている ClickHouse Cloud MCP Server の URL をコピーします

```bash
https://mcp.clickhouse.cloud/mcp
```


## Claude Code に ClickHouse MCP サーバーを追加する {#add-clickhouse-mcp-server-claude-code}

1. 作業ディレクトリで次のコマンドを実行して、ClickHouse Cloud MCP サーバーの設定を Claude Code に追加します。この例では、Claude Code の設定内で MCP サーバーに `clickhouse_cloud` という名前を付けています。

```bash
claude mcp add --transport http clickhouse_cloud https://mcp.clickhouse.cloud/mcp
```

1b. 使用している MCP クライアントによっては、JSON の設定ファイルを直接編集することもできます

```json
{
  "mcpServers": {
    "clickhouse-remote": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

2. 作業ディレクトリ内で Claude Code を起動する

```bash
[user@host ~/Documents/repos/mcp_test] $ claude
```


## OAuth を使用して ClickHouse Cloud に認証する {#authenticate-via-oauth}

1. 最初のセッションでは Claude Code がブラウザウィンドウを開きます。そうでない場合は、Claude Code で `/mcp` コマンドを実行し、`clickhouse_cloud` MCP サーバーを選択して接続を開始することもできます。

2. ClickHouse Cloud の認証情報を使用して認証します

<Image img={img3} alt="OAuth 接続フロー" size="sm"/>

<Image img={img4} alt="OAuth 接続フロー（成功）" size="sm"/>



## Claude CodeからClickHouse Cloud Remote MCPサーバーを使用する {#use-rempte-mcp-from-claude-code}

1. Claude CodeでリモートMCPサーバーが接続されていることを確認してください

<Image img={img5} alt='Claude Code MCP success' size='md' />

<Image img={img6} alt='Claude Code MCP Details' size='md' />

2. 完了です。これでClaude CodeからClickHouse Cloud Remote MCPサーバーを使用できます

<Image img={img7} alt='Claude Code MCP Usage' size='md' />

この例ではClaude Codeを使用していますが、同様の手順でMCPをサポートする任意のLLMクライアントを使用できます。

</VerticalStepper>
