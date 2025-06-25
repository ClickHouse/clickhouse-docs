---
'slug': '/cloud/billing/marketplace/aws-marketplace-committed-contract'
'title': 'AWS Marketplace Committed Contract'
'description': 'Subscribe to ClickHouse Cloud through the AWS Marketplace (Committed
  Contract)'
'keywords':
- 'aws'
- 'amazon'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
---

import Image from '@theme/IdealImage';
import aws_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-committed-1.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import aws_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-10.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import aws_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-12.png';

Get started with ClickHouse Cloud on the [AWS Marketplace](https://aws.amazon.com/marketplace) via a committed contract. A committed contract, also known as a a Private Offer, allows customers to commit to spending a certain amount on ClickHouse Cloud over a period of time.

## Prerequisites {#prerequisites}

- ClickHouseからの特定の契約条件に基づいたPrivate Offer。

## Steps to sign up {#steps-to-sign-up}

1. プライベートオファーの確認と受け入れのためのリンクが含まれたメールを受け取っているはずです。

<br />

<Image img={aws_marketplace_committed_1} size="md" alt="AWS Marketplace private offer email" border/>

<br />

2. メール内の **Review Offer** リンクをクリックします。これによりプライベートオファーの詳細が記載されたAWS Marketplaceのページに移動します。プライベートオファーを受け入れる際には、契約オプションのプルダウンリストで単位数を1に設定してください。

3. AWSポータルでのサブスクリプション手続きが完了したら、 **Set up your account** をクリックします。この時点でClickHouse Cloudにリダイレクトされ、新しいアカウントを登録するか、既存のアカウントでサインインする必要があります。このステップを完了しないと、AWS MarketplaceのサブスクリプションをClickHouse Cloudにリンクすることができません。

4. ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録します。このステップは非常に重要で、あなたのClickHouse Cloud組織をAWS Marketplaceの請求に結びつけることができます。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

新しいClickHouse Cloudユーザーの場合は、ページの下部で **Register** をクリックします。新しいユーザーを作成するように求められ、メールの確認を行います。メールを確認した後、ClickHouse Cloudのログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud) で新しいユーザー名を使用してログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up page" border/>

<br />

新しいユーザーの場合は、ビジネスに関する基本情報をいくつか提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

既存のClickHouse Cloudユーザーであれば、単に資格情報を使用してログインしてください。

5. ログインに成功すると、新しいClickHouse Cloud組織が作成されます。この組織はあなたのAWS請求アカウントに接続され、すべての使用量はAWSアカウントを通じて請求されます。

6. ログイン後、請求が実際にAWS Marketplaceに関連付けられていることを確認し、ClickHouse Cloudリソースの設定を開始できます。

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud view AWS Marketplace billing" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud new services page" border/>

<br />

6. サインアップが確認された旨のメールを受け取るはずです：

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace confirmation email" border/>

<br />

問題が発生した場合は、[サポートチームにお問い合わせ](https://clickhouse.com/support/program)ください。
