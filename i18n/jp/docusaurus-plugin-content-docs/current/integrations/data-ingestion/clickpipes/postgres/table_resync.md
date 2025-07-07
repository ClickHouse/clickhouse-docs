---
'title': '特定のテーブルの再同期'
'description': 'Postgres ClickPipe内の特定のテーブルを再同期します'
'slug': '/integrations/clickpipes/postgres/table_resync'
'sidebar_label': 'テーブル再同期'
---




# 特定のテーブルの再同期 {#resync-tables}

パイプの特定のテーブルを再同期することが有用なシナリオがあります。いくつかのサンプルユースケースとしては、Postgresでの大規模なスキーマ変更や、ClickHouseでのデータの再モデル化が考えられます。

ボタンのクリックで個別のテーブルを再同期する作業は進行中ですが、このガイドでは、Postgres ClickPipeでこれを実現するための手順を共有します。

### 1. パイプからテーブルを削除する {#removing-table}

これは、[テーブル削除ガイド](./removing_tables)に従って行うことができます。

### 2. ClickHouseでテーブルをトランケートまたは削除する {#truncate-drop-table}

このステップは、次のステップでこのテーブルを再追加する際にデータの重複を避けるためのものです。これを行うには、ClickHouse Cloudの**SQL Console**タブに移動し、クエリを実行します。PeerDBはデフォルトでReplacingMergeTreeテーブルを作成するため、テーブルが一時的な重複が無害なほど小さい場合は、このステップをスキップできます。

### 3. 再度ClickPipeにテーブルを追加する {#add-table-again}

これは、[テーブル追加ガイド](./add_table)に従って行うことができます。
