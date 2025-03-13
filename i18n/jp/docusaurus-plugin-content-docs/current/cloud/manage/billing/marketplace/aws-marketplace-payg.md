---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: AWS Marketplace PAYG
description: AWS Marketplaceを通じてClickHouse Cloudにサブスクライブします（PAYG）。
keywords: [aws, marketplace, billing, PAYG]
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
import aws_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-10.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import aws_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-12.png';

ClickHouse Cloudを[AWS Marketplace](https://aws.amazon.com/marketplace)を通じてPAYG（従量課金制）のパブリックオファーとして始めましょう。

## 前提条件 {#prerequisites}

- あなたの請求管理者によって購入権が有効化されたAWSアカウント。
- 購入するには、このアカウントでAWSマーケットプレイスにログインしている必要があります。

## サインアップ手順 {#steps-to-sign-up}

1. [AWS Marketplace](https://aws.amazon.com/marketplace)に移動し、ClickHouse Cloudを検索します。

<br />

<img src={aws_marketplace_payg_1}
    alt='AWS Marketplace ホームページ'
    class='image'
    style={{width: '500px'}}
/>

<br />

2. [リスティング](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)をクリックし、次に**購入オプションを表示**をクリックします。

<br />

<img src={aws_marketplace_payg_2}
    alt='AWS MarketplaceでClickHouseを検索'
    class='image'
    style={{width: '500px'}}
/>

<br />

3. 次の画面で契約を設定します：
- **契約の長さ** - PAYG契約は月ごとに実行されます。
- **更新設定** - 契約を自動更新するかどうかを設定できます。 
自動更新を有効にしない場合、請求サイクルの終了時に自動的に猶予期間に入り、その後解約されることに注意してください。

- **契約オプション** - このテキストボックスに任意の数（または1）を入力できます。これは公的オファーの価格に影響を与えません。この単位は通常、ClickHouse Cloudからのプライベートオファーを受け入れるときに使用されます。

- **購入注文** - これはオプションであり、無視しても構いません。

<br />

<img src={aws_marketplace_payg_3}
    alt='AWS Marketplace 契約設定'
    class='image'
    style={{width: '500px'}}
/>

<br />

上記の情報を記入した後、**契約を作成**をクリックします。契約価格がゼロドルで表示されていることを確認できます。これは、支払いが発生せず、使用に応じて料金が発生することを意味します。

<br />

<img src={aws_marketplace_payg_4}
    alt='AWS Marketplace 契約確認'
    class='image'
    style={{width: '500px'}}
/>

<br />

4. **契約を作成**をクリックすると、確認して支払うモーダルが表示されます（$0の支払い）。

5. **今すぐ支払う**をクリックすると、AWS MarketplaceのClickHouse Cloudオファーにサブスクライブしたことを確認するメッセージが表示されます。

<br />

<img src={aws_marketplace_payg_5}
    alt='AWS Marketplace 支払い確認'
    class='image'
    style={{width: '500px'}}
/>

<br />

6. この時点で、セットアップはまだ完了していないことに注意してください。**アカウント設定**をクリックし、ClickHouse Cloudにサインアップする必要があります。

7. ClickHouse Cloudにリダイレクトされると、既存のアカウントでログインするか、新しいアカウントを登録できます。このステップは、あなたのClickHouse Cloud組織をAWS Marketplaceの請求に結びつけるために非常に重要です。

<br />

<img src={aws_marketplace_payg_6}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '300px'}}
/>

<br />

新しいClickHouse Cloudユーザーの場合は、ページの下部にある**登録**をクリックします。新しいユーザーを作成し、メールを確認するように促されます。メールを確認した後、ClickHouse Cloudログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud)で新しいユーザー名を使用してログインできます。

<br />

<img src={aws_marketplace_payg_7}
    alt='ClickHouse Cloud サインアップページ'
    class='image'
    style={{width: '500px'}}
/>

<br />

新しいユーザーの場合、ビジネスに関する基本的な情報も提供する必要があることに注意してください。以下のスクリーンショットをご覧ください。

<br />

<img src={aws_marketplace_payg_8}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

<br />

<img src={aws_marketplace_payg_9}
    alt='ClickHouse Cloud サインアップ情報フォーム 2'
    class='image'
    style={{width: '400px'}}
/>

<br />

既存のClickHouse Cloudユーザーの場合は、資格情報を使用して簡単にログインできます。

8. ログインに成功すると、新しいClickHouse Cloud組織が作成されます。この組織はあなたのAWS請求アカウントに接続され、すべての使用状況があなたのAWSアカウントを通じて請求されます。

9. ログイン後、請求が実際にAWS Marketplaceに結びついていることを確認し、ClickHouse Cloudリソースの設定を開始できます。

<br />

<img src={aws_marketplace_payg_10}
    alt='ClickHouse Cloud AWS Marketplace請求の確認'
    class='image'
    style={{width: '300px'}}
/>

<br />

<img src={aws_marketplace_payg_11}
    alt='ClickHouse Cloud 新サービスページ'
    class='image'
    style={{width: '400px'}}
/>

<br />

10. サインアップ確認のメールが届くはずです：

<br />

<img src={aws_marketplace_payg_12}
    alt='AWS Marketplace 確認メール'
    class='image'
    style={{width: '500px'}}
/>

<br />

問題が発生した場合は、[サポートチームにお問い合わせ](https://clickhouse.com/support/program)ください。
