---
slug: '/cloud/billing/marketplace/gcp-marketplace-payg'
title: 'GCP Marketplace PAYG'
description: 'Subscribe to ClickHouse Cloud through the GCP Marketplace (PAYG).'
keywords:
- 'gcp'
- 'marketplace'
- 'billing'
- 'PAYG'
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

ClickHouse Cloudを[GCP Marketplace](https://console.cloud.google.com/marketplace)でPAYG（従量課金）公共オファーを通じて始めましょう。

## 必要条件 {#prerequisites}

- 請求管理者によって購入権が有効化されているGCPプロジェクト。
- GCP MarketplaceでClickHouse Cloudをサブスクライブするには、購入権を持つアカウントでログインし、適切なプロジェクトを選択する必要があります。

## サインアップの手順 {#steps-to-sign-up}

1. [GCP Marketplace](https://cloud.google.com/marketplace)に行き、ClickHouse Cloudを検索します。正しいプロジェクトが選択されていることを確認してください。

<Image img={gcp_marketplace_payg_1} size="md" alt="GCP Marketplaceのホームページ" border/>

2. [リスティング](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)をクリックし、次に**Subscribe**をクリックします。

<Image img={gcp_marketplace_payg_2} size="md" alt="GCP MarketplaceのClickHouse Cloud" border/>

3. 次の画面で、サブスクリプションを設定します：

- プランはデフォルトで「ClickHouse Cloud」になります。
- サブスクリプションの期間は「毎月」です。
- 適切な請求アカウントを選択します。
- 利用規約に同意し、**Subscribe**をクリックします。

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="GCP Marketplaceでのサブスクリプション設定" border/>

<br />

4. **Subscribe**をクリックすると、**Sign up with ClickHouse**のモーダルが表示されます。

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="GCP Marketplaceのサインアップモーダル" border/>

<br />

5. この時点では、セットアップはまだ完了していないことに注意してください。**Set up your account**をクリックしてClickHouse Cloudにリダイレクトし、ClickHouse Cloudにサインアップする必要があります。

6. ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録できます。このステップは非常に重要で、ClickHouse Cloudの組織をGCP Marketplaceの請求に結び付けることができます。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloudのサインインページ" border/>

<br />

新しいClickHouse Cloudユーザーの場合は、ページの下部にある**Register**をクリックします。新しいユーザーを作成し、メールを確認するように求められます。メールを確認した後、ClickHouse Cloudのログインページを離れて、[https://console.clickhouse.cloud](https://console.clickhouse.cloud)で新しいユーザー名を使用してログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloudのサインアップページ" border/>

<br />

新しいユーザーの場合、ビジネスに関する基本情報を提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloudサインアップ情報フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloudサインアップ情報フォーム2" border/>

<br />

既存のClickHouse Cloudユーザーの場合は、単に資格情報を使用してログインします。

7. ログインが成功すると、新しいClickHouse Cloud組織が作成されます。この組織はあなたのGCP請求アカウントに接続され、すべての利用がGCPアカウントを通じて請求されます。

8. ログイン後、請求が実際にGCP Marketplaceに結び付けられていることを確認し、ClickHouse Cloudリソースの設定を開始できます。

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloudのサインインページ" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloudの新しいサービスページ" border/>

<br />

9. サインアップを確認するメールを受け取るべきです：

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace確認メール" border/>

<br />

<br />

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program)にお問い合わせください。
