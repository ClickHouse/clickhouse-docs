---
'title': '特定のテーブルの再同期'
'description': 'MySQL ClickPipe内の特定のテーブルを再同期する'
'slug': '/integrations/clickpipes/mysql/table_resync'
'sidebar_label': 'テーブルの再同期'
'doc_type': 'guide'
---


# 特定のテーブルの再同期 {#resync-tables}

パイプの特定のテーブルを再同期することが有用なシナリオがあります。いくつかの例としては、MySQLのスキーマの大幅な変更や、ClickHouseでのデータの再モデリングが考えられます。

ボタンひとつで個々のテーブルを再同期する機能は現在進行中ですが、このガイドでは、MySQL ClickPipeでこれを実現するための手順を共有します。

### 1. パイプからテーブルを削除する {#removing-table}

これは、[テーブル削除ガイド](./removing_tables)に従って行うことができます。

### 2. ClickHouseでテーブルをトランケートまたは削除する {#truncate-drop-table}

このステップは、次のステップでこのテーブルを再追加する際にデータの重複を避けるためです。これを行うには、ClickHouse Cloudの**SQLコンソール**タブに移動し、クエリを実行します。テーブルがClickHouseに既に存在し、かつ空でない場合、テーブルの追加をブロックするためのバリデーションがありますのでご注意ください。

### 3. テーブルを再度ClickPipeに追加する {#add-table-again}

これは、[テーブル追加ガイド](./add_table)に従って行うことができます。
