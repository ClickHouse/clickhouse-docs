---
'description': '允许以只读模式立即从备份中附加表/数据库。'
'sidebar_label': '备份'
'sidebar_position': 60
'slug': '/engines/database-engines/backup'
'title': '备份'
---


# 备份

数据库备份允许即时以只读模式附加来自 [备份](../../operations/backup) 的表/数据库。

数据库备份可以使用增量备份和非增量备份。

## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

备份目标可以是任何有效的备份 [目标](../../operations/backup#configure-a-backup-destination)，如 `Disk`，`S3`，`File`。

使用 `Disk` 备份目标，从备份创建数据库的查询如下所示：

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name'))
```

**引擎参数**

- `database_name_inside_backup` — 备份中的数据库名称。
- `backup_destination` — 备份目标。

## 使用示例 {#usage-example}

让我们用 `Disk` 备份目标做一个示例。首先，在 `storage.xml` 中设置备份磁盘：

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

使用示例。让我们创建测试数据库、表，插入一些数据，然后创建一个备份：

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

所以现在我们有了 `test_database_backup` 备份，让我们创建数据库 Backup：

```sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

现在我们可以查询数据库中的任何表：

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

我们也可以像使用任何普通数据库一样处理这个数据库 Backup。例如查询其中的表：

```sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup':

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
