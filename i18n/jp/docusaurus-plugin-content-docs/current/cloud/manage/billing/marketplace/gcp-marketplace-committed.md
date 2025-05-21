---
slug: /cloud/billing/marketplace/gcp-marketplace-committed-contract
title: 'GCPマーケットプレイスのコミット契約'
description: 'GCPマーケットプレイスを通じてClickHouse Cloudにサブスクライブする（コミット契約）'
keywords: ['gcp', 'google', 'marketplace', 'billing', 'committed', 'committed contract']
---
```

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

GCPマーケットプレイスを通じてコントラクトをコミットしてClickHouse Cloudを始めましょう。コミット契約（プライベートオファーとも呼ばれます）は、顧客が一定期間にわたってClickHouse Cloudに対して特定の金額を支出することを約束するものです。

## 前提条件 {#prerequisites}

- 特定の契約条件に基づくClickHouseからのプライベートオファー。

## サインアップ手順 {#steps-to-sign-up}

1. あなたはプライベートオファーをレビューし、受け入れるためのリンクが記載されたメールを受け取っているはずです。

<br />

<Image img={gcp_marketplace_committed_1} size="md" alt="GCP Marketplace プライベートオファーのメール" border />

<br />

2. メール内の**オファーをレビュー**リンクをクリックしてください。これにより、プライベートオファーの詳細が記載されたGCPマーケットプレイスのページに移動します。

<br />

<Image img={gcp_marketplace_committed_2} size="md" alt="GCP Marketplace オファーの要約" border/>

<br />

<Image img={gcp_marketplace_committed_3} size="md" alt="GCP Marketplace 価格要約" border/>

<br />

3. プライベートオファーの詳細を確認し、すべてが正しければ**受け入れる**をクリックします。

<br />

<Image img={gcp_marketplace_committed_4} size="md" alt="GCP Marketplace 受け入れページ" border/>

<br />

4. **製品ページに移動**をクリックします。

<br />

<Image img={gcp_marketplace_committed_5} size="md" alt="GCP Marketplace 受け入れ確認" border/>

<br />

5. **プロバイダーで管理**をクリックします。

<br />

<Image img={gcp_marketplace_committed_6} size="md" alt="GCP Marketplace ClickHouse Cloudページ" border/>

<br />

この時点でClickHouse Cloudにリダイレクトされ、サインアップまたはサインインすることが重要です。このステップを完了しないと、GCPマーケットプレイスのサブスクリプションをClickHouse Cloudにリンクすることができません。

<br />

<Image img={gcp_marketplace_committed_7} size="md" alt="GCP Marketplace サイトを離れる確認モーダル" border/>

<br />

6. ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録します。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud サインインページ" border/>

<br />

新しいClickHouse Cloudユーザーの場合、ページの下部にある**登録**をクリックします。新しいユーザーを作成し、メールを確認するように促されます。メールを確認した後、ClickHouse Cloudのログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud)で新しいユーザー名を使用してログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud サインアップページ" border/>

<br />

新しいユーザーの場合、ビジネスに関する基本情報を提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報フォーム 2" border/>

<br />

既存のClickHouse Cloudユーザーの場合は、資格情報を使用してログインするだけです。

7. 成功裏にログインすると、新しいClickHouse Cloud組織が作成されます。この組織はあなたのGCP請求アカウントに接続され、すべての使用量はあなたのGCPアカウントを通じて請求されます。

8. ログイン後、請求が実際にGCPマーケットプレイスに関連付けられていることを確認し、ClickHouse Cloudのリソースを設定し始めることができます。

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud サインインページ" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 新しいサービスページ" border/>

<br />

9. サインアップ確認のメールを受け取るはずです：

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace 確認メール" border/>

<br />

<br />

問題が発生した場合は、[サポートチームに連絡](https://clickhouse.com/support/program)することをためらわないでください。
