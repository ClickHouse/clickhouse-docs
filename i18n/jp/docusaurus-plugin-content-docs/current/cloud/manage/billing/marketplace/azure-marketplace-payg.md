---
slug: '/cloud/billing/marketplace/azure-marketplace-payg'
title: 'Azure Marketplace PAYG'
description: 'Subscribe to ClickHouse Cloud through the Azure Marketplace (PAYG).'
keywords:
- 'azure'
- 'marketplace'
- 'billing'
- 'PAYG'
---

import Image from '@theme/IdealImage';
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

ClickHouse Cloudを[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)でPAYG（従量課金）パブリックオファーを通じて始めましょう。

## 前提条件 {#prerequisites}

- 購入権限を持つ請求管理者によって有効化されたAzureプロジェクト。
- Azure MarketplaceでClickHouse Cloudに登録するには、購入権限を持つアカウントでログインし、適切なプロジェクトを選択する必要があります。

1. [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)にアクセスし、ClickHouse Cloudを検索します。市場でオファーを購入できるように、ログインしていることを確認してください。

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

2. 商品リストページで、**Get It Now**をクリックします。

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

3. 次の画面で、名前、メール、および所在地情報を提供する必要があります。

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

4. 次の画面で、**Subscribe**をクリックします。

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

5. 次の画面で、サブスクリプション、リソースグループ、およびリソースグループの位置を選択します。リソースグループの位置は、ClickHouse Cloudでサービスを起動する予定の位置と同じである必要はありません。

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

6. サブスクリプションの名前を提供する必要があり、利用可能なオプションから請求条件を選択する必要があります。「**Recurring billing**」をオンまたはオフに設定することができます。"オフ"に設定すると、請求期間が終了した後に契約が終了し、リソースは廃止されます。

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

7. **"Review + subscribe"**をクリックします。

8. 次の画面で、すべてが正しいことを確認し、**Subscribe**をクリックします。

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

9. この時点で、ClickHouse CloudのAzureサブスクリプションに登録されていますが、まだClickHouse Cloudでアカウントを設定していません。次のステップは、請求がAzure Marketplaceを通じて正しく行われるために、ClickHouse CloudがあなたのAzureサブスクリプションにバインドできるようにするために必要不可欠です。

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

10. Azureのセットアップが完了すると、**Configure account now**ボタンがアクティブになります。

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

11. **Configure account now**をクリックします。

<br />

以下のようなメールが届き、アカウントの構成に関する詳細が記載されています：

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

12. ClickHouse Cloudのサインアップまたはサインインページにリダイレクトされます。新しいアカウントを使用してサインアップするか、既存のアカウントを使用してサインインできます。サインインすると、新しい組織が作成され、Azure Marketplaceを通じて使用および請求される準備が整います。

13. 先に進む前に、いくつかの質問 - 住所や会社の詳細 - に回答する必要があります。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

14. **Complete sign up**をクリックすると、ClickHouse Cloud内の組織に移動され、請求画面を確認してAzure Marketplaceを通じて請求されていることを確認し、サービスを作成できるようになります。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

15. 問題が発生した場合は、[サポートチームに連絡する](https://clickhouse.com/support/program)ことをためらわないでください。
