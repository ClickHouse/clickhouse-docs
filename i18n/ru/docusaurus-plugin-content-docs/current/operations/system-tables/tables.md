---
description: 'Системная таблица, содержащая метаданные каждой таблицы, известной серверу.'
keywords: ['системная таблица', 'таблицы']
slug: /operations/system-tables/tables
title: 'system.tables'
doc_type: 'reference'
---

# system.tables \{#systemtables\}

Содержит метаданные для каждой таблицы, известной серверу.

[Отсоединённые](../../sql-reference/statements/detach.md) таблицы не отображаются в `system.tables`.

[Временные таблицы](../../sql-reference/statements/create/table.md#temporary-tables) видны в `system.tables` только в тех сессиях, в которых они были созданы. Они отображаются с пустым полем `database` и с включённым флагом `is_temporary`.

Столбцы:

* `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных, в которой находится таблица.

* `name` ([String](../../sql-reference/data-types/string.md)) — имя таблицы.

* `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID таблицы (база данных Atomic).

* `engine` ([String](../../sql-reference/data-types/string.md)) — Имя движка таблицы (без параметров).

* `is_temporary` ([UInt8](../../sql-reference/data-types/int-uint.md)) — флаг, указывающий, является ли таблица временной.

* `data_paths` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Пути к данным таблицы в файловой системе.

* `metadata_path` ([String](../../sql-reference/data-types/string.md)) - Путь к метаданным таблицы в файловой системе.

* `metadata_modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - время последнего изменения метаданных таблицы.

* `metadata_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — версия метаданных для таблиц ReplicatedMergeTree, 0 для таблиц других типов.

* `dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Зависимости от баз данных.

* `dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Зависимости таблицы (материализованные [представления](/sql-reference/statements/create/view#materialized-view), зависящие от текущей таблицы).

* `create_table_query` ([String](../../sql-reference/data-types/string.md)) - Запрос, использованный для создания таблицы.

* `engine_full` ([String](../../sql-reference/data-types/string.md)) - Параметры движка таблицы.

* `as_select` ([String](../../sql-reference/data-types/string.md)) - запрос `SELECT` для представления.

* `parameterized_view_parameters` ([Array](../../sql-reference/data-types/array.md) типа [Tuple](../../sql-reference/data-types/tuple.md)) — параметры параметризованного представления.

* `partition_key` ([String](../../sql-reference/data-types/string.md)) — выражение ключа партиционирования, заданное в таблице.

* `sorting_key` ([String](../../sql-reference/data-types/string.md)) — выражение ключа сортировки, заданное для таблицы.

* `primary_key` ([String](../../sql-reference/data-types/string.md)) — выражение первичного ключа, указанное для таблицы.

* `sampling_key` ([String](../../sql-reference/data-types/string.md)) — выражение ключа выборки, заданное в таблице.

* `storage_policy` ([String](../../sql-reference/data-types/string.md)) - Политика хранения:

  * [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)
  * [Distributed](/engines/table-engines/special/distributed)

* `total_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - Общее число строк, если можно быстро определить точное количество строк в таблице, иначе `NULL` (включая строки в базовой таблице `Buffer`).

* `total_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - Общее число байт (включая индексы и проекции), если можно быстро определить точное количество байт для таблицы в хранилище, иначе `NULL` (не включает данные в каком-либо базовом хранилище).

  * Если таблица хранит данные на диске, возвращает используемое место на диске (в сжатом виде).
  * Если таблица хранит данные в памяти, возвращает приблизительный объём используемой памяти в байтах.

* `total_bytes_uncompressed` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество несжатых байт (включая индексы и проекции), если можно быстро определить точное количество байт по контрольным суммам кусков таблицы в хранилище, иначе `NULL` (не учитывает базовое хранилище, если оно есть).

* `lifetime_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — общее количество строк, вставленных с момента запуска сервера (только для таблиц `Buffer`).

* `lifetime_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - Общее количество байт, записанных операциями INSERT с момента запуска сервера (только для таблиц типа `Buffer`).

* `comment` ([String](../../sql-reference/data-types/string.md)) - Комментарий к таблице.

* `has_own_data` ([UInt8](../../sql-reference/data-types/int-uint.md)) — флаг, указывающий, хранит ли сама таблица данные на диске или только обращается к другому источнику.

* `loading_dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Зависимости при загрузке базы данных (список объектов, которые должны быть загружены до текущего объекта).

* `loading_dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Зависимости загрузки таблицы (список объектов, которые должны быть загружены до текущего объекта).

* `loading_dependent_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Базы данных, от загрузки которых зависит текущая.

* `loading_dependent_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Таблица, от которой зависит загрузка.

Таблица `system.tables` используется при реализации запроса `SHOW TABLES`.

**Пример**

```sql
SELECT * FROM system.tables LIMIT 2 FORMAT Vertical;
```

```text
Row 1:
──────
database:                   base
name:                       t1
uuid:                       81b1c20a-b7c6-4116-a2ce-7583fb6b6736
engine:                     MergeTree
is_temporary:               0
data_paths:                 ['/var/lib/clickhouse/store/81b/81b1c20a-b7c6-4116-a2ce-7583fb6b6736/']
metadata_path:              /var/lib/clickhouse/store/461/461cf698-fd0b-406d-8c01-5d8fd5748a91/t1.sql
metadata_modification_time: 2021-01-25 19:14:32
dependencies_database:      []
dependencies_table:         []
create_table_query:         CREATE TABLE base.t1 (`n` UInt64) ENGINE = MergeTree ORDER BY n
engine_full:                MergeTree ORDER BY n
as_select:                  SELECT database AS table_catalog
partition_key:
sorting_key:                n
primary_key:                n
sampling_key:
storage_policy:             default
total_rows:                 1
total_bytes:                99
lifetime_rows:              ᴺᵁᴸᴸ
lifetime_bytes:             ᴺᵁᴸᴸ
comment:
has_own_data:               0
loading_dependencies_database: []
loading_dependencies_table:    []
loading_dependent_database:    []
loading_dependent_table:       []

Row 2:
──────
database:                   default
name:                       53r93yleapyears
uuid:                       00000000-0000-0000-0000-000000000000
engine:                     MergeTree
is_temporary:               0
data_paths:                 ['/var/lib/clickhouse/data/default/53r93yleapyears/']
metadata_path:              /var/lib/clickhouse/metadata/default/53r93yleapyears.sql
metadata_modification_time: 2020-09-23 09:05:36
dependencies_database:      []
dependencies_table:         []
create_table_query:         CREATE TABLE default.`53r93yleapyears` (`id` Int8, `febdays` Int8) ENGINE = MergeTree ORDER BY id
engine_full:                MergeTree ORDER BY id
as_select:                  SELECT name AS catalog_name
partition_key:
sorting_key:                id
primary_key:                id
sampling_key:
storage_policy:             default
total_rows:                 2
total_bytes:                155
lifetime_rows:              ᴺᵁᴸᴸ
lifetime_bytes:             ᴺᵁᴸᴸ
comment:
has_own_data:               0
loading_dependencies_database: []
loading_dependencies_table:    []
loading_dependent_database:    []
loading_dependent_table:       []
```
