---
sidebar_label: 'ウェブ検索'
sidebar_position: 3
slug: /cloud/features/ai-ml/agents/builder/web-search
title: 'ウェブ検索'
description: 'ClickHouse Agents向けの外部ウェブ検索ツール'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'ウェブ検索']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import webSearch from '@site/static/images/cloud/agent-builder/web-search/web-search.png';

<BetaBadge />

ウェブ検索 を使うと、会話中にエージェントが公開ウェブから情報を取得できます。回答に最新情報が必要な質問、たとえば最近のリリース、対象のサービス外にあるドキュメント、または信頼できる情報源ですばやく確認したい場合に使用してください。

## 有効にする \{#enable-it\}

エージェントビルダーの **Capabilities** セクションで **ウェブ検索** をオンにします。有効にすると、ユーザーの質問とエージェントへの指示に基づいて、いつ検索を実行するかをエージェントが判断します。検索が実行され、結果が収集され、最も関連性の高いコンテンツがモデルコンテキストに渡されます。

<Image img={webSearch} alt="ウェブ検索セクションが強調表示され、ウェブ検索のチェックボックスが表示された Capabilities パネル" size="sm" />

## 検索ラウンドの仕組み \{#how-a-search-round-works\}

各検索は3つの段階で実行され、これらはCloud側で管理されます。

1. **検索** - エージェントのクエリが検索プロバイダーに送信され、候補となるURLが返されます。
2. **スクレイプ** - 関連するページを取得し、有用なテキストを抽出します。
3. **再順位付け** - リランカーが結果にスコアを付け、モデルが最も有用なものから先に参照できるようにします。

エージェントの応答には、実際に使用したURLが記載されます。

## 使用するケース \{#when-to-use-it\}

* 自分のサービスに含まれていないリリースノートや変更履歴を調べる場合。
* モデルが把握していない可能性がある情報を、情報源に照らして確認する場合。
* 公開されているブログ記事やドキュメントを分析のために会話に取り込む場合。

自分のデータやモデル自体の知識で答えられる質問には使用しないでください。検索ラウンドを1回行うたびにレイテンシが増加します。