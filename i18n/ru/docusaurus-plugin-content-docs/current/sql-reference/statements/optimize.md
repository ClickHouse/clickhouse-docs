---
description: 'Документация по OPTIMIZE'
sidebar_label: 'OPTIMIZE'
sidebar_position: 47
slug: /sql-reference/statements/optimize
title: 'Оператор OPTIMIZE'
---

Этот запрос пытается инициировать несогласованное слияние частей данных для таблиц. Обратите внимание, что мы обычно не рекомендуем использовать `OPTIMIZE TABLE ... FINAL` (см. эти [документы](/optimize/avoidoptimizefinal)), так как его использование предназначено для администрирования, а не для ежедневных операций.

:::note
`OPTIMIZE` не может исправить ошибку `Too many parts`.
:::

**Синтаксис**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

Запрос `OPTIMIZE` поддерживается для семейств [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) (включая [материализованные представления](/sql-reference/statements/create/view#materialized-view)) и движков [Buffer](../../engines/table-engines/special/buffer.md). Другие движки таблиц не поддерживаются.

Когда `OPTIMIZE` используется с семейством движков таблиц [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md), ClickHouse создает задание для слияния и ждет выполнения на всех репликах (если настройка [alter_sync](/operations/settings/settings#alter_sync) установлена в `2`) или на текущей реплике (если настройка [alter_sync](/operations/settings/settings#alter_sync) установлена в `1`).

- Если `OPTIMIZE` не выполняет слияние по любой причине, он не уведомляет клиента. Чтобы включить уведомления, используйте настройку [optimize_throw_if_noop](/operations/settings/settings#optimize_throw_if_noop).
- Если вы укажете `PARTITION`, только указанная партиция будет оптимизирована. [Как задать выражение для партиции](alter/partition.md#how-to-set-partition-expression).
- Если вы укажете `FINAL` или `FORCE`, оптимизация выполняется даже когда все данные уже находятся в одной части. Вы можете контролировать это поведение с помощью настройки [optimize_skip_merged_partitions](/operations/settings/settings#optimize_skip_merged_partitions). Также слияние принудительно выполняется, даже если выполняются параллельные слияния.
- Если вы укажете `DEDUPLICATE`, то полностью идентичные строки (если не указано by-clause) будут дедублированы (все столбцы сравниваются), это имеет смысл только для движка MergeTree.

Вы можете указать, как долго (в секундах) ждать неактивные реплики для выполнения запросов `OPTIMIZE`, с помощью настройки [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note    
Если `alter_sync` установлен в `2`, и некоторые реплики неактивны дольше времени, указанного в настройке `replication_wait_for_inactive_replica_timeout`, то выбрасывается исключение `UNFINISHED`.
:::

## BY expression {#by-expression}

Если вы хотите выполнить дедупликацию по заданному набору столбцов, а не по всем, вы можете явно указать список столбцов или использовать любую комбинацию [`*`](../../sql-reference/statements/select/index.md#asterisk), [`COLUMNS`](/sql-reference/statements/select#select-clause) или [`EXCEPT`](/sql-reference/statements/select#except) выражений. Явно написанный или неявно расширенный список столбцов должен включать все столбцы, указанные в выражении сортировки строк (как первичные, так и сортировочные ключи), и выражении партиционирования (ключ партиционирования).

:::note    
Обратите внимание, что `*` ведет себя так же, как в `SELECT`: [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) и [ALIAS](../../sql-reference/statements/create/table.md#alias) столбцы не учитываются при расширении.

Кроме того, ошибка будет, если указать пустой список столбцов или написать выражение, которое приводит к пустому списку столбцов, или дедублировать по столбцу `ALIAS`.
:::

**Синтаксис**

```sql
OPTIMIZE TABLE table DEDUPLICATE; -- все столбцы
OPTIMIZE TABLE table DEDUPLICATE BY *; -- исключает MATERIALIZED и ALIAS столбцы
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

Все следующие примеры выполняются в таком состоянии с 5 строками.

#### `DEDUPLICATE` {#deduplicate}
Когда столбцы для дедупликации не указаны, они все принимаются во внимание. Строка удаляется только если все значения во всех столбцах равны соответствующим значениям в предыдущей строке:

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

Когда столбцы указаны неявно, таблица дедуплицируется по всем столбцам, которые не являются `ALIAS` или `MATERIALIZED`. Учитывая таблицу выше, это столбцы `primary_key`, `secondary_key`, `value` и `partition_key`:

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
Дедуплицировать по всем столбцам, которые не являются `ALIAS` или `MATERIALIZED`, и явно не `value`: столбцы `primary_key`, `secondary_key` и `partition_key`.

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

Дедуплицировать по всем столбцам, соответствующим регулярному выражению: столбцы `primary_key`, `secondary_key` и `partition_key`:

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
