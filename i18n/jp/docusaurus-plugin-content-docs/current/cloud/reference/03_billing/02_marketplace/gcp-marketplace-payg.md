---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: 'GCP Marketplace 従量課金（PAYG）'
description: 'GCP Marketplace（PAYG）から ClickHouse Cloud を利用登録します。'
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

[GCP Marketplace](https://console.cloud.google.com/marketplace) から提供される PAYG（従量課金）パブリックオファーで ClickHouse Cloud の利用を開始します。


## 前提条件 \{#prerequisites\}

- 請求管理者によって購入権限が有効化されている GCP プロジェクト。
- GCP Marketplace 上で ClickHouse Cloud を購読するには、購入権限を持つアカウントでログインし、適切なプロジェクトを選択する必要があります。



## サインアップ手順 \{#steps-to-sign-up\}

1. [GCP Marketplace](https://cloud.google.com/marketplace) を開き、ClickHouse Cloud を検索します。対象となるプロジェクトが正しく選択されていることを確認します。

<Image img={gcp_marketplace_payg_1} size="md" alt="GCP Marketplace のホームページ" border/>

2. [商品ページ](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud) をクリックし、その後 **Subscribe** をクリックします。

<Image img={gcp_marketplace_payg_2} size="md" alt="GCP Marketplace 内の ClickHouse Cloud" border/>

3. 次の画面で、サブスクリプションを設定します:

- プランはデフォルトで「ClickHouse Cloud」になります
- サブスクリプション期間は「Monthly」です
- 適切な課金アカウントを選択します
- 利用規約に同意し、**Subscribe** をクリックします

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="GCP Marketplace でのサブスクリプション設定画面" border/>

<br />

4. **Subscribe** をクリックすると、**Sign up with ClickHouse** というモーダルが表示されます。

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="GCP Marketplace のサインアップモーダル" border/>

<br />

5. この時点では、まだセットアップは完了していないことに注意してください。**Set up your account** をクリックして ClickHouse Cloud にリダイレクトし、ClickHouse Cloud 上でサインアップする必要があります。

6. ClickHouse Cloud にリダイレクトされたら、既存アカウントでログインするか、新しいアカウントを登録できます。このステップは、ClickHouse Cloud の組織を GCP Marketplace の課金に紐づけるうえで非常に重要です。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud のサインインページ" border/>

<br />

新規の ClickHouse Cloud ユーザーの場合は、ページ下部の **Register** をクリックします。新しいユーザーの作成とメールアドレスの確認を求められます。メールアドレスを確認した後は、ClickHouse Cloud のログインページを閉じ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud) で新しいユーザー名を使用してログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud のサインアップページ" border/>

<br />

新規ユーザーの場合は、ビジネスに関する基本情報の入力も求められることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud のサインアップ情報入力フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud のサインアップ情報入力フォーム 2" border/>

<br />

既存の ClickHouse Cloud ユーザーの場合は、認証情報を使用してログインするだけで構いません。

7. 正常にログインすると、新しい ClickHouse Cloud 組織が作成されます。この組織は GCP の課金アカウントに接続され、すべての利用分は GCP アカウント経由で請求されます。

8. ログイン後、課金が実際に GCP Marketplace に紐づいていることを確認し、ClickHouse Cloud リソースのセットアップを開始できます。

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud のサインインページ" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud の新規サービスページ" border/>

<br />

9. サインアップ完了を確認するメールが届くはずです。

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace の確認メール" border/>

<br />

<br />

問題が発生した場合は、遠慮なく [サポートチーム](https://clickhouse.com/support/program) までお問い合わせください。
