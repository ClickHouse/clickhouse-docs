---
slug: '/sql-reference/statements/alter/projection'
sidebar_label: PROJECTION
sidebar_position: 49
description: 'Документация по манипулированию Проекциями'
title: Проекции
doc_type: reference
---
Прогнозы (Projections) хранят данные в формате, оптимизирующем выполнение запросов, эта функция полезна для:
- Выполнения запросов по колонке, которая не является частью первичного ключа.
- Предагрегации колонок, что позволит уменьшить как вычисления, так и ввод-вывод (IO).

Вы можете определить один или несколько прогнозов для таблицы, и в процессе анализа запроса ClickHouse выберет прогноз с наименьшим объемом данных для сканирования, не изменяя запрос, предоставленный пользователем.

:::note Использование диска

Прогнозы создадут внутри новую скрытую таблицу, это означает, что потребуется больше ввода-вывода (IO) и места на диске. Например, если прогноз имеет определенный другой первичный ключ, все данные из оригинальной таблицы будут дублироваться.
:::

Вы можете увидеть больше технических деталей о том, как прогнозы работают внутренне, на этой [странице](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections).

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
С помощью `ALTER TABLE` мы можем добавить Прогноз к существующей таблице:
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

Прогноз позволит нам быстро фильтровать по `user_name`, даже если в оригинальной таблице `user_name` не был определен как `PRIMARY_KEY`. В момент выполнения запроса ClickHouse определил, что будет обработано меньше данных, если использовать прогноз, так как данные упорядочены по `user_name`.
```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

Чтобы убедиться, что запрос использует прогноз, мы можем просмотреть таблицу `system.query_log`. В поле `projections` мы имеем имя используемого прогноза или пустое, если ни один не использовался:
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## Пример запроса на предагрегацию {#example-pre-aggregation-query}

Создание таблицы с Прогнозом:
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
Мы выполним первый запрос с использованием `GROUP BY` по полю `user_agent`, этот запрос не будет использовать прогноз, так как предагрегация не совпадает.
```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

Чтобы использовать прогноз, мы могли бы выполнить запросы, которые выбирают часть или все поля предагрегации и `GROUP BY`.
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

Как упоминалось ранее, мы можем просмотреть таблицу `system.query_log`. В поле `projections` мы имеем имя используемого прогноза или пустое, если ни один не использовался:
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## Обычный прогноз с полем `_part_offset` {#normal-projection-with-part-offset-field}

Создание таблицы с обычным прогнозом, который использует поле `_part_offset`:

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

Вставка некоторых тестовых данных:

```sql
INSERT INTO events SELECT * FROM generateRandom() LIMIT 100000;
```

### Использование `_part_offset` как вторичного индекса {#normal-projection-secondary-index}

Поле `_part_offset` сохраняет свое значение через слияния и мутации, что делает его ценным для вторичного индексирования. Мы можем использовать это в запросах:

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


# Управление прогнозами

Следующие операции с [прогнозами](/engines/table-engines/mergetree-family/mergetree.md/#projections) доступны:

## ADD PROJECTION {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - Добавляет описание прогноза в метаданные таблиц.

## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - Удаляет описание прогноза из метаданных таблиц и удаляет файлы прогноза с диска. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - Запрос перестраивает прогноз `name` в партиции `partition_name`. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - Удаляет файлы прогноза с диска, не удаляя описание. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Команды `ADD`, `DROP` и `CLEAR` являются легковесными в том смысле, что они только изменяют метаданные или удаляют файлы.

Кроме того, они реплицируются, синхронизируя метаданные прогнозов через ClickHouse Keeper или ZooKeeper.

:::note
Манипуляции прогнозами поддерживаются только для таблиц с движком [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](/engines/table-engines/mergetree-family/replication.md) варианты).
:::