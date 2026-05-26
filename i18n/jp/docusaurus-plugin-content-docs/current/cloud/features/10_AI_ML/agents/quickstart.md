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

<BetaBadge />

Cloudコンソールでカスタム エージェントを作成し、サービスに対して自然言語クエリを実行します。

## 前提条件 \{#prerequisites\}

* クエリ可能な ClickHouse Cloud サービス。
* Agent Builder の **Create agent** オプション。表示されない場合は、[sharing and access](/cloud/features/ai-ml/agents/sharing-and-access) に記載のとおり、組織の管理者に依頼して、Admin Settings からエージェント作成権限を付与してもらってください。

## エージェントを作成する \{#create-the-agent\}

Cloudコンソール で Agents を開き、Agent Builder のサイドパネルで **Create agent** をクリックします。次の主要なフィールドを入力します。

* **Name** — 短い識別子です。
* **Description** — エージェントの用途がチームメイトに伝わるよう、1 行で記述します。
* **Instructions** — システムプロンプトです。エージェントの役割、回答すべき質問、従う必要があるビジネスルールを記述します。
* **Model** — ドロップダウンからモデルを選択します。temperature やその他の生成設定は、[model parameters](/cloud/features/ai-ml/agents/builder/model-parameters) で調整します。

## ツールを追加する \{#attach-tools\}

エージェントに必要な機能を決めます。Builder では、次の機能を追加できます。

* [Code interpreter](/cloud/features/ai-ml/agents/builder/code-interpreter) — 計算やデータ変換を行うための、サンドボックス環境でのコード実行。
* [Web search](/cloud/features/ai-ml/agents/builder/web-search) — 公開Webのルックアップ。
* [Image generation](/cloud/features/ai-ml/agents/builder/image-generation) と [vision](/cloud/features/ai-ml/agents/builder/vision) — 視覚的な出力と入力。
* [MCP servers](/cloud/features/ai-ml/agents/builder/mcp-servers) — Model Context Protocol 経由のサードパーティ製ツール。
* [Skills](/cloud/features/ai-ml/agents/builder/skills) と [Subagents](/cloud/features/ai-ml/agents/builder/subagents) — 再利用可能な指示パックとタスク委任。

追加したツールはいつでも変更できます。

## クエリを実行する \{#run-a-query\}

エージェントを保存し、新しい会話を開いて、エージェントピッカーから自分のエージェントを選択します。質問を入力します。たとえば *「今週、行数が多いテーブルの上位 10 件は何ですか？」* と入力すると、エージェントが計画を立て、必要に応じてツールを呼び出し、回答を返します。

## 次のステップ \{#next-steps\}

* [エージェントをチームメイトと共有](/cloud/features/ai-ml/agents/sharing-and-access)します。
* エージェントが安定版になったら、[マーケットプレイス](/cloud/features/ai-ml/agents/marketplace)に公開します。