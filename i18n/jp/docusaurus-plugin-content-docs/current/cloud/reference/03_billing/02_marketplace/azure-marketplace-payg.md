---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: 'Azure Marketplace の従量課金 (PAYG)'
description: 'Azure Marketplace（PAYG）経由で ClickHouse Cloud を契約します。'
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
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png/';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png/';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) で提供されている PAYG（従量課金制）パブリックオファーから ClickHouse Cloud の利用を開始できます。


## 前提条件 {#prerequisites}

- 請求管理者によって購入権限が有効化されているAzureプロジェクト。
- Azure MarketplaceでClickHouse Cloudにサブスクライブするには、購入権限を持つアカウントでログインし、適切なプロジェクトを選択する必要があります。

1. [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)にアクセスし、ClickHouse Cloudを検索します。マーケットプレイスで製品を購入できるよう、ログインしていることを確認してください。

<br />

<Image
  img={azure_marketplace_payg_1}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

2. 製品リストページで、**Get It Now**をクリックします。

<br />

<Image
  img={azure_marketplace_payg_2}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

3. 次の画面で、名前、メールアドレス、および所在地情報を入力する必要があります。

<br />

<Image
  img={azure_marketplace_payg_3}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

4. 次の画面で、**Subscribe**をクリックします。

<br />

<Image
  img={azure_marketplace_payg_4}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

5. 次の画面で、サブスクリプション、リソースグループ、およびリソースグループの場所を選択します。リソースグループの場所は、ClickHouse Cloudでサービスを起動する予定の場所と同じである必要はありません。

<br />

<Image
  img={azure_marketplace_payg_5}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

6. また、サブスクリプションの名前を入力し、利用可能なオプションから請求期間を選択する必要があります。**Recurring billing**をオンまたはオフに設定できます。「オフ」に設定すると、請求期間の終了後に契約が終了し、リソースが廃止されます。

<br />

<Image
  img={azure_marketplace_payg_6}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

7. **「Review + subscribe」**をクリックします。

8. 次の画面で、すべての内容が正しいことを確認し、**Subscribe**をクリックします。

<br />

<Image
  img={azure_marketplace_payg_7}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

9. この時点で、ClickHouse CloudのAzureサブスクリプションへのサブスクライブは完了していますが、ClickHouse Cloudでのアカウント設定はまだ完了していないことに注意してください。次のステップは、ClickHouse CloudがAzureサブスクリプションにバインドされ、Azureマーケットプレイスを通じて請求が正しく行われるために必要かつ重要です。

<br />

<Image
  img={azure_marketplace_payg_8}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

10. Azureのセットアップが完了すると、**Configure account now**ボタンがアクティブになります。

<br />

<Image
  img={azure_marketplace_payg_9}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

11. **Configure account now**をクリックします。

<br />

アカウント設定の詳細が記載された以下のようなメールが届きます:

<br />

<Image
  img={azure_marketplace_payg_10}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

12. ClickHouse Cloudのサインアップまたはサインインページにリダイレクトされます。ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録できます。このステップは、ClickHouse Cloudの組織をAzure Marketplaceの請求にバインドするために非常に重要です。

13. 新規ユーザーの場合は、ビジネスに関する基本情報も入力する必要があります。以下のスクリーンショットを参照してください。

<br />

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_9}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム 2'
  border
/>

<br />

**Complete sign up**をクリックすると、ClickHouse Cloud内の組織に移動します。そこで請求画面を表示し、Azure Marketplaceを通じて請求されていることを確認し、サービスを作成できます。

<br />

<br />

<Image
  img={azure_marketplace_payg_11}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>

<br />

<br />

<Image
  img={azure_marketplace_payg_12}
  size='md'
  alt='ClickHouse Cloud サインアップ情報フォーム'
  border
/>


<br />

14. 問題やご不明な点がありましたら、遠慮なく[サポートチーム](https://clickhouse.com/support/program)までお問い合わせください。
