---
sidebar_label: '概要'
slug: /cloud/manage/billing/overview
title: '料金'
description: 'ClickHouse Cloud の料金に関する概要ページ'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', '料金', '請求', 'クラウドコスト', 'コンピュート料金']
---

料金に関する情報は、[ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) ページを参照してください。
ClickHouse Cloud の請求額は、コンピュート、ストレージ、[データ転送](/cloud/manage/network-data-transfer)（インターネットおよびリージョン間への送信）、および [ClickPipes](/integrations/clickpipes) の使用量に基づいて決まります。
請求額に影響する要因や支出を管理する方法について理解するには、引き続きお読みください。



## Amazon Web Services (AWS) の例 {#amazon-web-services-aws-example}

:::note

- 価格はAWS us-east-1の価格を反映しています。
- 該当するデータ転送およびClickPipesの料金については[こちら](/cloud/manage/network-data-transfer)をご確認ください。
  :::

### Basic: 月額$66.52から {#basic-from-6652-per-month}

最適な用途: 厳格な信頼性保証を必要としない、小規模データ量の部門レベルのユースケース。

**Basicティアサービス**

- 1レプリカ x 8 GiB RAM、2 vCPU
- 圧縮データ500 GB
- データバックアップ500 GB
- パブリックインターネット送信データ転送10 GB
- クロスリージョンデータ転送5 GB

この例の料金内訳:

<table>
  <thead>
    <tr>
      <th></th>
      <th>1日6時間稼働</th>
      <th>1日12時間稼働</th>
      <th>1日24時間稼働</th>
    </tr>
  </thead>
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
      <td>パブリックインターネット送信データ転送</td>
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

### Scale (常時稼働、自動スケーリング): 月額$499.38から {#scale-always-on-auto-scaling-from-49938-per-month}

最適な用途: 強化されたSLA(2レプリカ以上のサービス)、スケーラビリティ、および高度なセキュリティを必要とするワークロード。

**Scaleティアサービス**

- 稼働時間約100%のワークロード
- 予期しない課金を防ぐための自動スケーリング上限設定が可能
- パブリックインターネット送信データ転送100 GB
- クロスリージョンデータ転送10 GB

この例の料金内訳:

<table>
  <thead>
    <tr>
      <th></th>
      <th>例1</th>
      <th>例2</th>
      <th>例3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>コンピュート</td>
      <td>
        2レプリカ x 8 GiB RAM、2 vCPU<br></br>\$436.95
      </td>
      <td>
        2レプリカ x 16 GiB RAM、4 vCPU<br></br>\$873.89
      </td>
      <td>
        3レプリカ x 16 GiB RAM、4 vCPU<br></br>\$1,310.84
      </td>
    </tr>
    <tr>
      <td>ストレージ</td>
      <td>
        データ1 TB + バックアップ1<br></br>\$50.60
      </td>
      <td>
        データ2 TB + バックアップ1<br></br>\$101.20
      </td>
      <td>
        データ3 TB + バックアップ1<br></br>\$151.80
      </td>
    </tr>
    <tr>
      <td>パブリックインターネット送信データ転送</td>
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

### Enterprise: 開始価格は変動します {#enterprise-starting-prices-vary}

最適な用途: 厳格なセキュリティおよびコンプライアンス要件を持つ、大規模でミッションクリティカルなデプロイメント




**エンタープライズティアサービス**
- ワークロードの稼働時間 ~100%
- パブリックインターネットへの送信データ転送量 1 TB
- リージョン間データ転送量 500 GB

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
    <td>レプリカ 2 基 x 32 GiB RAM、8 vCPU<br></br>\$2,285.60</td>
    <td>レプリカ 2 基 x 64 GiB RAM、16 vCPU<br></br>\$4,571.19</td>
    <td>2 基 x 120 GiB RAM、30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>ストレージ</td>
    <td>5 TB + バックアップ 1 個<br></br>\$253.00</td>
    <td>10 TB + バックアップ 1 個<br></br>\$506.00</td>
    <td>20 TB + バックアップ 1 個<br></br>\$1,012.00</td>
  </tr>
  <tr>
    <td>パブリックインターネットへの送信データ転送</td>
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

### ClickHouseクレジット（CHC）とは何ですか？ {#what-is-chc}

ClickHouseクレジットは、ClickHouse Cloudの利用に対する1米ドル相当のクレジット単位であり、ClickHouseの現行の公開価格表に基づいて適用されます。

:::note
Stripeを通じて請求される場合、Stripeの請求書では1 CHCが$0.01米ドルと表示されます。これは、Stripeが標準SKUである1 CHC = $1米ドルの端数数量を請求できないという制限があるため、正確な請求を可能にするためです。
:::

### 従来の価格設定はどこで確認できますか？ {#find-legacy-pricing}

従来の価格設定情報は[こちら](https://clickhouse.com/pricing?legacy=true)で確認できます。

### コンピュートはどのように計測されますか？ {#how-is-compute-metered}

ClickHouse Cloudは、8GB RAMの単位で分単位でコンピュートを計測します。
コンピュートコストは、ティア、リージョン、クラウドサービスプロバイダーによって異なります。

### ディスク上のストレージはどのように計算されますか？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloudはクラウドオブジェクトストレージを使用し、使用量はClickHouseテーブルに保存されたデータの圧縮サイズで計測されます。
ストレージコストはティア間で同一であり、リージョンとクラウドサービスプロバイダーによって異なります。

### バックアップは総ストレージ容量に含まれますか？ {#do-backups-count-toward-total-storage}

ストレージとバックアップはストレージコストに含まれ、個別に請求されます。
すべてのサービスはデフォルトで1日間保持される1つのバックアップが設定されています。
追加のバックアップが必要な場合は、Cloudコンソールの設定タブで追加の[バックアップ](/cloud/manage/backups/overview)を構成できます。

### 圧縮率はどのように見積もりますか？ {#how-do-i-estimate-compression}

圧縮率はデータセットによって異なります。
どの程度異なるかは、データがそもそもどの程度圧縮可能か（高カーディナリティフィールドと低カーディナリティフィールドの数）、およびスキーマの設定方法（例えば、オプションのコーデックを使用するかどうか）に依存します。
一般的な分析データの種類では10倍程度になることがありますが、それよりも大幅に低い場合や高い場合もあります。
ガイダンスについては[最適化ドキュメント](/optimize/asynchronous-inserts)を、詳細なログ記録のユースケース例については[Uberのブログ](https://www.uber.com/blog/logging/)を参照してください。
正確に知るための唯一の実用的な方法は、データセットをClickHouseに取り込み、データセットのサイズとClickHouseに保存されたサイズを比較することです。

次のクエリを使用できます：

```sql title="圧縮率の見積もり"
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = <your table name>
```

### セルフマネージドデプロイメントを使用している場合、クラウドでサービスを実行するコストを見積もるためにClickHouseはどのようなツールを提供していますか？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouseクエリログは、ClickHouse Cloudでワークロードを実行するコストを見積もるために使用できる[主要なメトリクス](/operations/system-tables/query_log)を記録します。
セルフマネージドからClickHouse Cloudへの移行の詳細については、[移行ドキュメント](/cloud/migration/clickhouse-to-cloud)を参照し、さらに質問がある場合は[ClickHouse Cloudサポート](https://console.clickhouse.cloud/support)にお問い合わせください。

### ClickHouse Cloudではどのような請求オプションが利用できますか？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloudは以下の請求オプションをサポートしています：

- セルフサービス月次（米ドル、クレジットカード経由）
- 直接販売の年次/複数年（事前支払いの「ClickHouseクレジット」を通じて、米ドル、追加の支払いオプションあり）
- AWS、GCP、Azureマーケットプレイスを通じて（従量課金制（PAYG）またはマーケットプレイスを通じてClickHouse Cloudとの契約にコミット）

:::note
PAYGのClickHouse Cloudクレジットは$0.01米ドル単位で請求され、使用量に基づいて部分的なClickHouseクレジットを請求できるようになっています。これは、事前に$1米ドル単位で購入されるコミット支出のClickHouseクレジットとは異なります。
:::

### クレジットカードを削除できますか？ {#can-i-delete-my-credit-card}

請求UIではクレジットカードを削除できませんが、いつでも更新できます。これにより、組織が常に有効な支払い方法を持つことが保証されます。クレジットカードを削除する必要がある場合は、[ClickHouse Cloudサポート](https://console.clickhouse.cloud/support)にお問い合わせください。

### 請求サイクルはどのくらいの期間ですか？ {#how-long-is-the-billing-cycle}

請求は月次の請求サイクルに従い、開始日はClickHouse Cloud組織が作成された日として記録されます。


### アクティブなPAYGマーケットプレイスサブスクリプションがあり、その後コミット契約を締結した場合、コミットクレジットが最初に消費されますか？ {#committed-credits-consumed-first-with-active-payg-subscription}

はい。使用量は以下の支払い方法の順序で消費されます：

- コミット（前払い）クレジット
- マーケットプレイスサブスクリプション（PAYG）
- クレジットカード

### ClickHouse CloudはScaleおよびEnterpriseサービスのコスト管理にどのような制御機能を提供していますか？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- トライアルおよび年間コミット契約のお客様は、消費量が特定の閾値（`50%`、`75%`、`90%`）に達すると、自動的にメールで通知されます。これにより、ユーザーは使用量を事前に管理できます。
- ClickHouse Cloudでは、分析ワークロードにおける重要なコスト要因であるコンピュートに対して、[高度なスケーリング制御](/manage/scaling)を使用して最大自動スケーリング制限を設定できます。
- [高度なスケーリング制御](/manage/scaling)では、メモリ制限を設定し、非アクティブ時の一時停止/アイドル動作を制御するオプションが提供されます。

### ClickHouse CloudはBasicサービスのコスト管理にどのような制御機能を提供していますか？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高度なスケーリング制御](/manage/scaling)では、非アクティブ時の一時停止/アイドル動作を制御できます。Basicサービスではメモリ割り当ての調整はサポートされていません。
- デフォルト設定では、非アクティブ期間後にサービスが一時停止されることに注意してください。

### 複数のサービスがある場合、サービスごとに請求書が発行されますか、それとも統合請求書が発行されますか？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

請求期間において、特定の組織内のすべてのサービスに対して統合請求書が生成されます。

### トライアル期間とクレジットが期限切れになる前にクレジットカードを追加してアップグレードした場合、課金されますか？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

ユーザーが30日間のトライアル期間が終了する前にトライアルから有料プランに変換し、トライアルクレジット残高が残っている場合、最初の30日間のトライアル期間中はトライアルクレジットから引き続き消費され、その後クレジットカードに課金されます。

### 支出を追跡するにはどうすればよいですか？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloudコンソールは、サービスごとの使用量を詳細に表示する使用量表示を提供します。使用量ディメンションごとに整理されたこの内訳により、各計測単位に関連するコストを把握できます。

### ClickHouse Cloudサービスのサブスクリプションに対する請求書にアクセスするにはどうすればよいですか？ {#how-do-i-access-my-invoice-for-my-subscription-to-the-clickhouse-cloud-service}

クレジットカードを使用した直接サブスクリプションの場合：

請求書を表示するには、ClickHouse Cloud UIの左側のナビゲーションバーから組織を選択し、「請求」に移動します。すべての請求書は「請求書」セクションに一覧表示されます。

クラウドマーケットプレイス経由のサブスクリプションの場合：

すべてのマーケットプレイスサブスクリプションは、マーケットプレイスによって請求および請求書発行されます。請求書は、それぞれのクラウドプロバイダーマーケットプレイスから直接表示できます。

### 使用量明細書の日付がマーケットプレイス請求書と一致しないのはなぜですか？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWSマーケットプレイスの請求は暦月サイクルに従います。
たとえば、2024年12月1日から2025年1月1日までの使用量に対して、
請求書は2025年1月3日から5日の間に生成されます。

ClickHouse Cloudの使用量明細書は異なる請求サイクルに従い、使用量はサインアップ日から30日間にわたって計測および報告されます。

これらの日付が同じでない場合、使用量と請求書の日付は異なります。使用量明細書は特定のサービスの日ごとの使用量を追跡するため、ユーザーは明細書を利用してコストの内訳を確認できます。

### 前払いクレジットの使用に関して制限はありますか？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloudの前払いクレジット（ClickHouseを通じた直接購入、またはクラウドプロバイダーのマーケットプレイス経由）は、契約条件の範囲内でのみ利用できます。
これは、受諾日または将来の日付に適用でき、過去の期間には適用できないことを意味します。
前払いクレジットでカバーされない超過分は、クレジットカード支払いまたはマーケットプレイスの月次請求でカバーする必要があります。

### クラウドプロバイダーマーケットプレイス経由で支払う場合とClickHouseに直接支払う場合で、ClickHouse Cloudの価格に違いはありますか？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}


マーケットプレイス経由の請求とClickHouseへの直接登録では、料金に違いはありません。
いずれの場合も、ClickHouse Cloudの使用量はClickHouse Cloud Credits（CHC）で追跡され、
同じ方法で計測されて請求されます。

### コンピュート分離の請求方法 {#how-is-compute-compute-separation-billed}

既存のサービスに加えて新しいサービスを作成する際、
この新しいサービスが既存のサービスと同じデータを共有するかどうかを選択できます。
共有する場合、これら2つのサービスは[ウェアハウス](/cloud/reference/warehouses)を形成します。
ウェアハウスにはデータが保存され、複数のコンピュートサービスがこのデータにアクセスします。

データは1回のみ保存されるため、複数のサービスがアクセスしていても、データのコピー1つ分の料金のみを支払います。
コンピュートの料金は通常通りです。コンピュート分離/ウェアハウスに対する追加料金はありません。
このデプロイメントで共有ストレージを活用することで、ストレージとバックアップの両方でコスト削減の恩恵を受けられます。

コンピュート分離により、場合によっては大幅なClickHouse Creditsの節約が可能です。
以下のセットアップが良い例です：

1. 24時間365日稼働してサービスにデータを取り込むETLジョブがあります。これらのETLジョブは大量のメモリを必要としないため、例えば32 GiBのRAMを持つ小規模なインスタンスで実行できます。

2. 同じチームのデータサイエンティストがアドホックなレポート要件を持っており、236 GiBという大量のメモリを必要とするクエリを実行する必要があります。ただし、高可用性は不要で、最初の実行が失敗した場合は待機してクエリを再実行できます。

この例では、データベース管理者として以下のことができます：

1. それぞれ16 GiBの2つのレプリカを持つ小規模なサービスを作成します。これによりETLジョブの要件を満たし、高可用性を提供します。

2. データサイエンティスト向けに、同じウェアハウス内に236 GiBのレプリカを1つだけ持つ2つ目のサービスを作成できます。このサービスにアイドリングを有効にすることで、データサイエンティストが使用していない時は料金が発生しません。

**Scaleティア**でのこの例の月額コスト見積もり：

- 親サービス24時間稼働：2レプリカ x 16 GiB、レプリカあたり4 vCPU
- 子サービス：1レプリカ x 236 GiB、レプリカあたり59 vCPU
- 圧縮データ3 TB + バックアップ1つ
- パブリックインターネットエグレスデータ転送100 GB
- クロスリージョンデータ転送50 GB

<table class='nowrap-header'>
  <thead>
    <tr>
      <th></th>
      <th>
        <span>子サービス</span>
        <br />
        <span>1日1時間稼働</span>
      </th>
      <th>
        <span>子サービス</span>
        <br />
        <span>1日2時間稼働</span>
      </th>
      <th>
        <span>子サービス</span>
        <br />
        <span>1日4時間稼働</span>
      </th>
    </tr>
  </thead>
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

ウェアハウスを使用しない場合、データサイエンティストがクエリに必要とするメモリ量に対して料金を支払う必要があります。
しかし、ウェアハウス内で2つのサービスを組み合わせ、一方をアイドリング状態にすることで、コストを節約できます。


## ClickPipes の料金 {#clickpipes-pricing}

ClickPipes の課金に関する詳細は、専用の[「ClickPipes の課金」セクション](/cloud/reference/billing/clickpipes)をご参照ください。
