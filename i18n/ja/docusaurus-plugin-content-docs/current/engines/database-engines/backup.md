---
slug: /engines/database-engines/backup
sidebar_position: 60
sidebar_label: バックアップ
title: "バックアップ"
description: "バックアップからテーブル/データベースを読み取り専用モードで瞬時に接続できるようにします。"
---

# バックアップ

データベースのバックアップは、[バックアップ](../../operations/backup)からテーブル/データベースを読み取り専用モードで瞬時に接続できるようにします。

データベースのバックアップは、増分バックアップと非増分バックアップの両方で機能します。

## データベースの作成 {#creating-a-database}

``` sql
    CREATE DATABASE backup_database
    ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

バックアップ先は、`Disk`、`S3`、`File`のようないかなる有効なバックアップ[先](../../operations/backup#configure-a-backup-destination)でも可能です。

`Disk`バックアップ先を使用した場合、バックアップからデータベースを作成するクエリは次のようになります：

``` sql
    CREATE DATABASE backup_database
    ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name'))
```

**エンジンパラメータ**

- `database_name_inside_backup` — バックアップ内のデータベース名。
- `backup_destination` — バックアップ先。

## 使用例 {#usage-example}

`Disk`バックアップ先を使用した例を作成してみましょう。まず、`storage.xml`でバックアップディスクを設定します：

``` xml
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

使用の例です。テストデータベースを作成し、テーブルを作成し、データを挿入してからバックアップを作成します：

``` sql
CREATE DATABASE test_database;

CREATE TABLE test_database.test_table_1 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_1 VALUES (0, 'test_database.test_table_1');

CREATE TABLE test_database.test_table_2 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_2 VALUES (0, 'test_database.test_table_2');

CREATE TABLE test_database.test_table_3 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_3 VALUES (0, 'test_database.test_table_3');

BACKUP DATABASE test_database TO Disk('backups', 'test_database_backup');
```

これで、`test_database_backup`バックアップができましたので、バックアップデータベースを作成します：

``` sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

これで、データベースから任意のテーブルをクエリできるようになります：

``` sql
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

このバックアップデータベースは、通常のデータベースと同様に操作することも可能です。例えば、テーブルをクエリする場合：

``` sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup';

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
