---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace の従量課金 (PAYG)'
description: 'AWS Marketplace（PAYG 従量課金）経由で ClickHouse Cloud に登録します。'
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

PAYG（従量課金制）のパブリックオファーを利用して、[AWS Marketplace](https://aws.amazon.com/marketplace) から ClickHouse Cloud の利用を開始しましょう。


## 前提条件 {#prerequisites}

- 課金管理者によって購入権限が付与されている AWS アカウント。
- 購入するには、そのアカウントで AWS Marketplace にログインしている必要があります。
- サブスクリプションに ClickHouse の組織を接続するには、その組織の管理者である必要があります。

:::note
1 つの AWS アカウントは、「ClickHouse Cloud - Pay As You Go」サブスクリプション 1 件のみに登録でき、そのサブスクリプションは 1 つの ClickHouse 組織にのみリンクできます。
:::



## サインアップ手順 {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### ClickHouse Cloud - Pay As You Go を検索する {#search-payg}

[AWS Marketplace](https://aws.amazon.com/marketplace) にアクセスし、「ClickHouse Cloud - Pay As You Go」を検索します。

<Image img={aws_marketplace_payg_1} alt="ClickHouse を検索している AWS Marketplace" border/>

### 購入オプションを表示する {#purchase-options}

[リスティング](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu) をクリックし、続いて **View purchase options** をクリックします。

<Image img={aws_marketplace_payg_2} alt="AWS Marketplace の購入オプション表示画面" border/>

### 購読する {#subscribe}

次の画面で、**Subscribe** をクリックします。

:::note
**Purchase order (PO) number** は任意入力のため、省略してかまいません。
:::

<Image img={aws_marketplace_payg_3} alt="AWS Marketplace の購読画面" border/>

### アカウントをセットアップする {#set-up-your-account}

この時点ではセットアップは完了しておらず、まだ ClickHouse Cloud 組織の請求は AWS Marketplace 経由になっていないことに注意してください。Marketplace のサブスクリプション画面で **Set up your account** をクリックし、ClickHouse Cloud にリダイレクトしてセットアップを完了させる必要があります。

<Image img={aws_marketplace_payg_4} alt="アカウントのセットアップ" border/>

ClickHouse Cloud にリダイレクトされたら、既存アカウントでログインするか、新しいアカウントを登録できます。ClickHouse Cloud 組織を AWS Marketplace の課金に紐付けるために、このステップは非常に重要です。

:::note[新規 ClickHouse Cloud ユーザー]
ClickHouse Cloud を初めて利用する場合は、以下の手順に従ってください。
:::

<details>
<summary><strong>新規ユーザー向けの手順</strong></summary>

ClickHouse Cloud を初めて利用する場合は、ページ下部の **Register** をクリックします。新規ユーザーの作成とメールアドレスの確認を求められます。メールアドレスを確認したら、ClickHouse Cloud のログインページは閉じてかまいません。https://console.clickhouse.cloud にアクセスし、新しく作成したユーザー名でログインします。

<Image img={aws_marketplace_payg_5} size="md" alt="ClickHouse Cloud のサインアップ"/>

:::note[新規ユーザー]
ビジネスに関する基本的な情報も入力する必要があります。以下のスクリーンショットを参照してください。
:::

<Image img={aws_marketplace_payg_6} size="md" alt="開始前の入力画面"/>

<Image img={aws_marketplace_payg_7} size="md" alt="開始前の入力画面（続き）"/>

</details>

すでに ClickHouse Cloud を利用している場合は、既存の認証情報を使用してログインするだけでかまいません。

### Marketplace サブスクリプションを Organization に追加する {#add-marketplace-subscription}

正常にログインしたら、この Marketplace サブスクリプションで課金する新しい Organization を作成するか、このサブスクリプションに紐付けて課金する既存の Organization を選択します。 

<Image img={aws_marketplace_payg_8} size="md" alt="Marketplace サブスクリプションの追加" border/>

このステップを完了すると、組織はこの AWS サブスクリプションに接続され、すべての利用料金は AWS アカウント経由で請求されます。

ClickHouse UI の組織の請求ページから、請求が AWS Marketplace にリンクされていることを確認できます。

<Image img={aws_marketplace_payg_9} size="lg" alt="請求ページの確認" border/>

</VerticalStepper>



## サポート {#support}

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program)までお気軽にお問い合わせください。
