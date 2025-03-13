---
title: 新しい価格次元
slug: /cloud/manage/jan-2025-faq/pricing-dimensions
keywords: [新しい価格, 次元]
description: データ転送と ClickPipes の価格次元
---

import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';
import NetworkPricing from '@site/i18n/jp/docusaurus-plugin-content-docs/current/cloud/manage/_snippets/_network_transfer_rates.md';

新しい ClickHouse Cloud の価格設定に次の次元が追加されました。

:::note
データ転送および ClickPipes の価格は、2025年3月24日までは旧プラン（開発、製品、専用）には適用されません。
:::

## データ転送価格 {#data-transfer-pricing}

### ユーザーはどのようにデータ転送に対して課金され、組織のティアや地域によって異なりますか？ {#how-are-users-charged-for-data-transfer-and-will-this-vary-across-organization-tiers-and-regions}

- ユーザーは、公開インターネットのエグレスと地域間エグレスの2つの次元にわたってデータ転送の料金を支払います。地域内のデータ転送やプライベートリンク/プライベートサービス接続の使用およびデータ転送には課金されません。ただし、ユーザーへの適切な課金に影響を与える使用パターンが見られた場合は、追加のデータ転送料金次元を実施する権利を留保します。
- データ転送料金は、クラウドサービスプロバイダー (CSP) および地域によって異なります。
- データ転送料金は**組織のティア間で**異なることはありません。
- 公開エグレス価格は、発信元の地域のみを基にしています。地域間（またはクロス地域）価格は、発信元と宛先の両方の地域に依存します。

<NetworkPricing/>

### データ転送料金は、使用量が増えるにつれて段階的になりますか？ {#will-data-transfer-pricing-be-tiered-as-usage-increases}

データ転送料金は、使用量が増えても**段階的には**なりません。料金は、地域やクラウドサービスプロバイダーによって異なることに注意してください。

## ClickPipesの価格FAQ {#clickpipes-pricing-faq}

### なぜ今ClickPipesの価格モデルを導入するのですか？ {#why-are-we-introducing-a-pricing-model-for-clickpipes-now}

最初はユーザーのフィードバックを集め、機能を洗練させ、ニーズに合っていることを確認するために、ClickPipesを無料で提供することにしました。GAプラットフォームが成長し、数兆行のデータを移動させる中で時間の試練に耐えることができたため、価格モデルを導入することでサービスの改善、インフラの維持、専用サポートおよび新しいコネクタの提供を続けることが可能になります。

### ClickPipesのレプリカとは何ですか？ {#what-are-clickpipes-replicas}

ClickPipesは、ClickHouse Cloudサービスとは独立して実行およびスケールする専用インフラを介して、リモートデータソースからデータを取り込みます。そのため、専用のコンピュートレプリカを使用します。以下の図は、簡略化されたアーキテクチャを示しています。

ストリーミング ClickPipesの場合、ClickPipesレプリカはリモートデータソース（例：Kafkaブローカー）にアクセスし、データを引き出して処理し、宛先の ClickHouseサービスに取り込みます。

<img src={clickpipesPricingFaq1} alt="ClickPipesレプリカ - ストリーミング ClickPipes" />

オブジェクトストレージ ClickPipesの場合、ClickPipesレプリカはデータロードタスクを調整し（コピーするファイルの特定、状態の維持、パーティションの移動）、データは直接 ClickHouseサービスから引き出されます。

<img src={clickpipesPricingFaq2} alt="ClickPipesレプリカ - オブジェクトストレージ ClickPipes" />

### デフォルトのレプリカ数とそのサイズは何ですか？ {#what-is-the-default-number-of-replicas-and-their-size}

各 ClickPipe はデフォルトで1つのレプリカが提供され、2 GiBのRAMと0.5 vCPUを持っています。これは **0.25** ClickHouseコンピュートユニットに相当します（1ユニット = 8 GiB RAM、2 vCPUs）。

### ClickPipesレプリカはスケールできますか？ {#can-clickpipes-replicas-be-scaled}

現在、ストリーミングの ClickPipes のみが水平方向にスケール可能で、各レプリカには基本ユニットの **0.25** ClickHouseコンピュートユニットを追加できます。特定のユースケースに応じて、レプリカごとにCPUとRAMを増やす垂直スケーリングも利用可能です。

### どれくらいの ClickPipesレプリカが必要ですか？ {#how-many-clickpipes-replicas-do-i-need}

必要なレプリカ数は、ワークロードスループットとレイテンシ要件によって異なります。デフォルト値の1レプリカから始め、レイテンシを測定し、必要に応じてレプリカを追加することをお勧めします。Kafka ClickPipesの場合、Kafkaブローカーのパーティションもそれに応じてスケールする必要があることを忘れないでください。スケーリングコントロールは、各ストリーミング ClickPipe の “設定” の下にあります。

<img src={clickpipesPricingFaq3} alt="ClickPipesレプリカ - どれくらいのClickPipesレプリカが必要ですか？" />

### ClickPipesの価格構造はどのようになっていますか？ {#what-does-the-clickpipes-pricing-structure-look-like}

価格構造は2つの次元で構成されています：
- **コンピュート**: 単位あたりの時間ごとの価格
  コンピュートは、ClickPipesレプリカポッドを実行するコストを表し、データを積極的に取り込んでいるかどうかに関係ありません。すべての ClickPipesタイプに適用されます。
- **取り込まれたデータ**: GBあたりの価格
  取り込まれたデータレートは、すべてのストリーミング ClickPipes（Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs）に適用され、レプリカポッドを介して転送されたデータに基づいて課金されます。取り込まれたデータサイズ（GB）は、ソースから受信したバイト（圧縮または非圧縮）に基づいて請求されます。

### ClickPipesの公示価格は何ですか？ {#what-are-the-clickpipes-public-prices}

- コンピュート: \$0.20 / 単位 / 時間（\$0.05 / レプリカ / 時間）
- 取り込まれたデータ: \$0.04 / GB

### 具体的な例ではどのように見えますか？ {#how-does-it-look-in-an-illustrative-example}

たとえば、単一のレプリカ（0.25コンピュートユニット）を使用してKafkaコネクタで24時間にわたり1TBのデータを取り込む場合、コストは次のようになります：

$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$

オブジェクトストレージコネクタ（S3およびGCS）の場合、ClickPipesポッドはデータを処理せず、転送の調整のみを行うため、ClickPipesコンピュートコストのみが発生します。これは基盤の ClickHouseサービスによって操作されます：

$$
0.25 \times 0.20 \times 24 = \$1.2
$$

### 新しい価格モデルはいつ発効しますか？ {#when-does-the-new-pricing-model-take-effect}

新しい価格モデルは、2025年1月27日以降に作成されたすべての組織に適用されます。

### 現在のユーザーには何が起こりますか？ {#what-happens-to-current-users}

既存のユーザーには、ClickPipesサービスが無料で提供される**60日間の猶予期間**があります。2025年3月24日から、既存のユーザーの ClickPipesに自動的に請求が開始されます。

### ClickPipesの価格は市場と比べてどうですか？ {#how-does-clickpipes-pricing-compare-to-the-market}

ClickPipesの価格設定の哲学は、プラットフォームの運用コストをカバーしつつ、ClickHouse Cloudにデータを簡単かつ信頼性高く移動する方法を提供することです。その観点から、私たちの市場分析では、我々が競争力のある位置にいることが明らかになりました。
