---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: 'GCP Marketplace 従量課金 (PAYG)'
description: 'GCP Marketplace（従量課金/PAYG）を通じて ClickHouse Cloud を利用開始します。'
keywords: ['gcp', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
---

import gcp_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-1.png';
import gcp_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-2.png';
import gcp_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-3.png';
import gcp_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-4.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';
import Image from '@theme/IdealImage';

[GCP Marketplace](https://console.cloud.google.com/marketplace) から PAYG（従量課金制）のパブリックオファーを利用して、ClickHouse Cloud の利用を開始します。


## 前提条件 {#prerequisites}

- 請求管理者によって購入権限が付与されているGCPプロジェクト。
- GCP MarketplaceでClickHouse Cloudにサブスクライブするには、購入権限を持つアカウントでログインし、適切なプロジェクトを選択する必要があります。


## サインアップ手順 {#steps-to-sign-up}

1. [GCP Marketplace](https://cloud.google.com/marketplace)にアクセスし、ClickHouse Cloudを検索します。正しいプロジェクトが選択されていることを確認してください。

<Image
  img={gcp_marketplace_payg_1}
  size='md'
  alt='GCP Marketplaceホームページ'
  border
/>

2. [リスティング](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)をクリックし、次に**Subscribe**をクリックします。

<Image
  img={gcp_marketplace_payg_2}
  size='md'
  alt='GCP MarketplaceのClickHouse Cloud'
  border
/>

3. 次の画面でサブスクリプションを設定します:

- プランはデフォルトで「ClickHouse Cloud」になります
- サブスクリプション期間は「Monthly」です
- 適切な請求先アカウントを選択します
- 利用規約に同意し、**Subscribe**をクリックします

<br />

<Image
  img={gcp_marketplace_payg_3}
  size='sm'
  alt='GCP Marketplaceでサブスクリプションを設定'
  border
/>

<br />

4. **Subscribe**をクリックすると、**Sign up with ClickHouse**というモーダルが表示されます。

<br />

<Image
  img={gcp_marketplace_payg_4}
  size='md'
  alt='GCP Marketplaceサインアップモーダル'
  border
/>

<br />

5. この時点では、セットアップはまだ完了していないことに注意してください。**Set up your account**をクリックしてClickHouse Cloudにリダイレクトし、ClickHouse Cloudでサインアップする必要があります。

6. ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントで登録できます。この手順は、ClickHouse Cloud組織をGCP Marketplaceの請求に紐付けるために非常に重要です。

<br />

<Image
  img={aws_marketplace_payg_6}
  size='md'
  alt='ClickHouse Cloudサインインページ'
  border
/>

<br />

ClickHouse Cloudの新規ユーザーの場合は、ページ下部の**Register**をクリックしてください。新しいユーザーを作成し、メールアドレスを確認するよう求められます。メールアドレスを確認した後、ClickHouse Cloudログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud)で新しいユーザー名を使用してログインできます。

<br />

<Image
  img={aws_marketplace_payg_7}
  size='md'
  alt='ClickHouse Cloudサインアップページ'
  border
/>

<br />

新規ユーザーの場合は、ビジネスに関する基本情報も提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='ClickHouse Cloudサインアップ情報フォーム'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_9}
  size='md'
  alt='ClickHouse Cloudサインアップ情報フォーム2'
  border
/>

<br />

既存のClickHouse Cloudユーザーの場合は、認証情報を使用してログインするだけです。

7. ログインに成功すると、新しいClickHouse Cloud組織が作成されます。この組織はGCP請求先アカウントに接続され、すべての使用量はGCPアカウント経由で請求されます。

8. ログイン後、請求が実際にGCP Marketplaceに紐付けられていることを確認し、ClickHouse Cloudリソースのセットアップを開始できます。

<br />

<Image
  img={gcp_marketplace_payg_5}
  size='md'
  alt='ClickHouse Cloudサインインページ'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_11}
  size='md'
  alt='ClickHouse Cloud新規サービスページ'
  border
/>

<br />

9. サインアップを確認するメールが届きます:

<br />
<br />

<Image
  img={gcp_marketplace_payg_6}
  size='md'
  alt='GCP Marketplace確認メール'
  border
/>

<br />

<br />

問題が発生した場合は、遠慮なく[サポートチーム](https://clickhouse.com/support/program)にお問い合わせください。
