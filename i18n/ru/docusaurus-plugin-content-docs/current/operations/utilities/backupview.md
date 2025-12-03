---
description: 'Документация по clickhouse_backupview {#clickhouse_backupview}'
slug: /operations/utilities/backupview
title: 'clickhouse_backupview'
doc_type: 'reference'
---

# clickhouse_backupview {#clickhouse_backupview}

Модуль Python для анализа бэкапов, созданных командой [BACKUP](/operations/backup).
Основная цель — получить информацию из бэкапа без его фактического восстановления.

Этот модуль предоставляет функции для:
- перечисления файлов, входящих в бэкап
- чтения файлов из бэкапа
- получения в удобном для чтения виде полезной информации о базах данных, таблицах и частях (parts), содержащихся в бэкапе
- проверки целостности бэкапа

## Пример: {#example}

```python
from clickhouse_backupview import open_backup, S3, FileInfo
```

# Откройте резервную копию. Можно также использовать локальный путь: {#open-a-backup-we-could-also-use-a-local-path}
# backup = open_backup("/backups/my_backup_1/") {#backup-open_backupbackupsmy_backup_1}
backup = open_backup(S3("uri", "access_key_id", "secret_access_key"))

# Получить список баз данных в резервной копии. {#get-a-list-of-databasess-inside-the-backup}
print(backup.get_databases()))

# Получить список таблиц, включённых в резервную копию, {#get-a-list-of-tables-inside-the-backup}
# и для каждой таблицы — её запрос CREATE и списки партиций и частей. {#and-for-each-table-its-create-query-and-a-list-of-parts-and-partitions}
for db in backup.get_databases():
    for tbl in backup.get_tables(database=db):
        print(backup.get_create_query(database=db, table=tbl))
        print(backup.get_partitions(database=db, table=tbl))
        print(backup.get_parts(database=db, table=tbl))

# Извлеките всё из резервной копии. {#extract-everything-from-the-backup}
backup.extract_all(table="mydb.mytable", out='/tmp/my_backup_1/all/')

# Извлеките данные конкретной таблицы. {#extract-the-data-of-a-specific-table}
backup.extract_table_data(table="mydb.mytable", out='/tmp/my_backup_1/mytable/')

# Извлечь одну партицию. {#extract-a-single-partition}
backup.extract_table_data(table="mydb.mytable", partition="202201", out='/tmp/my_backup_1/202201/')

# Извлечь отдельную часть. {#extract-a-single-part}

backup.extract&#95;table&#95;data(table=&quot;mydb.mytable&quot;, part=&quot;202201&#95;100&#95;200&#95;3&quot;, out=&#39;/tmp/my&#95;backup&#95;1/202201&#95;100&#95;200&#95;3/&#39;)

```

Дополнительные примеры см. в [тестах](https://github.com/ClickHouse/ClickHouse/blob/master/utils/backupview/test/test.py).
```
