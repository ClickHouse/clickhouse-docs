---
description: 'Документация по работе с проекциями'
sidebar_label: 'PROJECTION'
sidebar_position: 49
slug: /sql-reference/statements/alter/projection
title: 'Проекции'
doc_type: 'reference'
---

Проекции хранят данные в формате, который оптимизирует выполнение запросов. Этот механизм полезен для:
- Выполнения запросов по столбцу, который не является частью первичного ключа
- Предварительной агрегации столбцов, что снижает как вычислительные затраты, так и нагрузку на операции ввода-вывода (I/O)

Вы можете определить одну или несколько проекций для таблицы, и во время анализа запроса ClickHouse выберет проекцию с наименьшим объемом данных для сканирования, не изменяя запрос, заданный пользователем.

:::note Использование диска

При использовании проекций внутренне создаётся новая скрытая таблица, что означает, что потребуется больше операций ввода-вывода и дискового пространства.
Например, если в проекции определён первичный ключ, отличный от исходного, все данные из исходной таблицы будут продублированы.
:::

Более технические подробности об устройстве проекций можно найти на этой [странице](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections).

## Пример фильтрации без использования первичного ключа {#example-filtering-without-using-primary-keys}

Создание таблицы:

```sql
CREATE TABLE visits_order
(
   `user_id` UInt64,
   `user_name` String,
   `pages_visited` Nullable(Float64),
   `user_agent` String
)
ENGINE = MergeTree()
PRIMARY KEY user_agent
```

С помощью команды `ALTER TABLE` можно добавить проекцию к существующей таблице:

```sql
ALTER TABLE visits_order ADD PROJECTION user_name_projection (
SELECT
*
ORDER BY user_name
)

ALTER TABLE visits_order MATERIALIZE PROJECTION user_name_projection
```

Добавление данных:

```sql
INSERT INTO visits_order SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

Проекция позволит нам быстро фильтровать по `user_name`, даже если в исходной таблице `user_name` не был определён как `PRIMARY_KEY`.
Во время выполнения запроса ClickHouse определил, что при использовании проекции будет обработано меньше данных, так как данные упорядочены по `user_name`.

```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

Чтобы убедиться, что запрос использует проекцию, мы можем просмотреть таблицу `system.query_log`. В столбце `projections` указано имя использованной проекции или пустое значение, если проекция не применялась:

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## Пример запроса предварительной агрегации {#example-pre-aggregation-query}

Создание таблицы с проекцией:

```sql
CREATE TABLE visits
(
   `user_id` UInt64,
   `user_name` String,
   `pages_visited` Nullable(Float64),
   `user_agent` String,
   PROJECTION projection_visits_by_user
   (
       SELECT
           user_agent,
           sum(pages_visited)
       GROUP BY user_id, user_agent
   )
)
ENGINE = MergeTree()
ORDER BY user_agent
```

Добавление данных:

```sql
INSERT INTO visits SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

```sql
INSERT INTO visits SELECT
    number,
    'test',
    1. * (number / 2),
   'IOS'
FROM numbers(100, 500);
```

Мы выполним первый запрос с использованием `GROUP BY` по полю `user_agent`; этот запрос не будет использовать заданную проекцию, так как предагрегация не соответствует условиям запроса.

```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

Чтобы использовать проекцию, мы можем выполнять запросы, которые выбирают часть или все поля предагрегации и группировки (`GROUP BY`).

```sql
SELECT
    user_agent
FROM visits
WHERE user_id > 50 AND user_id < 150
GROUP BY user_agent
```

```sql
SELECT
    user_agent,
    sum(pages_visited)
FROM visits
GROUP BY user_agent
```

Как уже отмечалось, мы можем просмотреть таблицу `system.query_log`. В поле `projections` указано имя использованной проекции или пустое значение, если проекция не использовалась:

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## Обычная проекция с полем `_part_offset` {#normal-projection-with-part-offset-field}

Создание таблицы с обычной проекцией, использующей поле `_part_offset`:

```sql
CREATE TABLE events
(
    `event_time` DateTime,
    `event_id` UInt64,
    `user_id` UInt64,
    `huge_string` String,
    PROJECTION order_by_user_id
    (
        SELECT
            _part_offset
        ORDER BY user_id
    )
)
ENGINE = MergeTree()
ORDER BY (event_id);
```

Добавление тестовых данных:

```sql
INSERT INTO events SELECT * FROM generateRandom() LIMIT 100000;
```

### Использование `_part_offset` в качестве вторичного индекса {#normal-projection-secondary-index}

Поле `_part_offset` сохраняет свое значение при слияниях и мутациях, что делает его полезным для вторичного индексирования. Это можно использовать в запросах:

```sql
SELECT
    count()
FROM events
WHERE _part_starting_offset + _part_offset IN (
    SELECT _part_starting_offset + _part_offset
    FROM events
    WHERE user_id = 42
)
SETTINGS enable_shared_storage_snapshot_in_query = 1
```

# Управление проекциями {#manipulating-projections}

Доступны следующие операции с [проекциями](/engines/table-engines/mergetree-family/mergetree.md/#projections):

## ДОБАВИТЬ ПРОЕКЦИЮ {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT &lt;COLUMN LIST EXPR&gt; [GROUP BY] [ORDER BY] )` — добавляет в метаданные таблицы описание проекции.

## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` — удаляет из метаданных таблицы описание проекции и соответствующие файлы проекции на диске. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - запрос перестраивает проекцию `name` в партиции `partition_name`. Реализован как [мутация](/sql-reference/statements/alter/index.md#mutations).

## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` — удаляет файлы проекции с диска, не удаляя её описания. Эта операция реализована как [мутация](/sql-reference/statements/alter/index.md#mutations).

Команды `ADD`, `DROP` и `CLEAR` являются «лёгкими» в том смысле, что они только изменяют метаданные или удаляют файлы.

Также они реплицируются, синхронизируя метаданные проекций через ClickHouse Keeper или ZooKeeper.

:::note
Управление проекциями поддерживается только для таблиц с движком [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) (включая [реплицируемые](/engines/table-engines/mergetree-family/replication.md) варианты).
:::
