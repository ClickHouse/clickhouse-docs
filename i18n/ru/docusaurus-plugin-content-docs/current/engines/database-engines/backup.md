---
slug: /engines/database-engines/backup
sidebar_position: 60
sidebar_label: Резервное копирование
title: "Резервное копирование"
description: "Позволяет мгновенно подключать таблицу/базу данных из резервных копий в режиме только для чтения."
---


# Резервное копирование

Резервное копирование базы данных позволяет мгновенно подключать таблицу/базу данных из [резервных копий](../../operations/backup) в режиме только для чтения.

Резервное копирование базы данных работает как с инкрементными, так и с неинкрементными резервными копиями.

## Создание базы данных {#creating-a-database}

``` sql
    CREATE DATABASE backup_database
    ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

Резервное место может быть любым допустимым резервным [назначением](../../operations/backup#configure-a-backup-destination), таким как `Disk`, `S3`, `File`.

При использовании резервного назначения `Disk` запрос на создание базы данных из резервной копии выглядит следующим образом:

``` sql
    CREATE DATABASE backup_database
    ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name'))
```

**Параметры движка**

- `database_name_inside_backup` — Название базы данных внутри резервной копии.
- `backup_destination` — Резервное назначение.

## Пример использования {#usage-example}

Давайте сделаем пример с резервным назначением `Disk`. Сначала настроим диск для резервного копирования в `storage.xml`:

``` xml
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

Пример использования. Давайте создадим тестовую базу данных, таблицы, вставим данные и затем создадим резервную копию:

``` sql
CREATE DATABASE test_database;

CREATE TABLE test_database.test_table_1 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_1 VALUES (0, 'test_database.test_table_1');

CREATE TABLE test_database.test_table_2 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_2 VALUES (0, 'test_database.test_table_2');

CREATE TABLE test_database.test_table_3 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_3 VALUES (0, 'test_database.test_table_3');

BACKUP DATABASE test_database TO Disk('backups', 'test_database_backup');
```

Теперь у нас есть резервная копия `test_database_backup`, давайте создадим базу данных Backup:

``` sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

Теперь мы можем выполнять запросы к любой таблице из базы данных:

``` sql
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

Также возможно работать с этой базой данных Backup как с обычной базой данных. Например, выполнять запросы к таблицам в ней:

``` sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup';

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
