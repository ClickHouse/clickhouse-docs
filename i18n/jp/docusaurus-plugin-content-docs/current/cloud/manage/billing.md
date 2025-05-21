---
sidebar_label: '概要'
slug: /cloud/manage/billing/overview
title: '価格'
description: 'ClickHouse Cloudの価格に関する概要ページ'
---

価格情報については、[ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator)ページを参照してください。
ClickHouse Cloudは、コンピュートやストレージの使用量に基づき、[データ転送](/cloud/manage/network-data-transfer)（インターネット経由及びクロスリージョン）、および[ClickPipes](/integrations/clickpipes)を請求します。
請求に影響を与える要因や、支出を管理する方法について理解するために、読み進めてください。

## Amazon Web Services (AWS) の例 {#amazon-web-services-aws-example}

:::note
- 価格はAWS us-east-1の価格を反映しています。
- 該当するデータ転送とClickPipesの料金については、[こちら](jan2025_faq/dimensions.md)を参照してください。
:::

### Basic: 月額66.52ドルから {#basic-from-6652-per-month}

最適な用途: 硬い信頼性保証がない小規模データボリュームを持つ部門での使用ケース。

**Basicレベルのサービス**
- 1レプリカ x 8 GiB RAM, 2 vCPU
- 500 GBの圧縮データ
- 500 GBのデータバックアップ
- 10 GBの公共インターネットのデータ転送
- 5 GBのクロスリージョンデータ転送

この例の価格内訳：

<table><thead>
  <tr>
    <th></th>
    <th>1日あたり6時間の稼働</th>
    <th>1日あたり12時間の稼働</th>
    <th>1日あたり24時間の稼働</th>
  </tr></thead>
<tbody>
  <tr>
    <td>コンピュート</td>
    <td>\$39.91</td>
    <td>\$79.83</td>
    <td>\$159.66</td>
  </tr>
  <tr>
    <td>ストレージ</td>
    <td>\$25.30</td>
    <td>\$25.30</td>
    <td>\$25.30</td>
  </tr>
  <tr>
    <td>公共インターネットのデータ転送</td>
    <td>\$1.15</td>
    <td>\$1.15</td>
    <td>\$1.15</td>
  </tr>
  <tr>
    <td>クロスリージョンデータ転送</td>
    <td>\$0.16</td>
    <td>\$0.16</td>
    <td>\$0.16</td>
  </tr>
  <tr>
    <td>合計</td>
    <td>\$66.52</td>
    <td>\$106.44</td>
    <td>\$186.27</td>
  </tr>
</tbody>
</table>

### Scale (常時稼働、自動スケーリング): 月額499.38ドルから {#scale-always-on-auto-scaling-from-49938-per-month}

最適な用途: 拡張性、強化されたSLA（2つ以上のレプリカサービス）および高度なセキュリティを必要とするワークロード。

**Scaleレベルのサービス**
- アクティブワークロード ~100% 時間
- 自動スケーリングの最大設定が可能で、請求の過剰を防ぎます
- 100 GBの公共インターネットのデータ転送
- 10 GBのクロスリージョンデータ転送

この例の価格内訳：

<table><thead>
  <tr>
    <th></th>
    <th>例1</th>
    <th>例2</th>
    <th>例3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>コンピュート</td>
    <td>2レプリカ x 8 GiB RAM, 2 vCPU<br></br>\$436.95</td>
    <td>2レプリカ x 16 GiB RAM, 4 vCPU<br></br>\$873.89</td>
    <td>3レプリカ x 16 GiB RAM, 4 vCPU<br></br>\$1,310.84</td>
  </tr>
  <tr>
    <td>ストレージ</td>
    <td>1TBのデータ + 1バックアップ<br></br>\$50.60</td>
    <td>2TBのデータ + 1バックアップ<br></br>\$101.20</td>
    <td>3TBのデータ + 1バックアップ<br></br>\$151.80</td>
  </tr>
  <tr>
    <td>公共インターネットのデータ転送</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
  </tr>
  <tr>
    <td>クロスリージョンデータ転送</td>
    <td>\$0.31</td>
    <td>\$0.31</td>
    <td>\$0.31</td>
  </tr>
  <tr>
    <td>合計</td>
    <td>\$499.38</td>
    <td>\$986.92</td>
    <td>\$1,474.47</td>
  </tr>
</tbody>
</table>

### Enterprise: 初期価格は様々 {#enterprise-starting-prices-vary}

最適な用途: 厳しいセキュリティとコンプライアンスニーズを持つ大規模、ミッションクリティカルなデプロイメント。

**Enterpriseレベルのサービス**
- アクティブワークロード ~100% 時間
- 1 TBの公共インターネットのデータ転送
- 500 GBのクロスリージョンデータ転送

<table><thead>
  <tr>
    <th></th>
    <th>例1</th>
    <th>例2</th>
    <th>例3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>コンピュート</td>
    <td>2レプリカ x 32 GiB RAM, 8 vCPU<br></br>\$2,285.60</td>
    <td>2レプリカ x 64 GiB RAM, 16 vCPU<br></br>\$4,571.19</td>
    <td>2 x 120 GiB RAM, 30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>ストレージ</td>
    <td>5TB + 1バックアップ<br></br>\$253.00</td>
    <td>10TB + 1バックアップ<br></br>\$506.00</td>
    <td>20TB + 1バックアップ<br></br>\$1,012.00</td>
  </tr>
  <tr>
    <td>公共インターネットのデータ転送</td>
    <td>\$115.20</td>
    <td>\$115.20</td>
    <td>\$115.20</td>
  </tr>
  <tr>
    <td>クロスリージョンデータ転送</td>
    <td>\$15.60</td>
    <td>\$15.60</td>
    <td>\$15.60</td>
  </tr>
  <tr>
    <td>合計</td>
    <td>\$2,669.40</td>
    <td>\$5,207.99</td>
    <td>\$9,713.79</td>
  </tr>
</tbody>
</table>

## よくある質問 (FAQs) {#faqs}

### コンピュートはどのように課金されますか？ {#how-is-compute-metered}

ClickHouse Cloudは、コンピュートを1分単位で、8G RAMの増分で課金します。
コンピュートコストは、ティア、地域、およびクラウドサービスプロバイダーによって異なります。

### ディスク上のストレージはどのように計算されますか？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloudはクラウドオブジェクトストレージを使用し、使用量はClickHouseテーブルに保存されたデータの圧縮サイズに基づいて測定されます。
ストレージコストは、ティア間で同じであり、地域およびクラウドサービスプロバイダーによって異なります。

### バックアップは合計ストレージにカウントされますか？ {#do-backups-count-toward-total-storage}

ストレージとバックアップはストレージコストにカウントされ、別々に請求されます。
すべてのサービスはデフォルトで1つのバックアップが保持され、1日保管されます。
追加のバックアップが必要なユーザーは、Cloud Consoleの設定タブから追加の[バックアップ](backups/overview.md)を構成できます。

### 圧縮をどのように推定しますか？ {#how-do-i-estimate-compression}

圧縮はデータセットによって大きく異なる場合があります。
データがどれだけ圧縮可能か（高い対低いカーディナリティフィールドの数）によって依存し、
ユーザーがスキーマを設定する方法（オプションコーデックを使用するかどうかなど）によります。
一般的な分析データの圧縮率は約10倍です。しかし、圧縮率が大幅に低下したり、上昇するケースもあります。
詳しくは、[最適化に関するドキュメント](/optimize/asynchronous-inserts)を参照し、詳しいログ使用事例に関してはこの[Uberブログ](https://www.uber.com/blog/logging/)をチェックしてください。
正確に知るための唯一の実用的な方法は、自分のデータセットをClickHouseに取り込み、データセットのサイズとClickHouseに保存されたサイズを比較することです。

以下のクエリを使用できます：

```sql title="圧縮の推定"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### セルフマネージドデプロイメントがある場合に、ClickHouseがクラウドでサービスを運用するコストを推定するためのツールは何ですか？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouseのクエリログは、ClickHouse Cloudでワークロードのコストを推定するために使用できる[主要なメトリクス](/operations/system-tables/query_log)をキャプチャします。
セルフマネージドからClickHouse Cloudへの移行の詳細については、[移行に関するドキュメント](/cloud/migration/clickhouse-to-cloud)を参照し、さらなる質問がある場合は、[ClickHouse Cloudサポート](https://console.clickhouse.cloud/support)にお問い合わせください。

### ClickHouse Cloudの請求オプションにはどのようなものがありますか？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloudは以下の請求オプションをサポートしています：

- セルフサービスの毎月（USD、クレジットカード経由）。
- 直接販売の年間/複数年（前払いの「ClickHouse Credits」を通じて、USD、追加の支払いオプション）。
- AWS、GCP、およびAzureのマーケットプレイスを介して（従量課金（PAYG）またはClickHouse Cloudとの契約を結ぶ）。

### 請求サイクルはどのくらいですか？ {#how-long-is-the-billing-cycle}

請求は月次の請求サイクルに従い、開始日はClickHouse Cloud組織の作成日として追跡されます。

### ScaleおよびEnterpriseサービスのコストを管理するためにClickHouse Cloudはどのような管理機能を提供していますか？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- トライアルおよび年次契約の顧客は、消費が特定の閾値（`50%`, `75%`, `90%`）に達した際に、自動的にメール通知が送信されます。これにより、ユーザーは使用量を積極的に管理できます。
- ClickHouse Cloudでは、[高度なスケーリング制御](/manage/scaling)を通じてコンピュートの最大自動スケーリング制限を設定できます。これは分析ワークロードにとって重要なコスト要因です。
- [高度なスケーリング制御](/manage/scaling)では、非アクティブ時の動作を制御するオプションを用いてメモリ制限を設定できます。

### Basicサービスのコストを管理するためにClickHouse Cloudはどのような管理機能を提供していますか？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高度なスケーリング制御](/manage/scaling)により、非アクティブ時の動作を制御できます。Basicサービスのメモリ割り当ての調整はサポートされていません。
- デフォルト設定では、非アクティブな状態が続いた後にサービスが一時停止します。

### 複数のサービスがある場合、サービスごとの請求書を受け取るのか、統合請求書を受け取るのか？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

請求期間中に特定の組織内のすべてのサービスについての統合請求書が生成されます。

### トライアル期間やクレジットが失効する前にクレジットカードを追加してアップグレードした場合、請求されますか？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

ユーザーがトライアル期間が終了する前に、有効なトライアルクレジットがある状態でトライアルから有料に移行すると、初めの30日間のトライアル期間中はトライアルクレジットから継続的に引き落とし、トライアル期間終了後にクレジットカードが請求されます。

### 自分の支出をどのように追跡できますか？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloudコンソールには、サービスごとの使用状況を詳細に表示するUsageの表示が用意されています。この内訳は、使用量の次元に基づいて整理されており、各課金単位に関連するコストを理解するのに役立ちます。

### ClickHouse Cloudサービスへのマーケットプレイスサブスクリプションの請求書にはどのようにアクセスできますか？ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

すべてのマーケットプレイスサブスクリプションは、マーケットプレイスによって請求および請求書が発行されます。請求書はそれぞれのクラウドプロバイダーのマーケットプレイスで直接確認できます。

### 使用状況明細書の日付とマーケットプレイス請求書の日付が一致しないのはなぜですか？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS Marketplaceの請求はカレンダーの月サイクルに従います。
例えば、2024年12月1日から2025年1月1日までの使用について、
請求書は2025年1月3日から5日の間に発行されます。

ClickHouse Cloudの使用状況明細書は、契約日から始まる30日間の課金サイクルで料金が課金されます。

これらの日付が異なる場合、使用状況と請求書の日付が異なる可能性があります。使用状況明細書は、特定のサービスの1日あたりの使用量を追跡するため、ユーザーはコストの詳細を確認するために明細書を活用できます。

### 前払いクレジットの使用に関する制限はありますか？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloudの前払いクレジット（直接ClickHouseを通じて、またはクラウドプロバイダーのマーケットプレイスを通じて）は、
契約の条件に対してのみ活用できます。
これは、受諾日に適用することができ、将来の日付で適用することはできますが、過去の期間に対しては適用できません。
前払いクレジットでカバーされない超過分は、クレジットカードの支払いまたはマーケットプレイスの月次請求でカバーされる必要があります。

### クラウドプロバイダーのマーケットプレイスを通じて支払う場合とClickHouseに直接支払う場合で、ClickHouse Cloudの価格に違いはありますか？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

マーケットプレイス請求とClickHouseとの直接契約の間には、価格の違いはありません。
いずれの場合でも、ClickHouse Cloudの使用はClickHouse Cloud Credits（CHC）で追跡されます。
すべての使用量は同様の方法で測定され、請求されます。

### コンピュートとコンピュート分離はどのように課金されますか？ {#how-is-compute-compute-separation-billed}

既存のサービスに加えてサービスを作成する際、 
新しいサービスが既存のものと同じデータを共有するかどうかを選択できます。 
共有する場合、これら2つのサービスは現在[倉庫](../reference/warehouses.md)を形成します。 
倉庫には、データが1回だけ保存され、複数のコンピュートサービスがこのデータにアクセスします。

データは1回のみ保存されるため、データに対して1つのコピーの費用を支払うだけで済み、複数のサービスがそれにアクセスします。 
コンピュートに関しては、通常通り請求されます — コンピュートとコンピュート分離/倉庫に対する追加料金はありません。
このデプロイメントで共有ストレージを活用することにより、ユーザーはストレージおよびバックアップの両方でコスト削減を享受します。

コンピュートとコンピュート分離により、場合によってはかなりのClickHouse Creditsを節約できる可能性があります。 
良い例は以下のセットアップです：

1. 24時間365日稼働しているETLジョブがあり、サービスにデータを取り込んでいます。これらのETLジョブは、それほど多くのメモリを必要としないため、例えば32 GiBのRAMを搭載した小さなインスタンスで実行できます。

2. 同じチームのデータサイエンティストが、かなりのメモリ - 236 GiBを必要とするクエリを実行したいと言っています。ただし、高い可用性は必要なく、最初の実行が失敗した場合でも、待って再実行できます。

この例では、データベースの管理者として以下のことができます：

1. 2つのレプリカそれぞれ16 GiBを持つ小さなサービスを作成する - これによりETLジョブを満たし、高い可用性を提供します。

2. データサイエンティスト用に、236 GiBの1レプリカを持つ同じ倉庫内に2つ目のサービスを作成します。このサービスでアイドル状態を有効にすると、データサイエンティストが使用していないときにこのサービスに対して支払う必要がなくなります。

この例での**Scale Tier**でのコスト推定（月額）：
- 親サービスは1日24時間稼働: 2レプリカ x 16 GiB 4 vCPU（各レプリカ）
- 子サービス: 1レプリカ x 236 GiB 59 vCPU（各レプリカ）
- 3 TBの圧縮データ + 1バックアップ
- 100 GBの公共インターネットのデータ転送
- 50 GBのクロスリージョンデータ転送

<table class="nowrap-header"><thead>
  <tr>
    <th></th>
    <th><span>子サービス</span><br/><span>1日1時間稼働</span></th>
    <th><span>子サービス</span><br/><span>1日2時間稼働</span></th>
    <th><span>子サービス</span><br/><span>1日4時間稼働</span></th>
  </tr></thead>
<tbody>
  <tr>
    <td>コンピュート</td>
    <td>\$1,142.43</td>
    <td>\$1,410.97</td>
    <td>\$1,948.05</td>
  </tr>
  <tr>
    <td>ストレージ</td>
    <td>\$151.80</td>
    <td>\$151.80</td>
    <td>\$151.80</td>
  </tr>
  <tr>
    <td>公共インターネットのデータ転送</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
  </tr>
  <tr>
    <td>クロスリージョンデータ転送</td>
    <td>\$1.56</td>
    <td>\$1.56</td>
    <td>\$1.56</td>
  </tr>
  <tr>
    <td>合計</td>
    <td>\$1,307.31</td>
    <td>\$1,575.85</td>
    <td>\$2,112.93</td>
  </tr>
</tbody>
</table>

倉庫がない場合、データエンジニアがクエリに必要なメモリ量に対して支払う必要があります。
しかし、2つのサービスを倉庫にまとめて一方をアイドル状態にすることで、コストを削減できます。

## ClickPipesの価格設定 {#clickpipes-pricing}

### ClickPipesの価格構造はどのようになっていますか？ {#what-does-the-clickpipes-pricing-structure-look-like}

2つの次元から構成されています。

- **コンピュート**: 単位あたりの価格（時間）
    コンピュートは、ClickPipesレプリカポッドがデータを積極的に取り込んでいるかどうかに関わらず、ClickPipesレプリカポッドを稼働させるためのコストを表します。
    これはすべてのClickPipesタイプに適用されます。
- **取り込まれたデータ**: GBあたりの価格
    取り込まれたデータ料金は、すべてのストリーミングClickPipes 
    （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs）に適用されます。データはレプリカポッドを介して転送されます。取り込まれたデータサイズ（GB）は、ソースから受け取ったバイト（圧縮されていないか圧縮されたかに関わらず）に基づいて請求されます。

### ClickPipesレプリカとは何ですか？ {#what-are-clickpipes-replicas}

ClickPipesは、専用のインフラストラクチャを介してリモートデータソースからデータを取り込みます。
このインフラストラクチャは、ClickHouse Cloudサービスとは独立して実行され、スケーリングされます。
そのため、専用コンピュートレプリカを使用します。

### レプリカのデフォルトの数とサイズは何ですか？ {#what-is-the-default-number-of-replicas-and-their-size}

各ClickPipeのデフォルトは、2 GiBのRAMと0.5 vCPUを装備した1レプリカです。
これは、**0.25** ClickHouseコンピュートユニットに相当します（1ユニット = 8 GiB RAM、2 vCPU）。

### ClickPipesの公共価格は何ですか？ {#what-are-the-clickpipes-public-prices}

- コンピュート: \$0.20（単位あたり、時間）
- 取り込まれたデータ: \$0.04（GBあたり）

### 例を示すとどのようになりますか？ {#how-does-it-look-in-an-illustrative-example}

以下の例は、特に言及されない限り、単一のレプリカを前提としています。

<table><thead>
  <tr>
    <th></th>
    <th>24時間で100 GB</th>
    <th>24時間で1 TB</th>
    <th>24時間で10 TB</th>
  </tr></thead>
<tbody>
  <tr>
    <td>ストリーミングClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>4レプリカの場合: <br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>オブジェクトストレージClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _ClickPipesのコンピュートはオーケストレーションのためだけに使用され 
実際のデータ転送は基盤となるClickHouseサービスによるものと見なされます_
