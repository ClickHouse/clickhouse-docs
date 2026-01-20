---
description: 'バックアップからテーブルまたはデータベースを読み取り専用モードで即座にアタッチできる。'
sidebar_label: 'バックアップ'
sidebar_position: 60
slug: /engines/database-engines/backup
title: 'バックアップ'
doc_type: 'reference'
---

# バックアップ \{#backup\}

データベースのバックアップ機能を使用すると、[バックアップ](/operations/backup/overview) からテーブルやデータベースを読み取り専用モードで即座にアタッチできます。

データベースのバックアップは、増分バックアップと非増分バックアップの両方に対応しています。

## データベースの作成 \{#creating-a-database\}

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

バックアップ先には、`Disk`、`S3`、`File` などの有効なバックアップ[先](/operations/backup/disk#configure-backup-destinations-for-disk)を指定できます。

バックアップ先が `Disk` の場合、バックアップからデータベースを作成するクエリは次のようになります。

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name'))
```

**エンジンパラメータ**

* `database_name_inside_backup` — バックアップ内のデータベースの名前。
* `backup_destination` — バックアップ先。

## 使用例 \{#usage-example\}

`Disk` バックアップ先を使った例を見てみましょう。まずは `storage.xml` でバックアップ用ディスクを設定します：

```xml
<storage_configuration>
    <disks>
        <backups>
            <type>local</type>
            <path>/home/ubuntu/ClickHouseWorkDir/backups/</path>
        </backups>
    </disks>
</storage_configuration>
<backups>
    <allowed_disk>backups</allowed_disk>
    <allowed_path>/home/ubuntu/ClickHouseWorkDir/backups/</allowed_path>
</backups>
```

使用例として、テスト用のデータベースとテーブルを作成し、いくつかデータを挿入してからバックアップを作成します。

```sql
CREATE DATABASE test_database;

CREATE TABLE test_database.test_table_1 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_1 VALUES (0, 'test_database.test_table_1');

CREATE TABLE test_database.test_table_2 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_2 VALUES (0, 'test_database.test_table_2');

CREATE TABLE test_database.test_table_3 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_3 VALUES (0, 'test_database.test_table_3');

BACKUP DATABASE test_database TO Disk('backups', 'test_database_backup');
```

これで `test_database_backup` のバックアップが取得できたので、このバックアップを使って `test_database_backup` データベースを作成しましょう。

```sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

これで、バックアップしたデータベース内の任意のテーブルにクエリを実行できます。

```sql
SELECT id, value FROM test_database_backup.test_table_1;

┌─id─┬─value──────────────────────┐
│  0 │ test_database.test_table_1 │
└────┴────────────────────────────┘

SELECT id, value FROM test_database_backup.test_table_2;

┌─id─┬─value──────────────────────┐
│  0 │ test_database.test_table_2 │
└────┴────────────────────────────┘

SELECT id, value FROM test_database_backup.test_table_3;

┌─id─┬─value──────────────────────┐
│  0 │ test_database.test_table_3 │
└────┴────────────────────────────┘
```

このバックアップとして作成したデータベースも、通常のデータベースと同様に操作できます。たとえば、その中のテーブルに対してクエリを実行できます。

```sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup':

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
