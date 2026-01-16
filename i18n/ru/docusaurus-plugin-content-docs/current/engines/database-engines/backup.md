---
description: 'Позволяет мгновенно подключать таблицы и базы данных из резервных копий в режиме только чтения.'
sidebar_label: 'Backup'
sidebar_position: 60
slug: /engines/database-engines/backup
title: 'Backup'
doc_type: 'reference'
---

# Backup \\{#backup\\}

База данных Backup позволяет мгновенно подключить таблицу или базу данных из [резервных копий](/operations/backup/overview) в режиме только для чтения.

База данных Backup работает как с инкрементными, так и с неинкрементными резервными копиями.

## Создание базы данных \{#creating-a-database\}

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

Назначением резервной копии может быть любой допустимый [пункт назначения](/operations/backup/disk#configure-backup-destinations-for-disk), например `Disk`, `S3`, `File`.

Если в качестве пункта назначения резервной копии используется `Disk`, запрос на создание базы данных из резервной копии выглядит следующим образом:

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name'))
```

**Параметры движка**

* `database_name_inside_backup` — Имя базы данных внутри резервной копии.
* `backup_destination` — Место размещения резервной копии.


## Пример использования \{#usage-example\}

Рассмотрим пример с местом назначения резервных копий типа `Disk`. Сначала настроим диск для резервных копий в `storage.xml`:

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

Пример использования. Давайте создадим тестовую базу данных и таблицы, вставим немного данных, а затем создадим резервную копию:

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

Теперь, когда у нас есть резервная копия `test_database_backup`, создадим базу данных из этой резервной копии:

```sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

Теперь мы можем выполнять запросы к любым таблицам из базы данных:

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

Также можно работать с этой резервной копией базы данных как с обычной базой. Например, выполнять в ней запросы к таблицам:

```sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup':

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
