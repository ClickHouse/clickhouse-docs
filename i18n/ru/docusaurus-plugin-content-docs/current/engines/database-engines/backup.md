---
description: 'Позволяет мгновенно прикрепить таблицу/база данных из резервных копий в режиме только для чтения.'
sidebar_label: 'Backup'
sidebar_position: 60
slug: /engines/database-engines/backup
title: 'Backup'
---


# Backup

Резервное копирование базы данных позволяет мгновенно прикрепить таблицу/базу данных из [резервных копий](../../operations/backup) в режиме только для чтения.

Резервное копирование базы данных работает как с инкрементными, так и с неинкрементными резервными копиями.

## Создание базы данных {#creating-a-database}

```sql
    CREATE DATABASE backup_database
    ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

Место назначения резервной копии может быть любым допустимым [местом назначения](../../operations/backup#configure-a-backup-destination) для резервного копирования, например `Disk`, `S3`, `File`.

При использовании в качестве места назначения резервного копирования `Disk`, запрос на создание базы данных из резервной копии выглядит следующим образом:

```sql
    CREATE DATABASE backup_database
    ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name')
```

**Параметры движка**

- `database_name_inside_backup` — имя базы данных внутри резервной копии.
- `backup_destination` — место назначения резервной копии.

## Пример использования {#usage-example}

Давайте сделаем пример с местом назначения резервной копии `Disk`. Сначала настроим диск для резервного копирования в `storage.xml`:

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

Пример использования. Создадим тестовую базу данных, таблицы, вставим данные, а затем создадим резервную копию:

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

Теперь у нас есть резервная копия `test_database_backup`, создадим базу данных Backup:

```sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

Теперь мы можем запросить любую таблицу из базы данных:

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

Также возможно работать с этой базой данных Backup как с любой обычной базой данных. Например, запросить таблицы в ней:

```sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup':

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
