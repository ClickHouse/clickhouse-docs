---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: AWS Marketplace コミット契約
description: AWS Marketplace (コミット契約) を通じて ClickHouse Cloud に登録する
keywords: [aws, amazon, marketplace, billing, committed, committed contract]
---

AWS Marketplace を介してコミット契約で ClickHouse Cloud を始めましょう。コミット契約、またはプライベートオファーとも呼ばれるこの契約は、顧客が一定期間にわたって ClickHouse Cloud に一定額を支出することを約束するものです。

## 前提条件 {#prerequisites}

- 特定の契約条件に基づいた ClickHouse からのプライベートオファー。

## 登録手順 {#steps-to-sign-up}

1. プライベートオファーを確認し、受諾するリンクが記載されたメールを受け取ったはずです。

<br />

<img src={require('./images/aws-marketplace-committed-1.png').default}
    alt='AWS Marketplace プライベートオファーのメール'
    class='image'
    style={{width: '400px'}}
/>

<br />

2. メール内の **Review Offer** リンクをクリックします。これにより、プライベートオファーの詳細が表示される AWS Marketplace ページに移動します。プライベートオファーを受諾する際には、契約オプションのプルダウンリストで単位数を1に設定してください。

3. AWS ポータルでの登録手続きを完了し、**Set up your account** をクリックします。この時点で ClickHouse Cloud にリダイレクトされ、新しいアカウントを登録するか、既存のアカウントでサインインする必要があります。このステップを完了しないと、AWS Marketplace のサブスクリプションを ClickHouse Cloud にリンクできません。

4. ClickHouse Cloud にリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録できます。このステップは非常に重要で、あなたの ClickHouse Cloud 組織と AWS Marketplace の請求を結びつけるために必要です。

<br />

<img src={require('./images/aws-marketplace-payg-6.png').default}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '300px'}}
/>

<br />

新しい ClickHouse Cloud ユーザーの場合は、ページの下部にある **Register** をクリックしてください。新しいユーザーを作成し、メールを確認するよう求められます。メールを確認した後、ClickHouse Cloud のログインページを離れ、新しいユーザー名で [https://console.clickhouse.cloud](https://console.clickhouse.cloud) にログインできます。

<br />

<img src={require('./images/aws-marketplace-payg-7.png').default}
    alt='ClickHouse Cloud サインアップページ'
    class='image'
    style={{width: '500px'}}
/>

<br />

新しいユーザーの場合は、ビジネスに関する基本情報を提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<img src={require('./images/aws-marketplace-payg-8.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

<br />

<img src={require('./images/aws-marketplace-payg-9.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム 2'
    class='image'
    style={{width: '400px'}}
/>

<br />

既存の ClickHouse Cloud ユーザーの場合は、資格情報を使用してログインしてください。

5. 正常にログインすると、新しい ClickHouse Cloud 組織が作成されます。この組織はあなたの AWS 請求アカウントに接続され、すべての使用状況はあなたの AWS アカウントを通じて請求されます。

6. ログイン後、請求が実際に AWS Marketplace に結びついていることを確認し、ClickHouse Cloud のリソースを設定し始めることができます。

<br />

<img src={require('./images/aws-marketplace-payg-10.png').default}
    alt='ClickHouse Cloud AWS Marketplace 請求の表示'
    class='image'
    style={{width: '300px'}}
/>

<br />

<img src={require('./images/aws-marketplace-payg-11.png').default}
    alt='ClickHouse Cloud 新サービスページ'
    class='image'
    style={{width: '400px'}}
/>

<br />

6. 登録が完了したことを確認するメールが届くはずです：

<br />

<img src={require('./images/aws-marketplace-payg-12.png').default}
    alt='AWS Marketplace 確認メール'
    class='image'
    style={{width: '500px'}}
/>

<br />

問題が発生した場合は、[サポートチームにお問い合わせください](https://clickhouse.com/support/program)。
