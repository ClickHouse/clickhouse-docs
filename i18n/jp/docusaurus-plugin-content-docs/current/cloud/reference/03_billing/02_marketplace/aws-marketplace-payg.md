---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace 従量課金 (PAYG)'
description: 'AWS Marketplace（従量課金制: PAYG）経由で ClickHouse Cloud をサブスクライブします。'
keywords: ['aws', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
---

import aws_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-1.png';
import aws_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-2.png';
import aws_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-3.png';
import aws_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-4.png';
import aws_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-5.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import Image from '@theme/IdealImage';

PAYG（従量課金制）のパブリックオファーを利用して、[AWS Marketplace](https://aws.amazon.com/marketplace) から ClickHouse Cloud の利用を開始しましょう。


## 前提条件 {#prerequisites}

- 請求管理者によって購入権限が付与されたAWSアカウント。
- 購入するには、このアカウントでAWS Marketplaceにログインする必要があります。
- ClickHouse組織をサブスクリプションに接続するには、その組織の管理者である必要があります。

:::note
1つのAWSアカウントで購読できる「ClickHouse Cloud - Pay As You Go」サブスクリプションは1つのみであり、そのサブスクリプションは1つのClickHouse組織にのみ紐付けることができます。
:::


## サインアップ手順 {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### ClickHouse Cloud - Pay As You Goを検索 {#search-payg}

[AWS Marketplace](https://aws.amazon.com/marketplace)にアクセスし、「ClickHouse Cloud - Pay As You Go」を検索します。

<Image
  img={aws_marketplace_payg_1}
  alt='AWS MarketplaceでClickHouseを検索'
  border
/>

### 購入オプションを表示 {#purchase-options}

[リスティング](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu)をクリックし、次に**購入オプションを表示**をクリックします。

<Image
  img={aws_marketplace_payg_2}
  alt='AWS Marketplaceの購入オプション表示'
  border
/>

### サブスクライブ {#subscribe}

次の画面でサブスクライブをクリックします。

:::note
**発注書（PO）番号**はオプションであり、省略可能です。
:::

<Image img={aws_marketplace_payg_3} alt='AWS Marketplaceでサブスクライブ' border />

### アカウントのセットアップ {#set-up-your-account}

この時点ではセットアップは完了しておらず、ClickHouse Cloud組織はまだマーケットプレイス経由で請求されていないことに注意してください。セットアップを完了するには、マーケットプレイスサブスクリプションの「アカウントのセットアップ」をクリックして、ClickHouse Cloudにリダイレクトする必要があります。

<Image img={aws_marketplace_payg_4} alt='アカウントのセットアップ' border />

ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントで登録できます。このステップは、ClickHouse Cloud組織をAWS Marketplaceの請求に紐付けるために非常に重要です。

:::note[ClickHouse Cloud新規ユーザー]
ClickHouse Cloudの新規ユーザーの場合は、以下の手順に従ってください。
:::

<details>
<summary><strong>新規ユーザー向けの手順</strong></summary>

ClickHouse Cloudの新規ユーザーの場合は、ページ下部の「登録」をクリックします。新しいユーザーを作成し、メールアドレスを確認するよう求められます。メールアドレスの確認後、ClickHouse Cloudのログインページを離れ、https://console.clickhouse.cloudで新しいユーザー名を使用してログインできます。

<Image img={aws_marketplace_payg_5} size='md' alt='ClickHouse Cloudサインアップ' />

:::note[新規ユーザー]
ビジネスに関する基本情報も提供する必要があります。以下のスクリーンショットを参照してください。
:::

<Image img={aws_marketplace_payg_6} size='md' alt='開始前の情報入力' />

<Image img={aws_marketplace_payg_7} size='md' alt='開始前の情報入力（続き）' />

</details>

既存のClickHouse Cloudユーザーの場合は、認証情報を使用してログインするだけです。

### マーケットプレイスサブスクリプションを組織に追加 {#add-marketplace-subscription}

ログインに成功したら、このマーケットプレイスサブスクリプションに請求する新しい組織を作成するか、このサブスクリプションに請求する既存の組織を選択するかを決定できます。

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='マーケットプレイスサブスクリプションの追加'
  border
/>

このステップを完了すると、組織がこのAWSサブスクリプションに接続され、すべての使用量がAWSアカウント経由で請求されます。

ClickHouse UIの組織の請求ページから、請求が実際にAWSマーケットプレイスにリンクされていることを確認できます。

<Image
  img={aws_marketplace_payg_9}
  size='lg'
  alt='請求ページの確認'
  border
/>

</VerticalStepper>


## サポート {#support}

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program)までお気軽にお問い合わせください。
