---
slug: /cloud/marketplace/marketplace-billing
title: 'マーケットプレイスでの課金'
description: 'AWS、GCP、Azure のマーケットプレイスを通じて ClickHouse Cloud を契約できます。'
keywords: ['aws', 'azure', 'gcp', 'google cloud', 'マーケットプレイス', '課金']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

AWS、GCP、Azure の各マーケットプレイス経由で ClickHouse Cloud を利用開始できます。これにより、既存のクラウドプロバイダーからの請求に ClickHouse Cloud の料金を含めることができます。

マーケットプレイスを通じて、従量課金制 (PAYG) で利用するか、ClickHouse Cloud とのコミットメント契約を結ぶかを選択できます。請求はクラウドプロバイダー側で処理され、すべてのクラウドサービスをまとめた 1 枚の請求書を受け取ります。

* [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
* [AWS Marketplace Committed Contract](/cloud/billing/marketplace/aws-marketplace-committed-contract)
* [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
* [GCP Marketplace Committed Contract](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
* [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
* [Azure Marketplace Committed Contract](/cloud/billing/marketplace/azure-marketplace-committed-contract)


## よくある質問 (FAQs) {#faqs}

### 自分の組織がマーケットプレイス課金に接続されていることはどのように確認できますか？​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

ClickHouse Cloud コンソールで **Billing** に移動します。**Payment details** セクションにマーケットプレイス名とリンクが表示されているはずです。

### 既存の ClickHouse Cloud ユーザーです。AWS / GCP / Azure マーケットプレイス経由で ClickHouse Cloud を購読するとどうなりますか？​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

クラウドプロバイダーのマーケットプレイスから ClickHouse Cloud にサインアップする手順は 2 段階です:
1. まずクラウドプロバイダーのマーケットプレイスポータルで ClickHouse Cloud を「購読 (subscribe)」します。購読が完了したら、「Pay Now」または「Manage on Provider」（マーケットプレイスによって異なります）をクリックします。これにより ClickHouse Cloud にリダイレクトされます。
2. ClickHouse Cloud 上で新しいアカウントを登録するか、既存のアカウントでサインインします。どちらの場合でも、マーケットプレイス課金に紐づけられた新しい ClickHouse Cloud 組織が作成されます。

注意: それ以前に ClickHouse Cloud にサインアップして作成された既存のサービスおよび組織はそのまま残り、マーケットプレイス課金には接続されません。ClickHouse Cloud では、同じアカウントを使用して複数の組織を管理でき、それぞれ異なる課金設定を持つことができます。

ClickHouse Cloud コンソール左下のメニューから組織を切り替えることができます。

### 既存の ClickHouse Cloud ユーザーです。既存のサービスをマーケットプレイス経由で課金したい場合はどうすればよいですか？​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

クラウドプロバイダーのマーケットプレイス経由で ClickHouse Cloud を購読する必要があります。マーケットプレイスでの購読が完了し、ClickHouse Cloud にリダイレクトされた後、既存の ClickHouse Cloud 組織をマーケットプレイス課金にリンクするオプションが表示されます。その時点以降、既存のリソースはマーケットプレイス経由で課金されるようになります。 

<Image img={marketplace_signup_and_org_linking} size='md' alt='マーケットプレイスでのサインアップと組織のリンク' border/>

組織の Billing ページから、課金がマーケットプレイスにリンクされていることを確認できます。問題が発生した場合は、[ClickHouse Cloud サポート](https://clickhouse.com/support/program) までお問い合わせください。

:::note
それ以前に ClickHouse Cloud にサインアップして作成された既存のサービスおよび組織はそのまま残り、マーケットプレイス課金には接続されません。
:::

### マーケットプレイスユーザーとして ClickHouse Cloud を購読しました。どのように解約できますか？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

ClickHouse Cloud の利用を停止し、既存の ClickHouse Cloud サービスをすべて削除するだけでも構いません。購読は有効なままですが、ClickHouse Cloud には継続課金がないため、料金は発生しません。

完全に解約したい場合は、クラウドプロバイダーのコンソールに移動して、そこでサブスクリプションの更新をキャンセルしてください。サブスクリプションが終了すると、既存のサービスはすべて停止され、クレジットカードの追加を求められます。カードが追加されない場合は、2 週間後に既存のサービスはすべて削除されます。

### マーケットプレイスユーザーとして ClickHouse Cloud を購読し、その後解約しました。再度購読したい場合、手順はどうなりますか？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

その場合は、通常どおり ClickHouse Cloud を購読してください（マーケットプレイス経由での ClickHouse Cloud の購読に関するセクションを参照してください）。

- AWS Marketplace の場合、新しい ClickHouse Cloud 組織が作成され、マーケットプレイスに接続されます。
- GCP Marketplace の場合、以前の組織が再有効化されます。

マーケットプレイス組織の再有効化に問題がある場合は、[ClickHouse Cloud サポート](https://clickhouse.com/support/program) までお問い合わせください。

### ClickHouse Cloud サービスのマーケットプレイスサブスクリプションに対する請求書にはどのようにアクセスできますか？​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS Billing コンソール](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP Marketplace orders](https://console.cloud.google.com/marketplace/orders)（サブスクリプションに使用した請求先アカウントを選択）

### 利用状況ステートメントの日付がマーケットプレイスの請求書の日付と一致しないのはなぜですか？​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

マーケットプレイスの課金は暦月サイクルに従います。たとえば、12 月 1 日から 1 月 1 日までの利用分については、1 月 3 日から 1 月 5 日の間に請求書が発行されます。

ClickHouse Cloud の利用状況ステートメントは、サインアップ日を起点として 30 日間の利用量を計測・報告する、別の課金サイクルに従っています。

これらの起算日が同一でない場合、利用状況ステートメントと請求書の日付は一致しません。利用状況ステートメントは、特定のサービスについて日単位で利用状況を追跡しているため、コストの内訳を確認する際はステートメントを参照できます。

### 一般的な請求情報はどこで確認できますか？ {#where-can-i-find-general-billing-information}

[Billing overview page](/cloud/manage/billing) を参照してください。

### クラウドプロバイダのマーケットプレイス経由で支払う場合と、ClickHouse に直接支払う場合で、ClickHouse Cloud の料金に違いはありますか？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

マーケットプレイス経由での課金と、ClickHouse に直接サインアップした場合の料金に違いはありません。どちらの場合も、ClickHouse Cloud の利用は ClickHouse Cloud Credits (CHC) によって計測され、同じ方法でメータリングおよび請求が行われます。

### 複数の ClickHouse Organization を、単一のクラウドマーケットプレイスの請求アカウント（AWS、GCP、または Azure）に紐づけて請求することはできますか？ {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

はい。複数の ClickHouse Organization を、同一のクラウドマーケットプレイスの請求アカウント（AWS、GCP、または Azure）に対して後払いで請求されるよう構成できます。ただし、前払いクレジットはデフォルトでは Organization 間で共有されません。Organization 間でクレジットを共有する必要がある場合は、[ClickHouse Cloud Support](https://clickhouse.com/support/program) までお問い合わせください。

### ClickHouse Organization の請求がクラウドマーケットプレイスのコミットメント契約経由になっている場合、クレジットを使い切ると自動的に PAYG（従量課金）に切り替わりますか？ {#automatically-move-to-PAYG-when-running-out-of-credit}

マーケットプレイスのコミットメント契約が有効な状態でそのクレジットを使い切った場合、組織は自動的に PAYG（従量課金）に切り替わります。ただし、既存の契約が期限切れになった際には、新しいマーケットプレイス契約を組織にリンクするか、クレジットカードによる直接課金に組織を移行する必要があります。 