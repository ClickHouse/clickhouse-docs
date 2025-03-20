---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: Azure Marketplace PAYG
description: Azure Marketplace (PAYG) を通じて ClickHouse Cloud にサブスクライブします。
keywords: [azure, marketplace, billing, PAYG]
---

import azure_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-1.png';
import azure_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-2.png';
import azure_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-3.png';
import azure_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-4.png';
import azure_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-5.png';
import azure_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-6.png';
import azure_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-7.png';
import azure_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-8.png';
import azure_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-9.png';
import azure_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-10.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

ClickHouse Cloudを[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)経由でPAYG（従量課金制）で始めましょう。

## 前提条件 {#prerequisites}

- あなたの請求管理者によって購入権が有効になっているAzureプロジェクト。
- Azure MarketplaceでClickHouse Cloudにサブスクライブするには、購入権のあるアカウントでログインし、適切なプロジェクトを選択する必要があります。

1. [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)にアクセスし、ClickHouse Cloudを検索します。購入できるようにログインしていることを確認してください。

<br />

<img src={azure_marketplace_payg_1}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '300px'}}
/>

<br />

2. 商品リストページで、**今すぐ取得**をクリックします。

<br />

<img src={azure_marketplace_payg_2}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '500px'}}
/>

<br />

3. 次の画面で、名前、メールアドレス、所在地情報を提供する必要があります。

<br />

<img src={azure_marketplace_payg_3}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

4. 次の画面で、**サブスクライブ**をクリックします。

<br />

<img src={azure_marketplace_payg_4}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

5. 次の画面で、サブスクリプション、リソースグループ、リソースグループの場所を選択します。リソースグループの場所は、ClickHouse Cloudでサービスを起動したい場所と同じである必要はありません。

<br />

<img src={azure_marketplace_payg_5}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '500px'}}
/>

<br />

6. サブスクリプションの名称を提供し、利用可能なオプションから請求条件を選択する必要があります。**定期課金**をオンまたはオフに設定することができます。「オフ」に設定すると、請求期間終了後に契約が終了し、リソースが廃止されます。

<br />

<img src={azure_marketplace_payg_6}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '500px'}}
/>

<br />

7. **"確認 + サブスクライブ"**をクリックします。

8. 次の画面で、すべてが正しいことを確認し、**サブスクライブ**をクリックします。

<br />

<img src={azure_marketplace_payg_7}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

9. この時点では、AzureのClickHouse Cloudサブスクリプションにサブスクライブしたことになりますが、まだClickHouse Cloud上でアカウントを設定していません。次のステップは重要であり、ClickHouse CloudがAzureサブスクリプションにバインドできるようにするために必要ですので、請求が正しく行われるようにします。

<br />

<img src={azure_marketplace_payg_8}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '500px'}}
/>

<br />

10. Azureの設定が完了すると、**今すぐアカウントを設定**ボタンがアクティブになります。

<br />

<img src={azure_marketplace_payg_9}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

11. **今すぐアカウントを設定**をクリックします。

<br />

以下のようなメールが届き、アカウントの設定に関する詳細が記載されています。

<br />

<img src={azure_marketplace_payg_10}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

12. ClickHouse Cloudのサインアップまたはサインインページにリダイレクトされます。新しいアカウントを使用してサインアップするか、既存のアカウントでサインインできます。サインインしたら、Azure Marketplaceを通じて請求される準備が整った新しい組織が作成されます。

13. 先に進む前に、住所や会社の詳細に関するいくつかの質問に答える必要があります。

<br />

<img src={aws_marketplace_payg_8}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

<img src={aws_marketplace_payg_9}
    alt='ClickHouse Cloudのサインアップ情報フォーム 2'
    class='image'
    style={{width: '400px'}}
/>

<br />

14. **サインアップを完了**をクリックすると、ClickHouse Cloud内のあなたの組織に移動し、Azure Marketplaceを通じて請求されていることを確認するための請求画面を表示し、サービスを作成できます。

<br />

<br />

<img src={azure_marketplace_payg_11}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '300px'}}
/>

<br />

<br />

<img src={azure_marketplace_payg_12}
    alt='ClickHouse Cloudのサインアップ情報フォーム'
    class='image'
    style={{width: '500px'}}
/>

<br />

15. 何か問題が発生した場合は、[サポートチームに連絡](https://clickhouse.com/support/program)することをためらわないでください。
