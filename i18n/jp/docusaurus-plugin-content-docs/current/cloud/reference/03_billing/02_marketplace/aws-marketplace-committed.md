---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: 'AWS Marketplace コミットメント契約'
description: 'AWS Marketplace（コミットメント契約）を通じて ClickHouse Cloud を契約する'
keywords: ['aws', 'amazon', 'marketplace', 'billing', 'コミットメント', 'コミットメント契約']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mp_committed_spend_1 from '@site/static/images/cloud/reference/mp_committed_spend_1.png'
import mp_committed_spend_2 from '@site/static/images/cloud/reference/mp_committed_spend_2.png'
import mp_committed_spend_3 from '@site/static/images/cloud/reference/mp_committed_spend_3.png'
import mp_committed_spend_4 from '@site/static/images/cloud/reference/mp_committed_spend_4.png'
import mp_committed_spend_5 from '@site/static/images/cloud/reference/mp_committed_spend_5.png'
import mp_committed_spend_6 from '@site/static/images/cloud/reference/mp_committed_spend_6.png'
import mp_committed_spend_7 from '@site/static/images/cloud/reference/mp_committed_spend_7.png'

コミットメント契約を利用して、[AWS Marketplace](https://aws.amazon.com/marketplace) 上で ClickHouse Cloud の利用を開始できます。
コミットメント契約は Private Offer（プライベートオファー）とも呼ばれ、一定期間にわたり、ClickHouse Cloud に対してあらかじめ定めた金額の利用を約束することができます。


## 前提条件 \\{#prerequisites\\}

- 特定の契約条件に基づく ClickHouse からのプライベートオファー。
- コミット済み支出オファーに ClickHouse の組織を紐付けるには、その組織の管理者である必要があります。

:::note
1 つの AWS アカウントは、1 つの ClickHouse 組織にのみリンク可能な 1 件の「ClickHouse Cloud - Committed Contract」プライベートオファーにだけ申し込むことができます。
:::

AWS 上でコミット済み契約を表示および受諾するために必要な権限:

- AWS マネージドポリシーを使用する場合、以下の権限が必要です:
  - `AWSMarketplaceRead-only`, `AWSMarketplaceManageSubscriptions`
  - または `AWSMarketplaceFullAccess`
- AWS マネージドポリシーを使用しない場合、以下の権限が必要です:
  - IAM アクション `aws-marketplace:ListPrivateListings` および `aws-marketplace:ViewSubscriptions`



## サインアップ手順 \\{#steps-to-sign-up\\}

<VerticalStepper headerLevel="h3">

### プライベートオファーを承諾する \\{#private-offer-accept\\}

プライベートオファーを確認して承諾するためのリンクが記載されたメールを受信しているはずです。

<Image img={mp_committed_spend_1} size="md" alt="AWS Marketplace のプライベートオファーのメール"/>

### オファーリンクを確認する \\{#review-offer-link\\}

メール内の「Review Offer」リンクをクリックします。
AWS Marketplace ページが開き、プライベートオファーの詳細が表示されます。

### アカウントをセットアップする \\{#setup-your-account\\}

AWS ポータル上でサブスクライブの手順を完了し、**「Set up your account」** をクリックします。
この時点で ClickHouse Cloud にリダイレクトされるので、新規アカウントを作成するか、既存アカウントでサインインしてください。
このステップを完了しないと、AWS Marketplace の契約を ClickHouse Cloud に紐付けることができません。

<Image img={mp_committed_spend_2} size="md" alt="AWS Marketplace のプライベートオファーのメール"/>

### ClickHouse Cloud にログインする \\{#login-cloud\\}

ClickHouse Cloud にリダイレクトされたら、既存アカウントでログインするか、新しいアカウントを登録できます。
このステップは、ClickHouse Cloud の組織を AWS Marketplace の課金に関連付けるために必要です。

<Image img={mp_committed_spend_3} size="md" alt="AWS Marketplace のプライベートオファーのメール"/>

### 新規の場合は登録する \\{#register\\}

ClickHouse Cloud を初めて利用する場合は、ページ下部の「Register」をクリックします。
新しいユーザーの作成とメールアドレスの確認を求められます。
メールアドレスを確認した後は、ClickHouse Cloud のログインページを閉じ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud) で新しいユーザー名を使ってログインできます。

新規ユーザーの場合、ビジネスに関する基本情報の入力も必要になります。
以下のスクリーンショットを参照してください。

<Image img={mp_committed_spend_4} size="md" alt="ビジネス情報の入力"/>

<Image img={mp_committed_spend_5} size="md" alt="ビジネス情報の入力"/>

すでに ClickHouse Cloud を利用している場合は、認証情報を使ってログインするだけで構いません。

### 請求先とする組織を作成または選択する \\{#create-select-org-to-bill\\}

ログインに成功したら、この Marketplace 契約の請求先とする新しい組織を作成するか、この契約の請求先とする既存の組織を選択できます。

<Image img={mp_committed_spend_6} size="md" alt="このサブスクリプションの請求先とする組織を作成または選択"/>

このステップを完了すると、組織は AWS のコミット済み利用額契約に接続され、すべての利用料金が AWS アカウント経由で請求されます。
ClickHouse UI の組織の請求ページから、請求が AWS Marketplace に正しくリンクされていることを確認できます。

<Image img={mp_committed_spend_7} size="md" alt="セットアップ完了の確認"/>

問題が発生した場合は、遠慮なく[サポートチーム](https://clickhouse.com/support/program)までお問い合わせください。

</VerticalStepper>
