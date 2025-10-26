---
'title': '特定のテーブルの再同期'
'description': 'Postgres ClickPipeにおける特定のテーブルの再同期'
'slug': '/integrations/clickpipes/postgres/table_resync'
'sidebar_label': 'テーブルの再同期'
'doc_type': 'guide'
---


# 特定のテーブルの再同期 {#resync-tables}

パイプの特定のテーブルを再同期することが有用なシナリオがあります。いくつかのサンプルユースケースとしては、Postgresの大規模なスキーマ変更やClickHouseでのデータの再モデル化が考えられます。

ボタンをクリックして個々のテーブルを再同期する作業は進行中ですが、このガイドでは、Postgres ClickPipeでこれを実現するための手順を共有します。

### 1. パイプからテーブルを削除する {#removing-table}

これは、[テーブル削除ガイド](./removing_tables)に従って行うことができます。

### 2. ClickHouseでテーブルを切り捨てるか削除する {#truncate-drop-table}

このステップは、次のステップでこのテーブルを再追加する際のデータ重複を避けるためのものです。これを行うには、ClickHouse Cloudの**SQLコンソール**タブに移動し、クエリを実行します。
テーブルがClickHouseにすでに存在し、空でない場合はテーブルの追加がブロックされるようにバリデーションがありますので注意してください。

### 3. 再びClickPipeにテーブルを追加する {#add-table-again}

これは、[テーブル追加ガイド](./add_table)に従って行うことができます。
