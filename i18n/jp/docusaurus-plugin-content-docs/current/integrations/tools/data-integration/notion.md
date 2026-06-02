---
sidebar_label: 'Notion'
slug: /integrations/notion
keywords: ['clickhouse', 'notion', 'mcp', 'カスタムエージェント', 'ai', '統合', '接続']
description: 'ClickHouse Remote MCPサーバーを介して、ClickHouse Cloud を Notion のカスタムエージェントに接続します。'
title: 'Notion を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';
import addClickHouseConnection from '@site/static/images/integrations/tools/data-integration/notion/add-clickhouse-connection.png';
import clickhouseToolsToggles from '@site/static/images/integrations/tools/data-integration/notion/clickhouse-tools-toggles.png';

<PartnerBadge />

[Notion](https://www.notion.com/) は、メモ、ドキュメント、プロジェクト、AI を活用した カスタムエージェント をまとめて扱える統合ワークスペースです。

ClickHouse Cloud は Notion の [カスタムエージェント](https://www.notion.com/help/mcp-connections-for-custom-agents) に接続できます。接続すると、そのエージェントは Notion を離れることなく、データの探索、読み取り専用の分析クエリの実行、ClickHouse Cloud のサービス情報やコスト情報の表示を行えます。

## 前提条件 \{#prerequisites\}

* [Remote MCPサーバーが有効化された](/use-cases/AI/MCP/remote_mcp#enable-remote-mcp-server)実行中の [ClickHouse Cloud service](/getting-started/quick-start/cloud)
* **Business** または **Enterprise** プランの Notion ワークスペース

## Notion のカスタムエージェントに ClickHouse を接続する \{#connect-clickhouse-to-notion\}

ClickHouse は Notion で事前設定済みの接続として提供されています (現在はベータ) 。カスタム MCPサーバーの設定や URL の貼り付けは不要です。

1. Notion で拡張したい カスタムエージェント を開き、**Settings** をクリックします。
2. **Add connection** をクリックし、利用可能な接続の一覧から **ClickHouse** を選択します。

<Image img={addClickHouseConnection} size="md" alt="Notion の Add connection ピッカーで ClickHouse を選択している画面" />

3. **Connect** をクリックし、ClickHouse Cloud の認証情報を使って OAuth フローを完了します。アクセス範囲は、アカウントがすでにアクセスできる organizations と services に限定されます。

4. エージェントの設定で新しい ClickHouse 接続を展開し、このエージェントで使用するツールを有効にします。各ツールについて、エージェントが自動的に実行するか、毎回承認を求めるかも選択できます。ClickHouse Remote MCPサーバーによって公開されるすべてのツールは読み取り専用です。完全かつ最新の一覧については、[available tools](/cloud/features/ai-ml/remote-mcp#available-tools) を参照してください。

<Image img={clickhouseToolsToggles} size="md" alt="Notion で展開した ClickHouse 接続にツールごとの切り替えが表示されている画面" />

:::note
各 カスタムエージェント にはそれぞれ専用の ClickHouse 接続が必要で、その接続を認証した本人だけがツール設定を変更できます。詳しくは、Notion の [Agent connections のセキュリティのベストプラクティス](https://www.notion.com/help/security-best-practices-for-agent-connections) を参照してください。
:::

## 関連コンテンツ \{#related-content\}

* [ClickHouse CloudのリモートMCPサーバーを有効にして接続する](/use-cases/AI/MCP/remote_mcp)
* [Cloud の Remote MCP: ツールリファレンス](/cloud/features/ai-ml/remote-mcp)
* Notion: [Custom Agents 向けMCP接続](https://www.notion.com/help/mcp-connections-for-custom-agents)
* Notion: [MCPインテグレーションで Custom Agents をツールスタックに接続する](https://www.notion.com/help/guides/connect-custom-agents-to-mcp-integrations)