---
description: 'Документация по Словарю'
sidebar_label: 'DICTIONARY'
sidebar_position: 38
slug: /sql-reference/statements/create/dictionary
title: 'CREATE DICTIONARY'
---

Создает новый [словарь](../../../sql-reference/dictionaries/index.md) с заданной [структурой](../../../sql-reference/dictionaries/index.md#dictionary-key-and-fields), [источником](../../../sql-reference/dictionaries/index.md#dictionary-sources), [расположением](/sql-reference/dictionaries#storing-dictionaries-in-memory) и [временной жизнью](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime).

## Синтаксис {#syntax}

```sql
CREATE [OR REPLACE] DICTIONARY [IF NOT EXISTS] [db.]dictionary_name [ON CLUSTER cluster]
(
    key1 type1  [DEFAULT|EXPRESSION expr1] [IS_OBJECT_ID],
    key2 type2  [DEFAULT|EXPRESSION expr2],
    attr1 type2 [DEFAULT|EXPRESSION expr3] [HIERARCHICAL|INJECTIVE],
    attr2 type2 [DEFAULT|EXPRESSION expr4] [HIERARCHICAL|INJECTIVE]
)
PRIMARY KEY key1, key2
SOURCE(SOURCE_NAME([param1 value1 ... paramN valueN]))
LAYOUT(LAYOUT_NAME([param_name param_value]))
LIFETIME({MIN min_val MAX max_val | max_val})
SETTINGS(setting_name = setting_value, setting_name = setting_value, ...)
COMMENT 'Комментарий'
```

Структура словаря состоит из атрибутов. Атрибуты словаря задаются аналогично столбцам таблицы. Единственным обязательным свойством атрибута является его тип, все остальные свойства могут иметь значения по умолчанию.

Клаузула `ON CLUSTER` позволяет создавать словарь в кластере, см. [Распределенный DDL](../../../sql-reference/distributed-ddl.md).

В зависимости от [расположения](/sql-reference/dictionaries#storing-dictionaries-in-memory) словаря один или несколько атрибутов могут быть указаны в качестве ключей словаря.

## SOURCE {#source}

Источник для словаря может быть:
- таблица в текущем сервисе ClickHouse
- таблица в удаленном сервисе ClickHouse
- файл, доступный по HTTP(S)
- другая база данных

### Создание словаря из таблицы в текущем сервисе ClickHouse {#create-a-dictionary-from-a-table-in-the-current-clickhouse-service}

Входная таблица `source_table`:

```text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

Создание словаря:

```sql
CREATE DICTIONARY id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000)
```

Вывод словаря:

```sql
SHOW CREATE DICTIONARY id_value_dictionary;
```

```response
CREATE DICTIONARY default.id_value_dictionary
(
    `id` UInt64,
    `value` String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table'))
LIFETIME(MIN 0 MAX 1000)
LAYOUT(FLAT())
```

:::note
При использовании SQL-консоли в [ClickHouse Cloud](https://clickhouse.com) вы должны указать пользователя (`default` или любого другого пользователя с ролью `default_role`) и пароль при создании словаря.
:::

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'passworD43$x';

GRANT default_role TO clickhouse_admin;

CREATE DATABASE foo_db;

CREATE TABLE foo_db.source_table (
    id UInt64,
    value String
) ENGINE = MergeTree
PRIMARY KEY id;

CREATE DICTIONARY foo_db.id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table' USER 'clickhouse_admin' PASSWORD 'passworD43$x' DB 'foo_db' ))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000);
```

### Создание словаря из таблицы в удаленном сервисе ClickHouse {#create-a-dictionary-from-a-table-in-a-remote-clickhouse-service}

Входная таблица (в удаленном сервисе ClickHouse) `source_table`:

```text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

Создание словаря:

```sql
CREATE DICTIONARY id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'HOSTNAME' PORT 9000 USER 'default' PASSWORD 'PASSWORD' TABLE 'source_table' DB 'default'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000)
```

### Создание словаря из файла, доступного по HTTP(S) {#create-a-dictionary-from-a-file-available-by-https}

```sql
CREATE DICTIONARY default.taxi_zone_dictionary
(
    `LocationID` UInt16 DEFAULT 0,
    `Borough` String,
    `Zone` String,
    `service_zone` String
)
PRIMARY KEY LocationID
SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(HASHED())
```

### Создание словаря из другой базы данных {#create-a-dictionary-from-another-database}

Пожалуйста, смотрите детали в [Источники словаря](/sql-reference/dictionaries#dbms).

**Смотрите также**

- Для получения дополнительной информации смотрите раздел [Словари](../../../sql-reference/dictionaries/index.md).
- [system.dictionaries](../../../operations/system-tables/dictionaries.md) — Эта таблица содержит информацию о [Словарях](../../../sql-reference/dictionaries/index.md).
