---
slug: '/sql-reference/statements/optimize'
sidebar_label: OPTIMIZE
sidebar_position: 47
description: 'Документация для Optimize'
title: 'Оператор OPTIMIZE'
doc_type: reference
---
Этот запрос пытается инициализировать несогласованное слияние частей данных для таблиц. Обратите внимание, что мы обычно не рекомендуем использовать `OPTIMIZE TABLE ... FINAL` (см. эти [документы](/optimize/avoidoptimizefinal)), поскольку его использование предназначено для администрирования, а не для повседневных операций.

:::note
`OPTIMIZE` не может исправить ошибку `Слишком много частей`.
:::

**Синтаксис**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

Запрос `OPTIMIZE` поддерживается для семейства [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) (включая [материализованные представления](/sql-reference/statements/create/view#materialized-view)) и движка [Buffer](../../engines/table-engines/special/buffer.md). Другие движки таблиц не поддерживаются.

Когда `OPTIMIZE` используется с семейством таблиц [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md), ClickHouse создает задачу для слияния и ждет выполнения на всех репликах (если настройка [alter_sync](/operations/settings/settings#alter_sync) установлена на `2`) или на текущей реплике (если настройка [alter_sync](/operations/settings/settings#alter_sync) установлена на `1`).

- Если `OPTIMIZE` не выполняет слияние по какой-либо причине, он не уведомляет клиента. Чтобы включить уведомления, используйте настройку [optimize_throw_if_noop](/operations/settings/settings#optimize_throw_if_noop).
- Если вы указали `PARTITION`, оптимизация выполняется только для указанной партиции. [Как установить выражение партиции](alter/partition.md#how-to-set-partition-expression).
- Если вы указали `FINAL` или `FORCE`, оптимизация выполняется даже тогда, когда все данные уже находятся в одной части. Вы можете контролировать это поведение с помощью [optimize_skip_merged_partitions](/operations/settings/settings#optimize_skip_merged_partitions). Кроме того, слияние принудительно выполняется, даже если происходит конкурирующее слияние.
- Если вы указали `DEDUPLICATE`, тогда полностью идентичные строки (если не указано by-клауза) будут дедуплицированы (все столбцы сравниваются). Это имеет смысл только для движка MergeTree.

Вы можете указать, как долго (в секундах) ждать, пока неактивные реплики выполнят запросы `OPTIMIZE`, с помощью настройки [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note    
Если `alter_sync` установлен на `2` и некоторые реплики не активны более времени, указанного настройкой `replication_wait_for_inactive_replica_timeout`, то выбрасывается исключение `UNFINISHED`.
:::

## BY expression {#by-expression}

Если вы хотите выполнить дедупликацию по кастомному набору столбцов, а не по всем, вы можете явно указать список столбцов или использовать любую комбинацию из [`*`](../../sql-reference/statements/select/index.md#asterisk), [`COLUMNS`](/sql-reference/statements/select#select-clause) или [`EXCEPT`](/sql-reference/statements/select/except-modifier) выражений. Явно указанный или неявно расширенный список столбцов должен содержать все столбцы, указанные в выражении упорядочивания строк (как первичные, так и ключи сортировки) и в выражении партиционирования (ключ партиционирования).

:::note    
Обратите внимание, что `*` ведет себя так же, как в `SELECT`: [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) и [ALIAS](../../sql-reference/statements/create/table.md#alias) столбцы не используются для расширения.

Также является ошибкой указывать пустой список столбцов или писать выражение, которое приводит к пустому списку столбцов, или дедуплицировать по столбцу `ALIAS`.
:::

**Синтаксис**

```sql
OPTIMIZE TABLE table DEDUPLICATE; -- all columns
OPTIMIZE TABLE table DEDUPLICATE BY *; -- excludes MATERIALIZED and ALIAS columns
OPTIMIZE TABLE table DEDUPLICATE BY colX,colY,colZ;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT (colX, colY);
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex');
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT (colX, colY);
```

**Примеры**

Рассмотрим таблицу:

```sql
CREATE TABLE example (
    primary_key Int32,
    secondary_key Int32,
    value UInt32,
    partition_key UInt32,
    materialized_value UInt32 MATERIALIZED 12345,
    aliased_value UInt32 ALIAS 2,
    PRIMARY KEY primary_key
) ENGINE=MergeTree
PARTITION BY partition_key
ORDER BY (primary_key, secondary_key);
```

```sql
INSERT INTO example (primary_key, secondary_key, value, partition_key)
VALUES (0, 0, 0, 0), (0, 0, 0, 0), (1, 1, 2, 2), (1, 1, 2, 3), (1, 1, 3, 3);
```

```sql
SELECT * FROM example;
```
Результат:

```sql

┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

Все следующие примеры выполняются для этого состояния с 5 строками.

#### `DEDUPLICATE` {#deduplicate}
Когда столбцы для дедупликации не указаны, учитываются все из них. Строка удаляется только в том случае, если все значения во всех столбцах равны соответствующим значениям в предыдущей строке:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE;
```

```sql
SELECT * FROM example;
```

Результат:

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY *` {#deduplicate-by-}

Когда столбцы указываются неявно, таблица дедуплицируется по всем столбцам, которые не являются `ALIAS` или `MATERIALIZED`. Учитывая приведенную выше таблицу, это столбцы `primary_key`, `secondary_key`, `value` и `partition_key`:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY *;
```

```sql
SELECT * FROM example;
```

Результат:

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY * EXCEPT` {#deduplicate-by--except}
Дедуплицировать по всем столбцам, которые не являются `ALIAS` или `MATERIALIZED`, и явно не являются `value`: столбцы `primary_key`, `secondary_key` и `partition_key`.

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY * EXCEPT value;
```

```sql
SELECT * FROM example;
```

Результат:

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY <list of columns>` {#deduplicate-by-list-of-columns}

Дедуплицировать явно по столбцам `primary_key`, `secondary_key` и `partition_key`:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY primary_key, secondary_key, partition_key;
```

```sql
SELECT * FROM example;
```
Результат:

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY COLUMNS(<regex>)` {#deduplicate-by-columnsregex}

Дедуплицировать по всем столбцам, соответствующим regex: столбцы `primary_key`, `secondary_key` и `partition_key`:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY COLUMNS('.*_key');
```

```sql
SELECT * FROM example;
```

Результат:

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```