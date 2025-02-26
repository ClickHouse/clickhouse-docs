---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: Azure Marketplace コミット契約
description: Azure Marketplace (コミット契約) を通じて ClickHouse Cloud に申し込む
keywords: [Microsoft, Azure, marketplace, billing, committed, committed contract]
---

コミット契約を介して [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) で ClickHouse Cloud を始めましょう。コミット契約（プライベートオファーとも呼ばれる）を利用すると、顧客は特定の期間にわたって ClickHouse Cloud に一定の金額を支出することを約束できます。

## 前提条件 {#prerequisites}

- 特定の契約条件に基づく ClickHouse からのプライベートオファー。

## サインアップ手順 {#steps-to-sign-up}

1. プライベートオファーを確認し、受け入れるためのリンクが記載されたメールを受け取っているはずです。

<br />

<img src={require('./images/azure-marketplace-committed-1.png').default}
    alt='Azure Marketplace プライベートオファーのメール'
    class='image'
    style={{width: '400px'}}
    />

<br />

2. メール内の **Review Private Offer** リンクをクリックします。これにより、プライベートオファーの詳細が表示される GCP Marketplace ページに遷移します。

<br />

<img src={require('./images/azure-marketplace-committed-2.png').default}
    alt='Azure Marketplace プライベートオファーの詳細'
    class='image'
    style={{width: '600px'}}
    />

<br />

3. オファーを受け入れると、**Private Offer Management** 画面に移動します。Azure が購入用のオファーを準備するのに少し時間がかかる場合があります。

<br />

<img src={require('./images/azure-marketplace-committed-3.png').default}
    alt='Azure Marketplace プライベートオファー管理ページ'
    class='image'
    style={{width: '600px'}}
    />

<br />

<img src={require('./images/azure-marketplace-committed-4.png').default}
    alt='Azure Marketplace プライベートオファー管理ページの読み込み中'
    class='image'
    style={{width: '600px'}}
    />

<br />

4. 数分後、ページを更新します。オファーが **Purchase** の準備が整っているはずです。

<br />

<img src={require('./images/azure-marketplace-committed-5.png').default}
    alt='Azure Marketplace プライベートオファー管理ページ 購入可能'
    class='image'
    style={{width: '500px'}}
    />

<br />

5. **Purchase** をクリックします。ポップアップが表示されます。以下を完了します：

<br />

- サブスクリプションとリソース グループ
- SaaS サブスクリプションの名前を入力
- プライベートオファーのある請求プランを選択します。プライベートオファーが作成された期間（例えば、1 年）にのみ金額が表示されます。他の請求期間オプションは $0 の金額になります。
- 繰り返し請求を選択するかどうかを決定します。繰り返し請求が選択されていない場合、契約は請求期間の終了時に終了し、リソースは廃止されます。
- **Review + subscribe** をクリックします。

<br />

<img src={require('./images/azure-marketplace-committed-6.png').default}
    alt='Azure Marketplace サブスクリプションフォーム'
    class='image'
    style={{width: '500px'}}
    />

<br />

6. 次の画面で、すべての詳細を確認し、**Subscribe** をクリックします。

<br />

<img src={require('./images/azure-marketplace-committed-7.png').default}
    alt='Azure Marketplace サブスクリプション確認'
    class='image'
    style={{width: '500px'}}
    />

<br />

7. 次の画面で、**Your SaaS subscription in progress** が表示されます。

<br />

<img src={require('./images/azure-marketplace-committed-8.png').default}
    alt='Azure Marketplace サブスクリプション送信ページ'
    class='image'
    style={{width: '500px'}}
    />

<br />

8. 準備が整ったら、**Configure account now** をクリックできます。これは、Azure サブスクリプションを ClickHouse Cloud 組織にバインドする重要なステップです。このステップを行わないと、あなたの Marketplace サブスクリプションは完了しません。

<br />

<img src={require('./images/azure-marketplace-committed-9.png').default}
    alt='Azure Marketplace アカウントの構成ボタン'
    class='image'
    style={{width: '400px'}}
    />

<br />

9. ClickHouse Cloud のサインアップまたはサインインページにリダイレクトされます。新しいアカウントを使用してサインアップするか、既存のアカウントでサインインできます。サインインすると、Azure Marketplace を介して使用および請求される新しい組織が作成されます。

10. 先に進む前に、いくつかの質問 - 住所と会社の詳細 - に回答する必要があります。

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

11. **Complete sign up** をクリックすると、ClickHouse Cloud 内のあなたの組織に移動し、請求画面を表示して Azure Marketplace を介して請求されていることを確認し、サービスを作成できるようになります。

<br />

<br />

<img src={require('./images/azure-marketplace-payg-11.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '300px'}}
    />

<br />

<br />

<img src={require('./images/azure-marketplace-payg-12.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '500px'}}
    />

<br />

問題が発生した場合は、[サポートチームにお問い合わせください](https://clickhouse.com/support/program)。
