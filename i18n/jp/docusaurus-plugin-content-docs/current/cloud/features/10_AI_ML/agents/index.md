---
sidebar_label: '概要'
slug: /cloud/features/ai-ml/agents
title: 'ClickHouse Agents'
description: 'ClickHouse Cloud の ClickHouse Agents の概要'
keywords: ['AI', 'ClickHouse Cloud', 'Agents', 'エージェントビルダー']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse Agents は、ClickHouse Cloud のマネージド型エージェント機能です。自然言語で分析作業の内容を記述すると、エージェントが手順を計画し、エージェントビルダーで追加したツールを呼び出して、お使いの ClickHouseサービス に対して実行します。

この機能はベータです。挙動や提供される機能の範囲は、一般提供前に変更される場合があります。

## できること \{#what-you-can-do\}

* コードを書かずにカスタムエージェントを作成できます。指示を設定し、モデルを選び、ツールを追加します。
* ClickHouseサービスと対話できます。必要に応じて、エージェントがツールを呼び出します。
* エージェントをチームメンバーと共有したり、マーケットプレイスに公開したりできます。

## このセクションの内容 \{#in-this-section\}

* [クイックスタート](/cloud/features/ai-ml/agents/quickstart) — 最初のエージェントを作成し、クエリを実行します。
* [チャット](/cloud/features/ai-ml/agents/chat) — 会話、ブックマーク、フォーク、複数の会話、共有。
* [エージェントビルダー](/cloud/features/ai-ml/agents/builder) — エージェントを作成して設定し、モデルパラメータを指定して、ツール、MCPサーバー、スキル、サブエージェントを追加します。
* [プロンプト](/cloud/features/ai-ml/agents/prompts) — 保存済みプロンプトのライブラリ。
* [メモリ](/cloud/features/ai-ml/agents/memory) — 会話をまたいで保持されるコンテキスト。
* [マーケットプレイス](/cloud/features/ai-ml/agents/marketplace) — 組織内でエージェントを共有し、見つけることができます。
* [共有とアクセス](/cloud/features/ai-ml/agents/sharing-and-access) — エージェントの権限モデル。