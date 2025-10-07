---
'title': '特定テーブルの再同期'
'description': 'MongoDB ClickPipeにおける特定テーブルの再同期'
'slug': '/integrations/clickpipes/mongodb/table_resync'
'sidebar_label': 'テーブルの再同期'
'doc_type': 'guide'
---


# 特定のテーブルの再同期 {#resync-tables}

特定のパイプのテーブルを再同期する必要があるシナリオがあります。いくつかのサンプルユースケースとしては、MongoDBでの大規模なスキーマ変更や、ClickHouseでのデータの再モデリングが考えられます。

ボタンをクリックして個別のテーブルを再同期する作業は進行中ですが、このガイドでは、MongoDB ClickPipeでこれを実現するための手順を共有します。

### 1. パイプからテーブルを削除する {#removing-table}

これは、[テーブル削除ガイド](./removing_tables)に従って行うことができます。

### 2. ClickHouseでテーブルを切り捨てるか削除する {#truncate-drop-table}

この手順は、次のステップで再度このテーブルを追加する際に、データ重複を避けるためのものです。これを行うには、ClickHouse Cloudの**SQLコンソール**タブに移動し、クエリを実行します。テーブルがすでにClickHouseに存在し、空でない場合、テーブルの追加をブロックするバリデーションがありますので注意してください。

### 3. 再度テーブルをClickPipeに追加する {#add-table-again}

これは、[テーブル追加ガイド](./add_table)に従って行うことができます。
