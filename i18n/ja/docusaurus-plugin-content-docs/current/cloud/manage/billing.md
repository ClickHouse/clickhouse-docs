---
sidebar_label: 概要
slug: /cloud/manage/billing/overview
title: 料金
---

料金情報については、[ClickHouse Cloud 料金](https://clickhouse.com/pricing#pricing-calculator) ページをご覧ください。  
ClickHouse Cloudは、コンピュート、ストレージ、[データ転送](/cloud/manage/network-data-transfer) （インターネット経由およびリージョン間の出口）、および [ClickPipes](/integrations/clickpipes) の使用に基づいて請求されます。  
請求に影響を与える要因や支出を管理する方法を理解するために、読み続けてください。

## Amazon Web Services (AWS) の例 {#amazon-web-services-aws-example}

:::note
- 価格はAWS us-east-1の価格を反映しています。
- 適用されるデータ転送およびClickPipesの料金を[こちら](jan2025_faq/dimensions.md)で確認できます。
:::

### ベーシック: 月額66.52ドルから {#basic-from-6652-per-month}

最適な利用法: 硬い信頼性保証がない小規模なデータ量の部門利用ケース。

**ベーシックティアサービス**
- 1レプリカ x 8 GiB RAM, 2 vCPU
- 500 GBの圧縮データ
- 500 GBのデータバックアップ
- 10 GBのインターネットの出口データ転送
- 5 GBのリージョン間データ転送

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
    <td>公共インターネット出口データ転送</td>
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

### スケール (常時稼働、自動スケーリング): 月額499.38ドルから {#scale-always-on-auto-scaling-from-49938-per-month}

最適な利用法: 拡張されたSLA（2以上のレプリカサービス）、スケーラビリティ、および高度なセキュリティを必要とするワークロード。

**スケールティアサービス**
- アクティブなワークロード ~100% 時間
- 自動スケーリング最大設定可能で、請求の暴走を防止
- 100 GBの公共インターネット出口データ転送
- 10 GBのリージョン間データ転送

この例の料金内訳:

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
    <td>公共インターネット出口データ転送</td>
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

### エンタープライズ: スターティングプライスは変動 {#enterprise-starting-prices-vary}

最適な利用法: 大規模な、ミッションクリティカルなデプロイメントで、厳格なセキュリティとコンプライアンスのニーズがあるもの。

**エンタープライズティアサービス**
- アクティブなワークロード ~100% 時間
- 1 TBの公共インターネット出口データ転送
- 500 GBのリージョン間データ転送

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
    <td>公共インターネット出口データ転送</td>
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

## よくある質問 (FAQs) {#faqs}

### コンピュートはどのように計測されるのか？ {#how-is-compute-metered}

ClickHouse Cloudは、1分単位で8G RAM単位でコンピュートを計測します。  
コンピュートコストは、ティア、リージョン、およびクラウドサービスプロバイダーによって異なります。

### ディスク上のストレージはどのように計算されるのか？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloudはクラウドオブジェクトストレージを使用し、ClickHouseテーブルに格納されたデータの圧縮サイズに基づいて使用量を計測します。  
ストレージコストはティアによらず同じで、リージョンおよびクラウドサービスプロバイダーによって異なります。

### バックアップは総ストレージにカウントされるのか？ {#do-backups-count-toward-total-storage}

ストレージおよびバックアップはストレージコストにカウントされ、別々に請求されます。  
すべてのサービスはデフォルトで1つのバックアップがあり、1日保持されます。  
追加のバックアップが必要なユーザーは、Cloud Consoleの設定タブから追加バックアップを構成できます。

### 圧縮を推定するにはどうすればよいか？ {#how-do-i-estimate-compression}

圧縮はデータセットによって大きく異なります。  
最初にデータがどれほど圧縮可能か（高い対低いカーディナリティのフィールドの数）や、ユーザーがスキーマをどのように設定するか（オプションのコーデックを使用するかどうかなど）に依存します。  
一般的な種類の分析データの場合、圧縮率は約10倍になることがありますが、かなり低くなったり高くなることもあります。  
[最適化ドキュメント](/optimize/asynchronous-inserts)を参照して指針を得て、詳細なログ使用事例の例についてはこの[Uberのブログ](https://www.uber.com/blog/logging/)を参照してください。  
正確に知る唯一の実用的な方法は、自分のデータセットをClickHouseに取り込み、そのサイズをClickHouseに保存されたサイズと比較することです。

次のクエリを使用できます：

```sql title="圧縮の推定"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### セルフマネージドデプロイメントがある場合、ClickHouseが提供するサービスをクラウドで実行するコストを見積もるためのツールは何か？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouseのクエリログは、ClickHouse Cloudでのワークロード実行コストを見積もるために使用できる[主要なメトリック](/operations/system-tables/query_log)をキャプチャします。  
セルフマネージドからClickHouse Cloudへの移行の詳細については、[移行ドキュメント](/cloud/migration/clickhouse-to-cloud)を参照し、さらに質問がある場合は[ClickHouse Cloudサポート](https://console.clickhouse.cloud/support)に問い合わせてください。

### ClickHouse Cloudの料金オプションは何がありますか？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloudは以下の料金オプションをサポートしています：

- 自己サービスの月額（USDで、クレジットカードによる）。
- 直接販売の年額 / 複数年（前払の「ClickHouse Credits」で、USD、追加の支払いオプション付き）。
- AWS、GCP、Azureのマーケットプレイスを通じて（ペイ・アズ・ユー・ゴー（PAYG）または、マーケットプレイスを通じてClickHouse Cloudとの契約を保証）。

### 請求サイクルの期間はどのくらいですか？ {#how-long-is-the-billing-cycle}

請求は月次請求サイクルに従い、開始日がClickHouse Cloud組織が作成された日として追跡されます。

### ClickHouse Cloudは、スケールおよびエンタープライズサービスのコスト管理にどのようなコントロールを提供しますか？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- トライアルまたは年間契約のお客様は、消費が特定の閾値（`50%`、`75%`、`90%`）に達した際、自動的にメールで通知されます。これにより、ユーザーは使用量を事前に管理できます。
- ClickHouse Cloudは、報告基準において多くの分析ワークロードのための重要なコスト要因であるコンピュートの最大自動スケーリング制限を設定することを可能にします。[高度なスケーリング制御](/manage/scaling)により、非活性時の一時停止/アイドル状態の動作を制御するオプションを使用してメモリ制限を設定できます。

### ClickHouse Cloudは、ベーシックサービスのコスト管理にどのようなコントロールを提供しますか？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高度なスケーリング制御](/manage/scaling)により、非活性時の一時停止/アイドル状態の動作を制御できます。ベーシックサービスについてはメモリ割り当ての調整はサポートされていません。
- デフォルト設定では、一定の非活性期間後にサービスが一時停止されます。

### 複数のサービスがある場合、サービスごとの請求書が生成されるのか、それとも統合請求書が生成されるのか？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

指定された請求期間内のすべてのサービスについて統合請求書が生成されます。

### トライアル期間やクレジットが失効する前にクレジットカードを追加してアップグレードした場合、請求が発生しますか？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

ユーザーがトライアルから有料に移行する際、トライアルの30日間のトライアル期間が終了する前でもトライアルクレジットが残っている場合、  
最初の30日間のトライアル期間中はトライアルクレジットから引き下げ続け、その後クレジットカードに請求します。

### 支出を追跡するにはどうすればよいか？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloudコンソールは、各サービスごとの使用状況を詳細に表示するUsage表示を提供しています。この内訳は、使用量の次元ごとに整理され、各計測単位に関連付けられたコストの理解を助けます。

### ClickHouse Cloudサービスのマーケットプレイスサブスクリプションの請求書にアクセスするにはどうすればよいか？ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

すべてのマーケットプレイスサブスクリプションはマーケットプレイスによって請求および請求書が発行されます。請求書は、各クラウドプロバイダーのマーケットプレイスを通じて直接確認できます。

### 使用状況明細書の日付がマーケットプレイスの請求書の日付と一致しないのはなぜですか？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWSマーケットプレイスの請求はカレンダー月のサイクルに従います。  
例えば、2024年12月1日と2025年1月1日の間の使用について、  
請求書は2025年1月3日から5日間の間に生成されます。

ClickHouse Cloudの使用状況明細書は、サインアップ日から始まる30日間の計測で異なる請求サイクルに従います。

使用状況明細書は、特定のサービスに対する日ごとの使用を追跡するため、これらの日付が異なる場合、使用量明細書のコスト内訳を見ることができます。

### 前払のクレジットの使用について制限はありますか？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloudの前払クレジット（ClickHouseまたはクラウドプロバイダーのマーケットプレイスを通じて）は、契約の条件に限定して利用可能です。  
これは、受け入れ日、または未来の日付に適用可能であり、過去の期間には適用できません。  
前払クレジットでカバーされていない超過分は、クレジットカード決済またはマーケットプレイスの月次請求によってカバーされる必要があります。

### クラウドプロバイダーのマーケットプレイス経由で支払う場合、ClickHouse Cloudの料金は直接ClickHouseに支払う場合と異なりますか？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

マーケットプレイスの請求と直接ClickHouseにサインアップすることの間で料金の違いはありません。  
いずれにしても、あなたのClickHouse Cloudの使用はClickHouse Cloudクレジット（CHC）で追跡され、  
同じ方法で計測され、請求されます。

### コンピュート-コンピュート分離の請求はどのように行われますか？ {#how-is-compute-compute-separation-billed}

存在するサービスに加えてサービスを作成する際に、  
新しいサービスが既存のサービスと同じデータを共有するかどうか選択できます。  
はいの場合、これらの2つのサービスは[ウェアハウス](../reference/warehouses.md)を形成します。  
ウェアハウスには、複数のコンピュートサービスがアクセスするデータが格納されています。

データが一度だけ保存されるため、複数のサービスがそれにアクセスしても1コピーのデータの料金しか支払う必要はありません。  
コンピュートについては通常通り請求され、コンピュート-コンピュート分離/ウェアハウスに対する追加料金は発生しません。  
このデプロイメントで共有ストレージを利用することで、ユーザーはストレージとバックアップの両方においてコスト削減のメリットを享受できます。

コンピュート-コンピュート分離は、場合によってはかなりの量のClickHouseクレジットを節約できます。   
良い例は次のセットアップです：

1. 24/7で稼働し、サービスにデータを取り込むETLジョブがあります。これらのETLジョブはそれほど多くのメモリを必要としないため、例えば32 GiBのRAMを搭載した小さなインスタンスで稼働できます。

2. 同じチームのデータサイエンティストが、かなりのメモリ（236 GiB）が必要なクエリを実行する必要があると言っていますが、高可用性は必要なく、最初の実行が失敗しても待って再実行できます。

この例では、データベースの管理者として、次のことができます：

1. 2つのレプリカを持つ小さなサービスを作成します。それぞれ16 GiBのRAMを搭載し、これがETLジョブを満たし、高可用性を提供します。

2. データサイエンティストのために、236 GiBの1つのレプリカのみのサービスを同じウェアハウスに作成します。このサービスにアイドル状態を有効にすることで、データサイエンティストが使用していないときにこのサービスに対して料金を支払わないようにできます。

この例の**スケールティア**での月額コスト推定：
- 親サービスは24時間稼働：2レプリカ x 16 GiB 4 vCPU
- 子サービス：1レプリカ x 236 GiB 59 vCPU 
- 3 TBの圧縮データ + 1バックアップ
- 100 GBの公共インターネット出口データ転送
- 50 GBのリージョン間データ転送

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
    <td>公共インターネット出口データ転送</td>
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

ウェアハウスを使用しない場合、データエンジニアがクエリに必要とするメモリ量に対して料金を支払う必要があります。  
しかし、2つのサービスをウェアハウスに組み合わせ、一方をアイドル状態にすることでお金を節約できます。

## ClickPipes 料金 {#clickpipes-pricing}

### ClickPipesの料金構造はどのようになりますか？ {#what-does-the-clickpipes-pricing-structure-look-like}

2つの次元で構成されています。

- **コンピュート**: 時間単位あたりの単価  
  コンピュートは、ClickPipesのレプリカポッドを実行するコストを示します。データの取り込みを行なっているかに関わらず適用されます。
  すべてのClickPipesタイプに適用されます。
- **取り込まれたデータ**: GB単位の料金  
  取り込まれたデータ料金は、すべてのストリーミングClickPipes（  
  Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs）  
  に適用され、レプリカポッドを介して転送されたデータに対して課金されます。取り込まれたデータサイズ（GB）は、ソースから受信したバイト（圧縮または非圧縮）に基づいて請求されます。

### ClickPipesのレプリカとは何ですか？ {#what-are-clickpipes-replicas}

ClickPipesは、ClickHouse Cloudサービスから独立して実行およびスケーリングされる専用インフラストラクチャを介してリモートデータソースからデータを取り込みます。  
この理由から、専用のコンピュートレプリカを使用します。

### デフォルトのレプリカの数とサイズはどのくらいですか？ {#what-is-the-default-number-of-replicas-and-their-size}

各ClickPipeはデフォルトで1つのレプリカが提供され、2 GiBのRAMおよび0.5 vCPUが割り当てられます。  
これは**0.25** ClickHouseコンピュートユニットに相当します（1ユニット = 8 GiB RAM, 2 vCPUs）。

### ClickPipesの公開価格はどのようになりますか？ {#what-are-the-clickpipes-public-prices}

- コンピュート: \$0.20（単位あたり、時間ごと） (\$0.05（レプリカあたり、時間ごと）)
- 取り込まれたデータ: \$0.04（GBあたり）

### 例を使うとどのようになりますか？ {#how-does-it-look-in-an-illustrative-example}

以下の例は、特に明記されていない限り、単一のレプリカを想定しています。

<table><thead>
  <tr>
    <th></th>
    <th>24時間で100 GB取り込み</th>
    <th>24時間で1 TB取り込み</th>
    <th>24時間で10 TB取り込み</th>
  </tr></thead>
<tbody>
  <tr>
    <td>ストリーミングClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>4レプリカで:<br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>オブジェクトストレージClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _オーケストレーションのためのClickPipesコンピュートのみ、  
実効データ転送は基盤となるClickhouseサービスによって担保されます_
