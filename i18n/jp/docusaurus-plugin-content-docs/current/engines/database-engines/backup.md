---
description: 'Allows to instantly attach table/database from backups in read-only
  mode.'
sidebar_label: 'バックアップ'
sidebar_position: 60
slug: '/engines/database-engines/backup'
title: 'Backup'
---




# バックアップ

データベースバックアップでは、[バックアップ](../../operations/backup)からテーブル/データベースを読み取り専用モードで瞬時にアタッチできます。

データベースバックアップは、増分バックアップと非増分バックアップの両方で機能します。

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

バックアップ先は、`Disk`、`S3`、`File`など、すべての有効なバックアップ[宛先](../../operations/backup#configure-a-backup-destination)にすることができます。

`Disk`バックアップ先を使用した場合、バックアップからデータベースを作成するクエリは次のようになります：

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name'))
```

**エンジンパラメータ**

- `database_name_inside_backup` — バックアップ内のデータベース名。
- `backup_destination` — バックアップ先。

## 使用例 {#usage-example}

`Disk`バックアップ先を使用した例を見てみましょう。まず、`storage.xml`でバックアップディスクを設定しましょう：

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

使用の例です。テストデータベースを作成し、テーブルを作成し、いくつかのデータを挿入し、最後にバックアップを作成しましょう：

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

これで`test_database_backup`バックアップができました。次に、バックアップを使用してデータベースを作成しましょう：

```sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

これで、データベースから任意のテーブルをクエリすることができます：

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

このバックアップデータベースを普通のデータベースと同様に操作することも可能です。例えば、テーブルをクエリすることもできます：

```sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup';

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
