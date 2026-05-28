---
sidebar_label: 'クイックスタート'
sidebar_position: 1
slug: /cloud/features/ai-ml/agents/quickstart
title: 'クイックスタート'
description: 'ClickHouse Cloud サービス向けに、最初の ClickHouse Agent を構築して実行する'
keywords: ['AI', 'ClickHouse Cloud', 'エージェント', 'クイックスタート', 'エージェントビルダー']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import agentBuilder from '@site/static/images/cloud/agent-builder/agent-builder.png';
import capabilities from '@site/static/images/cloud/agent-builder/capabilities.png';
import toolsButton from '@site/static/images/cloud/agent-builder/tools-button.png';
import toolsModal from '@site/static/images/cloud/agent-builder/tools-modal.png';
import chatQuery from '@site/static/images/cloud/agent-builder/chat-query.png';
import launchAgents from '@site/static/images/cloud/agent-builder/launch-ch-agents.png';

<BetaBadge />

Cloudコンソールでカスタム エージェントを作成し、サービスに対して自然言語クエリを実行します。

## 前提条件 \{#prerequisites\}

* クエリ可能な ClickHouse Cloud サービス。
* Agent Builder の **Create agent** オプション。表示されない場合は、[sharing and access](/cloud/features/ai-ml/agents/sharing-and-access) に記載のとおり、組織の管理者に依頼して、Admin Settings からエージェント作成権限を付与してもらってください。

## エージェントを作成する \{#build-the-agent\}

<VerticalStepper headerLevel="h3">
  ### ClickHouse Agents を起動する \{#launch-agents\}

  Cloud サービスの左側のサイドバーで **ClickHouse agents** をクリックし、エージェントのランチパッドを開きます。**Launch ClickHouse agents** をクリックして、エージェントビルダーを開きます。

  <Image img={launchAgents} alt="ClickHouse agents（ベータ）が選択された Cloud サービスのナビゲーション。Launch ClickHouse agents ボタンがあるランチパッドが表示されている" size="lg" />

  ### エージェントを作成する \{#create-the-agent\}

  エージェントビルダーで、左側パネル上部の **Create New Agent** をクリックします。次に、基本フィールドを入力します。

  * **Name** - エージェントの短い識別名。
  * **Description** - エージェントの用途の説明。チームメンバーにも表示されます。
  * **Category** - エージェントのカテゴリ。組織でカスタムカテゴリを使っていない場合は、`General` のままで構いません。
  * **Instructions** - システムプロンプト。エージェントの役割、答えるべき質問、従う必要があるビジネスルールを記述します。
  * **Model** - ドロップダウンからモデルを選択します。

  <Image img={agentBuilder} alt="Create New Agent ドロップダウン、フォームフィールド（Name、Description、Category、Instructions、Model）、および Capabilities セクションが表示されたエージェントビルダーパネル" size="lg" />

  ### 機能とツールを追加する \{#attach-tools\}

  エージェントの機能とツールは、2 か所で設定します。

  メインパネルの **Capabilities** — [Run Code](/cloud/features/ai-ml/agents/builder/code-interpreter)、[ウェブ検索](/cloud/features/ai-ml/agents/builder/web-search)、File Context、Artifacts、[MCPサーバー](/cloud/features/ai-ml/agents/builder/mcp-servers)、[スキル](/cloud/features/ai-ml/agents/builder/skills) などのファーストパーティ機能です。エージェントに必要なものをオンにします。

  <Image img={capabilities} alt="Run Code、ウェブ検索、File Context、Artifacts、MCPサーバー、Skills の切り替えが表示されたエージェントビルダーパネルの Capabilities セクション" size="sm" />

  パネル下部の **Add Tools** ボタンから開く **Tools** — [image generation](/cloud/features/ai-ml/agents/builder/image-generation)、[ビジョン](/cloud/features/ai-ml/agents/builder/vision)、検索 API、外部サービスなどのサードパーティ統合です。

  <Image img={toolsButton} alt="Add Tools ボタンが強調表示されたエージェントビルダーパネル下部" size="sm" />

  **Add Tools** をクリックして、カタログを参照します。

  <Image img={toolsModal} alt="Google、OpenAI Image Tools、Wolfram、DALL-E-3、Tavily Search、Calculator、Stable Diffusion などのサードパーティ統合をグリッド表示した Agent Tools モーダル" size="lg" />

  [サブエージェント](/cloud/features/ai-ml/agents/builder/subagents) は **Advanced settings** で設定します。詳細はサブエージェントのページを参照してください。

  追加した機能とツールはいつでも変更できます。

  ### クエリを実行する \{#run-a-query\}

  エージェントを保存し、新しい会話を開いて、エージェントピッカーから対象のエージェントを選択します。たとえば *&quot;What are my top 10 tables by row count this week?&quot;* と質問すると、エージェントが計画を立て、必要に応じてツールを呼び出し、回答を返します。

  <Image img={chatQuery} alt="「What are my top 10 tables by row count this week?」という質問と、それに対するエージェントの応答を表示したチャット。行数で各サービスの上位 10 テーブルを順位付けした Markdown テーブルと、その下に Key Observations が表示されている" size="lg" />
</VerticalStepper>

## 次のステップ \{#next-steps\}

* [エージェントをチームメイトと共有](/cloud/features/ai-ml/agents/sharing-and-access)します。
* エージェントが安定版になったら、[マーケットプレイス](/cloud/features/ai-ml/agents/marketplace)に公開します。