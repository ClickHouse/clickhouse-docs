```sql
-- 核心命令
BACKUP | RESTORE [ASYNC]
--- 备份/恢复的对象(或排除的对象)
TABLE [db.]table_name           [AS [db.]table_name_in_backup] |
DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup] |
DATABASE database_name          [AS database_name_in_backup] |
TEMPORARY TABLE table_name      [AS table_name_in_backup] |
VIEW view_name                  [AS view_name_in_backup] |
[EXCEPT TABLES ...] |
ALL [EXCEPT {TABLES|DATABASES}...] } [,...]
--- 
[ON CLUSTER 'cluster_name']
--- 备份或恢复的目标位置或源位置
TO|FROM 
File('<path>/<filename>') | 
Disk('<disk_name>', '<path>/') | 
S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>', '<extra_credentials>') |
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
--- 附加设置
[SETTINGS ...]
```

**有关各命令的详细信息，请参阅[《命令汇总》](/operations/backup/overview/#command-summary)。**
