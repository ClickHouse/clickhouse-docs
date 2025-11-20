---
slug: /cloud/billing/marketplace/migrate
title: '従量課金制 (PAYG) からクラウドマーケットプレイスでのコミット済み利用契約への課金の移行'
description: '従量課金制からコミット済み利用契約への移行。'
keywords: ['marketplace', 'billing', 'PAYG', 'pay-as-you-go', 'committed spend contract']
doc_type: 'guide'
---



# クラウドマーケットプレイスでの従量課金制（PAYG）からコミット型契約への請求移行 {#migrate-payg-to-committed}

ClickHouse組織が現在、クラウドマーケットプレイスの従量課金制（PAYG）サブスクリプション（または注文）で請求されており、同じクラウドマーケットプレイスを通じてコミット型契約による請求に移行する場合は、新しいオファーを承認してから、ご利用のクラウドサービスプロバイダーに応じて以下の手順を実行してください。


## 重要な注意事項 {#important-notes}

マーケットプレイスのPAYGサブスクリプションをキャンセルしても、ClickHouse Cloudアカウント自体は削除されません。削除されるのはマーケットプレイス経由の請求関係のみです。キャンセル後、システムはマーケットプレイスを通じたClickHouse Cloudサービスの請求を停止します。(注: このプロセスは即座には完了せず、完了までに数分かかる場合があります)。

マーケットプレイスサブスクリプションがキャンセルされた後、ClickHouse組織にクレジットカードが登録されている場合、新しいマーケットプレイスサブスクリプションが事前に紐付けられない限り、請求サイクルの終了時にそのカードに請求が行われます。

キャンセル後にクレジットカードが設定されていない場合、有効なクレジットカードまたは新しいクラウドマーケットプレイスサブスクリプションを組織に追加するまでに14日間の猶予期間があります。その期間内に支払い方法が設定されない場合、サービスは停止され、組織は[請求コンプライアンス](/manage/clickhouse-cloud-billing-compliance)違反と見なされます。

サブスクリプションがキャンセルされた後に発生した使用量は、次に設定された有効な支払い方法(プリペイドクレジット、マーケットプレイスサブスクリプション、クレジットカードの優先順位)に請求されます。

組織を新しいマーケットプレイスサブスクリプションに設定する際にご質問やサポートが必要な場合は、ClickHouse [サポート](https://clickhouse.com/support/program)までお問い合わせください。


## AWS Marketplace {#aws-marketplace}

PAYG サブスクリプションからコミット支出契約への移行に同じ AWS アカウント ID を使用する場合は、[営業チームへのお問い合わせ](https://clickhouse.com/company/contact)による変更を推奨します。この方法により、追加の手順は不要となり、ClickHouse 組織やサービスへの中断も発生しません。

ClickHouse 組織を PAYG サブスクリプションからコミット支出契約へ移行する際に異なる AWS アカウント ID を使用する場合は、以下の手順に従ってください:

### AWS PAYG サブスクリプションのキャンセル手順 {#cancel-aws-payg}

1. **[AWS Marketplace](https://us-east-1.console.aws.amazon.com/marketplace) にアクセスします**
2. **「Manage Subscriptions」ボタンをクリックします**
3. **「Your Subscriptions」に移動します:**
   - 「Manage Subscriptions」をクリックします
4. **リストから ClickHouse Cloud を見つけます:**
   - 「Your Subscriptions」配下の ClickHouse Cloud を探してクリックします
5. **サブスクリプションをキャンセルします:**
   - 「Agreement」配下で、ClickHouse Cloud の横にある「Actions」ドロップダウンまたはボタンをクリックします
   - 「Cancel subscription」を選択します

> **注意:** サブスクリプションのキャンセルに関するサポートが必要な場合(例: キャンセルボタンが表示されない場合)は、[AWS サポート](https://support.console.aws.amazon.com/support/home#/)にお問い合わせください。

次に、承認した新しい AWS コミット支出契約に ClickHouse 組織を設定するため、こちらの[手順](/cloud/billing/marketplace/aws-marketplace-committed-contract)に従ってください。


## GCP Marketplace {#gcp-marketplace}

### GCP PAYG注文のキャンセル手順 {#cancel-gcp-payg}

1. **[Google Cloud Marketplaceコンソール](https://console.cloud.google.com/marketplace)にアクセスします:**
   - 正しいGCPアカウントにログインし、適切なプロジェクトが選択されていることを確認してください
2. **ClickHouse注文を探します:**
   - 左側のメニューで「Your Orders」をクリックします
   - アクティブな注文のリストから該当するClickHouse注文を見つけます
3. **注文をキャンセルします:**
   - 注文の右側にある3点メニューを見つけ、表示される手順に従ってClickHouse注文をキャンセルします

> **注意:** この注文のキャンセルについてサポートが必要な場合は、[GCPサポート](https://cloud.google.com/support/docs/get-billing-support)にお問い合わせください。

次に、こちらの[手順](/cloud/billing/marketplace/gcp-marketplace-committed-contract)に従って、ClickHouse組織を新しいGCPコミット支出契約に構成してください。


## Azure Marketplace {#azure-marketplace}

### Azure PAYG サブスクリプションのキャンセル手順 {#cancel-azure-payg}

1. **[Microsoft Azure Portal](http://portal.azure.com) にアクセスします**
2. **「サブスクリプション」に移動します**
3. **キャンセルする有効な ClickHouse サブスクリプションを特定します**
4. **サブスクリプションをキャンセルします:**
   - ClickHouse Cloud サブスクリプションをクリックして、サブスクリプションの詳細を開きます
   - 「サブスクリプションのキャンセル」ボタンを選択します

> **注:** この注文のキャンセルに関してサポートが必要な場合は、Azure Portal でサポートチケットを作成してください。

次に、これらの[手順](/cloud/billing/marketplace/azure-marketplace-committed-contract)に従って、新しい Azure コミット支出契約に ClickHouse 組織を構成してください。


## コミット支出契約へのリンクに関する要件 {#linking-requirements}

> **注意:** マーケットプレイスのコミット支出契約に組織をリンクするには、以下の条件を満たす必要があります:
>
> - 手順を実行するユーザーは、サブスクリプションを紐付けるClickHouse組織の管理者ユーザーである必要があります
> - 組織の未払い請求書がすべて支払われている必要があります(ご質問がある場合は、ClickHouse[サポート](https://clickhouse.com/support/program)までお問い合わせください)
