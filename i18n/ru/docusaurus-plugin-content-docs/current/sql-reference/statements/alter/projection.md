---
slug: /sql-reference/statements/alter/projection
sidebar_position: 49
sidebar_label: ПРОЕКЦИИ
title: "Проекции"
---

Проекции хранят данные в формате, оптимизирующем выполнение запросов, что полезно для:
- Выполнения запросов по колонке, которая не является частью первичного ключа
- Предагрегирования колонок, что снизит как вычисления, так и ввод-вывод

Вы можете определить одну или несколько проекций для таблицы, и в процессе анализа запроса ClickHouse выберет проекцию с наименьшим количеством данных для сканирования, не изменяя запрос, предоставленный пользователем.

:::note Использование диска

Проекции создадут внутри новую скрытую таблицу, это означает, что потребуется больше операций ввода-вывода и дискового пространства. Например, если проекция определяет другой первичный ключ, все данные из оригинальной таблицы будут продублированы.
:::

Вы можете увидеть больше технических деталей о том, как проекции работают внутри, на этой [странице](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections).

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
Используя `ALTER TABLE`, мы можем добавить проекцию в существующую таблицу:
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

Проекция позволит нам быстро фильтровать по `user_name`, даже если в оригинальной таблице `user_name` не был определен как `PRIMARY_KEY`.
Во время выполнения запроса ClickHouse определил, что будет обработано меньше данных, если будет использована проекция, так как данные упорядочены по `user_name`.
```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

Чтобы проверить, что запрос использует проекцию, мы можем просмотреть таблицу `system.query_log`. В поле `projections` указано имя использованной проекции или пусто, если ни одна не была использована:
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## Пример запроса предагрегирования {#example-pre-aggregation-query}

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
Мы выполним первый запрос, используя `GROUP BY`, по полю `user_agent`, этот запрос не использует определенную проекцию, так как предагрегирование не соответствует.
```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

Чтобы использовать проекцию, мы можем выполнять запросы, которые выбирают часть или все поля предагрегирования и `GROUP BY`.
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

Как уже упоминалось, мы можем просмотреть таблицу `system.query_log`. В поле `projections` указано имя использованной проекции или пусто, если ни одна не была использована:
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


# Управление проекциями

Доступны следующие операции с [проекциями](/engines/table-engines/mergetree-family/mergetree.md/#projections):

## ADD PROJECTION {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - Добавляет описание проекции в метаданные таблиц.

## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - Удаляет описание проекции из метаданных таблиц и удаляет файлы проекции с диска. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - Запрос восстанавливает проекцию `name` в партиции `partition_name`. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - Удаляет файлы проекции с диска без удаления описания. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Команды `ADD`, `DROP` и `CLEAR` являются легковесными в том смысле, что они только изменяют метаданные или удаляют файлы.

Кроме того, они реплицируются, синхронизируя метаданные проекций через ClickHouse Keeper или ZooKeeper.

:::note
Манипуляции с проекциями поддерживаются только для таблиц с движком [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) (включая [реплицированные](/engines/table-engines/mergetree-family/replication.md) варианты).
:::
