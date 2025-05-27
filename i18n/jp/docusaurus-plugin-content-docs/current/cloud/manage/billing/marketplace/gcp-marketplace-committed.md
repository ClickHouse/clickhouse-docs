---
'slug': '/cloud/billing/marketplace/gcp-marketplace-committed-contract'
'title': 'GCP Marketplace Committed Contract'
'description': 'Subscribe to ClickHouse Cloud through the GCP Marketplace (Committed
  Contract)'
'keywords':
- 'gcp'
- 'google'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
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

ClickHouse Cloud を [GCP Marketplace](https://console.cloud.google.com/marketplace) で利用開始するには、コミット契約を通じて行います。コミット契約は、プライベートオファーとも呼ばれ、顧客が一定の金額を ClickHouse Cloud に対して一定期間内に支払うことを約束するものです。

## 前提条件 {#prerequisites}

- 特定の契約条件に基づく ClickHouse からのプライベートオファー。

## サインアップ手順 {#steps-to-sign-up}

1. プライベートオファーを確認し、受け入れるためのリンクを含むメールを受け取っているはずです。

<br />

<Image img={gcp_marketplace_committed_1} size="md" alt="GCP Marketplace プライベートオファーのメール" border />

<br />

2. メール内の **Review Offer** リンクをクリックします。これにより、プライベートオファーの詳細が表示された GCP Marketplace ページに移動します。

<br />

<Image img={gcp_marketplace_committed_2} size="md" alt="GCP Marketplace オファーの概要" border/>

<br />

<Image img={gcp_marketplace_committed_3} size="md" alt="GCP Marketplace 価格の概要" border/>

<br />

3. プライベートオファーの詳細を確認し、すべてが正しい場合は **Accept** をクリックします。

<br />

<Image img={gcp_marketplace_committed_4} size="md" alt="GCP Marketplace 受諾ページ" border/>

<br />

4. **Go to product page** をクリックします。

<br />

<Image img={gcp_marketplace_committed_5} size="md" alt="GCP Marketplace 受諾確認" border/>

<br />

5. **Manage on provider** をクリックします。

<br />

<Image img={gcp_marketplace_committed_6} size="md" alt="GCP Marketplace ClickHouse Cloud ページ" border/>

<br />

この時点で ClickHouse Cloud にリダイレクトし、サインアップまたはサインインを行うことが重要です。このステップを完了しないと、GCP Marketplace のサブスクリプションを ClickHouse Cloud にリンクすることができません。

<br />

<Image img={gcp_marketplace_committed_7} size="md" alt="GCP Marketplace ウェブサイト離脱確認モーダル" border/>

<br />

6. ClickHouse Cloud にリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録できます。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud サインインページ" border/>

<br />

新しい ClickHouse Cloud ユーザーの場合は、ページの下部にある **Register** をクリックします。新しいユーザーを作成し、メールを確認するよう促されます。メールの確認後、ClickHouse Cloud のログインページを離れ、新しいユーザー名を使用して [https://console.clickhouse.cloud](https://console.clickhouse.cloud) にログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud サインアップページ" border/>

<br />

新しいユーザーの場合、ビジネスに関する基本情報を提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報フォーム 2" border/>

<br />

既存の ClickHouse Cloud ユーザーの場合は、資格情報を使用してログインしてください。

7. ログインに成功すると、新しい ClickHouse Cloud 組織が作成されます。この組織は、あなたの GCP 請求アカウントに接続され、すべての使用量があなたの GCP アカウントを通じて請求されます。

8. ログイン後、あなたの請求が実際に GCP Marketplace に紐付いていることを確認し、ClickHouse Cloud リソースの設定を開始できます。

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud サインインページ" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 新サービスページ" border/>

<br />

9. サインアップ確認のメールを受け取るはずです：

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace 確認メール" border/>

<br />

<br />

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program) にご連絡ください。
