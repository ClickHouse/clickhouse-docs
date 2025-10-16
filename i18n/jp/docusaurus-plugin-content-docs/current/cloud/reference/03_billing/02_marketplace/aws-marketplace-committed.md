---
'slug': '/cloud/billing/marketplace/aws-marketplace-committed-contract'
'title': 'AWS Marketplace コミット契約'
'description': 'AWS Marketplaceを通じてClickHouse Cloudにサブスクライブする (Committed Contract)'
'keywords':
- 'aws'
- 'amazon'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
'doc_type': 'guide'
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

ClickHouse Cloudを[AWS Marketplace](https://aws.amazon.com/marketplace)で開始するには、コミットされた契約を通じて行います。コミットされた契約、別名プライベートオファーは、顧客が一定期間にわたってClickHouse Cloudに対して特定の金額を支出することを約束するためのものです。

## 前提条件 {#prerequisites}

- 特定の契約条件に基づくClickHouseからのプライベートオファー。
- ClickHouse組織をコミットされた支出オファーに接続するには、その組織の管理者である必要があります。

[AWSでコミット契約を表示および受諾するために必要な権限](https://docs.aws.amazon.com/marketplace/latest/buyerguide/private-offers-page.html#private-offers-page-permissions):
- AWSが管理するポリシーを使用している場合、次の権限が必要です: `AWSMarketplaceRead-only`, `AWSMarketplaceManageSubscriptions`, または `AWSMarketplaceFullAccess`。
- AWSが管理するポリシーを使用していない場合、次の権限が必要です: IAMアクション `aws-marketplace:ListPrivateListings` と `aws-marketplace:ViewSubscriptions`。

## サインアップ手順 {#steps-to-sign-up}

1. プライベートオファーを確認し受諾するためのリンクを含むメールを受け取っているはずです。

<br />

<Image img={aws_marketplace_committed_1} size="md" alt="AWS Marketplace private offer email" border/>

<br />

2. メール内の**オファーを確認**リンクをクリックしてください。これにより、プライベートオファーの詳細が表示されるAWS Marketplaceページに移動します。プライベートオファーを受け入れる際は、契約オプションのプルダウンリストで単位数を1に設定してください。

3. AWSポータルでのサブスクリプション手続きを完了し、**アカウントを設定**をクリックします。この時点でClickHouse Cloudにリダイレクトされ、新しいアカウントを登録するか、既存のアカウントでサインインする必要があります。このステップを完了しない限り、あなたのAWS MarketplaceのサブスクリプションとClickHouse Cloudをリンクさせることができません。

4. ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録してください。このステップは非常に重要で、あなたのClickHouse Cloud組織をAWS Marketplaceの請求に結びつけるために必要です。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

新しいClickHouse Cloudユーザーの場合は、ページの下部にある**登録**をクリックしてください。新しいユーザーを作成し、メールを確認するように促されます。メールを確認した後、ClickHouse Cloudのログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud)で新しいユーザー名を使ってログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up page" border/>

<br />

新しいユーザーの場合、ビジネスに関する基本情報を提供する必要がありますので、ご注意ください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

既存のClickHouse Cloudユーザーの場合は、資格情報を使用してログインするだけです。

5. ログインに成功すると、新しいClickHouse Cloud組織が作成されます。この組織はあなたのAWS請求アカウントに接続され、すべての使用量はAWSアカウントを通じて請求されます。

6. ログインすると、請求が実際にAWS Marketplaceに関連付けられていることを確認でき、ClickHouse Cloudリソースの設定を開始できます。

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud view AWS Marketplace billing" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud new services page" border/>

<br />

6. サインアップを確認するメールが届くはずです：

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace confirmation email" border/>

<br />

問題が発生した場合は、[サポートチームにお問い合わせください](https://clickhouse.com/support/program)。
