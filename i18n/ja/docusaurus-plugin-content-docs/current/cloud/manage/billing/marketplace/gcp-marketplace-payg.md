---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: GCPマーケットプレイス PAYG
description: GCPマーケットプレイス (PAYG) を通じて ClickHouse Cloud に登録します。
keywords: [gcp, marketplace, billing, PAYG]
---

GCPマーケットプレイスを通じて ClickHouse Cloud を開始するには、PAYG（従量課金制）のパブリックオファーをご利用ください。

## 前提条件 {#prerequisites}

- あなたの請求管理者によって購入権が有効化された GCP プロジェクト。
- GCPマーケットプレイスで ClickHouse Cloud に登録するには、購入権を持つアカウントでログインし、適切なプロジェクトを選択する必要があります。

## 登録手順 {#steps-to-sign-up}

1. [GCPマーケットプレイス](https://cloud.google.com/marketplace) にアクセスし、ClickHouse Cloud を検索します。正しいプロジェクトが選択されていることを確認してください。

<br />

<img src={require('./images/gcp-marketplace-payg-1.png').default}
    alt='GCPマーケットプレイス ホームページ'
    class='image'
    style={{width: '500px'}}
    />

<br />

2. [リスティング](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud) をクリックし、その後 **Subscribe** をクリックします。

<br />

<img src={require('./images/gcp-marketplace-payg-2.png').default}
    alt='GCPマーケットプレイスの ClickHouse Cloud'
    class='image'
    style={{width: '500px'}}
    />

<br />

3. 次の画面で、サブスクリプションを設定します：

- プランは「ClickHouse Cloud」がデフォルトになります
- サブスクリプションの時間枠は「毎月」
- 適切な請求アカウントを選択
- 条件に同意し、**Subscribe** をクリック

<br />

<img src={require('./images/gcp-marketplace-payg-3.png').default}
    alt='GCPマーケットプレイスでのサブスクリプション設定'
    class='image'
    style={{width: '400px'}}
    />

<br />

4. **Subscribe** をクリックすると、**ClickHouseでのサインアップ** というモーダルが表示されます。

<br />

<img src={require('./images/gcp-marketplace-payg-4.png').default}
    alt='GCPマーケットプレイスのサインアップモーダル'
    class='image'
    style={{width: '400px'}}
    />

<br />

5. この時点では、設定はまだ完了していないことに注意してください。**Set up your account** をクリックして ClickHouse Cloud にリダイレクトし、ClickHouse Cloud でサインアップする必要があります。

6. ClickHouse Cloud にリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録するかどちらかを選びます。このステップは非常に重要で、あなたの ClickHouse Cloud 組織を GCPマーケットプレイスの請求に結びつけるために必要です。

<br />

<img src={require('./images/aws-marketplace-payg-6.png').default}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '300px'}}
    />

<br />

新しい ClickHouse Cloud ユーザーである場合は、ページの下部にある **Register** をクリックしてください。新しいユーザーを作成し、メールを確認するよう求められます。メール確認後、ClickHouse Cloud のログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud) で新しいユーザー名を使ってログインできます。

<br />

<img src={require('./images/aws-marketplace-payg-7.png').default}
    alt='ClickHouse Cloud サインアップページ'
    class='image'
    style={{width: '500px'}}
    />

<br />

新しいユーザーの場合、ビジネスに関する基本情報も提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

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

既存の ClickHouse Cloud ユーザーの場合は、認証情報を使用してそのままログインしてください。

7. ログインに成功すると、新しい ClickHouse Cloud 組織が作成されます。この組織は、あなたの GCP 請求アカウントに接続され、すべての使用があなたの GCP アカウントを通じて請求されます。

8. ログイン後、実際に請求が GCPマーケットプレイスに紐付けられていることを確認し、ClickHouse Cloud リソースの設定を開始できます。

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

9. サインアップ確認のメールが届くはずです：

<br />
<br />

<img src={require('./images/gcp-marketplace-payg-6.png').default}
    alt='GCPマーケットプレイス 確認メール'
    class='image'
    style={{width: '300px'}}
    />

<br />

<br />

問題が発生した場合は、[サポートチームに連絡してください](https://clickhouse.com/support/program)。
