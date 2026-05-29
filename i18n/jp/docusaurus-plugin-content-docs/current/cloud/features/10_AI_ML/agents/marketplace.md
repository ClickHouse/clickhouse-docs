---
sidebar_label: 'マーケットプレイス'
sidebar_position: 7
slug: /cloud/features/ai-ml/agents/marketplace
title: 'エージェント マーケットプレイス'
description: 'ClickHouse Cloud 組織内で共有されているエージェントを見つけて利用できます'
keywords: ['AI', 'ClickHouse Cloud', 'エージェント', 'マーケットプレイス', '共有', '検索']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import marketplace from '@site/static/images/cloud/agent-builder/marketplace/marketplace.png';
import browse from '@site/static/images/cloud/agent-builder/marketplace/browse.png';
import useAgent from '@site/static/images/cloud/agent-builder/marketplace/use-agent.png';

<BetaBadge />

エージェント マーケットプレイス では、組織内の他のユーザーが共有したエージェントを閲覧、検索、実行できます。管理者が組織全体向けに公開したエージェントも表示されます。左側のサイドバーにある **エージェント マーケットプレイス** オプションから開きます。

<Image img={marketplace} alt="左側のサイドバーで エージェント マーケットプレイス オプションが強調表示されたチャット画面" size="lg" />

## 探す \{#browse\}

エージェントはカテゴリ別にグループ化されています。たとえば、*General*、*Human Resources*、*Research &amp; Development*、*Finance*、*IT*、*Sales* です。マーケットプレイス上部のタブでカテゴリを切り替えます。各エージェントカードには、名前、アイコン、所属カテゴリが表示されます。

検索バーを使うと、すべてのカテゴリを対象に、名前またはキーワードでエージェントを検索できます。

<Image img={browse} alt="タイトル、検索バー、カテゴリタブ（General、Human Resources、Research and Development、Finance、IT、Sales、After Sales、All）、およびエージェントカードが表示されたエージェント マーケットプレイス画面" size="lg" />

## エージェントを開く \{#open-an-agent\}

任意のエージェントカードをクリックすると、その詳細ビューが開きます。ここでは次の操作を行えます。

* **Start Chat** - エージェントとの新しいチャットを開始します。
* **Pin** - すばやくアクセスできるよう、エージェントをお気に入りに追加します。
* **Copy link** - エージェントへの直接リンクを共有します。

<Image img={useAgent} alt="エージェント名、アイコン、Pin、Copy link、Start Chat の各操作が表示されたエージェント詳細モーダル" size="md" />

## 独自のエージェントを公開する \{#publish-your-own\}

エージェントをマーケットプレイスで見つけられるようにするには、[共有とアクセス](/cloud/features/ai-ml/agents/sharing-and-access) パネルで適切な共有範囲を設定します。公開レベルは次のとおりです。

* **非公開** - 自分だけが表示できます。マーケットプレイスには表示されません。
* **ユーザーまたはグループと共有** - 指定したユーザーまたはグループに表示されます。それらのユーザーのマーケットプレイスに表示されます。
* **組織全体** - 組織内の全員に表示されます。管理者が設定したマーケットプレイス権限の対象になります。

公開前に、エージェントを分類し、わかりやすい説明を記載してください。これらのフィールドは、検索とカテゴリ別の閲覧の両方に使われます。

## 管理者向けコントロール \{#admin-controls\}

組織管理者は次のことを実行できます。

* マーケットプレイスに表示するカテゴリを選定する。
* 個々のエージェントを組織全体ビューに表示する。
* ロールごとにマーケットプレイスへのアクセスを許可または制限する。

権限モデルについては、[共有とアクセス](/cloud/features/ai-ml/agents/sharing-and-access)を参照してください。