---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace PAYG'
description: 'AWS Marketplace (PAYG) を通じて ClickHouse Cloud に登録します。'
keywords: ['aws', 'marketplace', 'billing', 'PAYG']
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
import aws_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-10.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import aws_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-12.png';
import Image from '@theme/IdealImage';

ClickHouse Cloudを[AWS Marketplace](https://aws.amazon.com/marketplace)を通じてPAYG（従量課金制）の公共オファーで始めましょう。

## 前提条件 {#prerequisites}

- 購入権限が与えられたAWSアカウント。
- 購入するには、このアカウントでAWS Marketplaceにログインしている必要があります。

## サインアップの手順 {#steps-to-sign-up}

1. [AWS Marketplace](https://aws.amazon.com/marketplace)にアクセスし、ClickHouse Cloudを検索します。

<br />

<Image img={aws_marketplace_payg_1} size="md" alt="AWS Marketplace ホームページ" border/>

<br />

2. [リスティング](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)をクリックし、次に**購入オプションを見る**をクリックします。

<br />

<Image img={aws_marketplace_payg_2} size="md" alt="AWS Marketplace で ClickHouse を検索" border/>

<br />

3. 次の画面で、契約を設定します：
- **契約期間** - PAYG契約は月単位で実行されます。
- **更新設定** - 契約を自動更新するかどうかを設定できます。 
自動更新を有効にしない場合、請求サイクルの終了時に自動的に猶予期間に入ります。

- **契約オプション** - このテキストボックスに任意の数値（または1だけ）を入力できます。これにより、公共オファーに対する価格には影響しません。これらの単位は通常、ClickHouse Cloudのプライベートオファーを受け入れるときに使用されます。

- **購入注文** - これは任意であり、無視してもかまいません。

<br />

<Image img={aws_marketplace_payg_3} size="md" alt="AWS Marketplace 契約の設定" border/>

<br />

上記の情報を入力したら、**契約を作成**をクリックします。表示された契約価格がゼロドルであることを確認でき、つまり料金の支払いはなく、使用に基づいて課金されることを意味します。

<br />

<Image img={aws_marketplace_payg_4} size="md" alt="AWS Marketplace 契約の確認" border/>

<br />

4. **契約を作成**をクリックすると、確認と支払いのためのモーダルが表示されます（$0の支払い）。

5. **今すぐ支払う**をクリックすると、ClickHouse CloudのAWS Marketplaceオファーにサブスクライブしたことが確認されます。

<br />

<Image img={aws_marketplace_payg_5} size="md" alt="AWS Marketplace 支払い確認" border/>

<br />

6. この時点では、セットアップはまだ完了していないことに注意してください。**アカウントを設定**をクリックしてClickHouse Cloudにリダイレクトし、ClickHouse Cloudにサインアップする必要があります。

7. ClickHouse Cloudにリダイレクトされると、既存のアカウントでログインするか、新しいアカウントを登録できます。このステップは非常に重要で、あなたのClickHouse Cloud組織をAWS Marketplaceの請求に紐付けるために必要です。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud サインインページ" border/>

<br />

新しいClickHouse Cloudユーザーの場合は、ページの下部にある**登録**をクリックします。新しいユーザーを作成し、メールアドレスを確認するように求められます。メールアドレスを確認した後、ClickHouse Cloudのログインページを離れ、新しいユーザー名で[https://console.clickhouse.cloud](https://console.clickhouse.cloud)にログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud サインアップページ" border/>

<br />

新しいユーザーである場合は、ビジネスに関する基本情報を提供する必要があることに注意してください。以下のスクリーンショットに参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報フォーム 2" border/>

<br />

既存のClickHouse Cloudユーザーの場合は、資格情報を使用してログインしてください。

8. ログインが成功すると、新しいClickHouse Cloud組織が作成されます。この組織はあなたのAWS請求アカウントに接続され、すべての使用状況はあなたのAWSアカウントを通じて請求されます。

9. ログインしたら、請求が実際にAWS Marketplaceに紐付けられていることを確認し、ClickHouse Cloudリソースの設定を開始できます。

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud AWS Marketplaceの請求を表示" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 新しいサービスページ" border/>

<br />

10. サインアップ確認のメールを受け取るはずです：

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace 確認メール" border/>

<br />

問題が発生した場合は、[サポートチームにお問い合わせください](https://clickhouse.com/support/program)。
