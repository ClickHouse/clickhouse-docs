---
'slug': '/cloud/billing/marketplace/azure-marketplace-committed-contract'
'title': 'Azure Marketplace コミット契約'
'description': 'Azure Marketplace を通じて ClickHouse Cloud にサブスクライブする (Committed Contract)'
'keywords':
- 'Microsoft'
- 'Azure'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
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

ClickHouse Cloudを[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)でのコミット契約を通じて始めましょう。コミット契約は、プライベートオファーとも呼ばれ、顧客が一定の期間内にClickHouse Cloudに対して一定の金額を支出することを約束することができます。

## 前提条件 {#prerequisites}

- 特定の契約条件に基づいたClickHouseからのプライベートオファー。

## サインアップ手順 {#steps-to-sign-up}

1. プライベートオファーの確認と受諾のリンクを含むメールを受け取っているはずです。

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Azure Marketplaceプライベートオファーのメール" border/>

<br />

2. メール内の**Review Private Offer**リンクをクリックします。これにより、プライベートオファーの詳細を含むGCP Marketplaceページに移動します。

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Azure Marketplaceプライベートオファーの詳細" border/>

<br />

3. オファーを受諾すると、**Private Offer Management**画面に移動します。Azureが購入のためのオファーを準備するのに少し時間がかかる場合があります。

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Azure Marketplaceプライベートオファー管理ページ" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Azure Marketplaceプライベートオファー管理ページの読み込み" border/>

<br />

4. 数分後、ページを更新してください。オファーは**Purchase**の準備が整っているはずです。

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Azure Marketplaceプライベートオファー管理ページの購入を可能にする" border/>

<br />

5. **Purchase**をクリックします - フライアウトが表示されます。次の情報を入力してください：

<br />

- サブスクリプションとリソースグループ 
- SaaSサブスクリプションの名前を提供
- プライベートオファーに対して選択できる請求プランを選択します。プライベートオファーが作成された条件（例：1年）のみ金額が表示されます。他の請求条件オプションは$0の金額となります。 
- 継続的請求を希望するかどうかを選択します。継続的請求が選択されていない場合、契約は請求期間の終了時に終了し、リソースは廃止されることになります。
- **Review + subscribe**をクリックします。

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Azure Marketplaceサブスクリプションフォーム" border/>

<br />

6. 次の画面で、すべての詳細を確認し、**Subscribe**をクリックします。

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Azure Marketplaceサブスクリプション確認" border/>

<br />

7. 次の画面で、**Your SaaS subscription in progress**が表示されます。

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Azure Marketplaceサブスクリプション提出ページ" border/>

<br />

8. 準備ができたら、**Configure account now**をクリックします。これは、AzureサブスクリプションをあなたのClickHouse Cloud組織に結びつける重要なステップです。このステップがないと、Marketplaceサブスクリプションは完了しません。

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Azure Marketplace構成アカウントボタン" border/>

<br />

9. ClickHouse Cloudのサインアップまたはサインインページにリダイレクトされます。新しいアカウントを使用してサインアップするか、既存のアカウントを使用してサインインできます。サインインすると、新しい組織が作成され、Azure Marketplaceを通じて使用および請求の準備が整います。

10. 先に進むためにいくつかの質問に答える必要があります - 住所と会社の詳細。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloudサインアップ情報フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloudサインアップ情報フォーム 2" border/>

<br />

11. **Complete sign up**をクリックすると、ClickHouse Cloud内のあなたの組織に移動し、Azure Marketplaceを通じて請求されていることを確認するための請求画面を表示できます。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="ClickHouse Cloudサインアップ情報フォーム" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloudサインアップ情報フォーム" border/>

<br />

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program)にご連絡ください。
