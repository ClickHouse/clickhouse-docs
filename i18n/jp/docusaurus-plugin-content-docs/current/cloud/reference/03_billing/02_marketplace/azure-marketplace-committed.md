---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: 'Azure Marketplace コミットメント契約'
description: 'Azure Marketplace のコミットメント契約を通じて ClickHouse Cloud を契約する'
keywords: ['Microsoft', 'Azure', 'marketplace', '課金', 'コミットメント', 'コミットメント契約']
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

ClickHouse Cloud を、コミット契約を通じて [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) から利用開始できます。コミット契約は Private Offer とも呼ばれ、一定期間にわたって ClickHouse Cloud に対してあらかじめ定めた金額の利用を約束する契約形態です。


## 前提条件 \{#prerequisites\}

- 特定の契約条件に基づいた ClickHouse からの Private Offer。



## サインアップ手順 \{#steps-to-sign-up\}

1. プライベートオファーを確認および承諾するためのリンクが記載されたメールを受け取っているはずです。

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Azure Marketplace プライベートオファーのメール" border/>

<br />

2. メール内の **Review Private Offer** リンクをクリックします。Azure Marketplace のプライベートオファー詳細ページに移動します。

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Azure Marketplace プライベートオファーの詳細" border/>

<br />

3. オファーを承諾すると、**Private Offer Management** 画面に移動します。Azure が購入用のオファーを準備するまで、少し時間がかかる場合があります。

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Azure Marketplace Private Offer Management ページ" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Azure Marketplace Private Offer Management ページの読み込み中画面" border/>

<br />

4. 数分後、ページを再読み込みします。オファーが **Purchase** 可能な状態になっているはずです。

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Azure Marketplace Private Offer Management ページ（購入が有効化された状態）" border/>

<br />

5. **Purchase** をクリックすると、フライアウトが開きます。以下を入力・設定します。

<br />

- サブスクリプションとリソースグループ
- SaaS サブスクリプション名
- プライベートオファーが適用される課金プランを選択します。プライベートオファーが作成された契約期間（例: 1 年）のみ金額が設定されています。その他の課金期間オプションは金額 $0 になります。
- 定期的な課金（自動更新）を有効にするかどうかを選択します。定期的な課金を選択しない場合、契約は課金期間の終了時に終了し、リソースは廃止予定 (decommissioned) 状態に設定されます。
- **Review + subscribe** をクリックします。

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Azure Marketplace サブスクリプションフォーム" border/>

<br />

6. 次の画面で、すべての詳細を確認し、**Subscribe** をクリックします。

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Azure Marketplace サブスクリプション確認画面" border/>

<br />

7. 次の画面で、**Your SaaS subscription in progress** と表示されます。

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Azure Marketplace サブスクリプション送信中のページ" border/>

<br />

8. 準備が整ったら、**Configure account now** をクリックできます。これは、お使いのアカウントの Azure サブスクリプションを ClickHouse Cloud の組織に紐付けるための重要なステップです。このステップを実施しない場合、Marketplace サブスクリプションは完了しません。

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Azure Marketplace Configure account now ボタン" border/>

<br />

9. ClickHouse Cloud のサインアップまたはサインインページにリダイレクトされます。新しいアカウントでサインアップすることも、既存のアカウントでサインインすることもできます。サインインが完了すると、新しい組織が作成され、Azure Marketplace 経由での請求が可能な状態になります。

10. 続行する前に、住所および会社情報に関するいくつかの質問に回答する必要があります。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報フォーム 2" border/>

<br />

11. **Complete sign up** をクリックすると、ClickHouse Cloud 内のご自身の組織ページに移動します。ここで課金画面を表示し、Azure Marketplace 経由で請求されていることを確認するとともに、サービスを作成できます。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program) まで遠慮なくお問い合わせください。
