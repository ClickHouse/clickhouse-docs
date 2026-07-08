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

ClickHouse Agents を使用すると、SQL やオーケストレーションロジックを自分で記述しなくても、対話を通じて ClickHouse データをクエリし、探索できます。
エージェントが意図を解釈し、手順を計画し、設定したツールを呼び出して、結果を返します。
この機能は現在ベータ版です。挙動や機能は、一般提供前に変更される場合があります。

## これでできること \{#what-you-can-do\}

ClickHouse Agents では、次のことができます。

* コードを書かずにカスタムエージェントを作成できます。指示を記述し、モデルを選択して、ツールを追加できます。
* ClickHouse service を相手に会話を実行でき、エージェントは必要に応じてツールを呼び出します。
* エージェントをチームメイトと共有したり、マーケットプレイスに公開したりできます。

## このセクションでは \{#in-this-section\}

以下のページでは、ClickHouse Agents の機能について詳しく学べます。

| ページ                                                        | 内容                                            |
| ---------------------------------------------------------- | --------------------------------------------- |
| [クイックスタート](/cloud/features/ai-ml/agents/quickstart)        | 最初のエージェントを作成し、例のクエリを実行する方法                    |
| [チャット](/cloud/features/ai-ml/agents/chat)                  | 会話、ブックマーク、フォーク、複数会話、共有                        |
| [エージェントビルダー](/cloud/features/ai-ml/agents/builder)         | エージェント、モデルパラメータ、連携ツール、MCPサーバー、スキル、サブエージェントの設定 |
| [プロンプト](/cloud/features/ai-ml/agents/prompts)              | 保存済みプロンプトのライブラリ                               |
| [Memory](/cloud/features/ai-ml/agents/memory)              | 会話をまたいで保持されるコンテキスト                            |
| [マーケットプレイス](/cloud/features/ai-ml/agents/marketplace)      | 組織内でのエージェントの共有と検索                             |
| [共有とアクセス](/cloud/features/ai-ml/agents/sharing-and-access) | エージェントの権限モデル                                  |