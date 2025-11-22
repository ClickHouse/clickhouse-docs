---
description: 'clickhouse_backupview のドキュメント {#clickhouse_backupview}'
slug: /operations/utilities/backupview
title: 'clickhouse_backupview'
doc_type: 'reference'
---



# clickhouse_backupview {#clickhouse_backupview}

[BACKUP](/operations/backup)コマンドで作成されたバックアップの分析を支援するPythonモジュールです。
主な目的は、バックアップを実際に復元せずに、バックアップから情報を取得できるようにすることです。

このモジュールは以下の機能を提供します:

- バックアップに含まれるファイルの列挙
- バックアップからのファイルの読み取り
- バックアップに含まれるデータベース、テーブル、パートに関する有用な情報を読みやすい形式で取得
- バックアップの整合性チェック


## 例: {#example}

```python
from clickhouse_backupview import open_backup, S3, FileInfo

```


# バックアップを開きます。ローカルパスを使うこともできます:
# backup = open_backup("/backups/my_backup_1/")
backup = open_backup(S3("uri", "access_key_id", "secret_access_key"))



# バックアップ内のデータベース一覧を取得する
print(backup.get_databases()))



# バックアップ内のテーブル一覧を取得し、
# 各テーブルごとにその CREATE 文とパーツおよびパーティションの一覧を取得します。
for db in backup.get_databases():
    for tbl in backup.get_tables(database=db):
        print(backup.get_create_query(database=db, table=tbl))
        print(backup.get_partitions(database=db, table=tbl))
        print(backup.get_parts(database=db, table=tbl))



# バックアップからすべてのデータを抽出する。
backup.extract_all(table="mydb.mytable", out='/tmp/my_backup_1/all/')



# 特定のテーブルのデータを抽出します。
backup.extract_table_data(table="mydb.mytable", out='/tmp/my_backup_1/mytable/')



# 単一パーティションを抽出する
backup.extract_table_data(table="mydb.mytable", partition="202201", out='/tmp/my_backup_1/202201/')



# 1つのパーツを抽出する。

backup.extract&#95;table&#95;data(table=&quot;mydb.mytable&quot;, part=&quot;202201&#95;100&#95;200&#95;3&quot;, out=&#39;/tmp/my&#95;backup&#95;1/202201&#95;100&#95;200&#95;3/&#39;)

```

その他の例については、[test](https://github.com/ClickHouse/ClickHouse/blob/master/utils/backupview/test/test.py)を参照してください。
```
