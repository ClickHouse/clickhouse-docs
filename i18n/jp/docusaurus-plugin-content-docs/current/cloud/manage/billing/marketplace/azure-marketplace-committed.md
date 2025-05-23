---
'slug': '/cloud/billing/marketplace/azure-marketplace-committed-contract'
'title': 'Azure Marketplace Committed Contract'
'description': 'Azure Marketplace (Committed Contract) を通じて ClickHouse Cloud に登録する'
'keywords':
- 'Microsoft'
- 'Azure'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
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

Get started with ClickHouse Cloud on the [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) via a committed contract. A committed contract, also known as a a Private Offer, allows customers to commit to spending a certain amount on ClickHouse Cloud over a period of time.

## Prerequisites {#prerequisites}

- ClickHouseからの特定の契約条件に基づくプライベートオファー。

## Steps to sign up {#steps-to-sign-up}

1. プライベートオファーをレビューして受け入れるためのリンクを含むメールを受け取っているはずです。

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Azure Marketplace private offer email" border/>

<br />

2. メール内の**Review Private Offer**リンクをクリックします。これにより、プライベートオファーの詳細を含むGCP Marketplaceページに移動します。

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Azure Marketplace private offer details" border/>

<br />

3. オファーを受け入れると、**Private Offer Management**画面に移動します。Azureが購入用にオファーを準備するまでに少し時間がかかる場合があります。

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Azure Marketplace Private Offer Management page" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Azure Marketplace Private Offer Management page loading" border/>

<br />

4. 数分後、ページをリフレッシュします。オファーは**Purchase**のために準備完了しているはずです。

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Azure Marketplace Private Offer Management page purchase enabled" border/>

<br />

5. **Purchase**をクリックします - フライアウトが開きます。以下を完了します：

<br />

- サブスクリプションとリソースグループ 
- SaaSサブスクリプションの名前を提供します
- プライベートオファーのための請求プランを選択します。プライベートオファーが作成された期間（例えば、1年）のみ金額が表示されます。他の請求期間オプションは$0の金額となります。 
- 定期請求を希望するかどうかを選択します。定期請求が選択されていない場合、契約は請求期間の終了時に終了し、リソースは廃止されます。
- **Review + subscribe**をクリックします。

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Azure Marketplace subscription form" border/>

<br />

6. 次の画面で、すべての詳細を確認し、**Subscribe**をクリックします。

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Azure Marketplace subscription confirmation" border/>

<br />

7. 次の画面には、**Your SaaS subscription in progress**が表示されます。

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Azure Marketplace subscription submitting page" border/>

<br />

8. 準備ができたら、**Configure account now**をクリックします。このステップは、AzureサブスクリプションをClickHouse Cloudの組織にバインドする重要なステップです。このステップなしでは、あなたのMarketplaceサブスクリプションは完了しません。

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Azure Marketplace configure account now button" border/>

<br />

9. ClickHouse Cloudのサインアップまたはサインインページにリダイレクトされます。新しいアカウントを使用してサインアップするか、既存のアカウントでサインインできます。サインインすると、新しい組織が作成され、Azure Marketplaceを通じて使用され、請求される準備が整います。

10. 進む前に、いくつかの質問 - 住所と会社の詳細 - に答える必要があります。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

11. **Complete sign up**をクリックすると、ClickHouse Cloud内の組織に移動し、Azure Marketplaceを通じて請求されることを確認するための請求画面を見ることができます。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

問題が発生した場合は、[サポートチームに連絡する](https://clickhouse.com/support/program)ことをためらわないでください。
