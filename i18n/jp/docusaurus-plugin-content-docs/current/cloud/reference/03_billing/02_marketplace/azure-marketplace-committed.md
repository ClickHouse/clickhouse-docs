---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: 'Azure Marketplace コミットメント契約'
description: 'Azure Marketplace（コミットメント契約）経由で ClickHouse Cloud を契約する'
keywords: ['Microsoft', 'Azure', 'marketplace', 'billing', 'committed', 'committed contract']
doc_type: 'guide'
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

コミット済み契約を通じて、[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 上で ClickHouse Cloud の利用を開始できます。コミット済み契約は Private Offer（プライベートオファー）とも呼ばれ、一定期間にわたって ClickHouse Cloud に対する所定の金額の支出をお客様にコミットしていただく仕組みです。


## 前提条件 {#prerequisites}

- 特定の契約条件に基づいたClickHouseからのプライベートオファー


## サインアップ手順 {#steps-to-sign-up}

1. プライベートオファーを確認して承諾するためのリンクが記載されたメールが届いているはずです。

<br />

<Image
  img={azure_marketplace_committed_1}
  size='md'
  alt='Azure Marketplaceプライベートオファーメール'
  border
/>

<br />

2. メール内の**Review Private Offer**リンクをクリックします。プライベートオファーの詳細が表示されたAzure Marketplaceページに移動します。

<br />

<Image
  img={azure_marketplace_committed_2}
  size='md'
  alt='Azure Marketplaceプライベートオファー詳細'
  border
/>

<br />

3. オファーを承諾すると、**Private Offer Management**画面に移動します。Azureがオファーの購入準備を完了するまで、しばらく時間がかかる場合があります。

<br />

<Image
  img={azure_marketplace_committed_3}
  size='md'
  alt='Azure Marketplace Private Offer Managementページ'
  border
/>

<br />

<Image
  img={azure_marketplace_committed_4}
  size='md'
  alt='Azure Marketplace Private Offer Managementページ読み込み中'
  border
/>

<br />

4. 数分後、ページを更新します。オファーが**Purchase**可能な状態になっているはずです。

<br />

<Image
  img={azure_marketplace_committed_5}
  size='md'
  alt='Azure Marketplace Private Offer Managementページ購入可能'
  border
/>

<br />

5. **Purchase**をクリックすると、フライアウトが開きます。以下の項目を入力してください:

<br />

- サブスクリプションとリソースグループ
- SaaSサブスクリプションの名前を入力
- プライベートオファーを受けている請求プランを選択します。プライベートオファーが作成された期間(例: 1年)のみに金額が表示されます。その他の請求期間オプションは$0の金額になります。
- 継続請求を希望するかどうかを選択します。継続請求を選択しない場合、契約は請求期間の終了時に終了し、リソースは廃止予定に設定されます。
- **Review + subscribe**をクリックします。

<br />

<Image
  img={azure_marketplace_committed_6}
  size='md'
  alt='Azure Marketplaceサブスクリプションフォーム'
  border
/>

<br />

6. 次の画面で、すべての詳細を確認し、**Subscribe**をクリックします。

<br />

<Image
  img={azure_marketplace_committed_7}
  size='md'
  alt='Azure Marketplaceサブスクリプション確認'
  border
/>

<br />

7. 次の画面に**Your SaaS subscription in progress**と表示されます。

<br />

<Image
  img={azure_marketplace_committed_8}
  size='md'
  alt='Azure Marketplaceサブスクリプション送信ページ'
  border
/>

<br />

8. 準備が完了したら、**Configure account now**をクリックできます。これは、AzureサブスクリプションをアカウントのClickHouse Cloud組織にバインドする重要なステップです。この手順を実行しないと、Marketplaceサブスクリプションは完了しません。

<br />

<Image
  img={azure_marketplace_committed_9}
  size='md'
  alt='Azure Marketplace configure account nowボタン'
  border
/>

<br />

9. ClickHouse Cloudのサインアップまたはサインインページにリダイレクトされます。新しいアカウントでサインアップするか、既存のアカウントでサインインできます。サインインすると、Azure Marketplace経由で使用および請求可能な新しい組織が作成されます。

10. 続行する前に、住所と会社の詳細に関するいくつかの質問に回答する必要があります。

<br />

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='ClickHouse Cloudサインアップ情報フォーム'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_9}
  size='md'
  alt='ClickHouse Cloudサインアップ情報フォーム2'
  border
/>

<br />

11. **Complete sign up**をクリックすると、ClickHouse Cloud内の組織に移動します。そこで請求画面を表示して、Azure Marketplace経由で請求されていることを確認し、サービスを作成できます。

<br />

<br />

<Image
  img={azure_marketplace_payg_11}
  size='sm'
  alt='ClickHouse Cloudサインアップ情報フォーム'
  border
/>

<br />

<br />

<Image
  img={azure_marketplace_payg_12}
  size='md'
  alt='ClickHouse Cloudサインアップ情報フォーム'
  border
/>

<br />

問題が発生した場合は、遠慮なく[サポートチーム](https://clickhouse.com/support/program)にお問い合わせください。
