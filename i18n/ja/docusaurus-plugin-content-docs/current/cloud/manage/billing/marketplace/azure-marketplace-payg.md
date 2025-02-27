---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: Azure Marketplace PAYG
description: Azure Marketplace (PAYG) を通じて ClickHouse Cloud にサブスクライブします。
keywords: [azure, marketplace, billing, PAYG]
---

[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) での PAYG (従量課金) パブリックオファーを通じて、ClickHouse Cloud を始めましょう。

## 前提条件 {#prerequisites}

- あなたの請求管理者によって購入権が有効化された Azure プロジェクト。
- Azure Marketplace で ClickHouse Cloud にサブスクライブするには、購入権を持つアカウントでログインし、適切なプロジェクトを選択する必要があります。

1. [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) にアクセスして ClickHouse Cloud を検索します。マーケットプレイスでオファーを購入できるように、ログインしていることを確認してください。

<br />

<img src={require('./images/azure-marketplace-payg-1.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '300px'}}
/>

<br />

2. 製品リストページで、**今すぐ取得**をクリックします。

<br />

<img src={require('./images/azure-marketplace-payg-2.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '500px'}}
/>

<br />

3. 次の画面で名前、メール、所在地情報を提供する必要があります。

<br />

<img src={require('./images/azure-marketplace-payg-3.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

4. 次の画面で、**サブスクライブ**をクリックします。

<br />

<img src={require('./images/azure-marketplace-payg-4.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

5. 次の画面で、サブスクリプション、リソースグループ、およびリソースグループの所在地を選択します。リソースグループの所在地は、ClickHouse Cloud 上でサービスを立ち上げる場所と同じである必要はありません。

<br />

<img src={require('./images/azure-marketplace-payg-5.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '500px'}}
/>

<br />

6. サブスクリプションの名前を提供し、利用可能なオプションから請求条件を選択する必要もあります。**定期請求**をオンまたはオフに設定することができます。「オフ」を設定した場合、請求期間が終了すると契約は終了し、リソースは廃止されます。

<br />

<img src={require('./images/azure-marketplace-payg-6.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '500px'}}
/>

<br />

7. **"レビュー + サブスクライブ"**をクリックします。

8. 次の画面で、すべてが正しいことを確認し、**サブスクライブ**をクリックします。

<br />

<img src={require('./images/azure-marketplace-payg-7.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

9. この時点で、ClickHouse Cloud の Azure サブスクリプションにサブスクライブしましたが、まだ ClickHouse Cloud 上でアカウントを設定していないことに注意してください。次の手順は必須であり、ClickHouse Cloud が Azure サブスクリプションにバインドできるようにするために重要ですので、この手順を実行してください。そうしないと、請求が Azure Marketplace を通じて正しく行われません。

<br />

<img src={require('./images/azure-marketplace-payg-8.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '500px'}}
/>

<br />

10. Azure のセットアップが完了すると、**今すぐアカウントを設定**ボタンがアクティブになります。

<br />

<img src={require('./images/azure-marketplace-payg-9.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

11. **今すぐアカウントを設定**をクリックします。

<br />

アカウントの設定に関する詳細が記載されたメールを受け取ります：

<br />

<img src={require('./images/azure-marketplace-payg-10.png').default}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

12. ClickHouse Cloud のサインアップまたはサインインページにリダイレクトされます。新しいアカウントを使用してサインアップするか、既存のアカウントでサインインすることができます。サインインすると、新しい組織が作成され、Azure Marketplace を通じて使用および請求される準備が整います。

13. 進む前に、いくつかの質問（住所および会社の詳細）に答える必要があります。

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

14. **サインアップを完了**をクリックすると、ClickHouse Cloud 内の組織に移動し、請求画面を表示し、Azure Marketplace を通じて請求されていることが確認でき、サービスを作成することができます。

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

15. 問題が発生した場合は、[サポートチームに問い合わせる](https://clickhouse.com/support/program)ことをためらわないでください。
