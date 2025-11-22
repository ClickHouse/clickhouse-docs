---
description: 'Документация по работе с проекциями'
sidebar_label: 'PROJECTION'
sidebar_position: 49
slug: /sql-reference/statements/alter/projection
title: 'Проекции'
doc_type: 'reference'
---

Проекции хранят данные в формате, который оптимизирует выполнение запросов. Эта функциональность полезна для:
- выполнения запросов по столбцу, который не является частью первичного ключа;
- предварительной агрегации столбцов, что сокращает как вычислительные затраты, так и операции ввода-вывода (I/O).

Вы можете определить одну или несколько проекций для таблицы, и во время анализа запроса ClickHouse без изменения исходного запроса пользователя выберет проекцию, для которой требуется просканировать наименьший объём данных.

:::note Disk usage

Проекции создают внутренне новую скрытую таблицу, что означает, что потребуется больше операций ввода-вывода и больше дискового пространства.
Например, если для проекции определён другой первичный ключ, все данные из исходной таблицы будут продублированы.
:::

Более подробные технические детали о внутреннем устройстве проекций можно найти на этой [странице](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections).



## Пример фильтрации без использования первичных ключей {#example-filtering-without-using-primary-keys}

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

С помощью `ALTER TABLE` можно добавить проекцию к существующей таблице:

```sql
ALTER TABLE visits_order ADD PROJECTION user_name_projection (
SELECT
*
ORDER BY user_name
)

ALTER TABLE visits_order MATERIALIZE PROJECTION user_name_projection
```

Вставка данных:

```sql
INSERT INTO visits_order SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

Проекция позволит быстро фильтровать данные по `user_name`, даже если в исходной таблице `user_name` не был определён как `PRIMARY_KEY`.
При выполнении запроса ClickHouse определит, что при использовании проекции будет обработано меньше данных, так как данные упорядочены по `user_name`.

```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

Чтобы проверить, использует ли запрос проекцию, можно обратиться к таблице `system.query_log`. В поле `projections` содержится имя использованной проекции или пустое значение, если проекция не использовалась:

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


## Пример запроса с предварительной агрегацией {#example-pre-aggregation-query}

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

Вставка данных:

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

Выполним первый запрос с использованием `GROUP BY` по полю `user_agent`. Этот запрос не будет использовать определённую проекцию, поскольку предварительная агрегация не соответствует требуемой.

```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

Чтобы использовать проекцию, можно выполнять запросы, которые выбирают часть или все поля предварительной агрегации и `GROUP BY`.

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

Как упоминалось ранее, можно просмотреть таблицу `system.query_log`. В поле `projections` содержится имя использованной проекции или пустое значение, если проекция не использовалась:

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


## Обычная проекция с полем `_part_offset` {#normal-projection-with-part-offset-field}

Создание таблицы с обычной проекцией, которая использует поле `_part_offset`:

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

Вставка тестовых данных:

```sql
INSERT INTO events SELECT * FROM generateRandom() LIMIT 100000;
```

### Использование `_part_offset` в качестве вторичного индекса {#normal-projection-secondary-index}

Поле `_part_offset` сохраняет своё значение при слияниях и мутациях, что делает его ценным для вторичной индексации. Это можно использовать в запросах:

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


# Работа с проекциями

Доступны следующие операции с [проекциями](/engines/table-engines/mergetree-family/mergetree.md/#projections):



## ADD PROJECTION {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` — добавляет описание проекции в метаданные таблицы.


## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - Удаляет описание проекции из метаданных таблицы и удаляет файлы проекции с диска. Реализована как [мутация](/sql-reference/statements/alter/index.md#mutations).


## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - Запрос перестраивает проекцию `name` в партиции `partition_name`. Реализуется как [мутация](/sql-reference/statements/alter/index.md#mutations).


## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` — удаляет файлы проекции с диска, не удаляя её описание. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Команды `ADD`, `DROP` и `CLEAR` являются лёгкими в том смысле, что они только изменяют метаданные или удаляют файлы.

Кроме того, они реплицируются, синхронизируя метаданные проекций через ClickHouse Keeper или ZooKeeper.

:::note
Манипуляции с проекциями поддерживаются только для таблиц с движком [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) (включая [реплицируемые](/engines/table-engines/mergetree-family/replication.md) варианты).
:::
