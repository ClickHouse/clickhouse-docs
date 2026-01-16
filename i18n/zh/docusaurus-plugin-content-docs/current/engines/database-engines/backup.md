---
description: '允许从备份中立即以只读模式挂载表或数据库。'
sidebar_label: '备份'
sidebar_position: 60
slug: /engines/database-engines/backup
title: '备份'
doc_type: '参考'
---

# 备份 \{#backup\}

数据库备份允许从[备份](/operations/backup/overview)中即时附加表或数据库，并以只读模式访问。

数据库备份同时支持增量和非增量备份。

## 创建数据库 \{#creating-a-database\}

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

备份目标可以是任意有效的[备份目的地](/operations/backup/disk#configure-backup-destinations-for-disk)，例如 `Disk`、`S3` 或 `File`。

使用 `Disk` 作为备份目标时，用于从备份创建数据库的查询如下：

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name'))
```

**引擎参数**

* `database_name_inside_backup` — 备份中数据库的名称。
* `backup_destination` — 备份存储位置。

## 使用示例 \{#usage-example\}

以 `Disk` 作为备份目标为例。首先在 `storage.xml` 中配置备份磁盘：

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

用法示例。先创建测试数据库和表，插入一些数据，然后创建备份：

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

现在我们已经有了 `test_database_backup` 这个备份，接下来使用 Backup 引擎创建数据库：

```sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

现在我们可以查询这个数据库中的任意表：

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

以 `Disk` 作为备份目标为例。首先在 `storage.xml` 中配置备份磁盘：

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

用法示例。先创建测试数据库和表，插入一些数据，然后创建备份：

CREATE DATABASE test&#95;database;

CREATE TABLE test&#95;database.test&#95;table&#95;1 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test&#95;database.test&#95;table&#95;1 VALUES (0, &#39;test&#95;database.test&#95;table&#95;1&#39;);

CREATE TABLE test&#95;database.test&#95;table&#95;2 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test&#95;database.test&#95;table&#95;2 VALUES (0, &#39;test&#95;database.test&#95;table&#95;2&#39;);

CREATE TABLE test&#95;database.test&#95;table&#95;3 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test&#95;database.test&#95;table&#95;3 VALUES (0, &#39;test&#95;database.test&#95;table&#95;3&#39;);

BACKUP DATABASE test&#95;database TO Disk(&#39;backups&#39;, &#39;test&#95;database&#95;backup&#39;);

现在我们已经有了 `test_database_backup` 备份，接下来创建名为 Backup 的数据库：

CREATE DATABASE test&#95;database&#95;backup ENGINE = Backup(&#39;test&#95;database&#39;, Disk(&#39;backups&#39;, &#39;test&#95;database&#95;backup&#39;));

现在我们可以查询数据库中的任意表：

SELECT id, value FROM test&#95;database&#95;backup.test&#95;table&#95;1;

┌─id─┬─value──────────────────────┐
│  0 │ test&#95;database.test&#95;table&#95;1 │
└────┴────────────────────────────┘

SELECT id, value FROM test&#95;database&#95;backup.test&#95;table&#95;2;

┌─id─┬─value──────────────────────┐
│  0 │ test&#95;database.test&#95;table&#95;2 │
└────┴────────────────────────────┘

SELECT id, value FROM test&#95;database&#95;backup.test&#95;table&#95;3;

┌─id─┬─value──────────────────────┐
│  0 │ test&#95;database.test&#95;table&#95;3 │
└────┴────────────────────────────┘

也可以像操作普通数据库一样使用该备份数据库。例如，可以查询其中的表：

SELECT database, name FROM system.tables WHERE database = &#39;test&#95;database&#95;backup&#39;:

┌─database─────────────┬─name─────────┐
│ test&#95;database&#95;backup │ test&#95;table&#95;1 │
│ test&#95;database&#95;backup │ test&#95;table&#95;2 │
│ test&#95;database&#95;backup │ test&#95;table&#95;3 │
└──────────────────────┴──────────────┘

```sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup':

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
