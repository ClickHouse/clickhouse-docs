---
title: '新しい料金ディメンション'
slug: /cloud/manage/jan-2025-faq/pricing-dimensions
keywords: ['新しい料金', 'ディメンション']
description: 'データ転送および ClickPipes の料金ディメンション'
---

import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';
import NetworkPricing from '@site/docs/cloud/manage/_snippets/_network_transfer_rates.md';


新しい ClickHouse Cloud 料金に以下のディメンションが追加されました。

:::note
データ転送と ClickPipes の料金は、2025年3月24日まで、レガシープラン（開発、プロダクション、専用）には適用されません。
:::

## データ転送料金 {#data-transfer-pricing}

### ユーザーはどのようにデータ転送料金を支払うのか、またこれは組織のティアや地域によって異なるのか？ {#how-are-users-charged-for-data-transfer-and-will-this-vary-across-organization-tiers-and-regions}

- ユーザーはデータ転送を 2 つのディメンション（公共インターネットエグレスおよび地域間エグレス）に沿って支払います。地域間データ転送やプライベートリンク/プライベートサービス接続の利用に対する料金はありません。ただし、ユーザーに適切に料金を請求する能力に影響を与える使用パターンが見られた場合、追加のデータ転送料金ディメンションを実施する権利を留保します。
- データ転送料金は、クラウドサービスプロバイダー (CSP) および地域によって異なります。
- データ転送料金は、組織のティア間で **は** 異なりません。
- 公共エグレス料金は、発信地域のみに基づいています。地域間（またはクロス地域）料金は、発信地域と宛先地域の両方に依存します。

<NetworkPricing/>

### データ転送料金は利用の増加に伴い階層型になるのか？ {#will-data-transfer-pricing-be-tiered-as-usage-increases}

データ転送料金は **利用の増加に伴い階層型にはなりません**。料金は地域およびクラウドサービスプロバイダーによって異なることに注意してください。

## ClickPipes 料金 FAQ {#clickpipes-pricing-faq}

### なぜ今 ClickPipes の料金モデルを導入するのか？ {#why-are-we-introducing-a-pricing-model-for-clickpipes-now}

当初、フィードバックを収集し、機能を洗練させ、ユーザーのニーズに合致させるために ClickPipes を無料で提供することに決めました。GA プラットフォームが成長し、数兆行を処理しても耐えられることが証明された後、料金モデルを導入することで、サービスの向上、インフラの維持、専用サポートや新しいコネクタの提供を継続できるようにします。

### ClickPipes レプリカとは何ですか？ {#what-are-clickpipes-replicas}

ClickPipes は、ClickHouse Cloud サービスから独立して実行され、スケールする専用のインフラを介して、リモートデータソースからデータを取り込むものです。このため、専用の計算レプリカを使用します。以下の図は、簡略化されたアーキテクチャを示しています。

ストリーミング ClickPipes の場合、ClickPipes レプリカはリモートデータソース（例：Kafka ブローカー）にアクセスし、データを取得して処理し、宛先の ClickHouse サービスに取り込みます。

<Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes レプリカ - ストリーミング ClickPipes" border/>

オブジェクトストレージ ClickPipes の場合、ClickPipes レプリカはデータローディングタスクを調整します（コピーするファイルの特定、状態の維持、パーティションの移動など）。データは ClickHouse サービスから直接取得されます。

<Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes レプリカ - オブジェクトストレージ ClickPipes" border/>

### レプリカのデフォルト数とそのサイズは？ {#what-is-the-default-number-of-replicas-and-their-size}

各 ClickPipe はデフォルトで 1 つのレプリカを持ち、2 GiB のRAMと 0.5 vCPU が提供されます。これは **0.25** ClickHouse 計算ユニットに相当します（1 ユニット = 8 GiB RAM、2 vCPUs）。

### ClickPipes レプリカはスケール可能ですか？ {#can-clickpipes-replicas-be-scaled}

現在、ストリーミング用の ClickPipes だけが水平方向にスケール可能であり、各レプリカに **0.25** ClickHouse 計算ユニットの基本ユニットを追加することができます。特定のユースケースに対しては、レプリカごとの CPU および RAM を追加することで垂直スケーリングも利用可能です。

### どれくらいの数の ClickPipes レプリカが必要ですか？ {#how-many-clickpipes-replicas-do-i-need}

これは、ワークロードのスループットとレイテンシ要件によります。デフォルト値の 1 レプリカから始まり、レイテンシを測定して必要に応じてレプリカを追加することをお勧めします。Kafka ClickPipesの場合、Kafka ブローカーのパーティションもそれに応じてスケールする必要があることに注意してください。スケーリング制御は、各ストリーミング ClickPipe の「設定」の下にあります。

<Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes レプリカ - どれくらいの数の ClickPipes レプリカが必要ですか？" border/>

### ClickPipes の料金構造はどのようになっていますか？ {#what-does-the-clickpipes-pricing-structure-look-like}

これは 2 つのディメンションから成り立っています：
- **計算**：単位あたりの料金（時間）
  計算は、ClickPipes レプリカポッドがデータを積極的に取り込んでいるかどうかに関わらず、実行経費を示します。これはすべての ClickPipes タイプに適用されます。
- **取り込まれたデータ**：GB あたりの料金
  取り込まれたデータ料金は、すべてのストリーミング ClickPipes（Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs）に適用され、レプリカポッドを介して転送されたデータに適用されます。取り込まれたデータサイズ（GB）は、ソースから受信したバイト数（圧縮または非圧縮）に基づいて課金されます。

### ClickPipes の公共価格は？ {#what-are-the-clickpipes-public-prices}

- 計算：\$0.20 / 単位 / 時間（\$0.05 / レプリカ / 時間）
- 取り込まれたデータ：\$0.04 / GB

### 具体例ではどうなりますか？ {#how-does-it-look-in-an-illustrative-example}

例えば、1TBのデータを24時間かけてKafkaコネクタを使用して単一のレプリカ（0.25 計算ユニット）で取り込む場合、費用は次のようになります：

$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$
<br/>

オブジェクトストレージコネクタ（S3およびGCS）の場合、ClickPipes ポッドはデータを処理するのではなく、転送を調整するだけなので、ClickPipes 計算コストのみが発生します。これは基盤の ClickHouse サービスによって運営されます：

$$
0.25 \times 0,20 \times 24 = \$1.2
$$

### 新しい料金モデルはいつ施行されますか？ {#when-does-the-new-pricing-model-take-effect}

新しい料金モデルは、2025年1月27日以降に作成されたすべての組織に対して施行されます。

### 現在のユーザーには何が起こりますか？ {#what-happens-to-current-users}

既存のユーザーは **60日間の猶予期間** があり、その間ClickPipes サービスは引き続き無料で提供されます。既存ユーザーの ClickPipes については、 **2025年3月24日** に自動的に請求が開始されます。

### ClickPipes の料金は市場とどう比較されますか？ {#how-does-clickpipes-pricing-compare-to-the-market}

ClickPipes の料金の哲学は、プラットフォームの運営コストをカバーしながら、ClickHouse Cloud にデータを移動するための簡単で信頼性の高い方法を提供することです。この観点から、私たちの市場分析によって、競争力のある位置にあることが明らかになりました。
