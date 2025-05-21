---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: 'Azure Marketplace PAYG'
description: 'Azure Marketplace (PAYG) を通じて ClickHouse Cloud にサブスクライブします。'
keywords: ['azure', 'marketplace', 'billing', 'PAYG']
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

ClickHouse Cloud を [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) を通じて、PAYG (従量課金制) のパブリックオファーとして開始しましょう。

## 前提条件 {#prerequisites}

- あなたの請求管理者によって購入権が有効化された Azure プロジェクト。
- Azure Marketplace で ClickHouse Cloud にサブスクライブするには、購入権のあるアカウントでログインし、適切なプロジェクトを選択する必要があります。

1. [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) に行き、ClickHouse Cloud を検索します。マーケットプレイスでオファーを購入できるように、ログインしていることを確認してください。

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

2. 製品リストページで、**Get It Now** をクリックします。

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

3. 次の画面で名前、メール、場所の情報を提供する必要があります。

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

4. 次の画面で、**Subscribe** をクリックします。

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

5. 次の画面で、サブスクリプション、リソースグループ、およびリソースグループの場所を選択します。リソースグループの場所は、ClickHouse Cloud でサービスを起動する場所と同じである必要はありません。

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

6. サブスクリプションの名前を提供するとともに、利用可能なオプションから請求期間を選択する必要があります。また、**Recurring billing** をオンまたはオフに設定することもできます。「オフ」に設定した場合、請求期間が終了した後に契約が終了し、リソースが解体されます。

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

7. **"Review + subscribe"** をクリックします。

8. 次の画面で、すべてが正しいことを確認し、**Subscribe** をクリックします。

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

9. この時点で、ClickHouse Cloud の Azure サブスクリプションにサブスクライブしたことになりますが、まだ ClickHouse Cloud アカウントは設定されていません。次のステップは必要であり、ClickHouse Cloud が Azure サブスクリプションにバインドして請求処理を正しく行うために重要です。

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

10. Azure のセットアップが完了すると、**Configure account now** ボタンがアクティブになります。

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

11. **Configure account now** をクリックします。

<br />

次のようなアカウント設定の詳細を含むメールが届きます：

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

12. ClickHouse Cloud のサインアップまたはサインインページにリダイレクトされます。新しいアカウントを使用してサインアップするか、既存のアカウントでサインインできます。サインインすると、新しい組織が作成され、Azure Marketplace を通じて使用と請求が可能になります。

13. 先に進む前に、いくつかの質問 - 住所や会社の詳細 - に答える必要があります。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報フォーム 2" border/>

<br />

14. **Complete sign up** をクリックすると、ClickHouse Cloud 内の組織に移動し、Azure Marketplace を通じて請求されることを確認し、サービスを作成できる請求画面を表示できます。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

15. 問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program) にお気軽にお問い合わせください。
