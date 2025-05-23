---
'slug': '/cloud/billing/marketplace/aws-marketplace-payg'
'title': 'AWS Marketplace PAYG'
'description': 'AWS Marketplaceを通じてClickHouse Cloudに登録（PAYG）します。'
'keywords':
- 'aws'
- 'marketplace'
- 'billing'
- 'PAYG'
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

Get started with ClickHouse Cloud on the [AWS Marketplace](https://aws.amazon.com/marketplace) via a PAYG (Pay-as-you-go) Public Offer.

## Prerequisites {#prerequisites}

- 購入権限が付与されたAWSアカウントが必要です。
- 購入するには、このアカウントでAWSマーケットプレイスにログインしている必要があります。

## Steps to sign up {#steps-to-sign-up}

1. [AWS Marketplace](https://aws.amazon.com/marketplace) に移動し、ClickHouse Cloudを検索します。

<br />

<Image img={aws_marketplace_payg_1} size="md" alt="AWS Marketplace home page" border/>

<br />

2. [リスティング](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)をクリックし、次に**購入オプションを見る**をクリックします。

<br />

<Image img={aws_marketplace_payg_2} size="md" alt="AWS Marketplace search for ClickHouse" border/>

<br />

3. 次の画面で契約を構成します：
- **契約期間** - PAYG契約は月単位で行われます。
- **更新設定** - 契約を自動更新するかどうか設定できます。 
自動更新を有効にしない場合、請求サイクルの終了時に組織は自動的に猶予期間に入ります。

- **契約オプション** - このテキストボックスには任意の数字（または1）を入力できます。これは、公共のオファーの単価が$0であるため、支払う価格には影響しません。これらの単位は通常、ClickHouse Cloudからのプライベートオファーを受け入れる際に使用されます。

- **発注書** - これはオプションであり、無視して構いません。

<br />

<Image img={aws_marketplace_payg_3} size="md" alt="AWS Marketplace configure contract" border/>

<br />

上記の情報を入力したら、**契約を作成**をクリックします。表示された契約価格がゼロドルであることを確認でき、これは実質的に支払いがなく、使用に基づいて請求されることを意味します。

<br />

<Image img={aws_marketplace_payg_4} size="md" alt="AWS Marketplace confirm contract" border/>

<br />

4. **契約を作成**をクリックすると、確認と支払い（$0が未払い）を行うためのモーダルが表示されます。

5. **今すぐ支払う**をクリックすると、AWSマーケットプレイスのClickHouse Cloudオファーに購読したことを確認するメッセージが表示されます。

<br />

<Image img={aws_marketplace_payg_5} size="md" alt="AWS Marketplace payment confirmation" border/>

<br />

6. この時点では、セットアップはまだ完了していないことに注意してください。**アカウントを設定する**をクリックしてClickHouse Cloudにリダイレクトし、ClickHouse Cloudにサインアップする必要があります。

7. ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントで登録できます。このステップは非常に重要で、あなたのClickHouse Cloud組織をAWSマーケットプレイスの請求に結びつけるために必要です。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

新しいClickHouse Cloudユーザーの場合は、ページの下部にある**登録**をクリックします。新しいユーザーを作成し、メールを確認するように求められます。メールを確認した後、ClickHouse Cloudのログインページを離れ、新しいユーザー名を使って[https://console.clickhouse.cloud](https://console.clickhouse.cloud)にログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up page" border/>

<br />

新しいユーザーの場合、ビジネスに関する基本情報も提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

既存のClickHouse Cloudユーザーの場合は、単に資格情報を使ってログインしてください。

8. ログインが成功すると、新しいClickHouse Cloud組織が作成されます。この組織はあなたのAWS請求アカウントに接続され、すべての使用はあなたのAWSアカウントを通じて請求されます。

9. ログインすると、請求が実際にAWSマーケットプレイスに結びついていることを確認でき、ClickHouse Cloudリソースの設定を開始できます。

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud view AWS Marketplace billing" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud new services page" border/>

<br />

10. サインアップ確認のメールが届くはずです：

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace confirmation email" border/>

<br />

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program)にお気軽にお問い合わせください。
