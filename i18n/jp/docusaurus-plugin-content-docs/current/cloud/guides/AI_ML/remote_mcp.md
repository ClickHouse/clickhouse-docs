---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: 'リモート MCP サーバーを有効化する'
title: 'ClickHouse Cloud のリモート MCP サーバーを有効化する'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse Cloud のリモート MCP を有効化して使用する方法を説明します。'
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

# ClickHouse Cloud リモート MCP サーバーの有効化 \{#enabling-the-clickhouse-cloud-remote-mcp-server\}

> このガイドでは、ClickHouse Cloud リモート MCP サーバーを有効化して使用する方法を説明します。ここでは例として Claude Code を MCP クライアントとして使用しますが、MCP をサポートする任意の LLM クライアントを使用できます。

<VerticalStepper headerLevel="h2">

## ClickHouse Cloud サービスでリモート MCP サーバーを有効化する \{#enable-remote-mcp-server\}

1. ClickHouse Cloud サービスに接続し、`Connect` ボタンをクリックして、対象サービスの Remote MCP Server を有効化します。

<Image img={img1} alt="Connect モーダルで MCP を選択" size="md"/>

<Image img={img2} alt="MCP Server を有効化" size="md"/>

2. `Connect` ビュー、または以下に表示されている ClickHouse Cloud MCP Server の URL をコピーします。

```bash
https://mcp.clickhouse.cloud/mcp
```

## Claude Code に ClickHouse MCP Server を追加する \{#add-clickhouse-mcp-server-claude-code\}

1. 作業ディレクトリ内で、次のコマンドを実行して ClickHouse Cloud MCP Server の設定を Claude Code に追加します。この例では、Claude Code の設定内で MCP サーバーに `clickhouse_cloud` という名前を付けています。

```bash
claude mcp add --transport http clickhouse_cloud https://mcp.clickhouse.cloud/mcp
```

1b. 使用している MCP クライアントによっては、JSON 設定を直接編集することもできます

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

## OAuth を使用して ClickHouse Cloud に対して認証する \{#authenticate-via-oauth\}

1. 最初のセッションでは、Claude Code がブラウザウィンドウを開きます。そうでない場合は、Claude Code で `/mcp` コマンドを実行し、`clickhouse_cloud` MCP サーバーを選択して接続を開始できます。

2. ClickHouse Cloud の認証情報を使用して認証します。

<Image img={img3} alt="OAuth 接続フロー" size="sm"/>

<Image img={img4} alt="OAuth 接続フローの成功" size="sm"/>

## Claude Code から ClickHouse Cloud Remote MCP Server を使用する \{#use-rempte-mcp-from-claude-code\}

1. Claude Code でリモート MCP サーバーが接続されていることを確認します。

<Image img={img5} alt="Claude Code MCP 成功" size="md"/>

<Image img={img6} alt="Claude Code MCP の詳細" size="md"/>

2. おめでとうございます。これで Claude Code から ClickHouse Cloud Remote MCP Server を使用できるようになりました。

<Image img={img7} alt="Claude Code MCP の利用例" size="md"/>

この例では Claude Code を使用しましたが、同様の手順に従うことで、MCP をサポートする任意の LLM クライアントを使用できます。

</VerticalStepper>
