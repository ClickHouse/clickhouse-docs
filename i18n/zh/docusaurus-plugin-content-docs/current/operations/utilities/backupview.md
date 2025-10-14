---
'description': 'clickhouse_backupview 的文档 {#clickhouse_backupview}'
'slug': '/operations/utilities/backupview'
'title': 'clickhouse_backupview'
'doc_type': 'reference'
---


# clickhouse_backupview {#clickhouse_backupview}

用于分析通过 [BACKUP](/operations/backup) 命令创建的备份的 Python 模块。其主要目的是允许在不实际还原备份的情况下获取一些备份信息。

该模块提供以下功能
- 枚举备份中包含的文件
- 从备份中读取文件
- 以可读形式获取有关数据库、表、备份中包含的分区片段的有用信息
- 检查备份的完整性

## 示例: {#example}

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

有关更多示例，请参见 [test](https://github.com/ClickHouse/ClickHouse/blob/master/utils/backupview/test/test.py)。
