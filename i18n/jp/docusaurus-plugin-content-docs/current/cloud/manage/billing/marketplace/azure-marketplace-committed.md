---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: Azure Marketplace コミット契約
description: Azure Marketplace (コミット契約) を通じて ClickHouse Cloud にサブスクライブする
keywords: [Microsoft, Azure, marketplace, billing, committed, committed contract]
---

import azure_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-1.png';
import azure_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-2.png';
import azure_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-3.png';
import azure_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-4.png';
import azure_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-5.png';
import azure_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-6.png';
import azure_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-7.png';
import azure_marketplace_committed_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-8.png';
import azure_marketplace_committed_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-9.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

ClickHouse Cloud を [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) でコミット契約を通じて利用開始しましょう。コミット契約は、プライベートオファーとも呼ばれ、顧客が特定の期間にわたって ClickHouse Cloud に一定額を支出することを約束できる契約です。

## 前提条件 {#prerequisites}

- 特定の契約条件に基づく ClickHouse のプライベートオファーを受け取っていること。

## サインアップ手順 {#steps-to-sign-up}

1. プライベートオファーの確認と受諾のためのリンクが記載されたメールを受け取っているはずです。

<br />

<img src={azure_marketplace_committed_1}
    alt='Azure Marketplace プライベートオファーのメール'
    class='image'
    style={{width: '400px'}}
/>

<br />

2. メール内の **Review Private Offer** リンクをクリックしてください。これにより、プライベートオファーの詳細が記載された GCP Marketplace ページに移動します。

<br />

<img src={azure_marketplace_committed_2}
    alt='Azure Marketplace プライベートオファーの詳細'
    class='image'
    style={{width: '600px'}}
/>

<br />

3. オファーを受け入れると、**プライベートオファー管理**画面に移動します。Azure が購入のためのオファーを準備するのに少し時間がかかる場合があります。

<br />

<img src={azure_marketplace_committed_3}
    alt='Azure Marketplace プライベートオファー管理ページ'
    class='image'
    style={{width: '600px'}}
/>

<br />

<img src={azure_marketplace_committed_4}
    alt='Azure Marketplace プライベートオファー管理ページの読み込み'
    class='image'
    style={{width: '600px'}}
/>

<br />

4. 数分後にページを更新してください。オファーが **Purchase** のために準備されるはずです。

<br />

<img src={azure_marketplace_committed_5}
    alt='Azure Marketplace プライベートオファー管理ページの購入が可能'
    class='image'
    style={{width: '500px'}}
/>

<br />

5. **Purchase** をクリックしてください。フライアウトが開きます。次の情報を入力してください：

<br />

- サブスクリプションとリソースグループ
- SaaS サブスクリプションの名前を提供してください
- プライベートオファーに基づく請求プランを選択してください。プライベートオファーが作成された期間（例えば、1年）のみ金額が表示されます。他の請求期間オプションは $0 の金額になります。
- 定期的な請求を希望するかどうかを選択してください。定期的な請求が選択されていない場合、契約は請求期間の終了時に終了し、リソースは廃止されます。
- **Review + subscribe** をクリックしてください。

<br />

<img src={azure_marketplace_committed_6}
    alt='Azure Marketplace サブスクリプションフォーム'
    class='image'
    style={{width: '500px'}}
/>

<br />

6. 次の画面で、すべての詳細を確認し、**Subscribe** を押してください。

<br />

<img src={azure_marketplace_committed_7}
    alt='Azure Marketplace サブスクリプション確認'
    class='image'
    style={{width: '500px'}}
/>

<br />

7. 次の画面で、**Your SaaS subscription in progress** が表示されます。

<br />

<img src={azure_marketplace_committed_8}
    alt='Azure Marketplace サブスクリプション提出ページ'
    class='image'
    style={{width: '500px'}}
/>

<br />

8. 準備が整うと、**Configure account now** をクリックできます。これは、Azure サブスクリプションを ClickHouse Cloud の組織に結びつける重要なステップです。このステップを行わないと、マーケットプレイスのサブスクリプションは完了しません。

<br />

<img src={azure_marketplace_committed_9}
    alt='Azure Marketplace アカウント今すぐ設定ボタン'
    class='image'
    style={{width: '400px'}}
/>

<br />

9. ClickHouse Cloud のサインアップまたはサインインページにリダイレクトされます。新しいアカウントでサインアップするか、既存のアカウントでサインインできます。サインインが完了すると、Azure Marketplace を通じて利用及び請求ができる新しい組織が作成されます。

10. あなたは少しの質問に答える必要があります - 住所や会社の詳細 - その後、進むことができます。

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

11. **Complete sign up** を押すと、ClickHouse Cloud 内の組織に移動し、請求画面を見ることができ、Azure Marketplace 経由で請求されていることを確認し、サービスを作成できます。

<br />

<br />

<img src={azure_marketplace_payg_11}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '300px'}}
/>

<br />

<br />

<img src={azure_marketplace_payg_12}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '500px'}}
/>

<br />

問題が発生した場合は、[サポートチームにお問い合わせください](https://clickhouse.com/support/program)。
