---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: 'AWS Marketplace コミットメント契約'
description: 'AWS Marketplace を通じて ClickHouse Cloud にコミットメント契約で申し込む'
keywords: ['aws', 'amazon', 'marketplace', 'billing', 'committed', 'committed contract']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mp_committed_spend_1 from '@site/static/images/cloud/reference/mp_committed_spend_1.png'
import mp_committed_spend_2 from '@site/static/images/cloud/reference/mp_committed_spend_2.png'
import mp_committed_spend_3 from '@site/static/images/cloud/reference/mp_committed_spend_3.png'
import mp_committed_spend_4 from '@site/static/images/cloud/reference/mp_committed_spend_4.png'
import mp_committed_spend_5 from '@site/static/images/cloud/reference/mp_committed_spend_5.png'
import mp_committed_spend_6 from '@site/static/images/cloud/reference/mp_committed_spend_6.png'
import mp_committed_spend_7 from '@site/static/images/cloud/reference/mp_committed_spend_7.png'

コミット済み契約（committed contract）を利用して、[AWS Marketplace](https://aws.amazon.com/marketplace) から ClickHouse Cloud の利用を開始できます。\
`Committed contract`（Private Offer とも呼ばれます）は、お客様が一定期間にわたり ClickHouse Cloud に対して特定の金額の利用を約束するための仕組みです。


## 前提条件 {#prerequisites}

- 特定の契約条件に基づくClickHouseからのプライベートオファー
- ClickHouse組織をコミット支出オファーに接続するには、その組織の管理者である必要があります。

:::note
1つのAWSアカウントでサブスクライブできる「ClickHouse Cloud - Committed Contract」プライベートオファーは1つのみで、それは1つのClickHouse組織にのみリンクできます。
:::

AWSでコミット契約を表示および承認するために必要な権限:

- AWSマネージドポリシーを使用する場合、以下の権限が必要です:
  - `AWSMarketplaceRead-only`、`AWSMarketplaceManageSubscriptions`
  - または `AWSMarketplaceFullAccess`
- AWSマネージドポリシーを使用していない場合、以下の権限が必要です:
  - IAMアクション `aws-marketplace:ListPrivateListings` および `aws-marketplace:ViewSubscriptions`


## サインアップ手順 {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### プライベートオファーの承認 {#private-offer-accept}

プライベートオファーを確認して承認するためのリンクが記載されたメールが届いているはずです。

<Image
  img={mp_committed_spend_1}
  size='md'
  alt='AWS Marketplaceプライベートオファーメール'
/>

### オファーリンクの確認 {#review-offer-link}

メール内の「Review Offer」リンクをクリックします。
プライベートオファーの詳細が表示されたAWS Marketplaceページに移動します。

### アカウントのセットアップ {#setup-your-account}

AWSポータルでサブスクリプション手順を完了し、**「Set up your account」**をクリックします。
この時点でClickHouse Cloudにリダイレクトし、新規アカウントを登録するか、既存のアカウントでサインインすることが重要です。
この手順を完了しないと、AWS MarketplaceコントラクトをClickHouse Cloudにリンクできません。

<Image
  img={mp_committed_spend_2}
  size='md'
  alt='AWS Marketplaceプライベートオファーメール'
/>

### Cloudへのログイン {#login-cloud}

ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新規アカウントを登録します。
この手順は、ClickHouse Cloud組織をAWS Marketplaceの請求に紐付けるために必要です。

<Image
  img={mp_committed_spend_3}
  size='md'
  alt='AWS Marketplaceプライベートオファーメール'
/>

### 新規ユーザーの場合は登録 {#register}

ClickHouse Cloudの新規ユーザーの場合は、ページ下部の「Register」をクリックします。
新規ユーザーの作成とメールアドレスの確認を求められます。
メールアドレスを確認した後、ClickHouse Cloudのログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud)で新しいユーザー名を使用してログインできます。

新規ユーザーの場合、ビジネスに関する基本情報の提供も必要になります。
以下のスクリーンショットを参照してください。

<Image
  img={mp_committed_spend_4}
  size='md'
  alt='ビジネス情報の提供'
/>

<Image
  img={mp_committed_spend_5}
  size='md'
  alt='ビジネス情報の提供'
/>

既存のClickHouse Cloudユーザーの場合は、認証情報を使用してログインするだけです。

### 請求先組織の作成または選択 {#create-select-org-to-bill}

ログインに成功したら、このマーケットプレイスコントラクトに請求する新しい組織を作成するか、このコントラクトに請求する既存の組織を選択するかを決定できます。

<Image
  img={mp_committed_spend_6}
  size='md'
  alt='このサブスクリプションに請求する組織の作成または選択'
/>

この手順を完了すると、組織がAWSコミット支出コントラクトに接続され、すべての使用量がAWSアカウント経由で請求されます。
ClickHouse UIの組織の請求ページから、請求が実際にAWS Marketplaceにリンクされていることを確認できます。

<Image img={mp_committed_spend_7} size='md' alt='セットアップ完了の確認' />

問題が発生した場合は、遠慮なく[サポートチーム](https://clickhouse.com/support/program)にお問い合わせください。

</VerticalStepper>
