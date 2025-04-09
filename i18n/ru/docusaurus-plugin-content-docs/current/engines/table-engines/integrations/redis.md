---
description: 'Этот движок позволяет интегрировать ClickHouse с Redis.'
sidebar_label: 'Redis'
sidebar_position: 175
slug: /engines/table-engines/integrations/redis
title: 'Redis'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Redis

<CloudNotSupportedBadge/>

Этот движок позволяет интегрировать ClickHouse с [Redis](https://redis.io/). Поскольку Redis использует модель ключ-значение, мы настоятельно рекомендуем выполнять запросы точечно, например, `where k=xx` или `where k in (xx, xx)`.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = Redis({host:port[, db_index[, password[, pool_size]]] | named_collection[, option=value [,..]] })
PRIMARY KEY(primary_key_name);
```

**Параметры движка**

- `host:port` — адрес сервера Redis, вы можете игнорировать порт, по умолчанию будет использоваться стандартный порт Redis 6379.
- `db_index` — индекс базы данных Redis в диапазоне от 0 до 15, по умолчанию 0.
- `password` — пароль пользователя, по умолчанию пустая строка.
- `pool_size` — максимальный размер пула подключений Redis, по умолчанию 16.
- `primary_key_name` - любое имя колонки из списка колонок.

:::note Сериализация
`PRIMARY KEY` поддерживает только одну колонку. Первичный ключ будет сериализован в двоичном виде как ключ Redis. Колонки, отличные от первичного ключа, будут сериализованы в двоичном виде как значение Redis в соответствующем порядке.
:::

Аргументы также могут быть переданы с использованием [именованных коллекций](/operations/named-collections.md). В этом случае `host` и `port` должны быть указаны отдельно. Этот подход рекомендуется для производственной среды. В данный момент все параметры, переданные через именованные коллекции в Redis, являются обязательными.

:::note Фильтрация
Запросы с `key equals` или `in filtering` будут оптимизированы для многократного поиска ключей в Redis. Если запросы без фильтрации ключа, произойдет полное сканирование таблицы, что является тяжелой операцией.
:::

## Пример использования {#usage-example}

Создайте таблицу в ClickHouse, используя движок `Redis` с простыми аргументами:

```sql
CREATE TABLE redis_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = Redis('redis1:6379') PRIMARY KEY(key);
```

Или используя [именованные коллекции](/operations/named-collections.md):

```xml
<named_collections>
    <redis_creds>
        <host>localhost</host>
        <port>6379</port>
        <password>****</password>
        <pool_size>16</pool_size>
        <db_index>s0</db_index>
    </redis_creds>
</named_collections>
```

```sql
CREATE TABLE redis_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = Redis(redis_creds) PRIMARY KEY(key);
```

Вставка:

```sql
INSERT INTO redis_table Values('1', 1, '1', 1.0), ('2', 2, '2', 2.0);
```

Запрос:

```sql
SELECT COUNT(*) FROM redis_table;
```

```text
┌─count()─┐
│       2 │
└─────────┘
```

```sql
SELECT * FROM redis_table WHERE key='1';
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 1   │  1 │ 1  │  1 │
└─────┴────┴────┴────┘
```

```sql
SELECT * FROM redis_table WHERE v1=2;
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 2   │  2 │ 2  │  2 │
└─────┴────┴────┴────┘
```

Обновление:

Обратите внимание, что первичный ключ нельзя обновить.

```sql
ALTER TABLE redis_table UPDATE v1=2 WHERE key='1';
```

Удаление:

```sql
ALTER TABLE redis_table DELETE WHERE key='1';
```

Усечение:

Асинхронно очистить базу данных Redis. Также `Truncate` поддерживает режим SYNC.

```sql
TRUNCATE TABLE redis_table SYNC;
```

Соединение:

Соединение с другими таблицами.

```sql
SELECT * FROM redis_table JOIN merge_tree_table ON merge_tree_table.key=redis_table.key;
```

## Ограничения {#limitations}

Движок Redis также поддерживает запросы сканирования, такие как `where k > xx`, но у него есть некоторые ограничения:
1. Запрос на сканирование может привести к появлению дублирующих ключей в очень редких случаях при ре-хешировании. См. подробности в [Redis Scan](https://github.com/redis/redis/blob/e4d183afd33e0b2e6e8d1c79a832f678a04a7886/src/dict.c#L1186-L1269).
2. Во время сканирования ключи могут создаваться и удаляться, поэтому результирующий набор данных не может представлять собой действительную точку во времени.
