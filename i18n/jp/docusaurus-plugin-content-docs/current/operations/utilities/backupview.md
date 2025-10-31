---
'description': 'clickhouse_backupview のドキュメント {#clickhouse_backupview}'
'slug': '/operations/utilities/backupview'
'title': 'clickhouse_backupview'
'doc_type': 'reference'
---


# clickhouse_backupview {#clickhouse_backupview}

Pythonモジュールは、[BACKUP](/operations/backup)コマンドで作成されたバックアップを分析するのに役立ちます。
主な目的は、バックアップを実際に復元することなく、バックアップから情報を取得できるようにすることでした。

このモジュールは以下の機能を提供します。
- バックアップに含まれるファイルを列挙する
- バックアップからファイルを読み込む
- バックアップに含まれるデータベース、テーブル、パーツに関する有用な情報を可読形式で取得する
- バックアップの整合性をチェックする

## 例: {#example}

```python
from clickhouse_backupview import open_backup, S3, FileInfo


# Open a backup. We could also use a local path:

# backup = open_backup("/backups/my_backup_1/")
backup = open_backup(S3("uri", "access_key_id", "secret_access_key"))


# Get a list of databasess inside the backup.
print(backup.get_databases()))


# Get a list of tables inside the backup,

# and for each table its create query and a list of parts and partitions.
for db in backup.get_databases():
    for tbl in backup.get_tables(database=db):
        print(backup.get_create_query(database=db, table=tbl))
        print(backup.get_partitions(database=db, table=tbl))
        print(backup.get_parts(database=db, table=tbl))


# Extract everything from the backup.
backup.extract_all(table="mydb.mytable", out='/tmp/my_backup_1/all/')


# Extract the data of a specific table.
backup.extract_table_data(table="mydb.mytable", out='/tmp/my_backup_1/mytable/')


# Extract a single partition.
backup.extract_table_data(table="mydb.mytable", partition="202201", out='/tmp/my_backup_1/202201/')


# Extract a single part.
backup.extract_table_data(table="mydb.mytable", part="202201_100_200_3", out='/tmp/my_backup_1/202201_100_200_3/')
```

さらに例については、[テスト](https://github.com/ClickHouse/ClickHouse/blob/master/utils/backupview/test/test.py)を参照してください。
