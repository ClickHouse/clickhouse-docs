---
'sidebar_label': '概要'
'slug': '/cloud/manage/billing/overview'
'title': 'Pricing'
'description': 'ClickHouse Cloud の価格に関する概要ページ'
---



For pricing information, see the [ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) page.
ClickHouse Cloud bills based on the usage of compute, storage, [data transfer](/cloud/manage/network-data-transfer) (egress over the internet and cross-region), and [ClickPipes](/integrations/clickpipes). 
To understand what can affect your bill, and ways that you can manage your spend, keep reading.

## Amazon Web Services (AWS) 例 {#amazon-web-services-aws-example}

:::note
- 価格はAWS us-east-1の価格を反映しています。
- 適用されるデータ転送およびClickPipesの料金を[ここ](jan2025_faq/dimensions.md)で確認できます。
:::

### 基本プラン: 月額66.52ドルから {#basic-from-6652-per-month}

最適な使用ケース: 硬い信頼性保証がない小規模データボリュームの部門向け使用ケース。

**基本ティアサービス**
- 1レプリカ x 8 GiB RAM, 2 vCPU
- 500 GBの圧縮データ
- 500 GBのデータバックアップ
- 10 GBのパブリックインターネットのデータ転送
- 5 GBのクロスリージョンデータ転送

この例の価格内訳:

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
    <td>パブリックインターネットのデータ転送</td>
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

### スケール (常時稼働、自動スケーリング): 月額499.38ドルから {#scale-always-on-auto-scaling-from-49938-per-month}

最適な使用ケース: 強化されたSLA（2つ以上のレプリカサービス）、スケーラビリティ、および高度なセキュリティが必要なワークロード。

**スケールティアサービス**
- アクティブワークロード ~100% 時間
- 自動スケーリングの最大設定可能で、請求が爆発しないように防止
- 100 GBのパブリックインターネットのデータ転送
- 10 GBのクロスリージョンデータ転送

この例の価格内訳:

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
    <td>パブリックインターネットのデータ転送</td>
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

### エンタープライズ: 価格は vary {#enterprise-starting-prices-vary}

最適な使用ケース: 厳格なセキュリティおよびコンプライアンスのニーズを備えた大規模でミッションクリティカルな展開

**エンタープライズティアサービス**
- アクティブワークロード ~100% 時間
- 1 TBのパブリックインターネットのデータ転送
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
    <td>パブリックインターネットのデータ転送</td>
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

## よくある質問 {#faqs}

### コンピュートはどのようにメータリングされていますか？ {#how-is-compute-metered}

ClickHouse Cloudは、コンピュートを1分単位で測定し、8G RAMの増分で課金します。 
コンピュートコストはティア、リージョン、クラウドサービスプロバイダによって異なります。

### ディスク上のストレージはどのように計算されますか？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloudはクラウドオブジェクトストレージを使用し、利用はClickHouseテーブルに保存されているデータの圧縮サイズで測定されます。 
ストレージコストはティアに関わらず同じで、リージョンやクラウドサービスプロバイダーによって変動します。 

### バックアップはストレージの合計にカウントされますか？ {#do-backups-count-toward-total-storage}

ストレージおよびバックアップはストレージコストにカウントされ、別途請求されます。 
すべてのサービスはデフォルトで1日保持される1つのバックアップを持ちます。 
追加のバックアップが必要なユーザーは、Cloud Consoleの設定タブで追加の[バックアップ](backups/overview.md)を構成できます。

### 圧縮をどのように推定しますか？ {#how-do-i-estimate-compression}

圧縮はデータセットによってかなり異なる可能性があります。 
データがどれだけ圧縮可能か（高カーディナリティフィールド対低カーディナリティフィールドの数）に依存しますし、ユーザーがスキーマをどのように設定するか（オプショナルコーデックを使用するかどうかなど）にも依存します。 
一般的な種類の分析データの場合、10倍ほど圧縮されることがありますが、実際にはそれよりも少ないか多い場合もあります。 
ガイダンスについては[最適化ドキュメント](/optimize/asynchronous-inserts)を参照し、詳細なログ使用例についてはこの[Uberブログ](https://www.uber.com/blog/logging/)をご覧ください。 
正確に知る唯一の実用的な方法は、データセットをClickHouseにインジェストし、データセットのサイズとClickHouseに保存されたサイズを比較することです。

以下のクエリを使用できます:

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### セルフマネージドデプロイメントがある場合、ClickHouseがクラウドでサービスを実行するコストを推定するためのツールは何ですか？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouseクエリログは、ClickHouse Cloud内のワークロードを実行するコストを推定するために使用できる[主要なメトリクス](/operations/system-tables/query_log)をキャプチャします。 
セルフマネージドからClickHouse Cloudへの移行の詳細については、[移行ドキュメント](/cloud/migration/clickhouse-to-cloud)を参照し、さらなる質問がある場合は[ClickHouse Cloudサポート](https://console.clickhouse.cloud/support)にお問い合わせください。

### ClickHouse Cloudにはどのような請求オプションがありますか？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloudは以下の請求オプションをサポートしています：

- 自己サービスの月額（USD、クレジットカードによる）。
- 直接販売の年次 / 複数年（先払いの"ClickHouse Credits"を通じて、USD、追加の支払いオプションあり）。
- AWS、GCP、Azureのマーケットプレイスを通じて（ペイ・アズ・ユー・ゴー（PAYG）またはマーケットプレイスを通じてClickHouse Cloudと契約する）。

### 請求サイクルはどのくらいですか？ {#how-long-is-the-billing-cycle}

請求は月額サイクルに従い、開始日はClickHouse Cloud組織が作成された日として追跡されます。

### スケールおよびエンタープライズサービスのコストを管理するためにClickHouse Cloudが提供する制御は何ですか？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- トライアルおよび年次契約の顧客は、消費が特定の閾値に達すると、自動的にメールで通知されます：`50%`、`75%`、`90%`。これにより、ユーザーは使用を積極的に管理できます。
- ClickHouse Cloudでは、[高度なスケーリング管理](/manage/scaling)を使用して、コンピュートに最大自動スケーリング制限を設定でき、これは分析ワークロードにとって重要なコスト要因です。
- [高度なスケーリング管理](/manage/scaling)を使用すると、非アクティブ中の一時停止/idlingの挙動を制御するオプションがあるメモリ制限を設定できます。

### 基本サービスのコストを管理するためにClickHouse Cloudが提供する制御は何ですか？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高度なスケーリング管理](/manage/scaling)を使用して、非アクティブ中の一時停止/idlingの挙動を制御できます。基本サービスでは、メモリ割り当ての調整はサポートされていません。
- デフォルト設定では、一時的な非アクティブ期間後にサービスが一時停止します。

### 複数のサービスがある場合、サービスごとに請求書が発行されますか、それとも統合請求書が発行されますか？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

特定の請求期間に対する組織内のすべてのサービスに対して、統合請求書が生成されます。

### トライアル期間とクレジットが失効する前にクレジットカードを追加してアップグレードすると、請求されますか？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

ユーザーが30日間のトライアル期間の終了前にトライアルから有料に変換し、トライアルクレジットが残っている場合、
初期30日間のトライアル期間中はトライアルクレジットから継続して引き落とされ、その後クレジットカードに請求されます。

### 自分の支出を追跡する方法は？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloudコンソールには、サービスごとの使用詳細を表示するUsage表示が用意されています。この内訳は、使用次元に整理されており、それぞれの計測ユニットに関連するコストを理解するのに役立ちます。

### ClickHouse Cloudサービスのマーケットプレイスサブスクリプションの請求書にアクセスするにはどうすればよいですか？ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

すべてのマーケットプレイスサブスクリプションは、マーケットプレイスによって請求および請求書が発行されます。請求書は、各クラウドプロバイダーのマーケットプレイスを通じて直接表示できます。

### 使用状況明細書の日付がマーケットプレイスの請求書と一致しないのはなぜですか？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS Marketplaceの請求はカレンダーの月のサイクルに従います。
たとえば、2024年12月1日から2025年1月1日までの使用の場合、 
請求書は2025年1月3日から5日までの間に発行されます。

ClickHouse Cloudの使用状況明細書は、異なる請求サイクルに従い、使用状況はサインアップの日から始まり30日間測定されて報告されます。

これらの日付が異なる場合、使用状況および請求の日付は異なります。使用状況明細書は、特定のサービスの使用を日ごとに追跡するため、コストの内訳を確認するために明細書を信頼できます。

### 前払いクレジットの使用に制限はありますか？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloudの前払いクレジット（ClickHouseを通じて直接、またはクラウドプロバイダーのマーケットプレイス経由）は 
契約の条件に基づいてのみ利用可能です。 
これは、受け入れ日または将来の日に適用でき、過去の期間に対しては適用できないことを意味します。 
前払いクレジットでカバーされないオーバーは、クレジットカード支払いまたはマーケットプレイスの月額請求でカバーされる必要があります。

### クラウドプロバイダーのマーケットプレイスを通じて支払う場合と直接ClickHouseに支払う場合で、ClickHouse Cloudの価格に違いはありますか？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

マーケットプレイスの請求とClickHouseに直接サインアップする場合の価格には違いはありません。 
いずれの場合も、ClickHouse Cloudの使用はClickHouse Cloud Credits (CHCs)として追跡され、 
同じ方法で計測され、請求されます。

### コンピュート-コンピュート分離の請求はどうなりますか？ {#how-is-compute-compute-separation-billed}

既存のサービスに加えて新しいサービスを作成する場合、 
この新しいサービスが既存のサービスとデータを共有すべきかどうかを選択できます。 
はいの場合、これら2つのサービスは[ウェアハウス](../reference/warehouses.md)を形成します。 
ウェアハウスにはデータが1回のみ保存され、複数のコンピュートサービスがこのデータにアクセスします。

データが1回だけ保存されるため、複数のサービスがアクセスしていても、データの複製に対してのみ支払います。 
コンピュートに関しては通常通り支払いが発生し、コンピュート-コンピュート分離/ウェアハウスに対する追加料金はありません。
このデプロイメントでは共有ストレージを活用することで、ストレージとバックアップのコスト削減の恩恵を得ることができます。

コンピュート-コンピュート分離は、場合によっては大量のClickHouse Creditsを節約できます。 
良い例は以下のようなセットアップです：

1. 24時間体制でデータを取り込むETLジョブがあります。これらのETLジョブはあまりメモリを必要としないため、例えば、32 GiBのRAMの小さなインスタンスで実行できます。

2. 同じチームのデータサイエンティストが突発的なレポーティング要件があり、 significant amount of memory - 236 GiBが必要ですが、高い可用性は必要とせず、最初の実行が失敗した場合は待って再実行できます。

この例では、データベースの管理者として、次のことを行えます：

1. 2つのレプリカを持つ小さなサービスを作成します。それぞれ16 GiB - これがETLジョブを満たし、高い可用性を提供します。

2. データサイエンティストのために、同じウェアハウス内に236 GiBの1レプリカのみの2番目のサービスを作成できます。このサービスに対してアイリングを有効にすることで、データサイエンティストが使用していないときはこのサービスに対して支払わないようにします。

この例の**スケールティア**に関するコスト見積り（毎月）：
- 親サービスは24時間稼働：2レプリカ x 16 GiB 4 vCPU（各レプリカ）
- 子サービス：1レプリカ x 236 GiB 59 vCPU（各レプリカ）
- 3 TBの圧縮データ + 1バックアップ
- 100 GBのパブリックインターネットのデータ転送
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
    <td>パブリックインターネットのデータ転送</td>
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

ウェアハウスがない場合、データエンジニアがクエリに必要とするメモリの量に対して支払わなければなりませんでした。 
しかし、2つのサービスをウェアハウスで結合し、一方をアイリングすることでお金を節約できます。

## ClickPipes料金 {#clickpipes-pricing}

### ClickPipesの料金構成はどのようになりますか？ {#what-does-the-clickpipes-pricing-structure-look-like}

2つの次元から構成されています。

- **コンピュート**: 1時間当たりの単価
    コンピュートは、ClickPipesレプリカポッドがデータを取り込むかどうかに関わらず、実行するコストを示します。 
    すべてのClickPipesタイプに適用されます。
- **取り込まれたデータ**: GB当たりの価格設定
    取り込まれたデータレートは、すべてのストリーミングClickPipes 
    （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs） 
    のレプリカポッドを介して転送されたデータに適用されます。取り込まれたデータサイズ（GB）は、ソースから受信したバイト数に基づいて請求されます（圧縮されていてもされていなくても）。

### ClickPipesレプリカとは何ですか？ {#what-are-clickpipes-replicas}

ClickPipesは、ClickHouse Cloudサービスとは独立して実行およびスケールする専用インフラストラクチャを介してリモートデータソースからデータを取り込みます。 
このため、専用のコンピュートレプリカを使用します。

### レプリカのデフォルト数とサイズは何ですか？ {#what-is-the-default-number-of-replicas-and-their-size}

各ClickPipeは、2 GiBのRAMと0.5 vCPUが提供される1レプリカがデフォルトです。 
これは**0.25** ClickHouseコンピュートユニット（1ユニット = 8 GiB RAM、2 vCPUs）に相当します。

### ClickPipesの公表価格は何ですか？ {#what-are-the-clickpipes-public-prices}

- コンピュート: \$0.20 /単位 /時間（\$0.05 /レプリカ /時間）
- 取り込まれたデータ: \$0.04 /GB

### 例としてはどのようになりますか？ {#how-does-it-look-in-an-illustrative-example}

以下の例では、明示的に記載されていない限り、単一のレプリカを仮定します。

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

$^1$ _オーケストレーション用のClickPipesコンピュートのみ。 
実際のデータ転送は基盤となるClickhouseサービスによって想定されています_
