---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: 'GCP Marketplace PAYG'
description: 'GCP Marketplace (PAYG) を通じて ClickHouse Cloud を購読します。'
keywords: ['gcp', 'marketplace', 'billing', 'PAYG']
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

Get started with ClickHouse Cloud on the [GCP Marketplace](https://console.cloud.google.com/marketplace) via a PAYG (Pay-as-you-go) Public Offer.

## Prerequisites {#prerequisites}

- あなたの請求管理者によって購入権が有効になっている GCP プロジェクト。
- GCP Marketplace で ClickHouse Cloud に購読するには、購入権があるアカウントでログインし、適切なプロジェクトを選択する必要があります。

## Steps to sign up {#steps-to-sign-up}

1. [GCP Marketplace](https://cloud.google.com/marketplace) にアクセスし、ClickHouse Cloud を検索します。正しいプロジェクトが選択されていることを確認してください。

<Image img={gcp_marketplace_payg_1} size="md" alt="GCP Marketplace ホームページ" border/>

2. [リスティング](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud) をクリックし、次に **Subscribe** をクリックします。

<Image img={gcp_marketplace_payg_2} size="md" alt="GCP Marketplace の ClickHouse Cloud" border/>

3. 次の画面で、購読を設定します：

- プランは "ClickHouse Cloud" にデフォルト設定されます
- 購読期間は "Monthly" です
- 適切な請求アカウントを選択します
- 利用規約に同意し、**Subscribe** をクリックします

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="GCP Marketplace での購読設定" border/>

<br />

4. **Subscribe** をクリックすると、**Sign up with ClickHouse** というモーダルが表示されます。

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="GCP Marketplace サインアップモーダル" border/>

<br />

5. この時点でセットアップはまだ完了していないことに注意してください。**Set up your account** をクリックして ClickHouse Cloud にリダイレクトし、ClickHouse Cloud にサインアップする必要があります。

6. ClickHouse Cloud にリダイレクトされたら、既存のアカウントにログインするか、新しいアカウントで登録できます。このステップは、あなたの ClickHouse Cloud 組織を GCP Marketplace 請求に結びつけるために非常に重要です。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud サインインページ" border/>

<br />

新しい ClickHouse Cloud ユーザーの場合は、ページの下部にある **Register** をクリックしてください。新しいユーザーを作成し、メールを確認するように求められます。メールを確認した後、ClickHouse Cloud のログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud) で新しいユーザー名を使用してログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud サインアップページ" border/>

<br />

新しいユーザーの場合、ビジネスに関する基本情報を提供する必要もあることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報フォーム 2" border/>

<br />

既存の ClickHouse Cloud ユーザーの場合は、資格情報を使用して単にログインしてください。

7. 正常にログインすると、新しい ClickHouse Cloud 組織が作成されます。この組織は GCP 請求アカウントに接続され、すべての使用料はあなたの GCP アカウントを通じて請求されます。

8. ログイン後、請求が実際に GCP Marketplace に紐づけられていることを確認し、ClickHouse Cloud リソースのセットアップを開始できます。

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud サインインページ" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 新しいサービスページ" border/>

<br />

9. サインアップが確認されるメールが届くはずです：

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace 確認メール" border/>

<br />

<br />

何か問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program) に遠慮なくお問い合わせください。
