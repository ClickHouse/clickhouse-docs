---
slug: /engines/database-engines/backup
sidebar_position: 60
sidebar_label: 备份
title: "备份"
description: "允许从备份中即时以只读模式附加表/数据库。"
---


# 备份

数据库备份允许从 [备份](../../operations/backup) 中即时以只读模式附加表/数据库。

数据库备份支持增量备份和非增量备份。

## 创建数据库 {#creating-a-database}

``` sql
    CREATE DATABASE backup_database
    ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

备份目标可以是任何有效的备份 [目标](../../operations/backup#configure-a-backup-destination)，如 `Disk`、`S3`、`File`。

使用 `Disk` 备份目标，从备份创建数据库的查询如下所示：

``` sql
    CREATE DATABASE backup_database
    ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name')
```

**引擎参数**

- `database_name_inside_backup` — 备份内部的数据库名称。
- `backup_destination` — 备份目标。

## 使用示例 {#usage-example}

让我们以 `Disk` 备份目标举个例子。首先在 `storage.xml` 中设置备份盘：

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

使用示例。让我们创建测试数据库、表格，插入一些数据，然后创建备份：

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

现在我们有了 `test_database_backup` 备份，让我们创建数据库 Backup：

``` sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

现在我们可以查询任何表格：

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

还可以像操作任何普通数据库一样操作这个数据库 Backup。例如在其中查询表格：

``` sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup';

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
