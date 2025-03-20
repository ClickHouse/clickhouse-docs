---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: AWS Marketplace コミット契約
description: AWS Marketplace を通じて ClickHouse Cloud にサブスクライブする (コミット契約)
keywords: [aws, amazon, marketplace, billing, committed, committed contract]
---

import aws_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-committed-1.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import aws_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-10.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import aws_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-12.png';

ClickHouse Cloud を [AWS Marketplace](https://aws.amazon.com/marketplace) 経由でコミット契約を通じて開始しましょう。コミット契約はプライベートオファーとしても知られ、顧客が一定期間にわたって ClickHouse Cloud に対して一定の金額を支出することを約束することができます。

## 必要条件 {#prerequisites}

- 特定の契約条件に基づく ClickHouse からのプライベートオファー。

## サインアップ手順 {#steps-to-sign-up}

1. あなたはプライベートオファーを確認し受け入れるためのリンクが含まれたメールを受け取ったはずです。

<br />

<img src={aws_marketplace_committed_1}
    alt='AWS Marketplace プライベートオファーのメール'
    class='image'
    style={{width: '400px'}}
/>

<br />

2. メール内の **オファーを確認** リンクをクリックします。これにより、プライベートオファーの詳細が記載された AWS Marketplace ページに移動します。プライベートオファーを受け入れる際は、契約オプションのプルダウンリストでユニット数を 1 に設定してください。

3. AWS ポータルでサブスクリプションの手続きを完了し、**アカウントを設定** をクリックします。この時点で ClickHouse Cloud にリダイレクトし、新しいアカウントに登録するか、既存のアカウントでサインインする必要があります。このステップを完了しないと、あなたの AWS Marketplace サブスクリプションと ClickHouse Cloud をリンクすることができません。

4. ClickHouse Cloud にリダイレクトされると、既存のアカウントでログインするか、新しいアカウントを登録できます。このステップは、あなたの ClickHouse Cloud 組織を AWS Marketplace の請求に結び付けるために非常に重要です。

<br />

<img src={aws_marketplace_payg_6}
    alt='ClickHouse Cloud サインインページ'
    class='image'
    style={{width: '300px'}}
/>

<br />

もし新しい ClickHouse Cloud ユーザーであれば、ページの下にある **登録** をクリックします。新しいユーザーを作成し、メールを確認するよう促されます。メールを確認した後は、ClickHouse Cloud のログインページを離れ、新しいユーザー名で [https://console.clickhouse.cloud](https://console.clickhouse.cloud) にログインできます。

<br />

<img src={aws_marketplace_payg_7}
    alt='ClickHouse Cloud サインアップページ'
    class='image'
    style={{width: '500px'}}
/>

<br />

新しいユーザーの場合は、ビジネスに関する基本的な情報を提供する必要があることに注意してください。以下のスクリーンショットを参照してください。

<br />

<img src={aws_marketplace_payg_8}
    alt='ClickHouse Cloud サインアップ情報フォーム'
    class='image'
    style={{width: '400px'}}
/>

<br />

<br />

<img src={aws_marketplace_payg_9}
    alt='ClickHouse Cloud サインアップ情報フォーム 2'
    class='image'
    style={{width: '400px'}}
/>

<br />

既存の ClickHouse Cloud ユーザーであれば、単にあなたの資格情報を使ってログインしてください。

5. ログインに成功すると、新しい ClickHouse Cloud 組織が作成されます。この組織はあなたの AWS 請求アカウントに接続され、すべての使用量があなたの AWS アカウントを通じて請求されます。

6. ログイン後、請求が実際に AWS Marketplace に結び付いていることを確認し、ClickHouse Cloud リソースの設定を開始できます。

<br />

<img src={aws_marketplace_payg_10}
    alt='ClickHouse Cloud AWS Marketplace 請求の表示'
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

6. サインアップを確認するメールが届くはずです：

<br />

<img src={aws_marketplace_payg_12}
    alt='AWS Marketplace 確認メール'
    class='image'
    style={{width: '500px'}}
/>

<br />

何か問題が発生した場合は、[サポートチーム](https://clickhouse.com/support/program)に連絡してください。
