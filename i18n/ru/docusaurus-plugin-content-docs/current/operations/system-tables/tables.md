---
description: 'Системная таблица, содержащая метаданные каждой таблицы, о которой знает сервер.'
keywords: ['системная таблица', 'таблицы']
slug: /operations/system-tables/tables
title: 'system.tables'
---


# system.tables

Содержит метаданные каждой таблицы, о которой знает сервер.

[Отсоединенные](../../sql-reference/statements/detach.md) таблицы не отображаются в `system.tables`.

[Временные таблицы](../../sql-reference/statements/create/table.md#temporary-tables) видимы в `system.tables` только в тех сессиях, где они были созданы. Они отображаются с пустым полем `database` и с установленным флагом `is_temporary`.

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных, в которой находится таблица.

- `name` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.

- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID таблицы (атомарная база данных).

- `engine` ([String](../../sql-reference/data-types/string.md)) — Имя движка таблицы (без параметров).

- `is_temporary` ([UInt8](../../sql-reference/data-types/int-uint.md)) - Флаг, указывающий, является ли таблица временной.

- `data_paths` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Пути к данным таблицы в файловых системах.

- `metadata_path` ([String](../../sql-reference/data-types/string.md)) - Путь к метаданным таблицы в файловой системе.

- `metadata_modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - Время последнего изменения метаданных таблицы.

- `metadata_version` ([Int32](../../sql-reference/data-types/int-uint.md)) - Версия метаданных для таблицы ReplicatedMergeTree, 0 для таблицы, не являющейся ReplicatedMergeTree.

- `dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Зависимости базы данных.

- `dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Зависимости таблицы ([материализованные представления](/sql-reference/statements/create/view#materialized-view) текущей таблицы).

- `create_table_query` ([String](../../sql-reference/data-types/string.md)) - Запрос, который был использован для создания таблицы.

- `engine_full` ([String](../../sql-reference/data-types/string.md)) - Параметры движка таблицы.

- `as_select` ([String](../../sql-reference/data-types/string.md)) - Запрос `SELECT` для представления.

- `parameterized_view_parameters` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — Параметры параметризованного представления.

- `partition_key` ([String](../../sql-reference/data-types/string.md)) - Выражение ключа партиции, указанное в таблице.

- `sorting_key` ([String](../../sql-reference/data-types/string.md)) - Выражение ключа сортировки, указанное в таблице.

- `primary_key` ([String](../../sql-reference/data-types/string.md)) - Выражение первичного ключа, указанное в таблице.

- `sampling_key` ([String](../../sql-reference/data-types/string.md)) - Выражение ключа выборки, указанное в таблице.

- `storage_policy` ([String](../../sql-reference/data-types/string.md)) - Политика хранения:

    - [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)
    - [Distributed](/engines/table-engines/special/distributed)

- `total_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - Общее количество строк, если возможно быстро определить точное количество строк в таблице, иначе `NULL` (включая базовую таблицу `Buffer`).

- `total_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - Общее количество байт, если возможно быстро определить точное количество байт для таблицы на хранилище, иначе `NULL` (не включает в себя любое подлежащие хранилище).

    - Если таблица хранит данные на диске, возвращает используемое пространство на диске (т.е. сжатое).
    - Если таблица хранит данные в памяти, возвращает приблизительное количество используемых байт в памяти.

- `total_bytes_uncompressed` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - Общее количество несжатых байт, если возможно быстро определить точное количество байт из контрольных сумм частей для таблицы на хранилище, иначе `NULL` (не учитывает подлежащие хранилище (если таковое имеется)).

- `lifetime_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - Общее количество строк, вставленных с момента старта сервера (только для таблиц `Buffer`).

- `lifetime_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - Общее количество байтов, вставленных с момента старта сервера (только для таблиц `Buffer`).

- `comment` ([String](../../sql-reference/data-types/string.md)) - Комментарий к таблице.

- `has_own_data` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, хранит ли сама таблица какие-либо данные на диске или только обращается к какому-либо другому источнику.

- `loading_dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Зависимости загрузки базы данных (список объектов, которые должны быть загружены перед текущим объектом).

- `loading_dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Зависимости загрузки таблицы (список объектов, которые должны быть загружены перед текущим объектом).

- `loading_dependent_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Зависимая загружаемая база данных.

- `loading_dependent_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - Зависимая загружаемая таблица.

Таблица `system.tables` используется в реализации запроса `SHOW TABLES`.

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
create_table_query:         CREATE TABLE base.t1 (`n` UInt64) ENGINE = MergeTree ORDER BY n SETTINGS index_granularity = 8192
engine_full:                MergeTree ORDER BY n SETTINGS index_granularity = 8192
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
create_table_query:         CREATE TABLE default.`53r93yleapyears` (`id` Int8, `febdays` Int8) ENGINE = MergeTree ORDER BY id SETTINGS index_granularity = 8192
engine_full:                MergeTree ORDER BY id SETTINGS index_granularity = 8192
as_select:                  SELECT name AS catalog_name
partition_key:
sorting_key:                id
primary_key:                id
sampling_key:
storage_policy:             default
total_rows:                 2
total_bytes:                155
lifetime_rows:              ᴺᵁᴸᴸ
lifetime_bytes:             ᴺᵁᴸᴹ
comment:
has_own_data:               0
loading_dependencies_database: []
loading_dependencies_table:    []
loading_dependent_database:    []
loading_dependent_table:       []
```
