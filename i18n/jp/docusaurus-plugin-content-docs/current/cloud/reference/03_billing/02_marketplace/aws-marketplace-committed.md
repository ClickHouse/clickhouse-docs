---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: 'AWS Marketplace コミット契約'
description: 'AWS Marketplace（コミット契約）経由で ClickHouse Cloud を契約する'
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

コミット型契約を通じて、[AWS Marketplace](https://aws.amazon.com/marketplace) から ClickHouse Cloud の利用を開始できます。
コミット型契約（Private Offer とも呼ばれます）は、一定期間にわたり ClickHouse Cloud に対してあらかじめ定めた金額の利用を約束する契約形態です。


## 前提条件 {#prerequisites}

- 特定の契約条件に基づくClickHouseからのプライベートオファー
- ClickHouse組織をコミット支出オファーに接続するには、その組織の管理者である必要があります。

:::note
1つのAWSアカウントでサブスクライブできる「ClickHouse Cloud - Committed Contract」プライベートオファーは1つのみであり、これは1つのClickHouse組織にのみリンクできます。
:::

AWSでコミット契約を表示および承認するために必要な権限:

- AWSマネージドポリシーを使用する場合、以下の権限が必要です:
  - `AWSMarketplaceRead-only`、`AWSMarketplaceManageSubscriptions`
  - または`AWSMarketplaceFullAccess`
- AWSマネージドポリシーを使用していない場合、以下の権限が必要です:
  - IAMアクション`aws-marketplace:ListPrivateListings`および`aws-marketplace:ViewSubscriptions`


## サインアップ手順 {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### プライベートオファーを承認する {#private-offer-accept}

プライベートオファーを確認して承認するためのリンクが記載されたメールが届いているはずです。

<Image
  img={mp_committed_spend_1}
  size='md'
  alt='AWS Marketplaceプライベートオファーメール'
/>

### オファーリンクを確認する {#review-offer-link}

メール内の「Review Offer」リンクをクリックします。
プライベートオファーの詳細が表示されたAWS Marketplaceページに移動します。

### アカウントを設定する {#setup-your-account}

AWSポータルでサブスクリプション手順を完了し、**「Set up your account」**をクリックします。
この時点でClickHouse Cloudにリダイレクトし、新しいアカウントを登録するか、既存のアカウントでサインインすることが重要です。
この手順を完了しないと、AWS MarketplaceコントラクトをClickHouse Cloudにリンクできません。

<Image
  img={mp_committed_spend_2}
  size='md'
  alt='AWS Marketplaceプライベートオファーメール'
/>

### Cloudにログインする {#login-cloud}

ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録します。
この手順は、ClickHouse CloudオーガニゼーションをAWS Marketplaceの請求に紐付けるために必要です。

<Image
  img={mp_committed_spend_3}
  size='md'
  alt='AWS Marketplaceプライベートオファーメール'
/>

### 新規の場合は登録する {#register}

ClickHouse Cloudの新規ユーザーの場合は、ページ下部の「Register」をクリックします。
新しいユーザーを作成し、メールアドレスを確認するよう求められます。
メールアドレスの確認後、ClickHouse Cloudログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud)で新しいユーザー名を使用してログインできます。

新規ユーザーの場合、ビジネスに関する基本情報も提供する必要があります。
以下のスクリーンショットを参照してください。

<Image
  img={mp_committed_spend_4}
  size='md'
  alt='ビジネス情報を提供'
/>

<Image
  img={mp_committed_spend_5}
  size='md'
  alt='ビジネス情報を提供'
/>

既存のClickHouse Cloudユーザーの場合は、認証情報を使用してログインします。

### 請求先オーガニゼーションを作成または選択する {#create-select-org-to-bill}

ログインに成功したら、このマーケットプレイスコントラクトに請求する新しいオーガニゼーションを作成するか、このコントラクトに請求する既存のオーガニゼーションを選択します。

<Image
  img={mp_committed_spend_6}
  size='md'
  alt='このサブスクリプションに請求するオーガニゼーションを作成または選択'
/>

この手順を完了すると、オーガニゼーションがAWSコミット支出コントラクトに接続され、すべての使用量がAWSアカウント経由で請求されます。
ClickHouse UIのオーガニゼーションの請求ページから、請求が実際にAWS Marketplaceにリンクされていることを確認できます。

<Image img={mp_committed_spend_7} size='md' alt='設定完了を確認' />

問題が発生した場合は、お気軽に[サポートチーム](https://clickhouse.com/support/program)にお問い合わせください。

</VerticalStepper>
