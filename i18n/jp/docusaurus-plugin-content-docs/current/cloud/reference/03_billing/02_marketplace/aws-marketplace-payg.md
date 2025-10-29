---
'slug': '/cloud/billing/marketplace/aws-marketplace-payg'
'title': 'AWS Marketplace PAYG'
'description': 'AWS Marketplace (PAYG) を通じて ClickHouse Cloud にサブスクライブします。'
'keywords':
- 'aws'
- 'marketplace'
- 'billing'
- 'PAYG'
'doc_type': 'guide'
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

- 購入権限が付与されたAWSアカウントが必要です（請求管理者により設定されます）。
- 購入するには、このアカウントでAWSマーケットプレイスにログインしている必要があります。

## Steps to sign up {#steps-to-sign-up}

1. [AWS Marketplace](https://aws.amazon.com/marketplace)にアクセスし、ClickHouse Cloudを検索します。

<br />

<Image img={aws_marketplace_payg_1} size="md" alt="AWS Marketplace home page" border/>

<br />

2. [リスティング](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)をクリックし、次に**購入オプションを表示**を選択します。

<br />

<Image img={aws_marketplace_payg_2} size="md" alt="AWS Marketplace search for ClickHouse" border/>

<br />

3. 次の画面で契約を設定します：
- **契約の期間** - PAYG契約は月ごとの契約です。
- **更新設定** - 契約を自動更新するかどうかを設定できます。
契約を毎月自動更新に設定することを強くお勧めします。ただし、自動更新を有効にしない場合、組織は請求サイクルの終わりに自動的に猶予期間に入り、その後廃止されます。

- **契約オプション** - このテキストボックスに任意の数（もしくは1を入力）できます。この数は、公共オファーに対して支払う価格には影響しません。これらのユニットは通常、ClickHouse Cloudからのプライベートオファーを受け入れるときに使用されます。

- **購入注文** - これはオプションであり、無視してもかまいません。

<br />

<Image img={aws_marketplace_payg_3} size="md" alt="AWS Marketplace configure contract" border/>

<br />

上記の情報を入力したら、**契約を作成**をクリックします。表示されている契約価格がゼロドルであることを確認でき、つまり支払いが不要で、使用量に基づいて料金が発生することになります。

<br />

<Image img={aws_marketplace_payg_4} size="md" alt="AWS Marketplace confirm contract" border/>

<br />

4. **契約を作成**をクリックすると、確認と支払い（$0の支払い）が求められるモーダルが表示されます。

5. **今すぐ支払う**をクリックすると、AWSマーケットプレイスの提供に対して現在購読しているという確認が表示されます。

<br />

<Image img={aws_marketplace_payg_5} size="md" alt="AWS Marketplace payment confirmation" border/>

<br />

6. この時点で設定はまだ完了していないことに注意してください。**アカウントを設定する**をクリックしてClickHouse Cloudにリダイレクトし、ClickHouse Cloudにサインアップする必要があります。

7. ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントで登録します。このステップは非常に重要で、あなたのClickHouse Cloud組織をAWSマーケットプレイスの請求に結びつけるために必要です。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

新しいClickHouse Cloudユーザーである場合は、ページの下部で**登録**をクリックします。新しいユーザーの作成とメールの確認を求められます。メールを確認した後、ClickHouse Cloudのログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud)で新しいユーザー名を使用してログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up page" border/>

<br />

新しいユーザーの場合、ビジネスに関する基本的な情報を提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

既存のClickHouse Cloudユーザーの場合は、資格情報を使用してログインしてください。

8. ログインに成功すると、新しいClickHouse Cloud組織が作成されます。この組織はあなたのAWS請求アカウントに接続され、すべての使用量はAWSアカウントを通じて請求されます。

9. ログインしたら、実際に請求がAWSマーケットプレイスに結び付いていることを確認し、ClickHouse Cloudのリソースを設定し始めることができます。

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud view AWS Marketplace billing" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud new services page" border/>

<br />

10. 登録確認のメールを受け取るはずです：

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace confirmation email" border/>

<br />

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program)にご連絡ください。
