---
description: 'clickhouse_backupview のリファレンスドキュメント {#clickhouse_backupview}'
slug: /operations/utilities/backupview
title: 'clickhouse_backupview'
doc_type: 'reference'
---

# clickhouse_backupview {#clickhouse_backupview}

[BACKUP](/operations/backup) コマンドによって作成されたバックアップを分析するための Python モジュールです。
主な目的は、バックアップを実際にリストアすることなく、そのバックアップから情報を取得できるようにすることです。

このモジュールは、次の機能を提供します。
- バックアップに含まれるファイルを列挙する
- バックアップからファイルを読み取る
- バックアップに含まれるデータベース、テーブル、パーツに関する有用な情報を可読な形式で取得する
- バックアップの整合性をチェックする

## 例 {#example}

```python
from clickhouse_backupview import open_backup, S3, FileInfo
```

# バックアップを開きます。ローカルパスを利用することもできます: {#open-a-backup-we-could-also-use-a-local-path}
# backup = open_backup("/backups/my_backup_1/") {#backup-open_backupbackupsmy_backup_1}
backup = open_backup(S3("uri", "access_key_id", "secret_access_key"))

# バックアップ内のデータベースの一覧を取得する {#get-a-list-of-databasess-inside-the-backup}
print(backup.get_databases()))

# バックアップ内のテーブル一覧を取得し、 {#get-a-list-of-tables-inside-the-backup}
# 各テーブルについて、その作成クエリとパーツおよびパーティションの一覧を表示します。 {#and-for-each-table-its-create-query-and-a-list-of-parts-and-partitions}
for db in backup.get_databases():
    for tbl in backup.get_tables(database=db):
        print(backup.get_create_query(database=db, table=tbl))
        print(backup.get_partitions(database=db, table=tbl))
        print(backup.get_parts(database=db, table=tbl))

# バックアップからすべてを抽出する {#extract-everything-from-the-backup}
backup.extract_all(table="mydb.mytable", out='/tmp/my_backup_1/all/')

# 特定のテーブルのデータを抽出します。 {#extract-the-data-of-a-specific-table}
backup.extract_table_data(table="mydb.mytable", out='/tmp/my_backup_1/mytable/')

# 1 つのパーティションを抽出する。 {#extract-a-single-partition}
backup.extract_table_data(table="mydb.mytable", partition="202201", out='/tmp/my_backup_1/202201/')

# 単一のパートを抽出する。 {#extract-a-single-part}

backup.extract&#95;table&#95;data(table=&quot;mydb.mytable&quot;, part=&quot;202201&#95;100&#95;200&#95;3&quot;, out=&#39;/tmp/my&#95;backup&#95;1/202201&#95;100&#95;200&#95;3/&#39;)

```

その他の例については、[test](https://github.com/ClickHouse/ClickHouse/blob/master/utils/backupview/test/test.py)を参照してください。
```
