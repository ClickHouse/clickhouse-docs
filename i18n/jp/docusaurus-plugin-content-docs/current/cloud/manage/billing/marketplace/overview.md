---
slug: /cloud/marketplace/marketplace-billing
title: 'マーケットプレイス請求'
description: 'AWS、GCP、Azureマーケットプレイスを通じてClickHouse Cloudにサブスクライブします。'
keywords: ['aws', 'azure', 'gcp', 'google cloud', 'marketplace', 'billing']
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

AWS、GCP、Azureのマーケットプレイスを通じてClickHouse Cloudにサブスクライブできます。これにより、既存のクラウドプロバイダーの請求を通じてClickHouse Cloudの料金を支払うことができます。

プランは、従量課金制 (PAYG) の利用か、マーケットプレイスを通じてClickHouse Cloudとの契約を結ぶことができます。請求はクラウドプロバイダーによって処理され、すべてのクラウドサービスに対して1つの請求書が送付されます。

- [AWSマーケットプレイスPAYG](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWSマーケットプレイスコミット契約](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCPマーケットプレイスPAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCPマーケットプレイスコミット契約](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [AzureマーケットプレイスPAYG](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azureマーケットプレイスコミット契約](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## FAQs {#faqs}

### どうやって私の組織がマーケットプレイス請求に接続されているか確認できますか？​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

ClickHouse Cloudコンソールで、**Billing** に移動します。**Payment details** セクションに、マーケットプレイスの名前とリンクが表示されるはずです。

### 既存のClickHouse Cloudユーザーですが、AWS / GCP / Azureマーケットプレイスを通じてClickHouse Cloudにサブスクライブした場合、何が起こりますか？​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

クラウドプロバイダーのマーケットプレイスからClickHouse Cloudにサインアップするのは2ステップのプロセスです：
1. まず、クラウドプロバイダーのマーケットプレイスポータルでClickHouse Cloudに「サブスクライブ」します。サブスクライブが完了したら、「今すぐ支払う」または「プロバイダーで管理」をクリックします（マーケットプレイスによって異なります）。これによりClickHouse Cloudにリダイレクトされます。
2. ClickHouse Cloudでは、新しいアカウントを登録するか、既存のアカウントにサインインします。いずれの場合も、マーケットプレイス請求に関連付けられた新しいClickHouse Cloud組織が作成されます。

NOTE: 以前のClickHouse Cloudサインアップからの既存のサービスと組織はそのままで、マーケットプレイス請求には接続されません。ClickHouse Cloudは、異なる請求を持つ複数の組織を管理するために同じアカウントを使用することを許可します。

ClickHouse Cloudコンソールの左下メニューから組織を切り替えることができます。

### 既存のClickHouse Cloudユーザーですが、既存のサービスをマーケットプレイス経由で請求されるようにしたい場合はどうすればいいですか？​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

クラウドプロバイダーのマーケットプレイスを通じてClickHouse Cloudにサブスクライブする必要があります。マーケットプレイスでのサブスクライブが完了し、ClickHouse Cloudにリダイレクトされた後、既存のClickHouse Cloud組織をマーケットプレイス請求にリンクするオプションが表示されます。その時点から、既存のリソースはマーケットプレイスを通じて請求されるようになります。 

<Image img={marketplace_signup_and_org_linking} size='md' alt='マーケットプレイスサインアップと組織のリンク' border/>

組織の請求ページから、請求が実際にマーケットプレイスにリンクされていることを確認できます。問題が発生した場合は、[ClickHouse Cloudサポート](https://clickhouse.com/support/program)にお問い合わせください。

:::note
以前のClickHouse Cloudサインアップからの既存のサービスと組織はそのままで、マーケットプレイス請求には接続されません。
:::

### マーケットプレイスユーザーとしてClickHouse Cloudにサブスクライブしました。どうやって解約できますか？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

ClickHouse Cloudの使用を単に停止し、すべての既存のClickHouse Cloudサービスを削除することで、解約できます。サブスクリプションは依然としてアクティブですが、ClickHouse Cloudには定期的な料金がないため、支払いは発生しません。

解約したい場合は、クラウドプロバイダーのコンソールに移動して、そこでサブスクリプションの更新をキャンセルしてください。サブスクリプションが終了すると、すべての既存のサービスが停止し、クレジットカードの追加を促されます。カードが追加されなかった場合、2週間後にすべての既存のサービスが削除されます。

### マーケットプレイスユーザーとしてClickHouse Cloudにサブスクライブし、その後解約しました。今、再度サブスクライブしたいのですが、プロセスはどうなりますか？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

その場合、通常通りClickHouse Cloudにサブスクライブしてください（マーケットプレイスを通じてのClickHouse Cloudへのサブスクライブに関するセクションを参照）。

- AWSマーケットプレイスの場合、新しいClickHouse Cloud組織が作成され、マーケットプレイスに接続されます。
- GCPマーケットプレイスの場合、古い組織が再アクティブ化されます。

マーケットプレイス組織の再アクティブ化に問題がある場合は、[ClickHouse Cloudサポート](https://clickhouse.com/support/program)にお問い合わせください。

### ClickHouse Cloudサービスのマーケットプレイスサブスクリプションの請求書にアクセスするにはどうすればよいですか？​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS請求コンソール](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCPマーケットプレイスの注文](https://console.cloud.google.com/marketplace/orders)（サブスクリプションに使用した請求アカウントを選択）

### 使用状況の明細書の日付がマーケットプレイスの請求書の日付と一致しないのはなぜですか？​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

マーケットプレイス請求はカレンダー月サイクルに従います。たとえば、12月1日から1月1日までの使用については、請求書は1月3日から1月5日の間に生成されます。

ClickHouse Cloudの使用状況明細書は、サインアップした日から30日間の使用を測定して報告する異なる請求サイクルに従います。

これらの日付が異なる場合、使用状況と請求書の日付は異なります。使用状況明細書は、特定のサービスの使用状況を日ごとに追跡するため、ユーザーはコストの内訳を見るために明細書を信頼できます。

### 一般的な請求情報はどこで見つけられますか？ {#where-can-i-find-general-billing-information}

[請求概要ページ](/cloud/manage/billing)をご覧ください。

### クラウドプロバイダーのマーケットプレイスを通じて支払う場合とClickHouseに直接支払う場合、ClickHouse Cloudの価格に違いはありますか？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

マーケットプレイス請求とClickHouseに直接サインアップすることの間に価格の違いはありません。いずれの場合も、ClickHouse Cloudの使用はClickHouse Cloudクレジット (CHC) に基づいて追跡され、同じ方法で測定され、請求されます。

### 単一のクラウドマーケットプレイス請求アカウントまたはサブアカウント (AWS、GCP、Azure) に対して複数のClickHouse組織を設定できますか？ {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

単一のClickHouse組織は単一のクラウドマーケットプレイス請求アカウントまたはサブアカウントに請求されるように設定できます。

### ClickHouse組織がクラウドマーケットプレイスのコミット支出契約を通じて請求されている場合、クレジットがなくなったときに自動的にPAYG請求に移行しますか？ {#automatically-move-to-PAYG-when-running-out-of-credit}

マーケットプレイスのコミット支出契約がアクティブであり、クレジットがなくなった場合、組織は自動的にPAYG請求に移行します。ただし、既存の契約が終了した場合は、新しいマーケットプレイス契約を組織にリンクするか、クレジットカードを使用して直接請求に移行する必要があります。
