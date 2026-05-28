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
import Image from '@theme/IdealImage';
import vision from '@site/static/images/cloud/agent-builder/vision/vision.png';

<BetaBadge />

ビジョン では、ユーザーが画像をアップロードすると、エージェントがその画像を解析できます。エージェントは画像を視覚対応のモデルに渡し、モデルは画像の内容を説明したり、要約したり、画像に関する質問に回答したりします。

## ビジョン機能を有効にする \{#enable-it\}

ビジョン は画像入力をサポートするモデルでのみ動作し、選択したモデルが対応していない場合はアップロード コントロールが無効になります。再度有効にするには、ビジョン 対応モデルに切り替えてください。

## ビジョン機能を使う \{#use-it\}

メッセージのコンポーザー左下にあるクリップアイコンをクリックし、**Upload to Provider** を選択して、スクリーンショット、写真、グラフ、図表などの画像を添付します。次に、画像の内容を読み取る必要がある質問をします。たとえば、*&quot;このクエリプランの何が問題ですか？&quot;*、*&quot;このスクリーンショット内のテキストを書き起こしてください&quot;*、*&quot;このダッシュボードを先週のものと比較してください&quot;* などです。

<Image img={vision} alt="Upload to Provider、Upload as Text、Upload to Code Environment の各オプションを示すクリップメニューが開いた状態のメッセージコンポーザー" size="lg" />

エージェント は画像をメッセージのコンテキストの一部として扱うため、同じターン内の後続の質問では、再アップロードしなくても見た内容を参照できます。

## ビジョンを他のツールと組み合わせる \{#combine-with-other-tools\}

ビジョンは、画像ベースの分析では[コードインタープリター](/cloud/features/ai-ml/agents/builder/code-interpreter)と相性がよく、たとえばエージェントがスクリーンショットから数値を読み取り、その後Pythonを実行して合計を計算できます。また、画像にモデルが調べる必要のある対象への言及が含まれている場合は、[ウェブ検索](/cloud/features/ai-ml/agents/builder/web-search)も有効です。