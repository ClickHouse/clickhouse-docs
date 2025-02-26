---
title: 新しい価格の次元
slug: /cloud/manage/jan-2025-faq/pricing-dimensions
keywords: [新しい価格, 次元]
description: データ転送およびClickPipesの価格次元
---

import NetworkPricing from '@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/manage/_snippets/_network_transfer_rates.md';

新しいClickHouse Cloudの価格に以下の次元が追加されました。

:::note
データ転送およびClickPipesの価格は、2025年3月24日まではレガシープラン、すなわち開発プラン、プロダクションプラン、および専用プランには適用されません。
:::

## データ転送の価格設定 {#data-transfer-pricing}

### ユーザーはデータ転送に対してどのように課金され、これは組織の階層や地域によって異なりますか？ {#how-are-users-charged-for-data-transfer-and-will-this-vary-across-organization-tiers-and-regions}

- ユーザーはデータ転送に対して、二つの次元—公共インターネットの出口と地域間の出口—に沿って料金を支払います。地域内のデータ転送やプライベートリンク/プライベートサービスコネクトの使用、およびデータ転送には料金は発生しません。ただし、ユーザーに適切に課金する能力に影響を与える使用パターンが確認された場合、追加のデータ転送の価格設定次元を実施する権利を留保します。
- データ転送の価格は、クラウドサービスプロバイダー（CSP）や地域によって異なります。
- データ転送の価格は、組織の階層間で**変わりません**。
- 公共出口の価格は、発信地域のみに基づいています。地域間（またはクロス地域）の価格は、発信地域と宛先地域の両方に依存します。

<NetworkPricing/>

### 使用が増えるにつれてデータ転送の価格は階層化されますか？ {#will-data-transfer-pricing-be-tiered-as-usage-increases}

データ転送の価格は、使用が増えるにつれて**階層化されません**。価格は地域およびクラウドサービスプロバイダーによって異なることに注意してください。

## ClickPipes価格のFAQ {#clickpipes-pricing-faq}

### なぜ今ClickPipesの価格モデルを導入するのですか？ {#why-are-we-introducing-a-pricing-model-for-clickpipes-now}

私たちは最初にClickPipesを無料でローンチすることを決定し、フィードバックを集め、機能を洗練し、ユーザーのニーズに応えることを目指しました。GAプラットフォームが成長し、数兆行を移動することで実績を確立してきたことを考慮すると、価格モデルを導入することでサービスの継続的な改善、インフラの維持、および専用サポートや新しいコネクタの提供を可能にします。

### ClickPipesのレプリカとは何ですか？ {#what-are-clickpipes-replicas}

ClickPipesは、ClickHouse Cloudサービスとは独立して実行され、スケールする専用インフラストラクチャを介して、リモートデータソースからデータを取り込みます。このため、専用のコンピューティングレプリカを使用します。以下の図は、簡略化されたアーキテクチャを示しています。

ストリーミングClickPipesの場合、ClickPipesのレプリカはリモートデータソース（例：Kafkaブローカー）にアクセスし、データをプルし、処理して宛先のClickHouseサービスに取り込みます。

![ClickPipesレプリカ - ストリーミングClickPipes](images/external_clickpipes_pricing_faq_1.png)

オブジェクトストレージClickPipesの場合、ClickPipesレプリカはデータロードタスクを調整し（コピーするファイルの特定、状態の維持、パーティションの移動）、データはClickHouseサービスから直接取得されます。

![ClickPipesレプリカ - オブジェクトストレージClickPipes](images/external_clickpipes_pricing_faq_2.png)

### レプリカのデフォルト数とサイズは何ですか？ {#what-is-the-default-number-of-replicas-and-their-size}

各ClickPipeはデフォルトで1つのレプリカを持ち、2 GiBのRAMと0.5 vCPUが提供されます。これは**0.25** ClickHouseコンピューティングユニットに相当します（1ユニット = 8 GiB RAM、2 vCPU）。

### ClickPipesのレプリカはスケーリングできますか？ {#can-clickpipes-replicas-be-scaled}

現在、ストリーミング用のClickPipesのみが、各レプリカに**0.25** ClickHouseコンピューティングユニットの基本単位を追加することで水平スケーリングできます。また、特定のユースケースに応じて、レプリカごとにCPUやRAMを追加する垂直スケーリングもオンデマンドで利用可能です。

### どのくらいの数のClickPipesレプリカが必要ですか？ {#how-many-clickpipes-replicas-do-i-need}

これはワークロードのスループットとレイテンシ要件によって異なります。デフォルト値の1レプリカから始めてレイテンシを測定し、必要に応じてレプリカを追加することをお勧めします。Kafka ClickPipesの場合、Kafkaブローカーのパーティションも適切にスケールする必要があることに注意してください。スケーリングコントロールは、各ストリーミングClickPipeの「設定」内で使用可能です。

![ClickPipesレプリカ - どのくらいの数のClickPipesレプリカが必要ですか？](images/external_clickpipes_pricing_faq_3.png)

### ClickPipesの価格構造はどのようになっていますか？ {#what-does-the-clickpipes-pricing-structure-look-like}

価格構造は二つの次元で構成されています：
- **コンピュート**：単位あたりの時間料金  
  コンピュートは、ClickPipesレプリカポッドがデータを積極的に取り込んでいるかどうかにかかわらず、実行するためのコストを表します。すべてのClickPipesタイプに適用されます。
- **取り込まれたデータ**：GBあたりの価格  
  取り込まれたデータの料金は、レプリカポッドを介して転送されたすべてのストリーミングClickPipes（Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs）に適用されます。取り込まれたデータサイズ（GB）は、ソースから受信したバイト（圧縮または非圧縮）に基づいて料金が発生します。

### ClickPipesの公表価格は何ですか？ {#what-are-the-clickpipes-public-prices}

- コンピュート：\$0.20 単位あたり1時間（\$0.05 レプリカあたり1時間）
- 取り込まれたデータ：\$0.04 GBあたり

### 説明的な例ではどのように見えますか？ {#how-does-it-look-in-an-illustrative-example}

例えば、単一のレプリカ（0.25コンピュートユニット）を使用して、Kafkaコネクタで24時間で1TBのデータを取り込む場合、料金は次のようになります：

$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$

オブジェクトストレージコネクタ（S3およびGCS）の場合、ClickPipesポッドはデータを処理せず、単に転送を調整しているため、ClickPipesコンピュートコストのみが発生します：

$$
0.25 \times 0.20 \times 24 = \$1.2
$$

### 新しい価格モデルはいつから適用されますか？ {#when-does-the-new-pricing-model-take-effect}

新しい価格モデルは、2025年1月27日以降に作成されたすべての組織に対して適用されます。

### 現在のユーザーには何が起こりますか？ {#what-happens-to-current-users}

既存のユーザーには**60日間の猶予期間**があり、その間ClickPipesサービスは引き続き無料で提供されます。既存のユーザーに対するClickPipesの請求は、**2025年3月24日**に自動的に始まります。

### ClickPipesの価格は市場とどのように比較されますか？ {#how-does-clickpipes-pricing-compare-to-the-market}

ClickPipesの価格設定の理念は、プラットフォームの運営コストをカバーし、ClickHouse Cloudへのデータ移動を簡単かつ信頼性の高い方法で提供することです。この観点から、私たちの市場分析では、私たちのポジションは競争力があることが示されました。
