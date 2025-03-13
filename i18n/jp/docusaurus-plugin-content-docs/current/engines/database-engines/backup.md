---
slug: /engines/database-engines/backup
sidebar_position: 60
sidebar_label: バックアップ
title: "バックアップ"
description: "バックアップからテーブル/データベースを読み取り専用モードで即座にアタッチすることを可能にします。"
---


# バックアップ

データベースバックアップでは、[バックアップ](../../operations/backup)からテーブル/データベースを読み取り専用モードで即座にアタッチすることができます。

データベースバックアップは、増分バックアップと非増分バックアップの両方で動作します。

## データベースの作成 {#creating-a-database}

``` sql
    CREATE DATABASE backup_database
    ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

バックアップ先は、`Disk`、`S3`、`File`のような有効なバックアップ[先](../../operations/backup#configure-a-backup-destination)である必要があります。

`Disk`バックアップ先を使用する場合、バックアップからデータベースを作成するクエリは次のようになります。

``` sql
    CREATE DATABASE backup_database
    ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name')
```

**エンジンパラメータ**

- `database_name_inside_backup` — バックアップ内のデータベースの名前。
- `backup_destination` — バックアップの先。

## 利用例 {#usage-example}

`Disk`バックアップ先を使った例を見てみましょう。まず`storage.xml`にバックアップディスクを設定します。

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

使用例を示します。テストデータベースを作成し、テーブルを作成し、データを挿入してからバックアップを作成しましょう。

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

これで`test_database_backup`バックアップが作成されましたので、データベースバックアップを作成します。

``` sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

これで、任意のテーブルをデータベースからクエリすることができます。

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

このデータベースバックアップは、通常のデータベースのように操作することも可能です。例えば、内部のテーブルをクエリすることができます。

``` sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup';

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
