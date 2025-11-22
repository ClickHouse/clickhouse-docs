---
description: 'Документация по OPTIMIZE'
sidebar_label: 'OPTIMIZE'
sidebar_position: 47
slug: /sql-reference/statements/optimize
title: 'Оператор OPTIMIZE'
doc_type: 'reference'
---

Этот запрос пытается инициировать внеплановое слияние частей данных в таблицах. Обратите внимание, что в целом мы не рекомендуем использовать `OPTIMIZE TABLE ... FINAL` (см. эти [документы](/optimize/avoidoptimizefinal)), так как он предназначен для административных задач, а не для повседневной эксплуатации.

:::note
`OPTIMIZE` не может исправить ошибку `Too many parts`.
:::

**Синтаксис**

```sql
OPTIMIZE TABLE [db.]имя [ON CLUSTER кластер] [PARTITION партиция | PARTITION ID 'идентификатор_партиции'] [FINAL | FORCE] [DEDUPLICATE [BY выражение]]
```

Запрос `OPTIMIZE` поддерживается для семейства [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) (включая [материализованные представления](/sql-reference/statements/create/view#materialized-view)) и движка [Buffer](../../engines/table-engines/special/buffer.md). Другие движки таблиц не поддерживаются.

Когда `OPTIMIZE` используется с семейством движков таблиц [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md), ClickHouse создаёт задачу на слияние и ожидает её выполнения на всех репликах (если настройка [alter&#95;sync](/operations/settings/settings#alter_sync) установлена в значение `2`) или на текущей реплике (если настройка [alter&#95;sync](/operations/settings/settings#alter_sync) установлена в значение `1`).

* Если `OPTIMIZE` по какой-либо причине не выполняет слияние, он не уведомляет клиента. Чтобы включить уведомления, используйте настройку [optimize&#95;throw&#95;if&#95;noop](/operations/settings/settings#optimize_throw_if_noop).
* Если вы указываете `PARTITION`, оптимизируется только указанная партиция. [Как задать выражение партиционирования](alter/partition.md#how-to-set-partition-expression).
* Если вы указываете `FINAL` или `FORCE`, оптимизация выполняется даже тогда, когда все данные уже находятся в одной части. Вы можете управлять этим поведением с помощью [optimize&#95;skip&#95;merged&#95;partitions](/operations/settings/settings#optimize_skip_merged_partitions). Также слияние принудительно запускается, даже если выполняются параллельные слияния.
* Если вы указываете `DEDUPLICATE`, то полностью идентичные строки (если не указано предложение `BY`) будут дедуплицированы (сравниваются все столбцы); это имеет смысл только для движка MergeTree.

Вы можете задать, как долго (в секундах) ждать выполнения запросов `OPTIMIZE` на неактивных репликах с помощью настройки [replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note\
Если `alter_sync` установлен в значение `2`, и некоторые реплики остаются неактивными дольше, чем время, заданное настройкой `replication_wait_for_inactive_replica_timeout`, генерируется исключение `UNFINISHED`.
:::


## Выражение BY {#by-expression}

Если требуется выполнить дедупликацию по определённому набору столбцов, а не по всем, можно явно указать список столбцов или использовать любую комбинацию выражений [`*`](../../sql-reference/statements/select/index.md#asterisk), [`COLUMNS`](/sql-reference/statements/select#select-clause) или [`EXCEPT`](/sql-reference/statements/select/except-modifier). Явно указанный или неявно развёрнутый список столбцов должен включать все столбцы, указанные в выражении упорядочивания строк (как первичный ключ, так и ключи сортировки), а также в выражении партиционирования (ключ партиционирования).

:::note  
Обратите внимание, что `*` ведёт себя так же, как в `SELECT`: столбцы [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) и [ALIAS](../../sql-reference/statements/create/table.md#alias) не используются при развёртывании.

Также является ошибкой указание пустого списка столбцов, написание выражения, которое приводит к пустому списку столбцов, или выполнение дедупликации по столбцу `ALIAS`.
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

Все следующие примеры выполняются для данного состояния с 5 строками.

#### `DEDUPLICATE` {#deduplicate}

Если столбцы для дедупликации не указаны, учитываются все столбцы. Строка удаляется только в том случае, если все значения во всех столбцах равны соответствующим значениям в предыдущей строке:

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

Если столбцы указаны неявно, дедупликация таблицы выполняется по всем столбцам, которые не являются `ALIAS` или `MATERIALIZED`. В приведённой выше таблице это столбцы `primary_key`, `secondary_key`, `value` и `partition_key`:

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

Дедупликация по всем столбцам, которые не являются `ALIAS` или `MATERIALIZED`, за исключением `value`: столбцы `primary_key`, `secondary_key` и `partition_key`.

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

Явная дедупликация по столбцам `primary_key`, `secondary_key` и `partition_key`:

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

Дедупликация по всем столбцам, соответствующим регулярному выражению: столбцам `primary_key`, `secondary_key` и `partition_key`:

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
