```sql
-- основные команды
BACKUP | RESTORE [ASYNC]
--- что включить в резервную копию/восстановление (или исключить)
TABLE [db.]table_name           [AS [db.]table_name_in_backup] |
DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup] |
DATABASE database_name          [AS database_name_in_backup] |
TEMPORARY TABLE table_name      [AS table_name_in_backup] |
VIEW view_name                  [AS view_name_in_backup] |
[EXCEPT TABLES ...] |
ALL [EXCEPT {TABLES|DATABASES}...] } [,...]
--- 
[ON CLUSTER 'cluster_name']
--- куда сохранять резервную копию или откуда выполнять восстановление
TO|FROM 
File('<path>/<filename>') | 
Disk('<disk_name>', '<path>/') | 
S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>', '<extra_credentials>') |
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
--- дополнительные настройки
[SETTINGS ...]
```

**Дополнительные сведения о каждой команде см. в разделе [&quot;краткий обзор команд&quot;](/operations/backup/overview/#command-summary).**
