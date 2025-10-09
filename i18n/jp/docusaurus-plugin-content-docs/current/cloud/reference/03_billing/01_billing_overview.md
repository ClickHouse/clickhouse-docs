---
'sidebar_label': '概要'
'slug': '/cloud/manage/billing/overview'
'title': '価格'
'description': 'ClickHouse Cloud 価格の概要ページ'
'doc_type': 'reference'
---

For pricing information, see the [ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) page.  
ClickHouse Cloud bills based on the usage of compute, storage, [data transfer](/cloud/manage/network-data-transfer) (egress over the internet and cross-region), and [ClickPipes](/integrations/clickpipes).  
To understand what can affect your bill, and ways that you can manage your spend, keep reading.

## Amazon Web Services (AWS) example {#amazon-web-services-aws-example}

:::note
- 価格はAWS us-east-1 の価格を反映しています。
- 適用されるデータ転送およびClickPipesの料金を[こちら](/cloud/manage/network-data-transfer)で確認してください。
:::

### Basic: from $66.52 per month {#basic-from-6652-per-month}

Best for: 部門の使用例で、堅固な信頼性保証のない小規模なデータボリューム。

**Basic tier service**
- 1 レプリカ x 8 GiB RAM, 2 vCPU
- 500 GB の圧縮データ
- 500 GB のデータのバックアップ
- 10 GB の公共インターネットの出口データ転送
- 5 GB のクロスリージョンデータ転送

Pricing breakdown for this example:

<table><thead>
  <tr>
    <th></th>
    <th>1日6時間のアクティブ</th>
    <th>1日12時間のアクティブ</th>
    <th>1日24時間のアクティブ</th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>\$39.91</td>
    <td>\$79.83</td>
    <td>\$159.66</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>\$25.30</td>
    <td>\$25.30</td>
    <td>\$25.30</td>
  </tr>
  <tr>
    <td>公共インターネットの出口データ転送</td>
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

### Scale (always-on, auto-scaling): from $499.38 per month {#scale-always-on-auto-scaling-from-49938-per-month}

Best for: SLAを強化したいワークロード（2 以上のレプリカサービス）、スケーラビリティ、高度なセキュリティが必要です。

**Scale tier service**
- アクティブワークロード ~100%の時間
- 自動スケーリングの最大構成可能な設定により、無駄な請求を防ぐ
- 100 GB の公共インターネットの出口データ転送
- 10 GB のクロスリージョンデータ転送

Pricing breakdown for this example:

<table><thead>
  <tr>
    <th></th>
    <th>例 1</th>
    <th>例 2</th>
    <th>例 3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>2 レプリカ x 8 GiB RAM, 2 vCPU<br></br>\$436.95</td>
    <td>2 レプリカ x 16 GiB RAM, 4 vCPU<br></br>\$873.89</td>
    <td>3 レプリカ x 16 GiB RAM, 4 vCPU<br></br>\$1,310.84</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>1 TB のデータ + 1 バックアップ<br></br>\$50.60</td>
    <td>2 TB のデータ + 1 バックアップ<br></br>\$101.20</td>
    <td>3 TB のデータ + 1 バックアップ<br></br>\$151.80</td>
  </tr>
  <tr>
    <td>公共インターネットの出口データ転送</td>
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

### Enterprise: Starting prices vary {#enterprise-starting-prices-vary}

Best for: 大規模でミッションクリティカルなデプロイメントで、厳格なセキュリティとコンプライアンスのニーズがある。

**Enterprise tier service**
- アクティブワークロード ~100%の時間
- 1 TB の公共インターネットの出口データ転送
- 500 GB のクロスリージョンデータ転送

<table><thead>
  <tr>
    <th></th>
    <th>例 1</th>
    <th>例 2</th>
    <th>例 3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>2 レプリカ x 32 GiB RAM, 8 vCPU<br></br>\$2,285.60</td>
    <td>2 レプリカ x 64 GiB RAM, 16 vCPU<br></br>\$4,571.19</td>
    <td>2 x 120 GiB RAM, 30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>5 TB + 1 バックアップ<br></br>\$253.00</td>
    <td>10 TB + 1 バックアップ<br></br>\$506.00</td>
    <td>20 TB + 1 バックアップ<br></br>\$1,012.00</td>
  </tr>
  <tr>
    <td>公共インターネットの出口データ転送</td>
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

## Frequently asked questions {#faqs}

### What is a ClickHouse Credit (CHC)? {#what-is-chc}

A ClickHouse Credit is a unit of credit toward Customer's usage of ClickHouse Cloud equal to one (1) US dollar, to be applied based on ClickHouse's then-current published price list.

### Where can I find legacy pricing? {#find-legacy-pricing}

Legacy pricing information can be found [here](https://clickhouse.com/pricing?legacy=true).

:::note 
If you are being billed through Stripe then you will see that 1 CHC is equal to \$0.01 USD on your Stripe invoice. This is to allow accurate billing on Stripe due to their limitation on not being able to bill fractional quantities of our standard SKU of 1 CHC = \$1 USD.
:::

### How is compute metered? {#how-is-compute-metered}

ClickHouse Cloud meters compute on a per-minute basis, in 8G RAM increments.  
Compute costs will vary by tier, region, and cloud service provider.

### How is storage on disk calculated? {#how-is-storage-on-disk-calculated}

ClickHouse Cloud uses cloud object storage and usage is metered on the compressed size of data stored in ClickHouse tables.  
Storage costs are the same across tiers and vary by region and cloud service provider. 

### Do backups count toward total storage? {#do-backups-count-toward-total-storage}

Storage and backups are counted towards storage costs and billed separately.  
All services will default to one backup, retained for a day.  
Users who need additional backups can do so by configuring additional [backups](/cloud/manage/backups/overview) under the settings tab of the Cloud console.

### How do I estimate compression? {#how-do-i-estimate-compression}

Compression can vary from dataset to dataset.  
How much it varies is dependent on how compressible the data is in the first place (number of high vs. low cardinality fields),  
and how the user sets up the schema (using optional codecs or not, for instance).  
It can be on the order of 10x for common types of analytical data, but it can be significantly lower or higher as well.  
See the [optimizing documentation](/optimize/asynchronous-inserts) for guidance and this [Uber blog](https://www.uber.com/blog/logging/) for a detailed logging use case example.  
The only practical way to know exactly is to ingest your dataset into ClickHouse and compare the size of the dataset with the size stored in ClickHouse.

You can use the query:

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### What tools does ClickHouse offer to estimate the cost of running a service in the cloud if I have a self-managed deployment? {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

The ClickHouse query log captures [key metrics](/operations/system-tables/query_log) that can be used to estimate the cost of running a workload in ClickHouse Cloud.  
For details on migrating from self-managed to ClickHouse Cloud please refer to the [migration documentation](/cloud/migration/clickhouse-to-cloud), and contact [ClickHouse Cloud support](https://console.clickhouse.cloud/support) if you have further questions.

### What billing options are available for ClickHouse Cloud? {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud supports the following billing options:

- セルフサービスの月額（USD、クレジットカード経由）。
- 直接販売の年間/複数年（前払いの「ClickHouse クレジット」を通じて、USDで、追加の支払いオプションあり）。
- AWS、GCP、Azure マーケットプレイス経由（従量課金制（PAYG）またはマーケットプレイスを通じて ClickHouse Cloud と契約）。

:::note
ClickHouse CloudのPAYGクレジットは\$0.01単位で請求され、使用量に基づいて部分的なClickHouseクレジットを顧客に請求できるようにしています。これはコミットされた支出のClickHouseクレジットとは異なり、予め全額の\$1単位で購入されます。
:::

### How long is the billing cycle? {#how-long-is-the-billing-cycle}

Billing follows a monthly billing cycle and the start date is tracked as the date when the ClickHouse Cloud organization was created.

### If I have an active PAYG marketplace subscription and then sign a committed contract, will my committed credits be consumed first? {#committed-credits-consumed-first-with-active-payg-subscription}

Yes. Usage is consumed with the following payment methods in this order:
- コミットされた（前払いの）クレジット
- マーケットプレイスサブスクリプション（PAYG）
- クレジットカード

### What controls does ClickHouse Cloud offer to manage costs for Scale and Enterprise services? {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- Trialおよび年間契約のお客様には、消費が特定の閾値（`50%`、`75%`、`90%`）に達した際に自動的にメールで通知されます。これにより、ユーザーは自分の使用状況を積極的に管理できます。
- ClickHouse Cloudでは、[Advanced scaling control](/manage/scaling)を使用して、アナリティクスワークロードの重大なコスト要因であるコンピュートの最大自動スケーリング制限を設定できます。
- [Advanced scaling control](/manage/scaling)は、非アクティブ時に一時停止/アイドルの動作を制御するオプションを持つメモリ制限を設定できます。

### What controls does ClickHouse Cloud offer to manage costs for Basic services? {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [Advanced scaling control](/manage/scaling)は、非アクティブ時の一時停止/アイドルの動作を制御できます。Basicサービスでのメモリ割り当ての調整はサポートされていません。
- デフォルト設定では、非アクティブ状態が続くとサービスが一時停止します。

### If I have multiple services, do I get an invoice per service or a consolidated invoice? {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

請求期間中、組織内のすべてのサービスのために統合請求書が生成されます。

### If I add my credit card and upgrade before my trial period and credits expire, will I be charged? {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

ユーザーがトライアルから有料に切り替える際に、トライアルのクレジットが残っている場合は、初期の30日トライアル期間中はトライアルクレジットから引き続き請求され、その後はクレジットカードに請求されます。

### How can I keep track of my spending? {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloudコンソールは、サービスごとの使用状況を詳細に示す使用量表示を提供します。この内訳は、使用量の次元別に整理されており、各メーター単位に関連するコストを理解するのに役立ちます。

### How do I access my invoices for my subscription to the ClickHouse Cloud service? {#how-do-i-access-my-invoice-for-my-subscription-to-the-clickhouse-cloud-service}

直接クレジットカードを使用しているサブスクリプションの場合：

請求書を表示するには、ClickHouse Cloud UIの左側のナビゲーションバーから自分の組織を選択し、「Billing」に移動します。すべての請求書が「Invoices」セクションにリストされています。

クラウドマーケットプレイス経由のサブスクリプションの場合：

すべてのマーケットプレイスサブスクリプションは、マーケットプレイスによって請求書が発行されます。請求書は、それぞれのクラウドプロバイダーのマーケットプレイスで直接確認できます。

### Why do the dates on the Usage statements not match my Marketplace Invoice? {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWSマーケットプレイスの請求はカレンダーの月サイクルに従います。  
例えば、2024年12月1日から2025年1月1日までの使用については、  
2025年1月3日から5日の間に請求書が発行されます。

ClickHouse Cloudの使用状況ステートメントは、サインアップ日から始まり30日間の使用量を測定し、報告します。

これらの日付が一致しない場合、使用量と請求書の日付は異なる場合があります。サービスごとの使用を日単位で追跡できるため、ユーザーは請求書からコストの内訳を確認できます。

### Are there any restrictions around the usage of prepaid credits? {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloudの前払いクレジット（ClickHouseを通じて直接、またはクラウドプロバイダーのマーケットプレイス経由で取得）は、契約の条件に基づいてのみ利用可能です。  
これは、承認日または今後の日付で適用され、過去の期間には適用できないことを意味します。  
前払いクレジットでカバーされない超過分は、クレジットカードの支払いまたはマーケットプレイスの月額請求でカバーされる必要があります。

### Is there a difference in ClickHouse Cloud pricing, whether paying through the cloud provider marketplace or directly to ClickHouse? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

マーケットプレイスの請求とClickHouseに直接サインアップする場合の価格に違いはありません。  
いずれの場合でも、ClickHouse Cloudの使用はClickHouse Cloud Credits (CHC)で追跡され、  
同じ方法でメーターが測定され、請求されます。

### How is compute-compute separation billed? {#how-is-compute-compute-separation-billed}

既存のサービスに加えて新しいサービスを作成する場合、  
この新しいサービスが既存のデータを共有するかどうかを選択できます。  
はいと答えると、これらの二つのサービスは[warehouse](/cloud/reference/warehouses)を形成します。  
ウェアハウスにはデータが保存され、複数のコンピュートサービスがこのデータにアクセスします。

データは一度だけ保存されるため、複数のサービスがアクセスしても、データのコピーに対してのみ支払いが必要です。  
コンピュートについては通常通り支払います — コンピュート-コンピュートの分離/ウェアハウスに追加料金はありません。  
このデプロイで共有ストレージを活用することで、ユーザーはストレージとバックアップの両方でコストを節約できます。

コンピュート-コンピュートの分離により、場合によっては多くのClickHouse Creditsを節約できます。  
良い例は以下のセットアップです：

1. 24/7で稼働しデータをサービスに取り込むETLジョブがあります。これらのETLジョブはあまりメモリを必要としないので、小型のインスタンス（例えば、32 GiBのRAM）で実行できます。

2. 同じチームのデータサイエンティストが、約236 GiBの大量のメモリを必要とするクエリを実行する必要があると言いますが、高い可用性は不要で、最初の実行が失敗した場合は待って再実行できます。

この例では、データベースの管理者として次のようにできます：

1. ETLジョブを満たして高い可用性を提供するために、2つのレプリカ（16 GiBずつ）の小型サービスを作成します。

2. データサイエンティスト用に、同じウェアハウス内に236 GiBのメモリで1つのレプリカを持つセカンドサービスを作成できます。このサービスをアイドル状態にすることで、データサイエンティストが使用していない時に料金を支払わずに済みます。

この例における**Scale Tier**のコスト推定（毎月）：
- 親サービスが1日24時間アクティブ: 2 レプリカ x 16 GiB 4 vCPU/レプリカ
- 子サービス: 1 レプリカ x 236 GiB 59 vCPU/レプリカ
- 3 TB の圧縮データ + 1 バックアップ
- 100 GB の公共インターネットの出口データ転送
- 50 GB のクロスリージョンデータ転送

<table class="nowrap-header"><thead>
  <tr>
    <th></th>
    <th><span>子サービス</span><br/><span>1日1時間アクティブ</span></th>
    <th><span>子サービス</span><br/><span>1日2時間アクティブ</span></th>
    <th><span>子サービス</span><br/><span>1日4時間アクティブ</span></th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>\$1,142.43</td>
    <td>\$1,410.97</td>
    <td>\$1,948.05</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>\$151.80</td>
    <td>\$151.80</td>
    <td>\$151.80</td>
  </tr>
  <tr>
    <td>公共インターネットの出口データ転送</td>
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

ウェアハウスなしの場合、データエンジニアがクエリに必要とするメモリの量に対して支払う必要があるでしょう。  
しかし、2つのサービスをウェアハウスで統合して、1つをアイドル状態にすることでお金を節約できます。

## ClickPipes pricing {#clickpipes-pricing}

For information on ClickPipes billing, please see the dedicated ["ClickPipes billing" section](/cloud/reference/billing/clickpipes).
