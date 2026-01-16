---
description: 'Этот движок позволяет интегрировать ClickHouse с RocksDB'
sidebar_label: 'EmbeddedRocksDB'
sidebar_position: 50
slug: /engines/table-engines/integrations/embedded-rocksdb
title: 'Табличный движок EmbeddedRocksDB'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Табличный движок EmbeddedRocksDB \{#embeddedrocksdb-table-engine\}

<CloudNotSupportedBadge />

Этот движок позволяет интегрировать ClickHouse с [RocksDB](http://rocksdb.org/).

## Создание таблицы \{#creating-a-table\}

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

* `ttl` — время жизни значений. TTL задаётся в секундах. Если TTL равен 0, используется обычный экземпляр RocksDB (без TTL).
* `rocksdb_dir` — путь к каталогу существующей базы RocksDB или целевой путь для создаваемой базы RocksDB. Таблица открывается с указанным `rocksdb_dir`.
* `read_only` — если `read_only` установлен в true, используется режим только для чтения. Для хранилища с TTL компакция (compaction) не будет запускаться (ни вручную, ни автоматически), поэтому просроченные записи не удаляются.
* `primary_key_name` — имя любого столбца из списка столбцов.
* `primary key` должен быть указан; в состав первичного ключа может входить только один столбец. Первичный ключ будет сериализован в бинарном виде как `rocksdb key`.
* столбцы, отличные от первичного ключа, будут сериализованы в бинарном виде как `rocksdb value` в соответствующем порядке.
* запросы с фильтрацией по ключу с использованием `equals` или `in` будут оптимизированы до поиска по нескольким ключам в `rocksdb`.

Настройки движка:

* `optimize_for_bulk_insert` — таблица оптимизирована для пакетных вставок (конвейер вставки будет создавать SST-файлы и импортировать их в базу данных RocksDB вместо записи в memtable); значение по умолчанию: `1`.
* `bulk_insert_block_size` — минимальный размер SST-файлов (в терминах числа строк), создаваемых пакетной вставкой; значение по умолчанию: `1048449`.

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

## Метрики \{#metrics\}

Кроме того, есть таблица `system.rocksdb`, содержащая статистику RocksDB:

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

## Конфигурация \{#configuration\}

Вы также можете изменить любые [параметры RocksDB](https://github.com/facebook/rocksdb/wiki/Option-String-and-Option-Map) с помощью конфигурации:

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

По умолчанию тривиальная оптимизация приблизительного подсчёта отключена, что может снизить производительность запросов `count()`. Чтобы включить эту оптимизацию, установите `optimize_trivial_approximate_count_query = 1`. Также этот параметр влияет на `system.tables` для движка EmbeddedRocksDB — включите его, чтобы увидеть приблизительные значения для `total_rows` и `total_bytes`.

## Поддерживаемые операции \{#supported-operations\}

### Вставки \{#inserts\}

При вставке новых строк в `EmbeddedRocksDB`, если ключ уже существует, его значение обновляется, иначе создаётся новый ключ.

Пример:

```sql
INSERT INTO test VALUES ('some key', 1, 'value', 3.2);
```

### Удаление \{#deletes\}

Строки можно удалять с помощью запросов `DELETE` или `TRUNCATE`.

```sql
DELETE FROM test WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE test DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE test;
```

### Обновления \{#updates\}

Значения можно обновлять с помощью запроса `ALTER TABLE`. Первичный ключ нельзя изменять.

```sql
ALTER TABLE test UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

### Соединения \{#joins\}

Поддерживается специальный тип соединения `direct` с таблицами EmbeddedRocksDB.
Такое прямое соединение позволяет избежать формирования хеш-таблицы в памяти и
обращается к данным напрямую из EmbeddedRocksDB.

При больших соединениях вы можете наблюдать значительно более низкое потребление памяти
при использовании прямых соединений, поскольку хеш-таблица не создаётся.

Чтобы включить прямые соединения:

```sql
SET join_algorithm = 'direct, hash'
```

:::tip
Когда параметр `join_algorithm` установлен в значение `direct, hash`, по возможности будут использоваться прямые соединения, а в остальных случаях — хеш-соединения.
:::

#### Пример \{#example\}

##### Создание и заполнение таблицы EmbeddedRocksDB \{#create-and-populate-an-embeddedrocksdb-table\}

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

##### Создайте и заполните таблицу для объединения с таблицей `rdb` \{#create-and-populate-a-table-to-join-with-table-rdb\}

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

##### Установите алгоритм соединения в значение `direct` \{#set-the-join-algorithm-to-direct\}

```sql
SET join_algorithm = 'direct'
```

##### Внутреннее соединение (INNER JOIN) \{#an-inner-join\}

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

### Подробнее о соединениях \{#more-information-on-joins\}

* [настройка `join_algorithm`](/operations/settings/settings.md#join_algorithm)
* [оператор JOIN](/sql-reference/statements/select/join.md)
