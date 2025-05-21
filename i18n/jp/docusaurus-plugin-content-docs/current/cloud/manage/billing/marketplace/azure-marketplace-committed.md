---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: 'Azure Marketplace コミット契約'
description: 'Azure Marketplace を通じて ClickHouse Cloud に登録する (コミット契約)'
keywords: ['Microsoft', 'Azure', 'marketplace', 'billing', 'committed', 'committed contract']
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

ClickHouse Cloud を [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 経由でコメット契約を通じて始めましょう。コメット契約（プライベートオファーとも呼ばれます）は、顧客が一定の期間内に ClickHouse Cloud に対して特定の金額を支出することを約束できるものです。

## 必要条件 {#prerequisites}

- 特定の契約条件に基づいた ClickHouse からのプライベートオファー。

## サインアップ手順 {#steps-to-sign-up}

1. プライベートオファーを確認し受け入れるためのリンクが含まれたメールを受け取っているはずです。

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Azure Marketplace プライベートオファーのメール" border/>

<br />

2. メール内の **Review Private Offer** リンクをクリックします。これにより、プライベートオファーの詳細が記載された GCP Marketplace ページに移動します。

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Azure Marketplace プライベートオファーの詳細" border/>

<br />

3. オファーを受け入れると、**Private Offer Management** 画面に移動します。Azure が購入のためにオファーを準備するのに少し時間がかかる場合があります。

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Azure Marketplace プライベートオファー管理ページ" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Azure Marketplace プライベートオファー管理ページの読み込み" border/>

<br />

4. 数分後、ページを更新してください。オファーは **Purchase** を取引可能であるべきです。

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Azure Marketplace プライベートオファー管理ページの購入が可能" border/>

<br />

5. **Purchase** をクリックします - フライアウトが表示されます。次の情報を入力してください：

<br />

- サブスクリプションとリソースグループ 
- SaaS サブスクリプションの名前を提供
- プライベートオファーのある請求プランを選択します。プライベートオファーが作成された期間（例えば、1 年）にのみ金額が表示されます。他の請求期間オプションは $0 の額となります。 
- 定期請求の有無を選択します。定期請求が選択されていない場合、契約は請求期間の終了時に終了し、リソースは非アクティブに設定されます。
- **Review + subscribe** をクリックします。

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Azure Marketplace サブスクリプションフォーム" border/>

<br />

6. 次の画面で、すべての詳細を確認し、**Subscribe** をクリックします。

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Azure Marketplace サブスクリプション確認" border/>

<br />

7. 次の画面で、**Your SaaS subscription in progress** が表示されます。

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Azure Marketplace サブスクリプション提出ページ" border/>

<br />

8. 準備ができたら、**Configure account now** をクリックできます。このステップは、Azure サブスクリプションを ClickHouse Cloud の組織にバインドする重要なステップです。このステップがなければ、マーケットプレイスサブスクリプションは完了しません。

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Azure Marketplace アカウント設定ボタン" border/>

<br />

9. ClickHouse Cloud のサインアップまたはサインインページにリダイレクトされます。新しいアカウントを使用してサインアップするか、既存のアカウントでサインインできます。サインインすると、新しい組織が作成され、Azure Marketplace 経由で請求ができるようになります。

10. 続行する前に、いくつかの質問 - 住所と会社の詳細 - に回答する必要があります。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報フォーム 2" border/>

<br />

11. **Complete sign up** をクリックすると、ClickHouse Cloud 内の組織に移動します。そこで請求画面を確認して、Azure Marketplace 経由で請求されていることを確認し、サービスを作成できます。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

何か問題が発生した場合は、[サポートチームにお問い合わせください](https://clickhouse.com/support/program)。
