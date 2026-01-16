---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace PAYG'
description: 'AWS Marketplace（PAYG）を通じて ClickHouse Cloud に申し込みます。'
keywords: ['aws', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
---

import aws_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-1.png';
import aws_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-2.png';
import aws_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-3.png';
import aws_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-4.png';
import aws_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-5.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import Image from '@theme/IdealImage';

[AWS Marketplace](https://aws.amazon.com/marketplace) の PAYG（従量課金制）パブリックオファーから ClickHouse Cloud の利用を開始しましょう。


## 前提条件 \{#prerequisites\}

- 請求管理者によって購入権限が有効化されている AWS アカウント。
- サブスクリプションを購入するには、そのアカウントで AWS Marketplace にログインしている必要があります。
- サブスクリプションに ClickHouse 組織を接続するには、その組織の管理者である必要があります。

:::note
1 つの AWS アカウントは、「ClickHouse Cloud - Pay As You Go」サブスクリプション 1 件にしか登録できず、そのサブスクリプションは 1 つの ClickHouse 組織にのみリンクできます。
:::

## サインアップ手順 \{#steps-to-sign-up\}

<VerticalStepper headerLevel="h3">

### ClickHouse Cloud - Pay As You Go を検索する \{#search-payg\}

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、「ClickHouse Cloud - Pay As You Go」を検索します。

<Image img={aws_marketplace_payg_1} alt="ClickHouse を検索している AWS Marketplace" border/>

### 購入オプションを表示する \{#purchase-options\}

[リスティング](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu) をクリックし、続いて **View purchase options** をクリックします。

<Image img={aws_marketplace_payg_2} alt="AWS Marketplace の購入オプションの表示" border/>

### 購読する \{#subscribe\}

次の画面で「Subscribe」をクリックします。

:::note
**Purchase order (PO) number** は任意であり、入力しなくてもかまいません。  
**このリスティングには 2 つのオファーが用意されています。** 「ClickHouse Cloud - Pay As You Go Free Trial」のオファーを選択した場合、30 日間の AWS 管理の無料トライアルにサブスクライブすることになります。ただし、30 日が経過するとこのリスティングのサブスクリプションは終了します。ClickHouse の Pay As You Go を継続利用するには、このリスティング上のもう一方の「ClickHouse Cloud - Pay As You Go」オファーに再度サブスクライブする必要があります。
:::

<Image img={aws_marketplace_payg_3} alt="AWS Marketplace でのサブスクライブ画面" border/>

### アカウントをセットアップする \{#set-up-your-account\}

この時点ではセットアップは完了しておらず、まだ ClickHouse Cloud の組織は Marketplace 経由での課金対象にはなっていない点に注意してください。Marketplace のサブスクリプション画面で「Set up your account」をクリックし、ClickHouse Cloud にリダイレクトしてセットアップを完了させます。

<Image img={aws_marketplace_payg_4} alt="アカウントのセットアップ" border/>

ClickHouse Cloud にリダイレクトされたら、既存アカウントでログインするか、新規アカウントを登録できます。このステップは、ClickHouse Cloud の組織を AWS Marketplace の課金に紐付けるために非常に重要です。

:::note[新規 ClickHouse Cloud ユーザー]
ClickHouse Cloud を初めて利用する場合は、以下の手順に従ってください。
:::

<details>
<summary><strong>新規ユーザー向けの手順</strong></summary>

ClickHouse Cloud を初めて利用する場合は、ページ下部の「Register」をクリックします。新しいユーザーの作成とメールアドレスの確認を求められます。メール確認が完了したら、ClickHouse Cloud のログインページを閉じ、https://console.clickhouse.cloud で新しいユーザー名を使用してログインできます。

<Image img={aws_marketplace_payg_5} size="md" alt="ClickHouse Cloud のサインアップ"/>

:::note[新規ユーザー]
ビジネスに関する基本的な情報の入力も必要になります。以下のスクリーンショットを参照してください。
:::

<Image img={aws_marketplace_payg_6} size="md" alt="開始前の画面"/>

<Image img={aws_marketplace_payg_7} size="md" alt="開始前の画面（続き）"/>

</details>

既存の ClickHouse Cloud ユーザーの場合は、認証情報を使用してログインするだけで構いません。

### Marketplace サブスクリプションを組織に追加する \{#add-marketplace-subscription\}

ログインに成功したら、この Marketplace サブスクリプションで課金する新しい組織を作成するか、既存の組織のいずれかを選択して、このサブスクリプションの課金先として指定できます。 

<Image img={aws_marketplace_payg_8} size="md" alt="Marketplace サブスクリプションの追加" border/>

このステップを完了すると、組織はこの AWS サブスクリプションに接続され、すべての使用量が AWS アカウント経由で課金されます。

ClickHouse の UI にある組織の請求ページから、請求が AWS Marketplace にリンクされていることを確認できます。

<Image img={aws_marketplace_payg_9} size="lg" alt="請求ページの確認" border/>

</VerticalStepper>

## サポート \{#support\}

問題が発生した場合は、[弊社サポートチーム](https://clickhouse.com/support/program)まで遠慮なくお問い合わせください。