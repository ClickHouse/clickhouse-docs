---
'slug': '/cloud/billing/marketplace/gcp-marketplace-payg'
'title': 'GCP Marketplace PAYG'
'description': 'GCP Marketplace (PAYG) を通じて ClickHouse Cloud にサブスクライブします。'
'keywords':
- 'gcp'
- 'marketplace'
- 'billing'
- 'PAYG'
'doc_type': 'guide'
---

import gcp_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-1.png';
import gcp_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-2.png';
import gcp_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-3.png';
import gcp_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-4.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';
import Image from '@theme/IdealImage';

ClickHouse Cloudを[GCP Marketplace](https://console.cloud.google.com/marketplace)で開始するには、PAYG（従量課金制）パブリックオファーを利用してください。

## 前提条件 {#prerequisites}

- 課金管理者により購入権限が有効になっているGCPプロジェクト。
- GCP MarketplaceでClickHouse Cloudに登録するには、購入権限を持つアカウントでログインし、適切なプロジェクトを選択する必要があります。

## サインアップ手順 {#steps-to-sign-up}

1. [GCP Marketplace](https://cloud.google.com/marketplace)にアクセスし、ClickHouse Cloudを検索します。正しいプロジェクトが選択されていることを確認してください。

<Image img={gcp_marketplace_payg_1} size="md" alt="GCP Marketplaceホームページ" border/>

2. [リスティング](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)をクリックし、次に**Subscribe**をクリックします。

<Image img={gcp_marketplace_payg_2} size="md" alt="GCP MarketplaceのClickHouse Cloud" border/>

3. 次の画面でサブスクリプションを設定します：

- プランはデフォルトで「ClickHouse Cloud」になります
- サブスクリプション期間は「月次」
- 適切な課金アカウントを選択
- 利用規約に同意し、**Subscribe**をクリック

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="GCP Marketplaceでのサブスクリプション設定" border/>

<br />

4. **Subscribe**をクリックすると、**Sign up with ClickHouse**というモーダルが表示されます。

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="GCP Marketplaceサインアップモーダル" border/>

<br />

5. この時点では設定はまだ完了していないことに注意してください。**Set up your account**をクリックしてClickHouse Cloudにリダイレクトし、ClickHouse Cloudに登録する必要があります。

6. ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録できます。このステップは、あなたのClickHouse Cloud組織をGCP Marketplaceの課金に結び付けるために非常に重要です。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloudサインインページ" border/>

<br />

新しいClickHouse Cloudユーザーの場合は、ページの下部で**Register**をクリックします。新しいユーザーを作成し、メールを確認するように促されます。メールを確認した後、ClickHouse Cloudのログインページを離れて[https://console.clickhouse.cloud](https://console.clickhouse.cloud)に新しいユーザー名でログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloudサインアップページ" border/>

<br />

新しいユーザーの場合、ビジネスに関する基本情報を提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloudサインアップ情報フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloudサインアップ情報フォーム2" border/>

<br />

既存のClickHouse Cloudユーザーの場合は、単に資格情報を使用してログインしてください。

7. ログインに成功すると、新しいClickHouse Cloud組織が作成されます。この組織はあなたのGCP課金アカウントに接続され、すべての使用量はあなたのGCPアカウントを通じて請求されます。

8. ログインすると、実際に課金がGCP Marketplaceに結び付けられていることを確認でき、ClickHouse Cloudリソースの設定を開始できます。

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloudサインインページ" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud新しいサービスページ" border/>

<br />

9. サインアップを確認するメールが届くはずです：

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace確認メール" border/>

<br />

<br />

問題が発生した場合は、[サポートチームにお問い合わせ](https://clickhouse.com/support/program)ください。
