---
slug: /cloud/marketplace/marketplace-billing
title: マーケットプレイスの請求
description: AWS、GCP、Azureのマーケットプレイスを通じてClickHouse Cloudにサブスクリプションします。
keywords: [aws, azure, gcp, google cloud, marketplace, billing]
---

AWS、GCP、Azureのマーケットプレイスを通じてClickHouse Cloudにサブスクリプションできます。これにより、既存のクラウドプロバイダの請求を通じてClickHouse Cloudを支払うことができます。

利用者は、従量課金制 (PAYG) を利用するか、マーケットプレイスを通じてClickHouse Cloudとの契約を結ぶことができます。請求はクラウドプロバイダーによって処理され、すべてのクラウドサービスの単一の請求書が送付されます。

- [AWSマーケットプレイス PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWSマーケットプレイス コミット契約](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCPマーケットプレイス PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCPマーケットプレイス コミット契約](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azureマーケットプレイス PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azureマーケットプレイス コミット契約](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## よくある質問 {#faqs}

### 組織がマーケットプレイスの請求に接続されていることを確認するにはどうしたらよいですか？​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

ClickHouse Cloudコンソールで、**Billing**に移動します。**Payment details**セクションにマーケットプレイスの名前とリンクが表示されるはずです。

### 既存のClickHouse Cloudユーザーです。AWS / GCP / Azureマーケットプレイスを通じてClickHouse Cloudにサブスクリプションするとどうなりますか？​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

クラウドプロバイダーのマーケットプレイスからClickHouse Cloudにサインアップするのは二段階のプロセスです：
1. まず、クラウドプロバイダーのマーケットプレイスポータルでClickHouse Cloudに「サブスクリプション」します。サブスクリプションが完了したら、「Pay Now」または「Manage on Provider」をクリックします（マーケットプレイスによります）。これにより、ClickHouse Cloudにリダイレクトされます。
2. ClickHouse Cloudでは、新しいアカウントを登録するか、既存のアカウントでサインインします。いずれにせよ、マーケットプレイス請求に関連付けられた新しいClickHouse Cloud組織が作成されます。

注意：以前のClickHouse Cloudのサインアップからのサービスや組織はそのまま残り、マーケットプレイス請求に接続されることはありません。ClickHouse Cloudは、異なる請求を持つ複数の組織を管理するために同じアカウントを使用することを許可します。

ClickHouse Cloudコンソールの左下のメニューから組織を切り替えることができます。

### 既存のClickHouse Cloudユーザーです。既存のサービスをマーケットプレイス経由で請求されるようにしたい場合はどうすればよいですか？​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

クラウドプロバイダーのマーケットプレイスを通じてClickHouse Cloudにサブスクリプションする必要があります。マーケットプレイスでのサブスクリプションが完了し、ClickHouse Cloudにリダイレクトされた後、既存のClickHouse Cloud組織をマーケットプレイス請求にリンクするオプションが表示されます。その時点から、既存のリソースの請求がマーケットプレイスを通じて行われます。

![マーケットプレイスサインアップと組織リンク](https://github.com/user-attachments/assets/a0939007-320b-4b12-9d6d-fd63bce31864)

組織の請求ページから、請求が実際にマーケットプレイスにリンクされているか確認できます。問題が発生した場合は、[ClickHouse Cloudサポート](https://clickhouse.com/support/program)にお問い合わせください。

:::note
以前のClickHouse Cloudのサインアップからのサービスや組織はそのまま残り、マーケットプレイス請求に接続されることはありません。
:::

### マーケットプレイスユーザーとしてClickHouse Cloudにサブスクリプションしました。どうやって解約できますか？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

ClickHouse Cloudの使用を止めて、すべての既存のClickHouse Cloudサービスを削除するだけで解約できます。サブスクリプションは依然としてアクティブのままですが、ClickHouse Cloudには定期料金がないため何も支払うことはありません。

解約したい場合は、クラウドプロバイダーコンソールに移動し、そこでサブスクリプションの更新をキャンセルしてください。サブスクリプションが終了すると、すべての既存サービスが停止し、クレジットカードの追加が求められます。カードが追加されていない場合、2週間後にすべての既存サービスが削除されます。

### マーケットプレイスユーザーとしてClickHouse Cloudにサブスクリプションし、その後解約しました。再度サブスクリプションする場合、手続きはどうなりますか？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

その場合は、通常通りClickHouse Cloudにサブスクリプションしてください（マーケットプレイス経由のサブスクリプションに関するセクションを参照）。

- AWSマーケットプレイスの場合、新しいClickHouse Cloud組織が作成され、マーケットプレイスに接続されます。
- GCPマーケットプレイスの場合、古い組織が再活性化されます。

マーケットプレイス組織の再活性化に問題がある場合は、[ClickHouse Cloudサポート](https://clickhouse.com/support/program)にお問い合わせください。

### ClickHouse Cloudサービスへのマーケットプレイスサブスクリプションの請求書にアクセスするにはどうすればよいですか？​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS請求コンソール](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCPマーケットプレイスの注文](https://console.cloud.google.com/marketplace/orders)（サブスクリプションに使用した請求アカウントを選択）

### 利用状況通知書の日付がマーケットプレイス請求書の日付と一致しないのはなぜですか？​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

マーケットプレイスの請求はカレンダーの月サイクルに従います。たとえば、12月1日から1月1日までの利用に対しては、1月3日から1月5日までの間に請求書が生成されます。

ClickHouse Cloudの利用状況通知書は、サインアップの日から30日間の測定と報告に従った異なる請求サイクルを持っています。

これらの日付が一致しない場合、利用状況の日付と請求書の日付が異なることになります。利用状況通知書は、指定されたサービスの利用を日単位で追跡するため、コストの内訳を見るために通知書を信頼できます。

### 一般的な請求情報はどこで見つけられますか？ {#where-can-i-find-general-billing-information}

[請求概要ページ](/cloud/manage/billing)をご覧ください。

### クラウドプロバイダーのマーケットプレイス経由で支払う場合とClickHouseに直接支払う場合で、ClickHouse Cloudの料金に違いはありますか？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

マーケットプレイス請求とClickHouseに直接サインアップする場合の料金に違いはありません。いずれの場合も、ClickHouse Cloudの利用はClickHouse Cloudクレジット (CHC) の観点から追跡され、同じ方法で測定され、請求されます。
