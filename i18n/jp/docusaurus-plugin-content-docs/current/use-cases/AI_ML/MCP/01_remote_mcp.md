---
'slug': '/use-cases/AI/MCP/remote_mcp'
'sidebar_label': 'ClickHouse Cloud リモート MCP'
'title': 'ClickHouse Cloud リモート MCP サーバーを有効にする'
'pagination_prev': null
'pagination_next': null
'description': 'このガイドでは、ClickHouse Cloud リモート MCP を有効にし、使用する方法について説明します。'
'keywords':
- 'AI'
- 'ClickHouse Cloud'
- 'MCP'
'show_related_blogs': true
'sidebar_position': 1
'doc_type': 'guide'
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

> このガイドでは、ClickHouse Cloud リモート MCP サーバーを有効化して使用する方法を説明します。この例では Claude Code を MCP クライアントとして使用しますが、MCP をサポートする任意の LLM クライアントを使用できます。

<VerticalStepper headerLevel="h2">

## ClickHouse Cloud サービス用のリモート MCP サーバーを有効化する {#enable-remote-mcp-server}

1. ClickHouse Cloud サービスに接続し、`Connect` ボタンをクリックして、サービスのリモート MCP サーバーを有効にします。

<Image img={img1} alt="接続モーダルで MCP を選択" size="md"/>

<Image img={img2} alt="MCP サーバーを有効化" size="md"/>

2. `Connect` ビューまたは下部から ClickHouse Cloud MCP サーバーの URL をコピーします。

```bash
https://mcp.clickhouse.cloud/mcp
```

## Claude Code に ClickHouse MCP サーバーを追加する {#add-clickhouse-mcp-server-claude-code}

1. 作業ディレクトリで、次のコマンドを実行して Claude Code に ClickHouse Cloud MCP サーバーの設定を追加します。この例では、Claude Code の設定内で MCP サーバーを `clickhouse_cloud` と名付けました。

```bash
claude mcp add --transport http clickhouse_cloud https://mcp.clickhouse.cloud/mcp
```

1b. 使用する MCP クライアントによっては、JSON 設定を直接編集することもできます。

```json
{
  "mcpServers": {
    "clickhouse-remote": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

2. 作業ディレクトリで Claude Code を起動します。

```bash
[user@host ~/Documents/repos/mcp_test] $ claude
```

## OAuth を介して ClickHouse Cloud に認証する {#authenticate-via-oauth}

1. Claude Code は最初のセッションでブラウザウィンドウを開きます。それ以外の場合、Claude Code で `/mcp` コマンドを実行し、`clickhouse_cloud` MCP サーバーを選択することで接続をトリガーすることもできます。

2. ClickHouse Cloud の資格情報を使用して認証します。

<Image img={img3} alt="OAuth 接続フロー" size="sm"/>

<Image img={img4} alt="OAuth 接続フロー成功" size="sm"/>

## Claude Code から ClickHouse Cloud リモート MCP サーバーを使用する {#use-rempte-mcp-from-claude-code}

1. Claude Code でリモート MCP サーバーが接続されていることを確認します。

<Image img={img5} alt="Claude Code MCP 成功" size="md"/>

<Image img={img6} alt="Claude Code MCP 詳細" size="md"/>

2. おめでとうございます！ Claude Code から ClickHouse Cloud リモート MCP サーバーを使用できるようになりました。

<Image img={img7} alt="Claude Code MCP 使用法" size="md"/>

この例では Claude Code を使用しましたが、同様の手順に従うことで MCP をサポートする任意の LLM クライアントを使用できます。

</VerticalStepper>
