---
title: 'New Pricing Dimensions'
slug: '/cloud/manage/jan-2025-faq/pricing-dimensions'
keywords:
- 'new pricing'
- 'dimensions'
description: 'Pricing dimensions for data transfer and ClickPipes'
---

import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';
import NetworkPricing from '@site/i18n/jp/docusaurus-plugin-content-docs/current/cloud/manage/_snippets/_network_transfer_rates.md';

以下の次元が新しい ClickHouse Cloud の料金に追加されました。

:::note
データ転送および ClickPipes の料金は、2025年3月24日まではレガシープラン（開発、プロダクション、および専用）には適用されません。
:::

## データ転送料金 {#data-transfer-pricing}

### ユーザーはどのようにデータ転送の料金を支払い、これは組織のティアや地域によって異なりますか？ {#how-are-users-charged-for-data-transfer-and-will-this-vary-across-organization-tiers-and-regions}

- ユーザーはデータ転送に対して、パブリックインターネットの出口および地域間の出口の2つの次元に沿って料金を支払います。地域内のデータ転送やプライベートリンク/プライベートサービスコネクトの使用とデータ転送に対しては料金は発生しません。ただし、ユーザーに適切に料金を請求する能力に影響を与える使用パターンを確認した場合、追加のデータ転送料金の次元を実装する権利を留保します。
- データ転送料金は、クラウドサービスプロバイダー（CSP）および地域によって異なります。
- データ転送料金は**組織のティアの間では**異ならないでしょう。
- パブリック出口の料金は、発信地域のみに基づいています。地域間（またはクロスリージョン）の料金は、発信地域および宛先地域の両方に依存します。

<NetworkPricing/>

### データ転送料金は使用量の増加に伴って段階的になりますか？ {#will-data-transfer-pricing-be-tiered-as-usage-increases}

データ転送の料金は使用量の増加に伴って**段階的にはなりません**。料金は地域やクラウドサービスプロバイダーによって異なることに注意してください。

## ClickPipes 料金 FAQ {#clickpipes-pricing-faq}

### なぜ今 ClickPipes の料金モデルを導入するのですか？ {#why-are-we-introducing-a-pricing-model-for-clickpipes-now}

最初は ClickPipes を無料で起動することを決定し、フィードバックを収集し、機能を洗練し、ユーザーのニーズを満たすことを目的としています。GA プラットフォームが成長し、何兆行ものデータを処理する中で効果的にテストをクリアしたため、料金モデルを導入することでサービスの改善を続け、インフラを維持し、専用サポートと新しいコネクタを提供することが可能になります。

### ClickPipes のレプリカとは何ですか？ {#what-are-clickpipes-replicas}

ClickPipes は、ClickHouse Cloud サービスとは独立して実行され、スケールする専用のインフラを介してリモートデータソースからデータを取り込みます。この理由から、専用のコンピュートレプリカを使用します。以下の図は、簡略化されたアーキテクチャを示しています。

ストリーミング ClickPipes の場合、ClickPipes のレプリカはリモートデータソース（例えば、Kafka ブローカー）にアクセスし、データを取り込み、処理して宛先 ClickHouse サービスに取り込みます。

<Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes Replicas - Streaming ClickPipes" border/>

オブジェクトストレージ ClickPipes の場合、ClickPipes のレプリカはデータロードタスクをオーケストレーションします（コピーするファイルを特定し、状態を維持し、パーティションを移動）し、データは ClickHouse サービスから直接取り込まれます。

<Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes Replicas - Object Storage ClickPipes" border/>

### レプリカのデフォルト数とそのサイズは何ですか？ {#what-is-the-default-number-of-replicas-and-their-size}

各 ClickPipe は、2 GiB の RAM と 0.5 vCPU が提供される 1 レプリカがデフォルトです。これは、**0.25** ClickHouse コンピュートユニット（1 ユニット = 8 GiB RAM、2 vCPU）に相当します。

### ClickPipes のレプリカをスケールできますか？ {#can-clickpipes-replicas-be-scaled}

現在、ストリーミング用の ClickPipes のみが、基本ユニットとして **0.25** ClickHouse コンピュートユニットを持つ複数のレプリカを追加することで水平にスケール可能です。特定のユースケースに応じて垂直スケーリングも利用可能です（レプリカごとにもっと多くの CPU と RAM を追加）。

### どれだけの ClickPipes レプリカが必要ですか？ {#how-many-clickpipes-replicas-do-i-need}

これは、ワークロードのスループットとレイテンシ要件によって異なります。デフォルトで 1 レプリカから始め、レイテンシを測定し、必要に応じてレプリカを追加することをお勧めします。Kafka ClickPipes の場合、Kafka ブローカーのパーティションもそれに応じてスケールする必要があります。スケーリングコントロールは、各ストリーミング ClickPipe の「設定」の下にあります。

<Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes Replicas - How many ClickPipes replicas do I need?" border/>

### ClickPipes の料金構造はどのようになっていますか？ {#what-does-the-clickpipes-pricing-structure-look-like}

料金は2つの次元で構成されています：
- **コンピュート**：ユニットあたりの時間単価
  コンピュートは、ClickPipes レプリカポッドがデータを積極的に取り込むかどうかに関わらず、実行コストを表します。すべての ClickPipes タイプに適用されます。
- **取り込まれたデータ**：GB あたりの料金
  取り込まれたデータレートは、すべてのストリーミング ClickPipes（Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs）に適用され、レプリカポッドを介して転送されたデータに対して適用されます。取り込まれたデータサイズ（GB）は、ソースから受信したバイトに基づいて請求されます（非圧縮または圧縮）。

### ClickPipes の公開料金は何ですか？ {#what-are-the-clickpipes-public-prices}

- コンピュート：\$0.20 per unit per hour（\$0.05 per replica per hour）
- 取り込まれたデータ：\$0.04 per GB

### イラスト例での例はどのようになりますか？ {#how-does-it-look-in-an-illustrative-example}

例えば、1 TB のデータを 24 時間の間、単一のレプリカ（0.25 コンピュートユニット）を使用して Kafka コネクタ経由で取り込む場合、費用は以下のようになります：

$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$
<br/>

オブジェクトストレージコネクタ（S3 と GCS）の場合、ClickPipes ポッドはデータを処理することはなく、転送をオーケストレーションしているだけであるため、ClickPipes のコンピュートコストのみが発生します：

$$
0.25 \times 0.20 \times 24 = \$1.2
$$

### 新しい料金モデルはいつ発効しますか？ {#when-does-the-new-pricing-model-take-effect}

新しい料金モデルは、2025年1月27日以降に作成されたすべての組織に適用されます。

### 現在のユーザーにはどうなりますか？ {#what-happens-to-current-users}

既存のユーザーには、ClickPipes サービスが引き続き無料で提供される **60日間の猶予期間** が設けられます。既存のユーザーへの ClickPipes の請求は **2025年3月24日** に自動的に開始されます。

### ClickPipes の料金は市場とどのように比較されますか？ {#how-does-clickpipes-pricing-compare-to-the-market}

ClickPipes の料金の背後にある哲学は、プラットフォームの運営コストをカバーし、ClickHouse Cloud へのデータ移動を簡単かつ信頼性の高い方法で提供することです。この観点から、我々の市場分析では競争力のある位置にあることが明らかになりました。
