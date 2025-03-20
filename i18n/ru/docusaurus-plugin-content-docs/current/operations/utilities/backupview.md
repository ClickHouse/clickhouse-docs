---
slug: /operations/utilities/backupview
title: clickhouse_backupview
---


# clickhouse_backupview {#clickhouse_backupview}

Модуль Python для помощи в анализе резервных копий, созданных командой [BACKUP](/operations/backup). 
Основной мотивацией было получение информации из резервной копии без фактического восстановления.

Этот модуль предоставляет функции для
- перечисления файлов, содержащихся в резервной копии
- чтения файлов из резервной копии
- получения полезной информации в читаемом виде о базах данных, таблицах, частях, содержащихся в резервной копии
- проверки целостности резервной копии

## Пример: {#example}

```python
from clickhouse_backupview import open_backup, S3, FileInfo


# Открываем резервную копию. Мы также могли бы использовать локальный путь:

# backup = open_backup("/backups/my_backup_1/")
backup = open_backup(S3("uri", "access_key_id", "secret_access_key"))


# Получаем список баз данных внутри резервной копии.
print(backup.get_databases())


# Получаем список таблиц внутри резервной копии,

# и для каждой таблицы ее запрос на создание и список частей и партиций.
for db in backup.get_databases():
    for tbl in backup.get_tables(database=db):
        print(backup.get_create_query(database=db, table=tbl))
        print(backup.get_partitions(database=db, table=tbl))
        print(backup.get_parts(database=db, table=tbl))


# Извлекаем все из резервной копии.
backup.extract_all(table="mydb.mytable", out='/tmp/my_backup_1/all/')


# Извлекаем данные конкретной таблицы.
backup.extract_table_data(table="mydb.mytable", out='/tmp/my_backup_1/mytable/')


# Извлекаем одну партицию.
backup.extract_table_data(table="mydb.mytable", partition="202201", out='/tmp/my_backup_1/202201/')


# Извлекаем одну часть.
backup.extract_table_data(table="mydb.mytable", part="202201_100_200_3", out='/tmp/my_backup_1/202201_100_200_3/')
```

Для получения дополнительных примеров смотрите [тест](https://github.com/ClickHouse/ClickHouse/blob/master/utils/backupview/test/test.py).
