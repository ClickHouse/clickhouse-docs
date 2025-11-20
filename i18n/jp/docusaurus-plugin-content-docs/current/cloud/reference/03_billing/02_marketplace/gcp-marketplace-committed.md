---
slug: /cloud/billing/marketplace/gcp-marketplace-committed-contract
title: 'GCP Marketplace コミットメント契約'
description: 'GCP Marketplace（コミットメント契約）を通じて ClickHouse Cloud を購読する'
keywords: ['gcp', 'google', 'marketplace', 'billing', 'committed', 'committed contract']
doc_type: 'guide'
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

コミット契約を通じて、[GCP Marketplace](https://console.cloud.google.com/marketplace) 上で ClickHouse Cloud の利用を開始できます。コミット契約（Private Offer とも呼ばれます）を利用すると、お客様は一定期間に ClickHouse Cloud に対して支出する金額をあらかじめ約束することができます。


## 前提条件 {#prerequisites}

- 特定の契約条件に基づくClickHouseからのプライベートオファー


## サインアップ手順 {#steps-to-sign-up}

1. プライベートオファーを確認および承認するためのリンクが記載されたメールが届いているはずです。

<br />

<Image
  img={gcp_marketplace_committed_1}
  size='md'
  alt='GCP Marketplaceプライベートオファーメール'
  border
/>

<br />

2. メール内の**Review Offer**リンクをクリックします。プライベートオファーの詳細が表示されたGCP Marketplaceページに移動します。

<br />

<Image
  img={gcp_marketplace_committed_2}
  size='md'
  alt='GCP Marketplaceオファー概要'
  border
/>

<br />

<Image
  img={gcp_marketplace_committed_3}
  size='md'
  alt='GCP Marketplace料金概要'
  border
/>

<br />

3. プライベートオファーの詳細を確認し、問題がなければ**Accept**をクリックします。

<br />

<Image
  img={gcp_marketplace_committed_4}
  size='md'
  alt='GCP Marketplace承認ページ'
  border
/>

<br />

4. **Go to product page**をクリックします。

<br />

<Image
  img={gcp_marketplace_committed_5}
  size='md'
  alt='GCP Marketplace承認確認'
  border
/>

<br />

5. **Manage on provider**をクリックします。

<br />

<Image
  img={gcp_marketplace_committed_6}
  size='md'
  alt='GCP Marketplace ClickHouse Cloudページ'
  border
/>

<br />

この時点でClickHouse Cloudにリダイレクトし、サインアップまたはサインインすることが重要です。この手順を完了しないと、GCP MarketplaceサブスクリプションをClickHouse Cloudに紐付けることができません。

<br />

<Image
  img={gcp_marketplace_committed_7}
  size='md'
  alt='GCP Marketplaceウェブサイト離脱確認モーダル'
  border
/>

<br />

6. ClickHouse Cloudにリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントで登録できます。

<br />

<Image
  img={aws_marketplace_payg_6}
  size='md'
  alt='ClickHouse Cloudサインインページ'
  border
/>

<br />

ClickHouse Cloudの新規ユーザーの場合は、ページ下部の**Register**をクリックします。新しいユーザーを作成し、メールアドレスを確認するよう求められます。メールアドレスの確認後、ClickHouse Cloudログインページを離れ、[https://console.clickhouse.cloud](https://console.clickhouse.cloud)で新しいユーザー名を使用してログインできます。

<br />

<Image
  img={aws_marketplace_payg_7}
  size='md'
  alt='ClickHouse Cloudサインアップページ'
  border
/>

<br />

新規ユーザーの場合、ビジネスに関する基本情報の入力も必要です。以下のスクリーンショットを参照してください。

<br />

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='ClickHouse Cloudサインアップ情報フォーム'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_9}
  size='md'
  alt='ClickHouse Cloudサインアップ情報フォーム2'
  border
/>

<br />

既存のClickHouse Cloudユーザーの場合は、認証情報を使用してログインしてください。

7. ログインに成功すると、新しいClickHouse Cloud組織が作成されます。この組織はGCP請求アカウントに接続され、すべての使用量はGCPアカウント経由で請求されます。

8. ログイン後、請求がGCP Marketplaceに紐付けられていることを確認し、ClickHouse Cloudリソースのセットアップを開始できます。

<br />

<Image
  img={gcp_marketplace_payg_5}
  size='md'
  alt='ClickHouse Cloudサインインページ'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_11}
  size='md'
  alt='ClickHouse Cloud新規サービスページ'
  border
/>

<br />

9. サインアップを確認するメールが届きます:

<br />
<br />

<Image
  img={gcp_marketplace_payg_6}
  size='md'
  alt='GCP Marketplace確認メール'
  border
/>

<br />

<br />

問題が発生した場合は、お気軽に[サポートチーム](https://clickhouse.com/support/program)までお問い合わせください。
