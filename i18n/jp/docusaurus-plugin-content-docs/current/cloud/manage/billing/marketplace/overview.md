---
slug: /cloud/marketplace/marketplace-billing
title: マーケットプレイス請求
description: AWS、GCP、および Azure マーケットプレイスを通じて ClickHouse Cloud にサブスクライブします。
keywords: [aws, azure, gcp, google cloud, marketplace, billing]
---

AWS、GCP、および Azure のマーケットプレイスを通じて ClickHouse Cloud にサブスクライブできます。これにより、既存のクラウドプロバイダーの請求を通じて ClickHouse Cloud に支払うことができます。

PAYG（従量制）を使用するか、マーケットプレイスを通じて ClickHouse Cloud との契約を結ぶことができます。請求はクラウドプロバイダーによって管理され、すべてのクラウドサービスに対して一つの請求書が送付されます。

- [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS Marketplace Committed Contract](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP Marketplace Committed Contract](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure Marketplace Committed Contract](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## よくある質問 {#faqs}

### 自分の組織がマーケットプレイス請求に接続されていることを確認するにはどうすればよいですか？​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

ClickHouse Cloud コンソールの **Billing** に移動します。**Payment details** セクションにマーケットプレイスの名前とリンクが表示されるはずです。

### 既存の ClickHouse Cloud ユーザーです。AWS / GCP / Azure マーケットプレイスを通じて ClickHouse Cloud にサブスクライブするとどうなりますか？​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

クラウドプロバイダーのマーケットプレイスから ClickHouse Cloud にサインアップするには、2つのステップがあります：
1. まず、クラウドプロバイダーのマーケットプレイスポータルで ClickHouse Cloud に「サブスクライブ」します。サブスクライブが完了したら、「Pay Now」または「Manage on Provider」をクリックします（マーケットプレイスによって異なります）。これにより、ClickHouse Cloud にリダイレクトされます。
2. ClickHouse Cloud では、新しいアカウントに登録するか、既存のアカウントにサインインします。どちらの場合でも、マーケットプレイス請求に関連付けられた新しい ClickHouse Cloud 組織が作成されます。

注意：以前の ClickHouse Cloud のサインアップからの既存のサービスや組織はそのままの状態で残り、マーケットプレイス請求には接続されません。ClickHouse Cloud では、異なる請求を持つ複数の組織を管理するために、同じアカウントを使用できます。

ClickHouse Cloud コンソールの左下のメニューから組織を切り替えることができます。

### 既存の ClickHouse Cloud ユーザーです。既存のサービスをマーケットプレイスを介して請求してもらうにはどうすればよいですか？​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

クラウドプロバイダーのマーケットプレイスを介して ClickHouse Cloud にサブスクライブする必要があります。マーケットプレイスでのサブスクライブが完了し、ClickHouse Cloud にリダイレクトされると、既存の ClickHouse Cloud 組織をマーケットプレイス請求にリンクするオプションが表示されます。その時点から、既存のリソースがマーケットプレイスを通じて請求されるようになります。

![マーケットプレイスサインアップと組織リンク](https://github.com/user-attachments/assets/a0939007-320b-4b12-9d6d-fd63bce31864)

組織の請求ページから、請求がマーケットプレイスにリンクされていることを確認できます。問題が発生した場合は、[ClickHouse Cloud サポート](https://clickhouse.com/support/program) にお問い合わせください。

:::note
以前の ClickHouse Cloud のサインアップからの既存のサービスや組織はそのままの状態で残り、マーケットプレイス請求には接続されません。
:::

### マーケットプレイスユーザーとして ClickHouse Cloud にサブスクライブしました。どうやって解約できますか？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

ClickHouse Cloud の利用を停止し、既存の ClickHouse Cloud サービスをすべて削除するだけで簡単に解約できます。サブスクリプションはまだアクティブですが、ClickHouse Cloud には定期的な料金がないため、何も支払う必要はありません。

解約したい場合は、クラウドプロバイダーのコンソールに移動し、そこでサブスクリプションの更新をキャンセルしてください。サブスクリプションが終了すると、すべての既存サービスが停止し、クレジットカードの追加を求められます。カードが追加されない場合、2週間後にすべての既存サービスが削除されます。

### マーケットプレイスユーザーとして ClickHouse Cloud にサブスクライブし、その後解約しました。再度サブスクライブするにはどうすればよいですか？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

その場合、通常通り ClickHouse Cloud にサブスクライブしてください（マーケットプレイスを介した ClickHouse Cloud へのサブスクリプションのセクションを参照）。

- AWS マーケットプレイスの場合、新しい ClickHouse Cloud 組織が作成され、マーケットプレイスに接続されます。
- GCP マーケットプレイスの場合、古い組織が再アクティブ化されます。

マーケットプレイスの組織を再アクティブ化する際に問題が発生した場合は、[ClickHouse Cloud Support](https://clickhouse.com/support/program) にお問い合わせください。

### ClickHouse Cloud サービスへのマーケットプレイス サブスクリプションの請求書にはどのようにアクセスしますか？​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS 請求コンソール](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP マーケットプレイスの注文](https://console.cloud.google.com/marketplace/orders)（サブスクリプションで使用した請求アカウントを選択）

### 使用状況ステートメントの日付がマーケットプレイスの請求書の日付と一致しないのはなぜですか？​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

マーケットプレイスの請求はカレンダー月のサイクルに従います。たとえば、12月1日から1月1日までの使用の請求書は、1月3日から1月5日の間に生成されます。

ClickHouse Cloud の使用状況ステートメントは、サインアップした日から30日間で使用量がメーター計測され報告される別の請求サイクルに従います。

使用状況と請求書の日付が異なる場合、これらの日付が一致しないためです。使用状況ステートメントは、特定のサービスに対して日ごとに使用状況を追跡するため、ユーザーはコストの内訳を確認するためにステートメントを利用できます。

### 一般的な請求情報はどこで見つけることができますか？ {#where-can-i-find-general-billing-information}

[請求概要ページ](/cloud/manage/billing)を参照してください。

### クラウドプロバイダーのマーケットプレイスを通じて支払う場合と直接 ClickHouse に支払う場合で、ClickHouse Cloud の価格に違いはありますか？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

マーケットプレイスの請求と直接 ClickHouse にサインアップする場合で、価格に違いはありません。いずれの場合も、ClickHouse Cloud の使用は ClickHouse Cloud Credits (CHCs) で追跡され、同じ方法でメーター計測され、請求されます。
