---
slug: /cloud/billing/marketplace/gcp-marketplace-committed-contract
title: GCP Marketplace コミット契約
description: GCP Marketplace を通じて ClickHouse Cloud に申し込む (コミット契約)
keywords: [gcp, google, marketplace, billing, committed, committed contract]
---

GCP Marketplace の [GCP Marketplace](https://console.cloud.google.com/marketplace) を通じて ClickHouse Cloud をコミット契約で始めましょう。コミット契約はプライベートオファーとも呼ばれ、顧客が一定の金額を ClickHouse Cloud に対して特定の期間中に支出することを約束できるものです。

## 前提条件 {#prerequisites}

- 特定の契約条件に基づく ClickHouse からのプライベートオファー。

## 申し込みの手順 {#steps-to-sign-up}

1. プライベートオファーを確認し、受け入れるためのリンクが含まれたメールを受け取っているはずです。

<br />

<img src={require('./images/gcp-marketplace-committed-1.png').default}
    alt='GCP Marketplace プライベートオファーのメール'
    class='image'
    style={{width: '300px'}}
/>

<br />

2. メール内の **オファーを確認** リンクをクリックします。これにより、プライベートオファーの詳細が記載された GCP Marketplace ページに移動します。

<br />

<img src={require('./images/gcp-marketplace-committed-2.png').default}
    alt='GCP Marketplace オファーの概要'
    class='image'
    style={{width: '300px'}}
/>

<br />

<img src={require('./images/gcp-marketplace-committed-3.png').default}
    alt='GCP Marketplace 価格の概要'
    class='image'
    style={{width: '300px'}}
/>

<br />

3. プライベートオファーの詳細を確認し、すべてが正しい場合は **受け入れる** をクリックします。

<br />

<img src={require('./images/gcp-marketplace-committed-4.png').default}
    alt='GCP Marketplace 受け入れページ'
    class='image'
    style={{width: '300px'}}
/>

<br />

4. **製品ページに移動** をクリックします。

<br />

<img src={require('./images/gcp-marketplace-committed-5.png').default}
    alt='GCP Marketplace 受け入れ確認'
    class='image'
    style={{width: '400px'}}
/>

<br />

5. **プロバイダーで管理** をクリックします。

<br />

<img src={require('./images/gcp-marketplace-committed-6.png').default}
    alt='GCP Marketplace ClickHouse Cloud ページ'
    class='image'
    style={{width: '400px'}}
/>

<br />

この時点で ClickHouse Cloud にリダイレクトされ、サインアップまたはサインインすることが重要です。このステップを完了しないと、GCP Marketplace のサブスクリプションを ClickHouse Cloud にリンクすることができません。

<br />

<img src={require('./images/gcp-marketplace-committed-7.png').default}
    alt='GCP Marketplace サイトを離れる確認モーダル'
    class='image'
    style={{width: '400px'}}
/>

<br />

6. ClickHouse Cloud にリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録できます。

<br />

<img src={require('./images/aws-marketplace-payg-6.png').default}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '300px'}}
/>

<br />

新しい ClickHouse Cloud ユーザーの場合は、ページの下部にある **登録** をクリックします。新しいユーザーを作成し、メールを確認するように求められます。メールを確認した後、ClickHouse Cloud のログインページを離れ、新しいユーザー名で [https://console.clickhouse.cloud](https://console.clickhouse.cloud) にログインできます。

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

<img src={require('./images/aws-marketplace-payg-9.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム 2'
    class='image'
    style={{width: '400px'}}
/>

<br />

既存の ClickHouse Cloud ユーザーの場合は、資格情報を使用してログインするだけです。

7. 成功裏にログインすると、新しい ClickHouse Cloud 組織が作成されます。この組織はあなたの GCP 請求アカウントに接続され、すべての使用は GCP アカウントを通じて請求されます。

8. ログインすると、請求が実際に GCP Marketplace に結びついていることを確認し、ClickHouse Cloud リソースのセットアップを開始できます。

<br />

<img src={require('./images/gcp-marketplace-payg-5.png').default}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '300px'}}
/>

<br />

<img src={require('./images/aws-marketplace-payg-11.png').default}
    alt='ClickHouse Cloud 新しいサービスページ'
    class='image'
    style={{width: '400px'}}
/>

<br />

9. サインアップを確認するメールが届くはずです：

<br />
<br />

<img src={require('./images/gcp-marketplace-payg-6.png').default}
    alt='GCP Marketplace 確認メール'
    class='image'
    style={{width: '300px'}}
/>

<br />

<br />

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program) にお気軽にお問い合わせください。
