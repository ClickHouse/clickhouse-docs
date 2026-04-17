---
sidebar_label: '支払い方法の管理'
slug: /manage/manage/billing/managing-payment-methods
title: '支払い方法の管理'
description: 'マーケットプレイスのサブスクリプションを管理し、バックアップ用のクレジットカードを追加する'
keywords: ['請求']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import add_payment_method from '@site/static/images/cloud/reference/billing/01-add-payment-method.png';
import edit_credit_card from '@site/static/images/cloud/reference/billing/02-edit-credit-card.png';
import edit_payment_method from '@site/static/images/cloud/reference/billing/03-edit-payment-method.png';
import edit_payment_method_2 from '@site/static/images/cloud/reference/billing/04-edit-payment-method.png';
import add_backup from '@site/static/images/cloud/reference/billing/05-add-backup.png';

このドキュメントでは、クレジットカード課金とマーケットプレイス課金の切り替え、バックアップ用クレジットカードの追加、複数の組織でのマーケットプレイス契約の共有など、ClickHouse Cloud における組織の請求方法を管理・更新する方法について説明します。

## 前提条件 \{#prerequisites\}

* 支払い方法を更新するには、組織で Admin または Billing ロールを持っている必要があります。
* 利用可能なマーケットプレイスサブスクリプションは、あなたが Admin または Billing ロールを持つ他の組織で有効になっているものに限られます。
* 他の組織のマーケットプレイスサブスクリプションを共有するには、現在の組織と、そのマーケットプレイスサブスクリプションを所有する組織の両方で Admin または Billing ロールを持っている必要があります。
* マーケットプレイスサブスクリプションで請求する組織内のすべてのサービスは、マーケットプレイスと同じクラウドプロバイダー (AWS、GCP、または Azure) 上にある必要があります。

:::note
他の組織のクレジットカードを共有することはできません。
現在の支払い方法がクレジットカードで、これを更新する場合は、新しいカード情報を入力する必要があります。
:::

## クレジットカードの支払い方法を追加または更新する \{#add-update-cc-payment-method\}

現在、組織の請求にクレジットカードを使用している場合は、Billing ページからカード情報を更新できます。

### クレジットカードを追加または更新する方法 \{#steps-add-update\}

1. ClickHouse Cloud コンソールで **Billing** に移動します。
2. クレジットカードを追加する場合は、ページ上部にある **支払い方法を追加** ボタンをクリックします。

<Image img={add_payment_method} alt="支払い方法を追加" size="lg" />

3. クレジットカードを編集する場合は、ページ上部にある **クレジットカードを編集** ボタンをクリックします。

<Image img={edit_credit_card} alt="クレジットカードを編集" size="lg" />

4. いずれの場合も、案内に従ってクレジットカードの請求先住所情報を追加または更新します。

## 既存のマーケットプレイス契約に組織の請求を設定する \{#configure-billing-to-existing-mp-sub\}

複数の組織がある場合は、次のことができます。

* 組織の請求を、クレジットカード請求から、他の組織のいずれかですでに有効なマーケットプレイス契約に切り替える。
* 組織の現在のマーケットプレイス契約を、別の組織で使用中の契約に変更する。

### クレジットカード請求から、他の組織のいずれかですでに有効なマーケットプレイスサブスクリプションに組織を切り替える手順 \{#steps-switch-org-already-active\}

1. ClickHouse Cloudコンソールの **Billing** ページに移動します。
2. **payment method** の横にある編集アイコンをクリックします。

<Image img={edit_payment_method} alt="支払い方法を編集" size="lg" />

3. **Edit payment method** ダイアログに、現在のクレジットカードが主な支払い方法として表示されます。
4. クレジットカードの下に、他の組織で利用可能なマーケットプレイスサブスクリプションが表示されます。各項目には、マーケットプレイスの種類 (例: AWS Marketplace) と、関連付けられている組織名が表示されます。
5. この組織の利用料金の請求先にするマーケットプレイスサブスクリプションを選択します。
6. **Update payment method** をクリックして確定します。

### 組織の現在のマーケットプレイスサブスクリプションを、別の組織で使用されているものに変更する手順 \{#steps-switch-org-different-org\}

1. ClickHouse Cloudコンソールの **Billing** ページに移動します。
2. **payment method** の横にある編集アイコンをクリックします。

<Image img={edit_payment_method_2} alt="支払い方法を編集" size="lg" />

3. **Edit payment method** ダイアログに、現在のマーケットプレイスサブスクリプションが支払い方法として表示されます。
4. 現在のマーケットプレイスサブスクリプションの下に、他の組織で利用可能な別のマーケットプレイスサブスクリプションが表示されます。各項目には、マーケットプレイスの種類 (例: AWS Marketplace) と、関連付けられている組織名が表示されます。
5. この組織の利用料金の請求先として使用する新しいマーケットプレイスサブスクリプションを選択します。
6. 確認のため、**Update payment method** をクリックします。

## マーケットプレイス組織に予備用のクレジットカードを追加する \{#add-backup-cc-to-marketplace-org\}

組織の主な支払い方法がマーケットプレイスのサブスクリプションである場合、バックアップの支払い方法としてクレジットカードを追加できます。バックアップカードに請求されるのは、利用料金をマーケットプレイスのサブスクリプションに請求できない場合のみです (たとえば、サブスクリプションがキャンセルまたは期限切れになった場合) 。

:::note
ClickHouse Cloud を利用するには、組織に少なくとも 1 つの有効な請求方法 (マーケットプレイスのサブスクリプションまたはクレジットカード) が設定されている必要があります。請求コンプライアンスの詳細は、[こちら](/manage/clickhouse-cloud-billing-compliance#billing-compliance)を参照してください。
:::

### バックアップ用クレジットカードを追加する手順 \{#steps-add-backup-cc\}

1. ClickHouse Cloud コンソールの **Billing** ページに移動します。
2. Billing ページの上部には、主な支払い方法としてマーケットプレイスサブスクリプションが表示され、バックアップの支払い方法は **None** と表示されます。
3. **add credit card** ボタンをクリックして、バックアップの支払い方法を設定します。

<Image img={add_backup} alt="バックアップ用クレジットカードを追加" size="lg" />

4. 画面の指示に従って、クレジットカードの請求先住所の詳細を追加または更新します。保存すると、**Billing** ページに主なマーケットプレイスサブスクリプションとあわせてバックアップ用クレジットカードが表示されます。

:::note
バックアップ用クレジットカードを設定すると、ボタンをクリックしてクレジットカード情報を編集し、それを主な支払い方法に設定することもできます。
ただし、そうすると、そのクレジットカードが組織で唯一の支払い方法となり、マーケットプレイスサブスクリプションは ClickHouse Cloud から完全に削除されます。
その場合は、セクション[&quot;クラウドプロバイダーからマーケットプレイス課金をセットアップする&quot;](#set-up-marketplace-billing-from-cp) の手順に従って、マーケットプレイスアカウントに戻り、再設定する必要があります。
:::

## クラウドプロバイダからマーケットプレイス課金をセットアップする \{#set-up-marketplace-billing-from-cp\}

ClickHouse Cloud コンソールを介さずに、クラウドマーケットプレイスから組織のマーケットプレイスサブスクリプションを直接セットアップまたは更新することもできます。

マーケットプレイスとサブスクリプションの種類に応じて、以下の手順に従ってください。

* [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
* [AWS Marketplace Committed Contract](/cloud/billing/marketplace/aws-marketplace-committed-contract)
* [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
* [GCP Marketplace Committed Contract](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
* [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
* [Azure Marketplace Committed Contract](/cloud/billing/marketplace/azure-marketplace-committed-contract)

このフローを完了すると、選択した組織の請求は新しい Marketplace サブスクリプションにリンクされ、ClickHouse Cloud コンソールの請求ページに更新内容が反映されます。

## サポート \{#support\}

問題が発生した場合は、[サポートチームまでお気軽にお問い合わせください](https://clickhouse.com/support/program)。

## よくある質問 \{#faqs\}

### 請求期間の途中で請求方法を切り替えた場合、使用料金はどうなりますか？ \{#what-happens-to-my-usage-charges-if-i-switch-billing-methods-mid-billing-cycle\}

切り替え先によって異なります。

マーケットプレイス課金からクレジットカード請求に切り替える場合: 請求期間の開始から切り替え時点までの使用量はマーケットプレイスに送られます。切り替え時点から請求期間の終了までの残りの使用量は、請求期間の終了時にクレジットカードへ請求されます。

クレジットカード請求からマーケットプレイス課金に切り替える場合: 請求期間全体の未請求分の使用量は、すべてマーケットプレイスに送られます。