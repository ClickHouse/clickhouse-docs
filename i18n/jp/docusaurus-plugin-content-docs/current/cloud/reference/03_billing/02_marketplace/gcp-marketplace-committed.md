---
slug: /cloud/billing/marketplace/gcp-marketplace-committed-contract
title: 'GCP Marketplace コミットメント契約'
description: 'GCP Marketplace（コミットメント契約）経由で ClickHouse Cloud を契約する'
keywords: ['gcp', 'google', 'marketplace', 'billing', 'committed', 'committed contract']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import gcp_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-1.png';
import gcp_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-2.png';
import gcp_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-3.png';
import gcp_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-4.png';
import gcp_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-5.png';
import gcp_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-6.png';
import gcp_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-7.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';

コミット型契約を通じて、[GCP Marketplace](https://console.cloud.google.com/marketplace) 上で ClickHouse Cloud の利用を開始できます。コミット型契約（Private Offer とも呼ばれます）は、一定期間にわたって ClickHouse Cloud の利用に一定額をコミットする仕組みです。


## 前提条件 {#prerequisites}

- 特定の契約条件に基づいて ClickHouse から提示されるプライベートオファー。



## サインアップ手順 {#steps-to-sign-up}

1. プライベートオファーを確認・同意するためのリンクが記載されたメールを受信しているはずです。

<br />

<Image img={gcp_marketplace_committed_1} size="md" alt="GCP Marketplace プライベートオファーのメール" border />

<br />

2. メール内の **Review Offer** リンクをクリックします。GCP Marketplace のプライベートオファー詳細ページに移動します。

<br />

<Image img={gcp_marketplace_committed_2} size="md" alt="GCP Marketplace オファー概要" border/>

<br />

<Image img={gcp_marketplace_committed_3} size="md" alt="GCP Marketplace 料金概要" border/>

<br />

3. プライベートオファーの詳細を確認し、内容に問題がなければ **Accept** をクリックします。

<br />

<Image img={gcp_marketplace_committed_4} size="md" alt="GCP Marketplace オファー承諾ページ" border/>

<br />

4. **Go to product page** をクリックします。

<br />

<Image img={gcp_marketplace_committed_5} size="md" alt="GCP Marketplace 承諾完了の確認画面" border/>

<br />

5. **Manage on provider** をクリックします。

<br />

<Image img={gcp_marketplace_committed_6} size="md" alt="GCP Marketplace の ClickHouse Cloud ページ" border/>

<br />

このタイミングで ClickHouse Cloud にリダイレクトし、サインアップまたはサインインすることが非常に重要です。このステップを完了しない場合、GCP Marketplace のサブスクリプションを ClickHouse Cloud にリンクできません。

<br />

<Image img={gcp_marketplace_committed_7} size="md" alt="GCP Marketplace サイト離脱確認モーダル" border/>

<br />

6. ClickHouse Cloud にリダイレクトされたら、既存アカウントでサインインするか、新規アカウントを登録するかを選択できます。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud サインインページ" border/>

<br />

新規の ClickHouse Cloud ユーザーの場合は、ページ下部の **Register** をクリックします。新しいユーザーの作成とメールアドレスの確認が求められます。メールアドレスの確認が完了したら、ClickHouse Cloud のログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud) にアクセスして新しいユーザー名でサインインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud サインアップページ" border/>

<br />

新規ユーザーの場合は、ビジネスに関する基本情報も入力する必要がある点に注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報入力フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報入力フォーム 2" border/>

<br />

既存の ClickHouse Cloud ユーザーの場合は、認証情報を使用してそのままサインインしてください。

7. サインインに成功すると、新しい ClickHouse Cloud 組織が作成されます。この組織は GCP の請求アカウントに接続され、すべての利用料金は GCP アカウント経由で請求されます。

8. サインイン後、請求が GCP Marketplace に紐づいていることを確認し、ClickHouse Cloud リソースのセットアップを開始できます。

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud サインインページ" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 新規サービスページ" border/>

<br />

9. サインアップ完了を確認するメールが届きます。

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace 確認メール" border/>

<br />

<br />

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program)まで遠慮なくお問い合わせください。
