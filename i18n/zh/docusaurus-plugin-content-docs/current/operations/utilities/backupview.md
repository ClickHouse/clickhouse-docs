---
slug: /operations/utilities/backupview
title: clickhouse_backupview
---


# clickhouse_backupview {#clickhouse_backupview}

用于帮助分析通过 [BACKUP](/operations/backup) 命令创建的备份的 Python 模块。  
主要目的是允许在不实际恢复备份的情况下获取备份的一些信息。

该模块提供以下函数：
- 列举备份中包含的文件
- 从备份中读取文件
- 以可读形式获取有关数据库、表及备份中包含的分区片段的有用信息
- 检查备份的完整性

## 示例: {#example}

```python
from clickhouse_backupview import open_backup, S3, FileInfo


# 打开一个备份。我们也可以使用本地路径：

# backup = open_backup("/backups/my_backup_1/")
backup = open_backup(S3("uri", "access_key_id", "secret_access_key"))


# 获取备份中数据库的列表。
print(backup.get_databases())


# 获取备份中表的列表，

# 并为每个表获取其创建查询以及分区片段和分区的列表。
for db in backup.get_databases():
    for tbl in backup.get_tables(database=db):
        print(backup.get_create_query(database=db, table=tbl))
        print(backup.get_partitions(database=db, table=tbl))
        print(backup.get_parts(database=db, table=tbl))


# 从备份中提取所有内容。
backup.extract_all(table="mydb.mytable", out='/tmp/my_backup_1/all/')


# 提取特定表的数据。
backup.extract_table_data(table="mydb.mytable", out='/tmp/my_backup_1/mytable/')


# 提取单个分区。
backup.extract_table_data(table="mydb.mytable", partition="202201", out='/tmp/my_backup_1/202201/')


# 提取单个分区片段。
backup.extract_table_data(table="mydb.mytable", part="202201_100_200_3", out='/tmp/my_backup_1/202201_100_200_3/')
```

更多示例请参见 [test](https://github.com/ClickHouse/ClickHouse/blob/master/utils/backupview/test/test.py).
