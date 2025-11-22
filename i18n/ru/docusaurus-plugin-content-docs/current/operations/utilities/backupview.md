---
description: 'Документация по clickhouse_backupview {#clickhouse_backupview}'
slug: /operations/utilities/backupview
title: 'clickhouse_backupview'
doc_type: 'reference'
---



# clickhouse_backupview {#clickhouse_backupview}

Модуль Python для анализа резервных копий, созданных командой [BACKUP](/operations/backup).
Основная задача — получение информации из резервной копии без её фактического восстановления.

Модуль предоставляет функции для

- перечисления файлов, содержащихся в резервной копии
- чтения файлов из резервной копии
- получения полезной информации в удобочитаемом виде о базах данных, таблицах и партициях, содержащихся в резервной копии
- проверки целостности резервной копии


## Пример {#example}

```python
from clickhouse_backupview import open_backup, S3, FileInfo

```


# Открываем резервную копию. Можно также использовать локальный путь:
# backup = open_backup("/backups/my_backup_1/")
backup = open_backup(S3("uri", "access_key_id", "secret_access_key"))



# Получить список баз данных в резервной копии.
print(backup.get_databases()))



# Получить список таблиц в резервной копии,
# и для каждой таблицы — её запрос CREATE и список частей и партиций.
for db in backup.get_databases():
    for tbl in backup.get_tables(database=db):
        print(backup.get_create_query(database=db, table=tbl))
        print(backup.get_partitions(database=db, table=tbl))
        print(backup.get_parts(database=db, table=tbl))



# Извлеките всё из резервной копии.
backup.extract_all(table="mydb.mytable", out='/tmp/my_backup_1/all/')



# Извлечь данные определённой таблицы.
backup.extract_table_data(table="mydb.mytable", out='/tmp/my_backup_1/mytable/')



# Извлечение одной партиции.
backup.extract_table_data(table="mydb.mytable", partition="202201", out='/tmp/my_backup_1/202201/')



# Извлечение одной части.

backup.extract&#95;table&#95;data(table=&quot;mydb.mytable&quot;, part=&quot;202201&#95;100&#95;200&#95;3&quot;, out=&#39;/tmp/my&#95;backup&#95;1/202201&#95;100&#95;200&#95;3/&#39;)

```

Дополнительные примеры см. в [тестах](https://github.com/ClickHouse/ClickHouse/blob/master/utils/backupview/test/test.py).
```
