---
slug: /cloud/billing/marketplace/migrate
title: 'クラウドマーケットプレイスで従量課金制 (PAYG) からコミットメント課金契約へ請求方式を移行する'
description: '従量課金制からコミットメント課金契約へ請求方式を移行します。'
keywords: ['マーケットプレイス', '請求', 'PAYG', '従量課金制', 'コミットメント課金契約']
doc_type: 'guide'
---



# クラウドマーケットプレイスでの従量課金 (PAYG) からコミットメント支出契約への課金移行 \\{#migrate-payg-to-committed\\}

ClickHouse の組織が現在、クラウドマーケットプレイスの有効な従量課金 (PAYG) サブスクリプション（または注文）によって課金されており、同じクラウドマーケットプレイス経由でコミットメント支出契約による課金へ移行したい場合は、新しいオファーを承諾したうえで、利用しているクラウドサービスプロバイダーに応じて以下の手順に従ってください。



## 重要な注意事項 \\{#important-notes\\}

マーケットプレイスの従量課金制 (PAYG) サブスクリプションをキャンセルしても、ClickHouse Cloud アカウント自体は削除されません。削除されるのは、マーケットプレイス経由の請求関係のみです。キャンセルが完了すると、ClickHouse Cloud サービスに対するマーケットプレイス経由での課金は停止されます。（注意：この処理は即時には行われず、完了まで数分かかる場合があります）。

マーケットプレイスのサブスクリプションがキャンセルされた後、ClickHouse 組織にクレジットカードが登録されている場合は、新しいマーケットプレイスサブスクリプションが事前に関連付けられていない限り、請求サイクルの終了時にそのカードに請求されます。

キャンセル後にクレジットカードが設定されていない場合、組織に有効なクレジットカードまたは新しいクラウドマーケットプレイスサブスクリプションを追加するための猶予期間として 14 日間があります。この期間内に支払い方法が設定されない場合、サービスは一時停止され、組織は[請求コンプライアンス](/manage/clickhouse-cloud-billing-compliance)に準拠していない状態とみなされます。

サブスクリプションのキャンセル後に発生した利用分については、次に設定されている有効な支払い方法に対して請求されます。優先順は、プリペイドクレジット、マーケットプレイスサブスクリプション、クレジットカードの順となります。

新しいマーケットプレイスサブスクリプションに組織を紐付ける際のご質問や、設定に関するサポートが必要な場合は、ClickHouse の[サポート](https://clickhouse.com/support/program)までお問い合わせください。



## AWS Marketplace \\{#aws-marketplace\\}

同じ AWS アカウント ID を使用して、PAYG サブスクリプションをコミット済み支出契約に移行したい場合は、この変更を行うために[営業窓口までお問い合わせ](https://clickhouse.com/company/contact)いただく方法を推奨します。そうすることで、追加の手順は不要となり、ClickHouse 組織やサービスに中断が発生することもありません。

別の AWS アカウント ID を使用して、ClickHouse 組織を PAYG サブスクリプションからコミット済み支出契約に移行したい場合は、次の手順に従ってください。

### AWS PAYG サブスクリプションを解約する手順 \\{#cancel-aws-payg\\}

1. **[AWS Marketplace](https://us-east-1.console.aws.amazon.com/marketplace) にアクセスします**
2. **「Manage Subscriptions」ボタンをクリックします**
3. **「Your Subscriptions」に移動します:**
    - 「Manage Subscriptions」をクリックします
4. **一覧から ClickHouse Cloud を探します:**
    - 「Your Subscriptions」内の ClickHouse Cloud を探してクリックします
5. **サブスクリプションを解約します:**
    - 「Agreement」の下で、ClickHouse Cloud の一覧の横にある「Actions」ドロップダウンまたはボタンをクリックします
    - 「Cancel subscription」を選択します

> **注:** サブスクリプションの解約についてサポートが必要な場合（例: 「Cancel subscription」ボタンが表示されない場合など）は、[AWS サポート](https://support.console.aws.amazon.com/support/home#/)にお問い合わせください。

続いて、受け入れた新しい AWS コミット済み支出契約で ClickHouse 組織を構成するために、これらの[手順](/cloud/billing/marketplace/aws-marketplace-committed-contract)に従ってください。



## GCP Marketplace \\{#gcp-marketplace\\}

### GCP PAYG 注文をキャンセルする手順 \\{#cancel-gcp-payg\\}

1. **[Google Cloud Marketplace Console](https://console.cloud.google.com/marketplace) にアクセスします。**
    - 正しい GCP アカウントでログインし、該当するプロジェクトが選択されていることを確認します。
2. **ClickHouse の注文を見つけます。**
    - 左側のメニューで「Your Orders」をクリックします。
    - アクティブな注文一覧から、対象の ClickHouse の注文を探します。
3. **注文をキャンセルします。**
    - 対象の注文の右側にある三点メニューを開き、表示される手順に従って ClickHouse の注文をキャンセルします。

> **注記:** この注文のキャンセルに関して支援が必要な場合は、[GCP サポート](https://cloud.google.com/support/docs/get-billing-support)にお問い合わせください。

続いて、これらの[手順](/cloud/billing/marketplace/gcp-marketplace-committed-contract)に従って、お使いの ClickHouse 組織を新しい GCP コミット済み支出契約用に構成します。



## Azure Marketplace \\{#azure-marketplace\\}

### Azure の PAYG サブスクリプションを解約する手順 \\{#cancel-azure-payg\\}

1. **[Microsoft Azure Portal](http://portal.azure.com) にアクセスします**
2. **「Subscriptions」に移動します**
3. **解約したい有効な ClickHouse サブスクリプションを探します**
4. **サブスクリプションを解約します:**
    - サブスクリプションの詳細を開くために、ClickHouse Cloud のサブスクリプションをクリックします
    - 「Cancel subscription」ボタンをクリックします

> **注:** この注文の解約についてサポートが必要な場合は、Azure Portal からサポートチケットを作成してください。

続いて、ClickHouse 組織を新しい Azure のコミット済み利用契約に対応させるため、こちらの[手順](/cloud/billing/marketplace/azure-marketplace-committed-contract)に従って構成してください。



## コミット済み利用契約へのリンク要件 \\{#linking-requirements\\}

> **注記:** 組織をマーケットプレイスのコミット済み利用契約にリンクするには、次の条件を満たしている必要があります:
> - 手順を実行するユーザーは、サブスクリプションを関連付ける対象の ClickHouse 組織の管理者ユーザーである必要があります
> - 組織内の未払いの請求書はすべて支払済みである必要があります（ご不明点がある場合は ClickHouse の [サポート](https://clickhouse.com/support/program) までお問い合わせください）