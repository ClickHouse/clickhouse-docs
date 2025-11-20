---
slug: /cloud/marketplace/marketplace-billing
title: 'マーケットプレイスでの課金'
description: 'AWS、GCP、Azure のマーケットプレイス経由で ClickHouse Cloud をサブスクライブします。'
keywords: ['aws', 'azure', 'gcp', 'google cloud', 'marketplace', 'billing']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

AWS、GCP、Azure のマーケットプレイス経由で ClickHouse Cloud を利用開始できます。これにより、既存のクラウドプロバイダーの請求に ClickHouse Cloud の料金を含めて支払うことができます。

マーケットプレイスでは、従量課金制 (PAYG) を利用するか、ClickHouse Cloud とのコミット契約を締結するかを選択できます。課金はクラウドプロバイダーによって処理され、すべてのクラウドサービスに対して 1 つの請求書が発行されます。

* [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
* [AWS Marketplace コミット契約](/cloud/billing/marketplace/aws-marketplace-committed-contract)
* [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
* [GCP Marketplace コミット契約](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
* [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
* [Azure Marketplace コミット契約](/cloud/billing/marketplace/azure-marketplace-committed-contract)


## よくある質問 {#faqs}

### 組織がマーケットプレイス請求に接続されていることを確認するにはどうすればよいですか? {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

ClickHouse Cloudコンソールで**請求**に移動します。**支払い詳細**セクションにマーケットプレイスの名前とリンクが表示されます。

### 既存のClickHouse Cloudユーザーです。AWS / GCP / Azureマーケットプレイス経由でClickHouse Cloudにサブスクライブするとどうなりますか? {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

クラウドプロバイダーのマーケットプレイスからClickHouse Cloudに登録するプロセスは2段階です:

1. まず、クラウドプロバイダーのマーケットプレイスポータルでClickHouse Cloudに「サブスクライブ」します。サブスクライブが完了したら、「今すぐ支払う」または「プロバイダーで管理」(マーケットプレイスによって異なります)をクリックします。これによりClickHouse Cloudにリダイレクトされます。
2. ClickHouse Cloudで新しいアカウントを登録するか、既存のアカウントでサインインします。いずれの場合も、マーケットプレイス請求に紐付けられた新しいClickHouse Cloud組織が作成されます。

注意: 以前のClickHouse Cloud登録による既存のサービスと組織は残り、マーケットプレイス請求には接続されません。ClickHouse Cloudでは、同じアカウントを使用して複数の組織を管理でき、それぞれ異なる請求を設定できます。

ClickHouse Cloudコンソールの左下のメニューから組織を切り替えることができます。

### 既存のClickHouse Cloudユーザーです。既存のサービスをマーケットプレイス経由で請求したい場合はどうすればよいですか? {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

クラウドプロバイダーのマーケットプレイス経由でClickHouse Cloudにサブスクライブする必要があります。マーケットプレイスでのサブスクライブが完了し、ClickHouse Cloudにリダイレクトされると、既存のClickHouse Cloud組織をマーケットプレイス請求にリンクするオプションが表示されます。その時点から、既存のリソースはマーケットプレイス経由で請求されるようになります。

<Image
  img={marketplace_signup_and_org_linking}
  size='md'
  alt='マーケットプレイス登録と組織のリンク'
  border
/>

組織の請求ページから、請求が実際にマーケットプレイスにリンクされていることを確認できます。問題が発生した場合は、[ClickHouse Cloudサポート](https://clickhouse.com/support/program)にお問い合わせください。

:::note
以前のClickHouse Cloud登録による既存のサービスと組織は残り、マーケットプレイス請求には接続されません。
:::

### マーケットプレイスユーザーとしてClickHouse Cloudにサブスクライブしました。サブスクライブを解除するにはどうすればよいですか? {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

ClickHouse Cloudの使用を停止し、既存のすべてのClickHouse Cloudサービスを削除するだけで済みます。サブスクリプションはアクティブなままですが、ClickHouse Cloudには定期的な料金がないため、何も支払う必要はありません。

サブスクライブを解除したい場合は、クラウドプロバイダーのコンソールに移動し、そこでサブスクリプションの更新をキャンセルしてください。サブスクリプションが終了すると、既存のすべてのサービスが停止され、クレジットカードの追加を求められます。カードが追加されない場合、2週間後にすべての既存サービスが削除されます。

### マーケットプレイスユーザーとしてClickHouse Cloudにサブスクライブし、その後解除しました。再度サブスクライブしたい場合、プロセスはどうなりますか? {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

その場合は、通常どおりClickHouse Cloudにサブスクライブしてください(マーケットプレイス経由でClickHouse Cloudにサブスクライブするセクションを参照)。

- AWSマーケットプレイスの場合、新しいClickHouse Cloud組織が作成され、マーケットプレイスに接続されます。
- GCPマーケットプレイスの場合、古い組織が再アクティブ化されます。

マーケットプレイス組織の再アクティブ化に問題がある場合は、[ClickHouse Cloudサポート](https://clickhouse.com/support/program)にお問い合わせください。

### ClickHouse Cloudサービスのマーケットプレイスサブスクリプションの請求書にアクセスするにはどうすればよいですか? {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS請求コンソール](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCPマーケットプレイス注文](https://console.cloud.google.com/marketplace/orders)(サブスクリプションに使用した請求アカウントを選択)

### 使用状況明細書の日付がマーケットプレイス請求書と一致しないのはなぜですか? {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

マーケットプレイス請求は暦月サイクルに従います。たとえば、12月1日から1月1日までの使用量に対して、1月3日から1月5日の間に請求書が生成されます。


ClickHouse Cloudの使用量明細書は、サインアップ日を起点とした30日間で使用量を計測・報告する独自の請求サイクルに従います。

使用量明細書の日付と請求書の日付が一致しない場合、これらの日付は異なります。使用量明細書は特定のサービスの使用量を日単位で追跡するため、ユーザーは明細書でコストの内訳を確認できます。

### 一般的な請求情報はどこで確認できますか? {#where-can-i-find-general-billing-information}

[請求概要ページ](/cloud/manage/billing)をご参照ください。

### クラウドプロバイダーのマーケットプレイス経由で支払う場合とClickHouseに直接支払う場合で、ClickHouse Cloudの料金に違いはありますか? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

マーケットプレイス請求とClickHouseへの直接サインアップの間に料金の違いはありません。いずれの場合も、ClickHouse Cloudの使用量はClickHouse Cloud Credits(CHC)で追跡され、同じ方法で計測されて請求されます。

### 複数のClickHouse Organizationを単一のクラウドマーケットプレイス請求アカウントまたはサブアカウント(AWS、GCP、Azure)に請求するように設定できますか? {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

単一のClickHouse Organizationは、単一のクラウドマーケットプレイス請求アカウントまたはサブアカウントに対してのみ請求するように設定できます。

### ClickHouse Organizationがクラウドマーケットプレイスのコミット支出契約を通じて請求されている場合、クレジットを使い果たすと自動的にPAYG請求に移行しますか? {#automatically-move-to-PAYG-when-running-out-of-credit}

マーケットプレイスのコミット支出契約が有効でクレジットを使い果たした場合、Organizationは自動的にPAYG請求に移行します。ただし、既存の契約が期限切れになった場合は、新しいマーケットプレイス契約をOrganizationにリンクするか、クレジットカードによる直接請求にOrganizationを移行する必要があります。
