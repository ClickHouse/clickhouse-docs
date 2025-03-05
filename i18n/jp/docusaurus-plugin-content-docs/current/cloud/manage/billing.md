---
sidebar_label: 概要
slug: /cloud/manage/billing/overview
title: 価格
---

価格情報については、[ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) ページをご覧ください。
ClickHouse Cloud は、コンピュート、ストレージ、[データ転送](/cloud/manage/network-data-transfer)（インターネット経由のエグレスおよびリージョン間）、および [ClickPipes](/integrations/clickpipes) の使用に基づいて請求されます。
請求に影響を与える要因や支出を管理する方法について理解するためには、引き続きお読みください。

## Amazon Web Services (AWS) の例 {#amazon-web-services-aws-example}

:::note
- 価格は AWS us-east-1 の価格を反映しています。
- 該当するデータ転送および ClickPipes の料金については、[こちら](jan2025_faq/dimensions.md) をご覧ください。
:::

### 基本プラン: 月額 $66.52 から {#basic-from-6652-per-month}

最適なケース: 厳しい信頼性保証が不要な小規模データ量の部門利用。

**基本プランサービス**
- 1 レプリカ x 8 GiB RAM, 2 vCPU
- 500 GB の圧縮データ
- 500 GB のデータバックアップ
- 10 GB のパブリックインターネットエグレスデータ転送
- 5 GB のリージョン間データ転送

この例の料金内訳:

<table><thead>
  <tr>
    <th></th>
    <th>1日6時間稼働</th>
    <th>1日12時間稼働</th>
    <th>1日24時間稼働</th>
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
    <td>パブリックインターネットエグレスデータ転送</td>
    <td>\$1.15</td>
    <td>\$1.15</td>
    <td>\$1.15</td>
  </tr>
  <tr>
    <td>リージョン間データ転送</td>
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

### スケール（常時稼働、自動スケーリング）: 月額 $499.38 から {#scale-always-on-auto-scaling-from-49938-per-month}

最適なケース: 強化された SLA（2 つ以上のレプリカサービス）、スケーラビリティ、高度なセキュリティを必要とするワークロード。

**スケールプランサービス**
- アクティブワークロード ~100% の時間
- 自動スケーリングの最大設定可能
- 100 GB のパブリックインターネットエグレスデータ転送
- 10 GB のリージョン間データ転送

この例の料金内訳:

<table><thead>
  <tr>
    <th></th>
    <th>例 1</th>
    <th>例 2</th>
    <th>例 3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>コンピュート</td>
    <td>2 レプリカ x 8 GiB RAM, 2 vCPU<br></br>\$436.95</td>
    <td>2 レプリカ x 16 GiB RAM, 4 vCPU<br></br>\$873.89</td>
    <td>3 レプリカ x 16 GiB RAM, 4 vCPU<br></br>\$1,310.84</td>
  </tr>
  <tr>
    <td>ストレージ</td>
    <td>1TB のデータ + 1 バックアップ<br></br>\$50.60</td>
    <td>2TB のデータ + 1 バックアップ<br></br>\$101.20</td>
    <td>3TB のデータ + 1 バックアップ<br></br>\$151.80</td>
  </tr>
  <tr>
    <td>パブリックインターネットエグレスデータ転送</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
  </tr>
  <tr>
    <td>リージョン間データ転送</td>
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

### エンタープライズ: 価格は変動します {#enterprise-starting-prices-vary}

最適なケース: 大規模なミッションクリティカルなデプロイメントで、厳格なセキュリティおよびコンプライアンス要件がある。

**エンタープライズプランサービス**
- アクティブワークロード ~100% の時間
- 1 TB のパブリックインターネットエグレスデータ転送
- 500 GB のリージョン間データ転送

<table><thead>
  <tr>
    <th></th>
    <th>例 1</th>
    <th>例 2</th>
    <th>例 3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>コンピュート</td>
    <td>2 レプリカ x 32 GiB RAM, 8 vCPU<br></br>\$2,285.60</td>
    <td>2 レプリカ x 64 GiB RAM, 16 vCPU<br></br>\$4,571.19</td>
    <td>2 x 120 GiB RAM, 30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>ストレージ</td>
    <td>5TB + 1 バックアップ<br></br>\$253.00</td>
    <td>10TB + 1 バックアップ<br></br>\$506.00</td>
    <td>20TB + 1 バックアップ<br></br>\$1,012.00</td>
  </tr>
  <tr>
    <td>パブリックインターネットエグレスデータ転送</td>
    <td>\$115.20</td>
    <td>\$115.20</td>
    <td>\$115.20</td>
  </tr>
  <tr>
    <td>リージョン間データ転送</td>
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

## よくある質問 {#faqs}

### コンピュートはどのように計測されますか？ {#how-is-compute-metered}

ClickHouse Cloud はコンピュートを1分ごとに計測し、8G RAM の増分で課金します。 
コンピュートコストは、ティア、リージョン、クラウドサービスプロバイダーによって異なります。

### ディスク上のストレージはどのように計算されますか？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloud はクラウドオブジェクトストレージを利用し、ClickHouse テーブルに保存されたデータの圧縮サイズに基づいて計測されます。 
ストレージコストはティアによって同じであり、リージョンとクラウドサービスプロバイダーによって異なります。

### バックアップは総ストレージにカウントされますか？ {#do-backups-count-toward-total-storage}

ストレージとバックアップはストレージコストにカウントされ、別々に請求されます。 
すべてのサービスは、デフォルトで1つのバックアップが保持されます。 
追加のバックアップが必要なユーザーは、Cloud Console の設定タブで追加の[バックアップ](backups/overview.md)を構成することができます。

### 圧縮率をどのように推定しますか？ {#how-do-i-estimate-compression}

圧縮率はデータセットによって大きく異なる場合があります。 
データがどれだけ圧縮可能か（高いカーディナリティと低いカーディナリティのフィールドの数）や、ユーザーがスキーマをどのように設定するか（オプションのコーデックを使用するかどうかなど）に依存します。 
一般的な分析データのタイプでは10倍程度であることが多いですが、もっと低かったり高かったりする場合もあります。 
ガイダンスについては[最適化ドキュメント](/optimize/asynchronous-inserts)をご覧となり、この[Uberブログ](https://www.uber.com/blog/logging/)で詳細なログ利用ケースの例を確認してください。 
正確に知る唯一の実用的な方法は、データセットをClickHouseに取り込んで、データセットのサイズとClickHouseに保存されたサイズを比較することです。

次のクエリを使用できます。

```sql title="圧縮率の推定"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### セルフマネージドデプロイメントがある場合、ClickHouseがクラウドでサービスを実行するコストを推定するためのツールは何ですか？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouse のクエリログは、[主要なメトリクス](/operations/system-tables/query_log)をキャプチャしており、ClickHouse Cloud でワークロードを実行するコストを推定するために使用できます。 
セルフマネージドから ClickHouse Cloud への移行の詳細については、[移行ドキュメント](/cloud/migration/clickhouse-to-cloud)をご確認いただき、さらなる質問がある場合は[ClickHouse Cloud サポート](https://console.clickhouse.cloud/support)にお問い合わせください。

### ClickHouse Cloud の請求オプションは何ですか？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud は、次の請求オプションをサポートしています：

- セルフサービス月額（USD、クレジットカード経由）。
- 直接販売の年次 / 複数年（前払いの「ClickHouse Credits」（USD）を使用し、他の支払いオプションもあり）。
- AWS、GCP、Azure マーケットプレイスを通じて（従量課金制（PAYG）またはマーケットプレイスを通じて ClickHouse Cloud との契約を約束する）。

### 請求サイクルはどのくらいですか？ {#how-long-is-the-billing-cycle}

請求は月次の請求サイクルに従い、開始日は ClickHouse Cloud 組織が作成された日を追跡します。

### ClickHouse Cloud は、スケールおよびエンタープライズサービスのコスト管理にどのような制御を提供していますか？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- トライアルおよび年次契約のお客様は、自身の消費が特定のしきい値（50%、75%、90%）に達した時に、自動的にメールで通知されます。これにより、ユーザーは自身の使用量を管理しやすくなります。
- ClickHouse Cloud は、[高度なスケーリング制御](/manage/scaling)を介してコンピュートの最大自動スケーリング制限を設定できるため、分析ワークロードのコストに大きな影響を与えます。
- [高度なスケーリング制御](/manage/scaling)を使用すると、メモリ制限を設定でき、非アクティブ状態の際の一時停止/アイドリングの動作を制御するオプションがあります。

### ClickHouse Cloud は、基本サービスのコスト管理にどのような制御を提供していますか？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高度なスケーリング制御](/manage/scaling)を使用すると、非アクティブ状態の際の一時停止/アイドリングの動作を制御できます。基本サービスではメモリ配分の調整はサポートされていません。
- デフォルト設定では、特定の非アクティブ期間後にサービスが一時停止します。

### 複数のサービスがある場合、サービスごとに請求書が生成されますか、それとも統合請求書が生成されますか？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

請求期間中のすべてのサービスに対して統合請求書が生成されます。

### トライアル期間やクレジットが期限切れになる前にクレジットカードを追加してアップグレードした場合、請求されますか？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

ユーザーが30日間のトライアル期間が終了する前にトライアルから有料に移行し、トライアルクレジットが残っている場合、最初の30日間はトライアルクレジットから引き続き引き落とし、クレジットカードに請求されます。

### 支出をどのように管理すればよいですか？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloud コンソールは、サービスごとの使用状況を詳細に示す使用状況表示を提供します。この内訳は、使用量の次元別に整理されており、それぞれの計測単位に関連するコストを理解するのに役立ちます。

### ClickHouse Cloud サービスのマーケットプレイスサブスクリプションに対する請求書にはどのようにアクセスしますか？ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

すべてのマーケットプレイスサブスクリプションはマーケットプレイスによって請求および請求書が発行されます。請求書は、それぞれのクラウドプロバイダーのマーケットプレイスを通じて直接表示できます。

### 使用状況のステートメントの日付がマーケットプレイスの請求書の日付と一致しないのはなぜですか？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWSマーケットプレイスの請求はカレンダー月サイクルに従います。
例えば、2024年12月1日から2025年1月1日までの使用については、2025年1月3日から1月5日までの間に請求書が生成されます。

ClickHouse Cloud の使用状況ステートメントは、サインアップした日から30日間使用量を計測して報告する異なる請求サイクルに従います。

使用状況と請求書の日付は、これらの日付が異なる場合に異なります。使用状況ステートメントは、特定のサービスの使用量を日ごとに追跡しているため、ユーザーはコストの内訳を確認するためにステートメントを頼りにできます。

### 前払いクレジットの使用に関して制限はありますか？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloud の前払いクレジット（ClickHouse から直接、またはクラウドプロバイダーのマーケットプレイスを通じて）は、契約の条件に従ってのみ利用可能です。 
これは、受諾日に適用するか、将来の日付に適用することができ、過去の期間には適用できません。 
前払いクレジットではカバーされない超過分は、クレジットカード支払いまたはマーケットプレイス月次請求によってカバーされる必要があります。

### クラウドプロバイダーのマーケットプレイスを通じて支払う場合と直接 ClickHouse に支払う場合で、ClickHouse Cloud の価格に違いがありますか？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

マーケットプレイス請求と ClickHouse に直接サインアップする場合の価格に違いはありません。 
いずれの場合でも、ClickHouse Cloud の使用は ClickHouse Cloud Credits (CHCs) に基づいて追跡され、同じ方法で計測および請求されます。

### コンピュート間の分離はどのように請求されますか？ {#how-is-compute-compute-separation-billed}

既存のサービスに加えてサービスを作成する際に、新しいサービスが既存のものとデータを共有するかどうかを選択できます。 
共有する場合、これらの2つのサービスは[ウェアハウス](../reference/warehouses.md)を形成します。 
ウェアハウスは、内部にデータを保存し、複数のコンピュートサービスがそのデータにアクセスします。

データは1つだけ保存されているため、複数のサービスがアクセスしてもデータのコピーの費用だけを支払います。 
コンピュートのコストは通常通り支払うことになり、コンピュート間の分離/ウェアハウスに対して追加費用はありません。
このデプロイメントで共有ストレージを利用することで、ユーザーはストレージおよびバックアップのコスト削減の恩恵を受けることができます。

場合によっては、コンピュート間の分離によってClickHouse Creditsを大幅に節約できます。 
以下はその良い例です：

1. ETL ジョブが24時間365日稼働しており、サービスにデータを取得しています。これらのETL ジョブは多くのメモリを必要としないため、小さなインスタンスで、例えば32 GiB のRAMで実行できます。

2. 同じチームのデータサイエンティストがアドホックなレポート要件があり、大量のメモリ（236 GiB）が必要なクエリを実行する必要があると述べていますが、高可用性は必要なく、最初の実行が失敗しても再実行することができます。

この例では、データベースの管理者として、次のようにできます：

1. 16 GiB のレプリカ2つを持つ小さなサービスを作成します - これによりETL ジョブを満たし、高可用性を提供します。

2. データサイエンティストのために、同じウェアハウス内に236 GiB のレプリカ1つのセカンドサービスを作成します。このサービスにアイドリングを有効にすることで、データサイエンティストが使用していないときにこのサービスの費用を支払う必要がなくなります。

この例の【スケールティア】におけるコスト推定（毎月）：
- 親サービスは1日24時間稼働：2 レプリカ x 16 GiB 4 vCPU/レプリカ
- 子サービス：1 レプリカ x 236 GiB 59 vCPU/レプリカ
- 3 TB の圧縮データ + 1 バックアップ
- 100 GB のパブリックインターネットエグレスデータ転送
- 50 GB のリージョン間データ転送

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
    <td>パブリックインターネットエグレスデータ転送</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
  </tr>
  <tr>
    <td>リージョン間データ転送</td>
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

ウェアハウスがなければ、データエンジニアがクエリに必要とするメモリの量を支払う必要があります。 
しかし、2つのサービスをウェアハウス内で統合し、1つをアイドルにすることで、お金を節約できます。

## ClickPipes の価格設定 {#clickpipes-pricing}

### ClickPipes の価格構造はどのようになっていますか？ {#what-does-the-clickpipes-pricing-structure-look-like}

2つの次元から成ります。

- **コンピュート**: 単位あたりの時間ごとの価格
    コンピュートは、ClickPipes レプリカポッドがデータをアクティブに取り込んでいるかどうかにかかわらず、実行するコストを表します。 
    すべての ClickPipes タイプに適用されます。
- **取り込まれたデータ**: GB あたりの価格
    取り込まれたデータ率は、すべてのストリーミング ClickPipes 
    （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs）に適用されます。 
    取り込まれたデータサイズ（GB）は、ソースから受信したバイト数（圧縮済みまたは圧縮されていない）に基づいて課金されます。

### ClickPipes レプリカとは何ですか？ {#what-are-clickpipes-replicas}

ClickPipes は、ClickHouse Cloud サービスとは独立して実行され、スケーリングされる専用のインフラストラクチャを介してリモートデータソースからデータを取り込みます。 
このため、専用のコンピュートレプリカを使用します。

### デフォルトのレプリカ数とサイズはどのくらいですか？ {#what-is-the-default-number-of-replicas-and-their-size}

各 ClickPipe のデフォルトは、2 GiB の RAM と 0.5 vCPU が提供される 1 レプリカです。 
これは **0.25** ClickHouse コンピュートユニットに相当します（1 ユニット = 8 GiB RAM、2 vCPUs）。

### ClickPipes の公称価格は何ですか？ {#what-are-the-clickpipes-public-prices}

- コンピュート: \$0.20 単位あたり時間 (\$0.05 レプリカあたり時間)
- 取り込まれたデータ: \$0.04 per GB

### イラスト例はどのようになりますか？ {#how-does-it-look-in-an-illustrative-example}

以下の例は、明示的に言及されない限り、単一のレプリカを前提としています。

<table><thead>
  <tr>
    <th></th>
    <th>24時間で100 GB</th>
    <th>24時間で1 TB</th>
    <th>24時間で10 TB</th>
  </tr></thead>
<tbody>
  <tr>
    <td>ストリーミング ClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>レプリカ4つの場合: <br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>オブジェクトストレージ ClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _オーケストレーション用の ClickPipes コンピュートのみ、効果的なデータ転送は基盤となる ClickHouse サービスによって仮定されます_
