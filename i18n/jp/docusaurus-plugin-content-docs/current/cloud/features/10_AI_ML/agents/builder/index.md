---
sidebar_label: '概要'
slug: /cloud/features/ai-ml/agents/builder
title: 'Agent Builder'
description: 'Agent BuilderでClickHouse Agentsを作成・設定'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'Agent Builder', 'ツール', '手順']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

Agent Builder は、エージェントを作成および設定する場所です。Cloudコンソールのサイドパネルとして開きます。

パネルは 3 つのセクションで構成されています。

* 上部の **Identity** — 名前、説明、アバター、instructions フィールド (システムプロンプト) 。
* 中央の **モデル設定** — provider、model、生成パラメーター。
* 下部の **Capabilities** — アタッチするツール、MCPサーバー、Skills、サブエージェント。

保存はフッターのボタンから行います。編集内容は次の会話から有効になり、進行中の実行は中断されません。

## Identity \{#identity\}

instructionsフィールドは、エージェントのシステムプロンプトです。役割、回答すべき質問の種類、従うべきルールを記述してください。エージェントがClickHouse serviceをクエリする場合は、スキーマの規約、算出メトリクス、用語を具体的に記述してください。モデルが独力でビジネス上の定義を推測することはできません。

## 基本設定 \{#core-configuration\}

* [モデル パラメータ](/cloud/features/ai-ml/agents/builder/model-parameters) — モデルを選択し、生成パラメータを調整します。設定は名前付きプリセットとして保存でき、再利用できます。

## 組み込みツール \{#built-in-tools\}

* [Code interpreter](/cloud/features/ai-ml/agents/builder/code-interpreter) — サンドボックス内でのコード実行。
* [Web search](/cloud/features/ai-ml/agents/builder/web-search) — 公開Webのルックアップ。
* [Image generation](/cloud/features/ai-ml/agents/builder/image-generation) — テキストから画像を生成。
* [Vision](/cloud/features/ai-ml/agents/builder/vision) — 画像入力に対応。

## 拡張性 \{#extensibility\}

* [MCPサーバー](/cloud/features/ai-ml/agents/builder/mcp-servers) — サードパーティ製のMCPサーバーをエージェントに追加します。
* [Skills](/cloud/features/ai-ml/agents/builder/skills) — 再利用可能な指示パック。
* [サブエージェント](/cloud/features/ai-ml/agents/builder/subagents) — 子エージェントに作業を委任します。