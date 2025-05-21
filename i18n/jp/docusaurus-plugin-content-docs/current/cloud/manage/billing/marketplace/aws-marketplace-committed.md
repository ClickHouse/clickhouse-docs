---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: 'AWS Marketplace コミット契約'
description: 'AWS Marketplace を通じて ClickHouse Cloud にサブスクライブ (コミット契約)'
keywords: ['aws', 'amazon', 'marketplace', 'billing', 'committed', 'committed contract']
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

ClickHouse Cloud を [AWS Marketplace](https://aws.amazon.com/marketplace) でコミット契約を通じて始めましょう。コミット契約はプライベートオファーとも呼ばれ、顧客が一定の期間にわたって ClickHouse Cloud に一定の金額を支出することを約束することを可能にします。

## 前提条件 {#prerequisites}

- 特定の契約条件に基づいた ClickHouse からのプライベートオファー。

## サインアップ手順 {#steps-to-sign-up}

1. プライベートオファーを確認し、受け入れるためのリンクが記載されたメールを受け取ったはずです。

<br />

<Image img={aws_marketplace_committed_1} size="md" alt="AWS Marketplace プライベートオファーのメール" border/>

<br />

2. メール内の **Review Offer** リンクをクリックします。これにより、プライベートオファーの詳細が表示された AWS Marketplace ページに移動します。プライベートオファーを受け入れる際は、契約オプションのピックリストでユニット数に 1 の値を選択してください。

3. AWS ポータルでサブスクライブの手順を完了し、**Set up your account** をクリックします。この時点で ClickHouse Cloud にリダイレクトされ、新しいアカウントを登録するか、既存のアカウントでサインインすることが重要です。このステップを完了しなければ、AWS Marketplace のサブスクリプションを ClickHouse Cloud にリンクすることができません。

4. ClickHouse Cloud にリダイレクトされたら、既存のアカウントでログインするか、新しいアカウントを登録してください。このステップは、あなたの ClickHouse Cloud 組織を AWS Marketplace の請求にバインドするために非常に重要です。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud サインインページ" border/>

<br />

新しい ClickHouse Cloud ユーザーの場合は、ページの下部にある **Register** をクリックしてください。新しいユーザーを作成し、メールを確認するように促されます。メールを確認した後、ClickHouse Cloud のログインページを離れ、新しいユーザー名で [https://console.clickhouse.cloud](https://console.clickhouse.cloud) にログインできます。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud サインアップページ" border/>

<br />

新しいユーザーの場合は、ビジネスに関する基本的な情報を提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud サインアップ情報フォーム" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud サインアップ情報フォーム 2" border/>

<br />

既存の ClickHouse Cloud ユーザーの場合は、単に資格情報を使ってログインしてください。

5. 成功裏にログインすると、新しい ClickHouse Cloud 組織が作成されます。この組織はあなたの AWS 請求アカウントに接続され、すべての使用量はあなたの AWS アカウントを通じて請求されます。

6. ログインが完了すると、実際に請求が AWS Marketplace に結びついていることを確認でき、ClickHouse Cloud リソースの設定を開始できます。

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud AWS Marketplace の請求確認" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 新しいサービスページ" border/>

<br />

6. サインアップが確認された旨のメールを受信するはずです：

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace 確認メール" border/>

<br />

問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program) にお問い合わせください。
