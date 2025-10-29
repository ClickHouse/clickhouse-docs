---
'slug': '/cloud/billing/marketplace/azure-marketplace-payg'
'title': 'Azure Marketplace PAYG'
'description': 'Azure Marketplace（PAYG）を通じてClickHouse Cloudにサブスクライブします。'
'keywords':
- 'azure'
- 'marketplace'
- 'billing'
- 'PAYG'
'doc_type': 'guide'
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

ClickHouse Cloudを[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)でPAYG（従量課金制）パブリックオファーを通じて始めましょう。

## 前提条件 {#prerequisites}

- あなたの請求管理者によって購入権が有効になっているAzureプロジェクト。
- Azure MarketplaceでClickHouse Cloudにサブスクライブするには、購入権を持つアカウントでログインし、適切なプロジェクトを選択する必要があります。

1. [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)にアクセスし、ClickHouse Cloudを検索します。マーケットプレイスでオファーを購入できるように、ログインしていることを確認してください。

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

2. 製品リストページで、**今すぐ取得**をクリックします。

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

3. 次の画面では、名前、メール、所在地の情報を提供する必要があります。

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

4. 次の画面で、**サブスクライブ**をクリックします。

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

5. 次の画面で、サブスクリプション、リソースグループ、およびリソースグループの所在地を選択します。リソースグループの所在地は、ClickHouse Cloudでサービスを起動する場所と同じである必要はありません。

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

6. サブスクリプションの名前を提供し、利用可能なオプションから請求条件を選択する必要があります。**定期請求**をオンまたはオフに設定することができます。オフに設定すると、契約は請求条件が終了した後に終了し、リソースは廃止されます。

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

7. **"レビュー + サブスクライブ"**をクリックします。

8. 次の画面で、すべてが正しいことを確認し、**サブスクライブ**をクリックします。

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

9. この時点で、ClickHouse CloudのAzureサブスクリプションにサブスクリプションが登録されていることに注意してくださいが、まだClickHouse Cloudでのアカウント設定は行われていません。次の手順は、ClickHouse CloudがあなたのAzureサブスクリプションにバインドし、請求がAzure Marketplaceを通じて正しく行われるために必要かつ重要です。

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

10. Azureのセットアップが完了すると、**アカウントを今すぐ設定**ボタンがアクティブになります。

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

11. **アカウントを今すぐ設定**をクリックします。

<br />

以下のようなメールが届き、アカウント設定の詳細が記載されています：

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

12. ClickHouse Cloudのサインアップまたはサインインページにリダイレクトされます。ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントで登録します。このステップは、ClickHouse Cloudの組織をAzure Marketplaceの請求にバインドするために非常に重要です。

13. 新しいユーザーである場合、ビジネスに関する基本的な情報も提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム2" border/>

<br />

**サインアップを完了**をクリックすると、ClickHouse Cloud内のあなたの組織に移動し、請求画面を表示して、Azure Marketplace経由で請求されていることを確認し、サービスを作成できるようになります。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloudのサインアップ情報フォーム" border/>

<br />

14. 何か問題が発生した場合は、[サポートチームにお問い合わせ](https://clickhouse.com/support/program)ください。
