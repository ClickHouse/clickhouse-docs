---
description: 'Документация по OPTIMIZE'
sidebar_label: 'OPTIMIZE'
sidebar_position: 47
slug: /sql-reference/statements/optimize
title: 'Команда OPTIMIZE'
doc_type: 'reference'
---

Этот запрос пытается инициировать внеплановое слияние частей данных таблиц. Обратите внимание, что в целом мы не рекомендуем использовать `OPTIMIZE TABLE ... FINAL` (см. [документацию](/optimize/avoidoptimizefinal)), поскольку эта команда предназначена для административных задач, а не для повседневных операций.

:::note
`OPTIMIZE` не может исправить ошибку `Too many parts`.
:::

**Синтаксис**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

Запрос `OPTIMIZE` поддерживается для семейства [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) (включая [materialized views](/sql-reference/statements/create/view#materialized-view)) и движка [Buffer](../../engines/table-engines/special/buffer.md). Другие табличные движки `OPTIMIZE` не поддерживают.

Когда `OPTIMIZE` используется с семейством табличных движков [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md), ClickHouse создает задачу на выполнение слияния и ожидает её завершения на всех репликах (если настройка [alter&#95;sync](/operations/settings/settings#alter_sync) установлена в значение `2`) или на текущей реплике (если настройка [alter&#95;sync](/operations/settings/settings#alter_sync) установлена в значение `1`).

* Если `OPTIMIZE` по какой-либо причине не выполняет слияние, клиент не получает об этом уведомления. Чтобы включить уведомления, используйте настройку [optimize&#95;throw&#95;if&#95;noop](/operations/settings/settings#optimize_throw_if_noop).
* Если вы указываете `PARTITION`, оптимизируется только указанная партиция. [Как задать выражение партиции](alter/partition.md#how-to-set-partition-expression).
* Если вы указываете `FINAL` или `FORCE`, оптимизация выполняется даже тогда, когда все данные уже находятся в одной части. Вы можете управлять этим поведением с помощью [optimize&#95;skip&#95;merged&#95;partitions](/operations/settings/settings#optimize_skip_merged_partitions). Кроме того, слияние принудительно выполняется даже при наличии параллельных слияний.
* Если вы указываете `DEDUPLICATE`, то полностью идентичные строки (если не указано предложение BY) будут удалены как дубликаты (сравниваются все столбцы). Это имеет смысл только для движка MergeTree.

Вы можете задать, как долго (в секундах) ждать выполнения запросов `OPTIMIZE` на неактивных репликах с помощью настройки [replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note
Если `alter_sync` установлен в значение `2`, и некоторые реплики неактивны дольше времени, заданного настройкой `replication_wait_for_inactive_replica_timeout`, генерируется исключение `UNFINISHED`.
:::

## Выражение BY {#by-expression}

Если вы хотите выполнять дедупликацию по произвольному набору столбцов, а не по всем, вы можете явно указать список столбцов или использовать любую комбинацию выражений [`*`](../../sql-reference/statements/select/index.md#asterisk), [`COLUMNS`](/sql-reference/statements/select#select-clause) или [`EXCEPT`](/sql-reference/statements/select/except-modifier). Явно заданный или неявно развёрнутый список столбцов должен включать все столбцы, указанные в выражении упорядочивания строк (как первичного, так и сортировочного ключей), а также в выражении партиционирования (ключ партиционирования).

:::note
Обратите внимание, что `*` ведёт себя так же, как в `SELECT`: столбцы [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) и [ALIAS](../../sql-reference/statements/create/table.md#alias) не используются при разворачивании списка.

Также является ошибкой указывать пустой список столбцов, писать выражение, приводящее к пустому списку столбцов, или выполнять дедупликацию по столбцу `ALIAS`.
:::

**Синтаксис**

```sql
OPTIMIZE TABLE table DEDUPLICATE; -- все столбцы
OPTIMIZE TABLE table DEDUPLICATE BY *; -- исключает столбцы MATERIALIZED и ALIAS
OPTIMIZE TABLE table DEDUPLICATE BY colX,colY,colZ;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT (colX, colY);
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex');
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT (colX, colY);
```

**Примеры**

Рассмотрим следующую таблицу:

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

Все последующие примеры выполняются для этого состояния с 5 строками.

#### `DEDUPLICATE` {#deduplicate}

Когда столбцы для дедупликации не указаны, учитываются все столбцы. Строка удаляется только в том случае, если все значения во всех столбцах равны соответствующим значениям в предыдущей строке:

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

Когда столбцы задаются неявно, дедупликация таблицы выполняется по всем столбцам, которые не являются `ALIAS` или `MATERIALIZED`. Для таблицы выше это столбцы `primary_key`, `secondary_key`, `value` и `partition_key`:

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

Выполняет дедупликацию по всем столбцам, которые не являются `ALIAS` или `MATERIALIZED`, при этом явно исключается столбец `value`, то есть используется набор столбцов `primary_key`, `secondary_key` и `partition_key`.

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

Выполните явную дедупликацию по столбцам `primary_key`, `secondary_key` и `partition_key`:

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

Удаляет дубликаты по всем столбцам, соответствующим регулярному выражению: столбцам `primary_key`, `secondary_key` и `partition_key`:

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
