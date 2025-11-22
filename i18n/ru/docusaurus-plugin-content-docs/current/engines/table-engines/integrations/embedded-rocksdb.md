---
description: 'Этот движок позволяет интегрировать ClickHouse с RocksDB'
sidebar_label: 'EmbeddedRocksDB'
sidebar_position: 50
slug: /engines/table-engines/integrations/embedded-rocksdb
title: 'Движок таблицы EmbeddedRocksDB'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Табличный движок EmbeddedRocksDB

<CloudNotSupportedBadge />

Этот движок позволяет интегрировать ClickHouse с [RocksDB](http://rocksdb.org/).



## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = EmbeddedRocksDB([ttl, rocksdb_dir, read_only]) PRIMARY KEY(primary_key_name)
[ SETTINGS name=value, ... ]
```

Параметры движка:

- `ttl` — время жизни значений. TTL указывается в секундах. Если TTL равен 0, используется обычный экземпляр RocksDB (без TTL).
- `rocksdb_dir` — путь к каталогу существующей базы данных RocksDB или путь назначения для создаваемой базы данных RocksDB. Открывает таблицу с указанным `rocksdb_dir`.
- `read_only` — если параметр `read_only` установлен в true, используется режим только для чтения. Для хранилища с TTL сжатие не будет запускаться (ни вручную, ни автоматически), поэтому устаревшие записи не удаляются.
- `primary_key_name` — любое имя столбца из списка столбцов.
- `primary key` должен быть указан, поддерживается только один столбец в первичном ключе. Первичный ключ будет сериализован в бинарном виде как `rocksdb key`.
- столбцы, отличные от первичного ключа, будут сериализованы в бинарном виде как значение `rocksdb` в соответствующем порядке.
- запросы с фильтрацией по ключу `equals` или `in` будут оптимизированы для поиска по нескольким ключам в `rocksdb`.

Настройки движка:

- `optimize_for_bulk_insert` — таблица оптимизирована для массовых вставок (конвейер вставки будет создавать SST-файлы и импортировать их в базу данных rocksdb вместо записи в memtables); значение по умолчанию: `1`.
- `bulk_insert_block_size` — минимальный размер SST-файлов (в строках), создаваемых при массовой вставке; значение по умолчанию: `1048449`.

Пример:

```sql
CREATE TABLE test
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = EmbeddedRocksDB
PRIMARY KEY key
```


## Метрики {#metrics}

Также существует таблица `system.rocksdb`, которая предоставляет статистику RocksDB:

```sql
SELECT
    name,
    value
FROM system.rocksdb

┌─name──────────────────────┬─value─┐
│ no.file.opens             │     1 │
│ number.block.decompressed │     1 │
└───────────────────────────┴───────┘
```


## Конфигурация {#configuration}

Вы также можете изменить любые [параметры rocksdb](https://github.com/facebook/rocksdb/wiki/Option-String-and-Option-Map) с помощью конфигурационного файла:

```xml
<rocksdb>
    <options>
        <max_background_jobs>8</max_background_jobs>
    </options>
    <column_family_options>
        <num_levels>2</num_levels>
    </column_family_options>
    <tables>
        <table>
            <name>TABLE</name>
            <options>
                <max_background_jobs>8</max_background_jobs>
            </options>
            <column_family_options>
                <num_levels>2</num_levels>
            </column_family_options>
        </table>
    </tables>
</rocksdb>
```

По умолчанию оптимизация тривиального приблизительного подсчёта отключена, что может негативно сказаться на производительности запросов `count()`. Чтобы включить эту оптимизацию, установите `optimize_trivial_approximate_count_query = 1`. Также эта настройка влияет на `system.tables` для движка EmbeddedRocksDB — включите её, чтобы видеть приблизительные значения для `total_rows` и `total_bytes`.


## Поддерживаемые операции {#supported-operations}

### Вставка данных {#inserts}

При вставке новых строк в `EmbeddedRocksDB`, если ключ уже существует, значение будет обновлено, в противном случае будет создан новый ключ.

Пример:

```sql
INSERT INTO test VALUES ('some key', 1, 'value', 3.2);
```

### Удаление данных {#deletes}

Строки можно удалить с помощью запроса `DELETE` или `TRUNCATE`.

```sql
DELETE FROM test WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE test DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE test;
```

### Обновление данных {#updates}

Значения можно обновить с помощью запроса `ALTER TABLE`. Первичный ключ обновить нельзя.

```sql
ALTER TABLE test UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

### Соединения {#joins}

Поддерживается специальное соединение `direct` с таблицами EmbeddedRocksDB.
Такое прямое соединение позволяет избежать формирования хеш-таблицы в памяти и обращается
к данным напрямую из EmbeddedRocksDB.

При больших соединениях использование прямых соединений может значительно снизить потребление памяти,
поскольку хеш-таблица не создается.

Чтобы включить прямые соединения:

```sql
SET join_algorithm = 'direct, hash'
```

:::tip
Когда параметр `join_algorithm` установлен в `direct, hash`, прямые соединения будут использоваться
по возможности, в остальных случаях — хеш-соединения.
:::

#### Пример {#example}

##### Создание и заполнение таблицы EmbeddedRocksDB {#create-and-populate-an-embeddedrocksdb-table}

```sql
CREATE TABLE rdb
(
    `key` UInt32,
    `value` Array(UInt32),
    `value2` String
)
ENGINE = EmbeddedRocksDB
PRIMARY KEY key
```

```sql
INSERT INTO rdb
    SELECT
        toUInt32(sipHash64(number) % 10) AS key,
        [key, key+1] AS value,
        ('val2' || toString(key)) AS value2
    FROM numbers_mt(10);
```

##### Создание и заполнение таблицы для соединения с таблицей `rdb` {#create-and-populate-a-table-to-join-with-table-rdb}

```sql
CREATE TABLE t2
(
    `k` UInt16
)
ENGINE = TinyLog
```

```sql
INSERT INTO t2 SELECT number AS k
FROM numbers_mt(10)
```

##### Установка алгоритма соединения в `direct` {#set-the-join-algorithm-to-direct}

```sql
SET join_algorithm = 'direct'
```

##### INNER JOIN {#an-inner-join}

```sql
SELECT *
FROM
(
    SELECT k AS key
    FROM t2
) AS t2
INNER JOIN rdb ON rdb.key = t2.key
ORDER BY key ASC
```

```response
┌─key─┬─rdb.key─┬─value──┬─value2─┐
│   0 │       0 │ [0,1]  │ val20  │
│   2 │       2 │ [2,3]  │ val22  │
│   3 │       3 │ [3,4]  │ val23  │
│   6 │       6 │ [6,7]  │ val26  │
│   7 │       7 │ [7,8]  │ val27  │
│   8 │       8 │ [8,9]  │ val28  │
│   9 │       9 │ [9,10] │ val29  │
└─────┴─────────┴────────┴────────┘
```

### Дополнительная информация о соединениях {#more-information-on-joins}

- [Настройка `join_algorithm`](/operations/settings/settings.md#join_algorithm)
- [Секция JOIN](/sql-reference/statements/select/join.md)
