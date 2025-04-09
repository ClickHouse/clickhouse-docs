---
slug: /cloud/billing/marketplace/gcp-marketplace-committed-contract
title: GCP Marketplace コミット契約
description: GCP Marketplaceを通じて ClickHouse Cloudにサインアップする（コミット契約）
keywords: [gcp, google, marketplace, billing, committed, committed contract]
---

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

ClickHouse Cloudを[GCP Marketplace](https://console.cloud.google.com/marketplace)を通じてコミット契約で始めましょう。コミット契約（プライベートオファーとも呼ばれます）は、顧客が一定の期間にわたってClickHouse Cloudに対して特定の金額を支出することを約束できる契約です。

## 前提条件 {#prerequisites}

- 特定の契約条件に基づくClickHouseからのプライベートオファー。

## サインアップ手順 {#steps-to-sign-up}

1. プライベートオファーを確認して受け入れるためのリンクが記載されたメールを受け取っているはずです。

<br />

<img src={gcp_marketplace_committed_1}
    alt='GCP Marketplace プライベートオファーのメール'
    class='image'
    style={{width: '300px'}}
    />

<br />

2. メール内の**オファーを確認**のリンクをクリックします。これによりプライベートオファーの詳細が表示されたGCP Marketplaceページにアクセスします。

<br />

<img src={gcp_marketplace_committed_2}
    alt='GCP Marketplace オファーの概要'
    class='image'
    style={{width: '300px'}}
    />

<br />

<img src={gcp_marketplace_committed_3}
    alt='GCP Marketplace 価格の概要'
    class='image'
    style={{width: '300px'}}
    />

<br />

3. プライベートオファーの詳細を確認し、すべてが正しい場合は**受け入れる**をクリックします。

<br />

<img src={gcp_marketplace_committed_4}
    alt='GCP Marketplace 受け入れページ'
    class='image'
    style={{width: '300px'}}
    />

<br />

4. **製品ページに移動**をクリックします。

<br />

<img src={gcp_marketplace_committed_5}
    alt='GCP Marketplace 受け入れ確認'
    class='image'
    style={{width: '400px'}}
    />

<br />

5. **プロバイダーで管理**をクリックします。

<br />

<img src={gcp_marketplace_committed_6}
    alt='GCP Marketplace ClickHouse Cloudページ'
    class='image'
    style={{width: '400px'}}
    />

<br />

この時点でClickHouse Cloudにリダイレクトし、サインアップまたはサインインすることが重要です。このステップを完了しないと、GCP MarketplaceのサブスクリプションをClickHouse Cloudにリンクできません。

<br />

<img src={gcp_marketplace_committed_7}
    alt='GCP Marketplace サイト離脱確認モーダル'
    class='image'
    style={{width: '400px'}}
    />

<br />

6. ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントで登録できます。

<br />

<img src={aws_marketplace_payg_6}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '300px'}}
    />

<br />

新しいClickHouse Cloudユーザーの場合は、ページの下部にある**登録**をクリックしてください。新しいユーザーを作成し、メールを確認するように求められます。メールを確認した後は、ClickHouse Cloudのログインページを閉じ、新しいユーザー名で[https://console.clickhouse.cloud](https://console.clickhouse.cloud)からログインできます。

<br />

<img src={aws_marketplace_payg_7}
    alt='ClickHouse Cloud サインアップページ'
    class='image'
    style={{width: '500px'}}
    />

<br />

新しいユーザーの場合、ビジネスに関する基本情報を提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<img src={aws_marketplace_payg_8}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
    />

<br />

<img src={aws_marketplace_payg_9}
    alt='ClickHouse Cloud サインアップ情報フォーム 2'
    class='image'
    style={{width: '400px'}}
    />

<br />

既存のClickHouse Cloudユーザーの場合は、資格情報を使用してログインします。

7. ログインに成功すると、新しいClickHouse Cloud組織が作成されます。この組織はあなたのGCPビリングアカウントに接続され、すべての使用量があなたのGCPアカウントを通じて課金されます。

8. ログインが完了したら、あなたのビリングが実際にGCP Marketplaceに関連付けられていることを確認し、ClickHouse Cloudリソースの設定を開始できます。

<br />

<img src={gcp_marketplace_payg_5}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '300px'}}
    />

<br />

<img src={aws_marketplace_payg_11}
    alt='ClickHouse Cloud 新しいサービスページ'
    class='image'
    style={{width: '400px'}}
    />

<br />

9. サインアップを確認するメールを受け取るはずです：

<br />
<br />

<img src={gcp_marketplace_payg_6}
    alt='GCP Marketplace 確認メール'
    class='image'
    style={{width: '300px'}}
    />

<br />

<br />

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program)にお気軽にお問い合わせください。
