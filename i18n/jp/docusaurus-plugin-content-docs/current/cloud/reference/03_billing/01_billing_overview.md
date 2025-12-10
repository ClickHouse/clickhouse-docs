---
sidebar_label: '概要'
slug: /cloud/manage/billing/overview
title: '料金'
description: 'ClickHouse Cloud の料金に関する概要ページ'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', '料金', '課金', 'クラウドコスト', 'コンピュート料金']
---

料金の詳細については、[ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) ページを参照してください。
ClickHouse Cloud の課金は、コンピュート、ストレージ、[データ転送](/cloud/manage/network-data-transfer)（インターネットおよびリージョン間への送信）、および [ClickPipes](/integrations/clickpipes) の使用量に基づいて行われます。
請求額に影響する要素や、コストを管理する方法について理解するには、以下を読み進めてください。

## Amazon Web Services (AWS) の例 {#amazon-web-services-aws-example}

:::note
- 料金は AWS us-east-1 の価格を反映しています。
- 該当するデータ転送料金および ClickPipes の料金は[こちら](/cloud/manage/network-data-transfer)をご覧ください。
:::

### Basic: 月額 $66.52 から {#basic-from-6652-per-month}

最適なユースケース: 厳密な信頼性保証を必要としない、小規模なデータ量の部門レベルのユースケース。

**Basic ティアのサービス**
- 1 レプリカ x 8 GiB RAM, 2 vCPU
- 圧縮データ 500 GB
- データバックアップ 500 GB
- パブリックインターネット送信データ転送 10 GB
- リージョン間データ転送 5 GB

この例における料金の内訳:

<table><thead>
  <tr>
    <th></th>
    <th>1 日あたり 6 時間稼働</th>
    <th>1 日あたり 12 時間稼働</th>
    <th>1 日あたり 24 時間稼働</th>
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
    <td>パブリックインターネット送信データ転送</td>
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

### Scale (常時稼働・自動スケーリング): 月額 $499.38 から {#scale-always-on-auto-scaling-from-49938-per-month}

最適なユースケース: 強化された SLA (2 つ以上のレプリカサービス)、スケーラビリティ、高度なセキュリティを必要とするワークロード。

**Scale ティアのサービス**
- 稼働時間がおおよそ 100% のワークロード
- 予期しない料金の増加を防ぐため、自動スケーリングの上限を設定可能
- パブリックインターネット送信データ転送 100 GB
- リージョン間データ転送 10 GB

この例における料金の内訳:

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
    <td>データ 1 TB + バックアップ 1 TB<br></br>\$50.60</td>
    <td>データ 2 TB + バックアップ 2 TB<br></br>\$101.20</td>
    <td>データ 3 TB + バックアップ 3 TB<br></br>\$151.80</td>
  </tr>
  <tr>
    <td>パブリックインターネット送信データ転送</td>
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

### Enterprise: 開始価格は構成によって異なります {#enterprise-starting-prices-vary}

最適なユースケース: 厳格なセキュリティおよびコンプライアンス要件を持つ、大規模でミッションクリティカルなデプロイメント

**エンタープライズティアサービス**
- 稼働率ほぼ 100% のワークロード
- パブリックインターネット向け送信データ転送 1 TB
- リージョン間データ転送 500 GB

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
    <td>2 レプリカ x 32 GiB RAM、8 vCPU<br></br>\$2,285.60</td>
    <td>2 レプリカ x 64 GiB RAM、16 vCPU<br></br>\$4,571.19</td>
    <td>2 レプリカ x 120 GiB RAM、30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>ストレージ</td>
    <td>5 TB + バックアップ 1 個<br></br>\$253.00</td>
    <td>10 TB + バックアップ 1 個<br></br>\$506.00</td>
    <td>20 TB + バックアップ 1 個<br></br>\$1,012.00</td>
  </tr>
  <tr>
    <td>パブリックインターネット向け送信データ転送</td>
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

### ClickHouse Credit (CHC) とは何ですか？ {#what-is-chc}

ClickHouse Credit は、ClickHouse Cloud の利用に対するクレジットの単位であり、1 CHC は 1 米ドル (US$1) に相当します。これは、ClickHouse がその時点で公開している価格表に基づいて適用されます。

:::note
Stripe を通じて請求されている場合、Stripe の請求書上では 1 CHC は US$0.01 として表示されます。これは、当社の標準 SKU（1 CHC = US$1）について、Stripe 側の仕様上、端数数量を請求できないためであり、その制約の中で正確な請求を行うためのものです。
:::

### 旧プラン（レガシー）の料金はどこで確認できますか？ {#find-legacy-pricing}

旧プラン（レガシー）の料金情報は[こちら](https://clickhouse.com/pricing?legacy=true)で確認できます。

### コンピュート（計算リソース）はどのように計測されますか？ {#how-is-compute-metered}

ClickHouse Cloud は、コンピュートを 8G RAM 単位で 1 分ごとに計測します。
コンピュートコストはティア、リージョン、クラウドサービスプロバイダーによって異なります。

### ディスク上のストレージはどのように算出されますか？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloud はクラウドオブジェクトストレージを使用しており、ClickHouse のテーブルに保存されているデータの圧縮後サイズに基づいて使用量を計測します。
ストレージコストはティア間で共通ですが、リージョンおよびクラウドサービスプロバイダーによって異なります。

### バックアップはストレージの合計に含まれますか？ {#do-backups-count-toward-total-storage}

ストレージとバックアップはいずれもストレージコストの対象となり、個別に請求されます。
すべてのサービスは、デフォルトで 1 日間保持される 1 つのバックアップが有効になっています。
追加のバックアップが必要なユーザーは、Cloud コンソールの設定タブで追加の[バックアップ](/cloud/manage/backups/overview)を構成することで対応できます。

### 圧縮率はどのように見積もればよいですか？ {#how-do-i-estimate-compression}

圧縮率はデータセットごとに大きく異なります。
どの程度変動するかは、そもそもデータがどれだけ圧縮しやすいか（高カーディナリティと低カーディナリティのフィールドの数など）や、
ユーザーがスキーマをどのように設計するか（オプションのコーデックを使用するかどうかなど）に依存します。
一般的な分析用データ型では、圧縮率が 10 倍程度になることもありますが、それより低くなる場合も高くなる場合もあります。
ガイドラインについては[最適化ドキュメント](/optimize/asynchronous-inserts)を、詳細なログ記録のユースケース例についてはこの [Uber のブログ記事](https://www.uber.com/blog/logging/)を参照してください。
正確な値を把握する唯一の実用的な方法は、実際にデータセットを ClickHouse に取り込み、元のデータセットサイズと ClickHouse に保存されたサイズを比較することです。

次のクエリを使用できます。

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <任意のテーブル名>
```

### セルフマネージドで運用している場合、クラウドでサービスを実行する際のコストを見積もるために ClickHouse はどのようなツールを提供していますか？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouse のクエリログは、ClickHouse Cloud でワークロードを実行するためのコストを見積もる際に利用できる[主要なメトリクス](/operations/system-tables/query_log)を記録します。
セルフマネージド環境から ClickHouse Cloud への移行の詳細については[移行ドキュメント](/cloud/migration/clickhouse-to-cloud)を参照し、さらに質問がある場合は [ClickHouse Cloud support](https://console.clickhouse.cloud/support) までお問い合わせください。

### ClickHouse Cloud にはどのような課金オプションがありますか？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud は次の課金オプションをサポートしています：

* セルフサービスによる月次課金（米ドル建て、クレジットカード払い）。
* 直販による年次 / 複数年契約（事前購入の「ClickHouse Credits」による米ドル建て支払いで、追加の支払いオプションも利用可能）。
* AWS、GCP、Azure のマーケットプレイス経由（従量課金制 (PAYG) またはマーケットプレイス経由で ClickHouse Cloud と契約を締結）。

:::note
PAYG 向けの ClickHouse Cloud クレジットは 0.01 ドル単位で請求されるため、利用状況に応じてクレジットの端数も含めて課金できます。これは、事前購入するコミット型の ClickHouse クレジット（1 ドル単位の整数額で購入）とは異なります。
:::

### クレジットカードを削除できますか？ {#can-i-delete-my-credit-card}

Billing UI からクレジットカードを削除することはできませんが、いつでも更新することはできます。これにより、常に有効な支払い方法が組織に設定されていることを保証します。クレジットカードを削除する必要がある場合は、[ClickHouse Cloud support](https://console.clickhouse.cloud/support) までお問い合わせください。

### 課金サイクルはどのくらいの期間ですか？ {#how-long-is-the-billing-cycle}

課金は月次サイクルに従い、開始日は ClickHouse Cloud の組織が作成された日となります。

### アクティブな PAYG マーケットプレイスサブスクリプションがある状態でコミットメント契約を締結した場合、先に消費されるのはコミット済みクレジットですか？ {#committed-credits-consumed-first-with-active-payg-subscription}

はい。利用分には、次の支払い方法がこの順番で適用されます:
- コミットメント（前払い）クレジット
- マーケットプレイスサブスクリプション（PAYG）
- クレジットカード

### ClickHouse Cloud の Scale および Enterprise サービスのコストを管理するためのコントロールには、どのようなものがありますか？ {#what-controls-doesclickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- Trial プランおよび Annual Commit のお客様には、消費量が `50%`、`75%`、`90%` のしきい値に達した際に、自動的にメールで通知されます。これにより、ユーザーは事前に利用量を管理できます。
- ClickHouse Cloud では、分析ワークロードにおける主要なコスト要因であるコンピュートについて、[Advanced scaling control](/manage/scaling) を使用して自動スケーリングの最大上限を設定できます。
- [Advanced scaling control](/manage/scaling) により、非アクティブ時の一時停止／アイドル状態の動作を制御するオプション付きでメモリ上限を設定できます。

### ClickHouse Cloud の Basic サービスのコストを管理するためのコントロールには、どのようなものがありますか？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [Advanced scaling control](/manage/scaling) により、非アクティブ時の一時停止／アイドル状態の動作を制御できます。Basic サービスではメモリ割り当ての調整はサポートされていません。
- 既定の設定では、一定期間アクティビティがないとサービスが一時停止される点に注意してください。

### 複数のサービスがある場合、サービスごとに請求書が発行されますか、それとも統合された請求書になりますか？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

特定の組織内のすべてのサービスに対し、その請求期間分をまとめた統合請求書が生成されます。

### トライアル期間およびトライアルクレジットが失効する前にクレジットカードを追加してアップグレードした場合、課金されますか？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

ユーザーが 30 日間のトライアル期間終了前にトライアルから有償プランへ移行し、なおかつトライアルクレジットが残っている場合、
最初の 30 日間のトライアル期間中は引き続きトライアルクレジットから消費され、その後にクレジットカードに課金されます。

### 自分の支出状況をどのように把握できますか？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloud コンソールには、サービスごとの利用状況を詳細に表示する Usage 画面があります。利用ディメンションごとに整理されたこの内訳により、各メーターユニットに関連するコストを把握できます。

### ClickHouse Cloud サービスのサブスクリプションに対する請求書には、どのようにアクセスできますか？ {#how-do-i-access-my-invoice-for-my-subscription-to-the-clickhouse-cloud-service}

クレジットカードによる直接サブスクリプションの場合:

ClickHouse Cloud UI の左側のナビゲーションバーから自分の組織を選択し、Billing に移動すると請求書を閲覧できます。すべての請求書は Invoices セクションに一覧表示されます。

クラウドマーケットプレイス経由のサブスクリプションの場合:

すべてのマーケットプレイスサブスクリプションは、マーケットプレイスによって請求・インボイス発行されます。請求書は、各クラウドプロバイダのマーケットプレイスから直接確認できます。

### Usage ステートメントの日付が、マーケットプレイスの請求書の日付と一致しないのはなぜですか？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS Marketplace の課金はカレンダーベースの月次サイクルに従います。
たとえば、2024-12-01 から 2025-01-01 までの利用分については、
2025-01-03 から 2025-01-05 の間に請求書が生成されます。

ClickHouse Cloud の Usage ステートメントは別の請求サイクルに従っており、
サインアップ日を起点とした 30 日間で利用が計測・報告されます。

これらの日付が一致しない場合、Usage ステートメントと請求書の日付は異なります。Usage ステートメントは特定サービスの利用を日別に追跡しているため、ユーザーはコスト内訳を確認する際にステートメントを参照できます。

### プリペイドクレジットの利用に関して、何か制限はありますか？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloud のプリペイドクレジット（ClickHouse からの直接購入、またはクラウドプロバイダのマーケットプレイス経由のいずれの場合も）は、
契約条件の範囲内でのみ利用できます。
つまり、受領日あるいは将来の日付から適用可能ですが、それ以前の期間には適用できません。
プリペイドクレジットでカバーされない超過分については、クレジットカードでの支払い、またはマーケットプレイスでの月次請求により支払う必要があります。

### ClickHouse Cloud の料金は、クラウドプロバイダのマーケットプレイス経由で支払う場合と ClickHouse に直接支払う場合で違いはありますか？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

マーケットプレイス課金と ClickHouse に直接サインアップする場合の料金に違いはありません。
いずれの場合も、ClickHouse Cloud の利用量は ClickHouse Cloud Credits (CHCs) 単位で計測され、
同じ方法でメータリングされ、その結果に基づいて課金されます。

### コンピュート分離はどのように課金されますか？ {#how-is-compute-compute-separation-billed}

既存のサービスに加えて新しいサービスを作成する際に、
この新しいサービスが既存のサービスと同じデータを共有するかどうかを選択できます。
「はい」の場合、これら 2 つのサービスは [warehouse](/cloud/reference/warehouses) を構成します。
warehouse にはデータが保存されており、複数のコンピュートサービスがこのデータにアクセスします。

データは 1 回だけ保存されるため、複数のサービスからアクセスされていても、支払うのは 1 つ分のデータ容量のみです。
コンピュートについては通常どおり課金され、コンピュート分離 / warehouse に対する追加料金は発生しません。
このデプロイメントで共有ストレージを活用することで、ユーザーはストレージおよびバックアップの両方のコスト削減の恩恵を受けられます。

コンピュート分離は、ケースによっては ClickHouse Cloud Credits を大幅に節約できる場合があります。
良い例として、次のような構成が挙げられます。

1. サービスに対して 24 時間 365 日稼働し、データを取り込む ETL ジョブがあります。これらの ETL ジョブは多くのメモリを必要としないため、例えば 32 GiB の RAM を持つ小さなインスタンス上で実行できます。

2. 同じチームのデータサイエンティストがアドホックなレポーティング要件を持っており、大量のメモリ (236 GiB) を必要とするクエリを実行する必要があると言っています。しかし、高可用性は必要なく、最初の実行が失敗した場合は待ってクエリを再実行しても構わないとしています。

この例では、データベース管理者として、次のことができます。

1. それぞれ 16 GiB のレプリカを 2 つ持つ小さなサービスを作成します。これで ETL ジョブの要件を満たし、高可用性も提供できます。

2. データサイエンティスト向けには、同じ warehouse 内に 1 つのレプリカ (236 GiB) のみを持つ 2 つ目のサービスを作成できます。このサービスでアイドル化を有効にすることで、データサイエンティストが利用していない間は、このサービスに対して課金されません。

この例における **Scale Tier** での月額コストの試算:
- 親サービス: 1 日 24 時間稼働、2 レプリカ x 各 16 GiB 4 vCPU
- 子サービス: 1 レプリカ x 各 236 GiB 59 vCPU
- 3 TB の圧縮データ + 1 つのバックアップ
- 100 GB のパブリックインターネット送信データ転送料
- 50 GB のリージョン間データ転送料

<table class="nowrap-header"><thead>
  <tr>
    <th></th>
    <th><span>子サービス</span><br/><span>1 日あたり 1 時間稼働</span></th>
    <th><span>子サービス</span><br/><span>1 日あたり 2 時間稼働</span></th>
    <th><span>子サービス</span><br/><span>1 日あたり 4 時間稼働</span></th>
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
    <td>パブリックインターネット送信データ転送料</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
  </tr>
  <tr>
    <td>リージョン間データ転送料</td>
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

warehouse を利用しない場合、データエンジニアがクエリに必要とするメモリ量に対して支払う必要があります。
しかし、2 つのサービスを 1 つの warehouse にまとめ、そのうち片方をアイドル状態にできるようにすることで、コストを削減できます。

## ClickPipes の料金 {#clickpipes-pricing}

ClickPipes の課金に関する情報は、専用の[「ClickPipes の課金」セクション](/cloud/reference/billing/clickpipes)を参照してください。
