---
'slug': '/cloud/billing/marketplace/migrate'
'title': 'クラウドマーケットプレイスでの従量課金制（PAYG）からコミットされた支出契約への移行'
'description': '従量課金制からコミットされた支出契約への移行。'
'keywords':
- 'marketplace'
- 'billing'
- 'PAYG'
- 'pay-as-you-go'
- 'committed spend contract'
'doc_type': 'guide'
---


# Migrate billing from pay-as-you-go (PAYG) to a committed spend contract in a cloud marketplace {#migrate-payg-to-committed}

もしあなたの ClickHouse 組織が現在、アクティブなクラウドマーケットプレイスの従量課金（PAYG）サブスクリプション（または注文）を通じて請求されており、同じクラウドマーケットプレイスを通じてコミットされた支出契約に移行したい場合は、新しいオファーを受け入れ、以下のステップに従ってください。サービスプロバイダーに基づいています。

## Important Notes {#important-notes}

マーケットプレイスの PAYG サブスクリプションをキャンセルしても ClickHouse Cloud アカウントが削除されることはありません - マーケットプレイスを通じた請求関係のみが削除されます。キャンセル後、当社のシステムはマーケットプレイスを通じた ClickHouse Cloud サービスへの請求を停止します。（注：このプロセスは即座には行われず、完了までに数分かかることがあります）。

マーケットプレイスのサブスクリプションがキャンセルされた後、ClickHouse 組織にクレジットカードが登録されている場合、請求サイクルの終了時にそのカードに請求します - 新しいマーケットプレイスのサブスクリプションが事前に付属していない限り。

キャンセル後にクレジットカードが設定されていない場合、組織に有効なクレジットカードまたは新しいクラウドマーケットプレイスのサブスクリプションを追加するための期間は 14 日です。その期間内に支払い方法が設定されない場合、サービスは一時停止され、組織は[請求コンプライアンス](/manage/clickhouse-cloud-billing-compliance)から外れると見なされます。

サブスクリプションがキャンセルされた後に発生した使用量は、次に設定された有効な支払い方法（プリペイドクレジット、マーケットプレイスのサブスクリプション、またはクレジットカードの順に）に請求されます。

新しいマーケットプレイスのサブスクリプションへの組織の設定に関する質問やサポートが必要な場合は、ClickHouse [サポート](https://clickhouse.com/support/program) に連絡してください。

## AWS Marketplace {#aws-marketplace}

PAYG サブスクリプションをコミットされた支出契約に移行するために同じ AWS アカウント ID を使用する場合、推奨される方法は [営業に連絡](https://clickhouse.com/company/contact)してこの修正を行うことです。こうすることで、追加のステップは不要になり、ClickHouse 組織やサービスに対する中断は発生しません。

異なる AWS アカウント ID を使用して ClickHouse 組織を PAYG サブスクリプションからコミットされた支出契約に移行したい場合は、以下の手順に従ってください。

### Steps to Cancel AWS PAYG Subscription {#cancel-aws-payg}

1. **[AWS Marketplace](https://us-east-1.console.aws.amazon.com/marketplace) に移動します**
2. **「サブスクリプションの管理」ボタンをクリックします**
3. **「あなたのサブスクリプション」に移動します：**
    - 「サブスクリプションの管理」をクリックします
4. **リストで ClickHouse Cloud を見つけます：**
    - 「あなたのサブスクリプション」の下で ClickHouse Cloud を探してクリックします
5. **サブスクリプションをキャンセルします：**
    - 「契約」セクションの ClickHouse Cloud リストの隣にある「アクション」ドロップダウンまたはボタンをクリックします
    - 「サブスクリプションをキャンセル」を選択します

> **Note:** サブスクリプションをキャンセルする手助けが必要な場合（例：サブスクリプションキャンセルボタンが利用できない場合）は、[AWS サポート](https://support.console.aws.amazon.com/support/home#/)に連絡してください。

次に、[これらの手順](/cloud/billing/marketplace/aws-marketplace-committed-contract)に従って、あなたの ClickHouse 組織を新しい AWS コミットされた支出契約に設定してください。

## GCP Marketplace {#gcp-marketplace}

### Steps to Cancel GCP PAYG Order {#cancel-gcp-payg}

1. **[Google Cloud Marketplace Console](https://console.cloud.google.com/marketplace) に移動します：**
    - 正しい GCP アカウントにログインしており、適切なプロジェクトが選択されていることを確認します
2. **ClickHouse 注文を見つけます：**
    - 左側のメニューで「あなたの注文」をクリックします
    - アクティブな注文のリストで正しい ClickHouse 注文を見つけます
3. **注文をキャンセルします：**
    - 注文の右側にある三点リーダーメニューを見つけて、指示に従って ClickHouse 注文をキャンセルします

> **Note:** この注文をキャンセルする手助けが必要な場合は、[GCP サポート](https://cloud.google.com/support/docs/get-billing-support)に連絡してください。

次に、[これらの手順](/cloud/billing/marketplace/gcp-marketplace-committed-contract)に従って、あなたの ClickHouse 組織を新しい GCP コミットされた支出契約に設定してください。

## Azure Marketplace {#azure-marketplace}

### Steps to Cancel Azure PAYG Subscription {#cancel-azure-payg}

1. **[Microsoft Azure Portal](http://portal.azure.com) に移動します**
2. **「サブスクリプション」に移動します**
3. **キャンセルしたいアクティブな ClickHouse サブスクリプションを見つけます**
4. **サブスクリプションをキャンセルします：**
    - ClickHouse Cloud サブスクリプションをクリックして、サブスクリプションの詳細を開きます
    - 「サブスクリプションをキャンセル」ボタンを選択します

> **Note:** この注文をキャンセルする手助けが必要な場合は、Azure ポータルでサポートチケットを開いてください。

次に、[これらの手順](/cloud/billing/marketplace/azure-marketplace-committed-contract)に従って、あなたの ClickHouse 組織を新しい Azure コミットされた支出契約に設定してください。

## Requirements for Linking to Committed Spend Contract {#linking-requirements}

> **Note:** マーケットプレイスのコミットされた支出契約に組織をリンクするためには：
> - 手順を実行するユーザーは、サブスクリプションを接続する ClickHouse 組織の管理者である必要があります
> - 組織内のすべての未払い請求書が支払われている必要があります（質問がある場合は ClickHouse [サポート](https://clickhouse.com/support/program) にお問い合わせください）
