---
description: 'Документация по работе с проекциями'
sidebar_label: 'PROJECTION'
sidebar_position: 49
slug: /sql-reference/statements/alter/projection
title: 'Проекции'
doc_type: 'reference'
---

В этой статье рассматривается, что такое проекции, как их можно использовать и какие существуют варианты управления ими.

## Обзор проекций \{#overview\}

Проекции хранят данные в формате, который оптимизирует выполнение запросов. Этот механизм полезен для:

- Выполнения запросов по столбцу, который не является частью первичного ключа
- Предварительной агрегации столбцов, что снижает как вычислительные затраты, так и нагрузку на операции ввода-вывода (I/O)

Вы можете определить одну или несколько проекций для таблицы, и во время анализа запроса ClickHouse выберет проекцию с наименьшим объемом данных для сканирования, не изменяя запрос, заданный пользователем.

:::note[Использование диска]
При использовании проекций внутренне создаётся новая скрытая таблица, что означает, что потребуется больше операций ввода-вывода и дискового пространства.
Например, если в проекции определён первичный ключ, отличный от исходного, все данные из исходной таблицы будут продублированы.
:::

Более технические подробности об устройстве проекций можно найти на этой [странице](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections).

## Использование проекций \{#examples\}

### Пример фильтрации без использования первичного ключа \{#example-filtering-without-using-primary-keys\}

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


### Пример запроса предварительной агрегации \{#example-pre-aggregation-query\}

Создайте таблицу с проекцией `projection_visits_by_user`:

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

Добавьте данные:

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

Выполните первый запрос с `GROUP BY` по полю `user_agent`.
Этот запрос не будет использовать PROJECTION, так как предагрегация не соответствует.

```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

Чтобы использовать проекцию, вы можете выполнять запросы, выбирающие часть или все поля предагрегации и поля `GROUP BY`:

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

Как уже упоминалось, вы можете просмотреть таблицу `system.query_log`, чтобы понять, использовалась ли проекция.
Поле `projections` показывает имя использованной проекции.
Оно будет пустым, если проекция не использовалась:

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


### Обычная проекция с полем `_part_offset` \{#normal-projection-with-part-offset-field\}

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


#### Использование `_part_offset` в качестве вторичного индекса \{#normal-projection-secondary-index\}

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


## Управление проекциями \{#manipulating-projections\}

Доступны следующие операции с [проекциями](/engines/table-engines/mergetree-family/mergetree.md/#projections):

### ДОБАВИТЬ ПРОЕКЦИЮ \{#add-projection\}

Используйте приведённый ниже оператор, чтобы добавить в метаданные таблицы описание проекции:

```sql
ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] ) [WITH SETTINGS ( setting_name1 = setting_value1, setting_name2 = setting_value2, ...)]
```


#### Предложение `WITH SETTINGS` \{#with-settings\}

`WITH SETTINGS` определяет **настройки уровня проекции**, которые задают, как проекция хранит данные (например, `index_granularity` или `index_granularity_bytes`).
Они напрямую соответствуют **настройкам таблицы MergeTree**, но применяются **только к этой проекции**.

Пример:

```sql
ALTER TABLE t
ADD PROJECTION p (
    SELECT x ORDER BY x
) WITH SETTINGS (
    index_granularity = 4096,
    index_granularity_bytes = 1048576
);
```

Настройки проекции переопределяют настройки таблицы, применяемые к этой проекции, с учётом правил проверки (например, недопустимые или несовместимые переопределения будут отклонены).


### DROP PROJECTION \{#drop-projection\}

Используйте следующую команду, чтобы удалить описание проекции из метаданных таблицы и файлы проекции с диска.
Эта операция реализована как [мутация](/sql-reference/statements/alter/index.md#mutations).

```sql
ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name
```


### MATERIALIZE PROJECTION \{#materialize-projection\}

Используйте следующую команду, чтобы перестроить проекцию `name` в партиции `partition_name`.
Это реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]
```


### CLEAR PROJECTION \{#clear-projection\}

Используйте приведённую ниже команду, чтобы удалить файлы проекции с диска, не удаляя её описания.
Эта операция реализована как [мутация](/sql-reference/statements/alter/index.md#mutations).

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]
```

Команды `ADD`, `DROP` и `CLEAR` являются «лёгкими» в том смысле, что они только изменяют метаданные или удаляют файлы.
Кроме того, они реплицируются и синхронизируют метаданные проекций через ClickHouse Keeper или ZooKeeper.

:::note
Управление проекциями поддерживается только для таблиц с движком [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) (включая [реплицируемые](/engines/table-engines/mergetree-family/replication.md) варианты).
:::


### Управление поведением слияния проекций \{#control-projections-merges\}

Когда вы выполняете запрос, ClickHouse выбирает между чтением из исходной таблицы или одной из её проекций.
Решение о чтении из исходной таблицы или одной из её проекций принимается отдельно для каждой части таблицы.
В общем случае ClickHouse стремится прочитать как можно меньше данных и использует несколько приёмов, чтобы определить, из какой части читать, например, выполняет выборочное чтение значений первичного ключа части.
В некоторых случаях у исходных частей таблицы могут отсутствовать соответствующие части проекций.
Это может происходить, например, потому что создание проекции для таблицы в SQL по умолчанию является «ленивым» — оно влияет только на вновь вставляемые данные и не изменяет существующие части.

Поскольку одна из проекций уже содержит предварительно вычислённые агрегированные значения, ClickHouse старается читать из соответствующих частей проекций, чтобы избежать повторной агрегации во время выполнения запроса. Если у конкретной части отсутствует соответствующая часть проекции, выполнение запроса возвращается к исходной части.

Но что произойдёт, если строки в исходной таблице изменятся нетривиальным образом из‑за нетривиальных фоновых слияний частей данных?
Например, предположим, что таблица хранится с использованием движка `ReplacingMergeTree`.
Если одна и та же строка обнаружена в нескольких входных частях во время слияния, будет сохранена только самая новая версия строки (из самой недавно вставленной части), тогда как все более старые версии будут отброшены.

Аналогично, если таблица хранится с использованием движка `AggregatingMergeTree`, операция слияния может свернуть одни и те же строки во входных частях (на основе значений первичного ключа) в одну строку для обновления частичных состояний агрегации.

До ClickHouse v24.8 части проекций либо тихо рассинхронизировались с основными данными, либо некоторые операции, такие как обновления и удаления, вообще не могли выполняться, так как база данных автоматически выбрасывала исключение, если таблица имела проекции.

Начиная с v24.8, новый табличный параметр [`deduplicate_merge_projection_mode`](/operations/settings/merge-tree-settings#deduplicate_merge_projection_mode) управляет поведением в случае упомянутых выше нетривиальных фоновых операций слияния, происходящих в частях исходной таблицы.

Мутации удаления — ещё один пример операций слияния частей, которые удаляют строки в частях исходной таблицы. Начиная с v24.7 у нас также есть параметр для управления поведением в отношении мутаций удаления, запускаемых легковесным удалением: [`lightweight_mutation_projection_mode`](/operations/settings/merge-tree-settings#deduplicate_merge_projection_mode).

Ниже перечислены возможные значения как для `deduplicate_merge_projection_mode`, так и для `lightweight_mutation_projection_mode`:

- `throw` (по умолчанию): Выбрасывается исключение, предотвращающее рассинхронизацию частей проекций.
- `drop`: Затронутые части таблицы проекций удаляются. Для этих частей запросы будут выполняться по исходной части таблицы.
- `rebuild`: Затронутая часть проекции перестраивается, чтобы оставаться согласованной с данными в исходной части таблицы.

## См. также \{#see-also\}

- ["Control Of Projections During Merges" (запись в блоге)](https://clickhouse.com/blog/clickhouse-release-24-08#control-of-projections-during-merges)
- ["Projections" (руководство)](/data-modeling/projections#using-projections-to-speed-up-UK-price-paid)
- ["Materialized Views versus Projections"](https://clickhouse.com/docs/managing-data/materialized-views-versus-projections)