---
slug: /operations/utilities/backupview
title: clickhouse_backupview
---

# clickhouse_backupview {#clickhouse_backupview}

[BACKUP](/operations/backup) コマンドによって作成されたバックアップを分析するための Python モジュールです。主な目的は、バックアップを実際に復元することなく、バックアップから情報を取得できるようにすることです。

このモジュールは以下の機能を提供します：
- バックアップに含まれるファイルを列挙する
- バックアップからファイルを読み取る
- バックアップに含まれるデータベース、テーブル、パーツに関する有用な情報を可読形式で取得する
- バックアップの整合性をチェックする

## 例: {#example}

```python
from clickhouse_backupview import open_backup, S3, FileInfo

# バックアップを開く。ローカルパスを使用することもできます：
# backup = open_backup("/backups/my_backup_1/")
backup = open_backup(S3("uri", "access_key_id", "secret_access_key"))

# バックアップ内のデータベースの一覧を取得します。
print(backup.get_databases()))

# バックアップ内のテーブルの一覧を取得し、
# 各テーブルにその作成クエリおよびパーツとパーティションのリストを取得します。
for db in backup.get_databases():
    for tbl in backup.get_tables(database=db):
        print(backup.get_create_query(database=db, table=tbl))
        print(backup.get_partitions(database=db, table=tbl))
        print(backup.get_parts(database=db, table=tbl))

# バックアップからすべてを抽出します。
backup.extract_all(table="mydb.mytable", out='/tmp/my_backup_1/all/')

# 特定のテーブルのデータを抽出します。
backup.extract_table_data(table="mydb.mytable", out='/tmp/my_backup_1/mytable/')

# 特定のパーティションを抽出します。
backup.extract_table_data(table="mydb.mytable", partition="202201", out='/tmp/my_backup_1/202201/')

# 特定のパーツを抽出します。
backup.extract_table_data(table="mydb.mytable", part="202201_100_200_3", out='/tmp/my_backup_1/202201_100_200_3/')
```

さらに多くの例については、[test](https://github.com/ClickHouse/ClickHouse/blob/master/utils/backupview/test/test.py)をご覧ください。
