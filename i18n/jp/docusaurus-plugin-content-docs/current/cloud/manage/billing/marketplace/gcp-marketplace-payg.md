---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: GCP Marketplace PAYG
description: GCP Marketplace (PAYG) を通じて ClickHouse Cloud に申し込む。
keywords: [gcp, marketplace, billing, PAYG]
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

ClickHouse Cloud を [GCP Marketplace](https://console.cloud.google.com/marketplace) 経由で PAYG (従量課金) の公共オファーを通じて開始します。

## 必要条件 {#prerequisites}

- 購入権限が有効な GCP プロジェクトをお持ちのこと。
- GCP Marketplace で ClickHouse Cloud に申し込むには、購入権限のあるアカウントでログインし、適切なプロジェクトを選択する必要があります。

## 申し込み手順 {#steps-to-sign-up}

1. [GCP Marketplace](https://cloud.google.com/marketplace) にアクセスし、ClickHouse Cloud を検索します。正しいプロジェクトが選択されていることを確認してください。

<br />

<img src={gcp_marketplace_payg_1}
    alt='GCP Marketplace ホームページ'
    class='image'
    style={{width: '500px'}}
    />

<br />

2. [リスティング](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)をクリックし、**Subscribe**（サブスクライブ）をクリックします。

<br />

<img src={gcp_marketplace_payg_2}
    alt='GCP Marketplace の ClickHouse Cloud'
    class='image'
    style={{width: '500px'}}
    />

<br />

3. 次の画面で、サブスクリプションを設定します：

- プランは「ClickHouse Cloud」にデフォルト設定されます
- サブスクリプションの時間枠は「月次」
- 適切な請求アカウントを選択
- 利用規約に同意し、**Subscribe**（サブスクライブ）をクリック

<br />

<img src={gcp_marketplace_payg_3}
    alt='GCP Marketplace でサブスクリプションを設定'
    class='image'
    style={{width: '400px'}}
    />

<br />

4. **Subscribe**（サブスクライブ）をクリックすると、**Sign up with ClickHouse**（ClickHouse でサインアップ）というモーダルが表示されます。

<br />

<img src={gcp_marketplace_payg_4}
    alt='GCP Marketplace サインアップモーダル'
    class='image'
    style={{width: '400px'}}
    />

<br />

5. 現時点では設定が完了していないことに注意してください。**Set up your account**（アカウントを設定）をクリックし、ClickHouse Cloud にサインアップする必要があります。

6. ClickHouse Cloud にリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録します。このステップは、ClickHouse Cloud 組織を GCP Marketplace の請求に結びつけるために非常に重要です。

<br />

<img src={aws_marketplace_payg_6}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '300px'}}
    />

<br />

新しい ClickHouse Cloud ユーザーの場合は、ページの下部にある **Register**（登録）をクリックします。新しいユーザーを作成し、メールアドレスを確認するよう求められます。メールアドレスを確認した後、ClickHouse Cloud のログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud) で新しいユーザー名を使ってログインします。

<br />

<img src={aws_marketplace_payg_7}
    alt='ClickHouse Cloud サインアップページ'
    class='image'
    style={{width: '500px'}}
    />

<br />

新しいユーザーの場合、ビジネスに関する基本情報を提供する必要がある点にも注意してください。以下のスクリーンショットを参照してください。

<br />

<img src={aws_marketplace_payg_8}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
    />

<br />

<img src={aws_marketplace_payg_9}
    alt='ClickHouse Cloud サインアップ情報フォーム 2'
    class='image'
    style={{width: '400px'}}
    />

<br />

既存の ClickHouse Cloud ユーザーの場合は、資格情報を使用してログインします。

7. 正常にログインした後、新しい ClickHouse Cloud 組織が作成されます。この組織はあなたの GCP 請求アカウントに接続され、すべての使用があなたの GCP アカウントを通じて請求されます。

8. ログインすると、請求が実際に GCP Marketplace に関連付けられていることを確認でき、ClickHouse Cloud リソースの設定を始めることができます。

<br />

<img src={gcp_marketplace_payg_5}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '300px'}}
    />

<br />

<img src={aws_marketplace_payg_11}
    alt='ClickHouse Cloud 新規サービスページ'
    class='image'
    style={{width: '400px'}}
    />

<br />

9. サインアップの確認メールが届くはずです：

<br />
<br />

<img src={gcp_marketplace_payg_6}
    alt='GCP Marketplace 確認メール'
    class='image'
    style={{width: '300px'}}
    />

<br />

<br />

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program)にご連絡ください。
