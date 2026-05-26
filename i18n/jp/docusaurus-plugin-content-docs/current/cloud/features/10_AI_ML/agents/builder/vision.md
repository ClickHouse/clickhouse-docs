---
sidebar_label: 'ビジョン'
sidebar_position: 5
slug: /cloud/features/ai-ml/agents/builder/vision
title: 'ビジョン'
description: 'ClickHouse Agents における画像入力と視覚認識'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'ビジョン', '画像入力', 'マルチモーダル']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ビジョン では、ユーザーが画像をアップロードすると、エージェントがその画像を解析できます。エージェントは画像を視覚対応のモデルに渡し、モデルは画像の内容を説明したり、要約したり、画像に関する質問に回答したりします。

## 有効にする \{#enable-it\}

Agent Builder でビジョン機能を切り替えます。ビジョン は画像入力をサポートするモデルでのみ動作し、選択したモデルが対応していない場合はアップロード コントロールが無効になります。再度有効にするには、[モデルパラメータ](/cloud/features/ai-ml/agents/builder/model-parameters) で ビジョン 対応モデルに切り替えてください。

## 使う \{#use-it\}

ユーザーは、スクリーンショット、写真、グラフ、図表などの画像をメッセージに添付できます。画像の内容を読み取る必要がある質問なら何でも可能です。たとえば、*&quot;このクエリプランの何が問題ですか？&quot;*、*&quot;このスクリーンショット内のテキストを書き起こしてください&quot;*、*&quot;このダッシュボードを先週のものと比較してください&quot;* などです。

agent は画像をメッセージのコンテキストの一部として扱うため、同じターン内の後続の質問では、再アップロードしなくても見た内容を参照できます。

## 他のツールと組み合わせる \{#combine-with-other-tools\}

ビジョンは、画像ベースの分析では[code interpreter](/cloud/features/ai-ml/agents/builder/code-interpreter)と相性がよく、たとえばエージェントがスクリーンショットから数値を読み取り、その後Pythonを実行して合計を計算できます。また、画像にモデルが調べる必要のある対象への言及が含まれている場合は、[web search](/cloud/features/ai-ml/agents/builder/web-search)も有効です。