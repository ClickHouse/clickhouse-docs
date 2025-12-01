---
description: 'clickhouse_backupview 文档 {#clickhouse_backupview}'
slug: /operations/utilities/backupview
title: 'clickhouse_backupview'
doc_type: 'reference'
---



# clickhouse_backupview {#clickhouse_backupview}

用于分析由 [BACKUP](/operations/backup) 命令创建的备份的 Python 模块。
主要目的是在不实际恢复备份的情况下，从备份中获取部分信息。

该模块提供的功能包括：
- 枚举备份中包含的文件
- 读取备份中的文件
- 以可读形式获取有关备份中包含的数据库、表和数据分片的有用信息
- 检查备份的完整性



## 示例： {#example}

```python
from clickhouse_backupview import open_backup, S3, FileInfo
```


# 打开备份。同样也可以使用本地路径： {#open-a-backup-we-could-also-use-a-local-path}
# backup = open_backup("/backups/my_backup_1/") {#backup-open_backupbackupsmy_backup_1}
backup = open_backup(S3("uri", "access_key_id", "secret_access_key"))



# 获取备份中的数据库列表。 {#get-a-list-of-databasess-inside-the-backup}
print(backup.get_databases()))



# 获取备份中的表列表， {#get-a-list-of-tables-inside-the-backup}
# 并针对每个表输出其创建语句以及分区和数据分片列表。 {#and-for-each-table-its-create-query-and-a-list-of-parts-and-partitions}
for db in backup.get_databases():
    for tbl in backup.get_tables(database=db):
        print(backup.get_create_query(database=db, table=tbl))
        print(backup.get_partitions(database=db, table=tbl))
        print(backup.get_parts(database=db, table=tbl))



# 从备份中提取全部内容。 {#extract-everything-from-the-backup}
backup.extract_all(table="mydb.mytable", out='/tmp/my_backup_1/all/')



# 提取指定表的数据。 {#extract-the-data-of-a-specific-table}
backup.extract_table_data(table="mydb.mytable", out='/tmp/my_backup_1/mytable/')



# 导出单个分区的数据。 {#extract-a-single-partition}
backup.extract_table_data(table="mydb.mytable", partition="202201", out='/tmp/my_backup_1/202201/')



# 提取单个数据分片。 {#extract-a-single-part}

backup.extract&#95;table&#95;data(table=&quot;mydb.mytable&quot;, part=&quot;202201&#95;100&#95;200&#95;3&quot;, out=&#39;/tmp/my&#95;backup&#95;1/202201&#95;100&#95;200&#95;3/&#39;)

```

更多示例请参阅 [test](https://github.com/ClickHouse/ClickHouse/blob/master/utils/backupview/test/test.py)。
```
