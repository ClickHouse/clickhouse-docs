---
slug: /cloud/billing/marketplace/migrate
title: 'クラウドマーケットプレイスでの請求を従量課金制 (PAYG) からコミット済み利用契約に移行する'
description: '従量課金制からコミット済み利用契約への移行。'
keywords: ['マーケットプレイス', '請求', 'PAYG', '従量課金制', 'コミット済み利用契約']
doc_type: 'guide'
---



# クラウドマーケットプレイスでの従量課金制(PAYG)からコミット支出契約への請求移行 {#migrate-payg-to-committed}

ClickHouse組織が現在、アクティブなクラウドマーケットプレイスの従量課金制(PAYG)サブスクリプション(または注文)で請求されており、同じクラウドマーケットプレイスのコミット支出契約による請求に移行する場合は、新しいオファーを承認してから、ご利用のクラウドサービスプロバイダーに応じて以下の手順を実行してください。


## 重要な注意事項 {#important-notes}

マーケットプレイスのPAYGサブスクリプションをキャンセルしても、ClickHouse Cloudアカウント自体は削除されません。削除されるのはマーケットプレイス経由の請求関係のみです。キャンセルが完了すると、システムはマーケットプレイス経由でのClickHouse Cloudサービスの請求を停止します(注:この処理は即座には完了せず、数分かかる場合があります)。

マーケットプレイスサブスクリプションがキャンセルされた後、ClickHouse組織にクレジットカードが登録されている場合、請求サイクルの終了時にそのカードへ請求が行われます(ただし、事前に新しいマーケットプレイスサブスクリプションが紐付けられた場合を除く)。

キャンセル後にクレジットカードが設定されていない場合、有効なクレジットカードまたは新しいクラウドマーケットプレイスサブスクリプションを組織に追加するまでに14日間の猶予期間があります。この期間内に支払い方法が設定されない場合、サービスは停止され、組織は[請求コンプライアンス](/manage/clickhouse-cloud-billing-compliance)違反と見なされます。

サブスクリプションがキャンセルされた後に発生した使用量は、次に設定された有効な支払い方法(プリペイドクレジット、マーケットプレイスサブスクリプション、クレジットカードの順)に請求されます。

組織を新しいマーケットプレイスサブスクリプションに設定する際のご質問やサポートが必要な場合は、ClickHouse[サポート](https://clickhouse.com/support/program)までお問い合わせください。


## AWS Marketplace {#aws-marketplace}

PAYG サブスクリプションからコミット支出契約への移行に同じ AWS アカウント ID を使用する場合は、[営業担当者に連絡](https://clickhouse.com/company/contact)してこの変更を行うことを推奨します。これにより、追加の手順は不要となり、ClickHouse 組織やサービスに中断が発生することはありません。

ClickHouse 組織を PAYG サブスクリプションからコミット支出契約に移行する際に異なる AWS アカウント ID を使用する場合は、以下の手順に従ってください。

### AWS PAYG サブスクリプションをキャンセルする手順 {#cancel-aws-payg}

1. **[AWS Marketplace](https://us-east-1.console.aws.amazon.com/marketplace) にアクセスします**
2. **「Manage Subscriptions」ボタンをクリックします**
3. **「Your Subscriptions」に移動します:**
   - 「Manage Subscriptions」をクリックします
4. **リストから ClickHouse Cloud を見つけます:**
   - 「Your Subscriptions」の下にある ClickHouse Cloud を探してクリックします
5. **サブスクリプションをキャンセルします:**
   - 「Agreement」の下で、ClickHouse Cloud のリストの横にある「Actions」ドロップダウンまたはボタンをクリックします
   - 「Cancel subscription」を選択します

> **注意:** サブスクリプションのキャンセルに関するサポートが必要な場合(例:キャンセルボタンが利用できない場合)は、[AWS サポート](https://support.console.aws.amazon.com/support/home#/)にお問い合わせください。

次に、承認した新しい AWS コミット支出契約に ClickHouse 組織を設定するため、これらの[手順](/cloud/billing/marketplace/aws-marketplace-committed-contract)に従ってください。


## GCP Marketplace {#gcp-marketplace}

### GCP PAYG注文のキャンセル手順 {#cancel-gcp-payg}

1. **[Google Cloud Marketplaceコンソール](https://console.cloud.google.com/marketplace)にアクセスします:**
   - 正しいGCPアカウントにログインし、適切なプロジェクトが選択されていることを確認してください
2. **ClickHouse注文を探します:**
   - 左側のメニューで「Your Orders」をクリックします
   - アクティブな注文のリストから該当するClickHouse注文を見つけます
3. **注文をキャンセルします:**
   - 注文の右側にある3点メニューを見つけ、指示に従ってClickHouse注文をキャンセルします

> **注記:** この注文のキャンセルに関してサポートが必要な場合は、[GCPサポート](https://cloud.google.com/support/docs/get-billing-support)にお問い合わせください。

次に、これらの[手順](/cloud/billing/marketplace/gcp-marketplace-committed-contract)に従って、新しいGCPコミット支出契約にClickHouse組織を設定してください。


## Azure Marketplace {#azure-marketplace}

### Azure PAYG サブスクリプションのキャンセル手順 {#cancel-azure-payg}

1. **[Microsoft Azure Portal](http://portal.azure.com) にアクセスする**
2. **「サブスクリプション」に移動する**
3. **キャンセルする ClickHouse サブスクリプションを特定する**
4. **サブスクリプションをキャンセルする:**
   - ClickHouse Cloud サブスクリプションをクリックしてサブスクリプションの詳細を開く
   - 「サブスクリプションのキャンセル」ボタンを選択する

> **注:** この注文のキャンセルに関するサポートが必要な場合は、Azure Portal でサポートチケットを作成してください。

次に、以下の[手順](/cloud/billing/marketplace/azure-marketplace-committed-contract)に従って、ClickHouse 組織を新しい Azure コミット支出契約に構成してください。


## コミット支出契約へのリンクに関する要件 {#linking-requirements}

> **注意:** マーケットプレイスのコミット支出契約に組織をリンクするには:
>
> - 手順を実行するユーザーは、サブスクリプションを紐付けるClickHouse組織の管理者である必要があります
> - 組織のすべての未払い請求書が支払い済みである必要があります(ご不明な点がございましたら、ClickHouse[サポート](https://clickhouse.com/support/program)までお問い合わせください)
