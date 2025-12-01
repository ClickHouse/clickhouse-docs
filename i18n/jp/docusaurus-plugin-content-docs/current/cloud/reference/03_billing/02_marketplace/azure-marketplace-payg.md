---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: 'Azure Marketplace PAYG'
description: 'Azure Marketplace（PAYG）を通じて ClickHouse Cloud をサブスクライブします。'
keywords: ['azure', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
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

PAYG（従量課金制）のパブリックオファーを通じて、[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) から ClickHouse Cloud の利用を開始しましょう。


## 前提条件 {#prerequisites}

- 課金管理者によって購入権限が付与されている Azure プロジェクト。
- Azure Marketplace で ClickHouse Cloud をサブスクライブするには、購入権限を持つアカウントでログインし、適切なプロジェクトを選択する必要があります。

1. [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) にアクセスし、ClickHouse Cloud を検索します。Marketplace 上のオファリングを購入できるよう、ログインしていることを確認してください。

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

2. プロダクトのリスティングページで、**今すぐ取得 (Get It Now)** をクリックします。

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

3. 次の画面で、名前、メールアドレス、および所在地情報を入力する必要があります。

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

4. 次の画面で、**サブスクライブ (Subscribe)** をクリックします。

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

5. 次の画面で、サブスクリプション、リソース グループ、およびリソース グループの場所を選択します。リソース グループの場所は、ClickHouse Cloud 上でサービスを起動しようとしている場所と同一である必要はありません。

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

6. サブスクリプション名を指定し、利用可能なオプションから課金期間を選択する必要もあります。**定期的な課金 (Recurring billing)** をオンまたはオフに設定できます。これを「オフ」に設定した場合、課金期間の終了時に契約は終了し、リソースは削除されます。

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

7. **"レビュー + サブスクライブ (Review + subscribe)"** をクリックします。

8. 次の画面で、すべての内容が正しいことを確認し、**サブスクライブ (Subscribe)** をクリックします。

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

9. この時点で、ClickHouse Cloud 用の Azure サブスクリプションにはサブスクライブ済みですが、ClickHouse Cloud 上のアカウント設定はまだ完了していません。ClickHouse Cloud が Azure サブスクリプションにバインドされ、請求が Azure Marketplace を通じて正しく行われるようにするには、次のステップが必要かつ重要です。

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

10. Azure 側のセットアップが完了すると、**今すぐアカウントを構成 (Configure account now)** ボタンがアクティブになります。

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

11. **今すぐアカウントを構成 (Configure account now)** をクリックします。

<br />

アカウント構成の詳細が記載された、以下のようなメールが届きます。

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

12. ClickHouse Cloud のサインアップまたはサインイン ページにリダイレクトされます。ClickHouse Cloud にリダイレクトされたら、既存アカウントでログインするか、新しいアカウントを登録できます。ClickHouse Cloud の組織を Azure Marketplace の課金にバインドするため、このステップは非常に重要です。

13. 新規ユーザーの場合は、ビジネスに関する基本情報の入力も求められます。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報フォーム 2" border/>

<br />

**サインアップを完了 (Complete sign up)** をクリックすると、ClickHouse Cloud 内の組織ページに移動します。そこで、Azure Marketplace 経由で課金されていることを確認するための請求画面を表示したり、サービスを作成したりできます。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>



<br />

14. 問題が発生した場合は、[弊社サポートチーム](https://clickhouse.com/support/program)まで遠慮なくお問い合わせください。
