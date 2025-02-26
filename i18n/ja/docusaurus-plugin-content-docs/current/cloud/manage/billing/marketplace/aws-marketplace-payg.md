---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: AWS Marketplace PAYG
description: AWS Marketplace (PAYG)を通じてClickHouse Cloudにサブスクライブします。
keywords: [aws, marketplace, billing, PAYG]
---

AWS Marketplaceの[ClickHouse Cloud](https://aws.amazon.com/marketplace)に、PAYG（従量課金制）のパブリックオファーを通じて開始します。

## 前提条件 {#prerequisites}

- 請求管理者によって購入権が有効化されたAWSアカウント。
- 購入するには、このアカウントでAWSマーケットプレイスにログインしている必要があります。

## サインアップ手順 {#steps-to-sign-up}

1. [AWS Marketplace](https://aws.amazon.com/marketplace)にアクセスし、ClickHouse Cloudを検索します。

<br />

<img src={require('./images/aws-marketplace-payg-1.png').default}
    alt='AWS Marketplaceのホームページ'
    class='image'
    style={{width: '500px'}}
/>

<br />

2. [リスティング](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)をクリックし、次に**購入オプションを表示**をクリックします。

<br />

<img src={require('./images/aws-marketplace-payg-2.png').default}
    alt='ClickHouseを検索するAWS Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

3. 次の画面で契約を設定します：
- **契約の期間** - PAYG契約は月ごとに行われます。
- **更新設定** - 契約を自動更新するかどうかを設定できます。 
自動更新を有効にしない場合、請求サイクルの終了時に組織は自動的に猶予期間に入り、その後停止されます。

- **契約オプション** - このテキストボックスに任意の数値（または1）を入力できます。これは、パブリックオファーに対しての価格に影響しません。これらの単位は通常、ClickHouse Cloudからのプライベートオファーを受け入れる際に使用されます。

- **購入注文** - これは任意であり、無視できます。

<br />

<img src={require('./images/aws-marketplace-payg-3.png').default}
    alt='AWS Marketplaceの契約設定'
    class='image'
    style={{width: '500px'}}
/>

<br />

上記の情報を入力したら、**契約を作成**をクリックします。表示される契約価格がゼロドルであることを確認できます。これは、実質的に支払いが不要であり、使用量に基づいて料金が発生することを意味します。

<br />

<img src={require('./images/aws-marketplace-payg-4.png').default}
    alt='AWS Marketplaceの契約確認'
    class='image'
    style={{width: '500px'}}
/>

<br />

4. **契約を作成**をクリックすると、確認と支払い（$0の請求）のためのモーダルが表示されます。

5. **今すぐ支払う**をクリックすると、ClickHouse CloudのAWS Marketplaceオファーにサブスクライブしたことを示す確認が表示されます。

<br />

<img src={require('./images/aws-marketplace-payg-5.png').default}
    alt='AWS Marketplace支払い確認'
    class='image'
    style={{width: '500px'}}
/>

<br />

6. この時点では、セットアップはまだ完了していないことに注意してください。**アカウントを設定する**をクリックして、ClickHouse Cloudにリダイレクトし、サインアップする必要があります。

7. ClickHouse Cloudにリダイレクトすると、既存のアカウントでログインするか、新しいアカウントで登録することができます。このステップは非常に重要で、あなたのClickHouse Cloud組織をAWS Marketplaceの請求に結びつけるために必要です。

<br />

<img src={require('./images/aws-marketplace-payg-6.png').default}
    alt='ClickHouse Cloudサインインページ'
    class='image'
    style={{width: '300px'}}
/>

<br />

新規のClickHouse Cloudユーザーの場合は、ページの下部にある**登録**をクリックします。新しいユーザーを作成し、メールを検証するように促されます。メールを検証した後、ClickHouse Cloudのログインページを離れ、新しいユーザー名で[https://console.clickhouse.cloud](https://console.clickhouse.cloud)にログインできます。

<br />

<img src={require('./images/aws-marketplace-payg-7.png').default}
    alt='ClickHouse Cloudサインアップページ'
    class='image'
    style={{width: '500px'}}
/>

<br />

新規ユーザーの場合は、ビジネスに関する基本情報も提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<img src={require('./images/aws-marketplace-payg-8.png').default}
    alt='ClickHouse Cloudサインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

<br />

<img src={require('./images/aws-marketplace-payg-9.png').default}
    alt='ClickHouse Cloudサインアップ情報フォーム2'
    class='image'
    style={{width: '400px'}}
/>

<br />

既存のClickHouse Cloudユーザーであれば、単に資格情報を使用してログインしてください。

8. ログインに成功すると、新しいClickHouse Cloud組織が作成されます。この組織はあなたのAWS請求アカウントに接続され、すべての使用量がAWSアカウントを通じて請求されます。

9. ログイン後、請求が実際にAWS Marketplaceに結びついていることを確認し、ClickHouse Cloudのリソース設定を開始できます。

<br />

<img src={require('./images/aws-marketplace-payg-10.png').default}
    alt='ClickHouse CloudでAWS Marketplaceの請求を表示'
    class='image'
    style={{width: '300px'}}
/>

<br />

<img src={require('./images/aws-marketplace-payg-11.png').default}
    alt='ClickHouse Cloudの新しいサービスページ'
    class='image'
    style={{width: '400px'}}
/>

<br />

10. サインアップ確認のメールが届くはずです：

<br />

<img src={require('./images/aws-marketplace-payg-12.png').default}
    alt='AWS Marketplace確認メール'
    class='image'
    style={{width: '500px'}}
/>

<br />

何か問題が発生した場合は、[サポートチームにお問い合わせ](https://clickhouse.com/support/program)ください。
