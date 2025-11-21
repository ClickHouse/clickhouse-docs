---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: 'ClickHouse Cloud リモート MCP'
title: 'ClickHouse Cloud リモート MCP サーバーを有効にする'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse Cloud リモート MCP を有効にして使用する方法を説明します。'
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


# ClickHouse Cloud リモート MCP サーバーの有効化

> 本ガイドでは、ClickHouse Cloud リモート MCP サーバーの有効化と使用方法について説明します。この例では MCP クライアントとして Claude Code を使用しますが、MCP に対応している任意の LLM クライアントを使用できます。

<VerticalStepper headerLevel="h2">


## ClickHouse CloudサービスのリモートMCPサーバーを有効化する {#enable-remote-mcp-server}

1. ClickHouse Cloudサービスに接続し、`Connect`ボタンをクリックして、サービスのリモートMCPサーバーを有効化します

<Image img={img1} alt='接続モーダルでMCPを選択' size='md' />

<Image img={img2} alt='MCPサーバーを有効化' size='md' />

2. `Connect`ビューまたは以下からClickHouse Cloud MCPサーバーのURLをコピーします

```bash
https://mcp.clickhouse.cloud/mcp
```


## Claude CodeへのClickHouse MCPサーバーの追加 {#add-clickhouse-mcp-server-claude-code}

1. 作業ディレクトリで以下のコマンドを実行し、ClickHouse Cloud MCPサーバーの構成をClaude Codeに追加します。この例では、Claude Codeの構成ファイル内でMCPサーバーに`clickhouse_cloud`という名前を付けています

```bash
claude mcp add --transport http clickhouse_cloud https://mcp.clickhouse.cloud/mcp
```

1b. 使用するMCPクライアントによっては、JSON構成ファイルを直接編集することもできます

```json
{
  "mcpServers": {
    "clickhouse-remote": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

2. 作業ディレクトリでClaude Codeを起動します

```bash
[user@host ~/Documents/repos/mcp_test] $ claude
```


## OAuthによるClickHouse Cloudへの認証 {#authenticate-via-oauth}

1. Claude Codeは初回セッション時にブラウザウィンドウを開きます。それ以外の場合は、Claude Codeで `/mcp` コマンドを実行し、`clickhouse_cloud` MCPサーバーを選択することで接続を開始できます

2. ClickHouse Cloudの認証情報を使用して認証を行います

<Image img={img3} alt='OAuth接続フロー' size='sm' />

<Image img={img4} alt='OAuth接続フロー成功' size='sm' />


## Claude CodeからClickHouse Cloud Remote MCPサーバーを使用する {#use-rempte-mcp-from-claude-code}

1. Claude CodeでリモートMCPサーバーが接続されていることを確認してください

<Image img={img5} alt='Claude Code MCP success' size='md' />

<Image img={img6} alt='Claude Code MCP Details' size='md' />

2. これで完了です。Claude CodeからClickHouse Cloud Remote MCPサーバーを使用できるようになりました

<Image img={img7} alt='Claude Code MCP Usage' size='md' />

この例ではClaude Codeを使用していますが、同様の手順でMCPをサポートする任意のLLMクライアントを使用することができます。

</VerticalStepper>
