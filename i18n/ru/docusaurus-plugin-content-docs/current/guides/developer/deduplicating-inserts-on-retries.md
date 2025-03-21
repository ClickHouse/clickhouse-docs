---
slug: /guides/developer/deduplicating-inserts-on-retries
title: Удаление дубликатов при повторных вставках
description: Предотвращение дублирующихся данных при повторных операциях вставки
keywords: [удаление дубликатов, удаление дубликатов, повторные вставки, вставки]
---

Операции вставки иногда могут завершаться ошибками, такими как тайм-ауты. Когда вставки не удаются, данные могут или не могут быть успешно вставлены. Этот гид охватывает, как включить удаление дубликатов при повторных вставках, чтобы одни и те же данные не вставлялись более одного раза.

Когда вставка повторяется, ClickHouse пытается определить, были ли данные уже успешно вставлены. Если вставленные данные помечены как дубликат, ClickHouse не вставляет их в целевую таблицу. Однако пользователь все равно получит статус успешной операции, как если бы данные были вставлены нормально.

## Включение удаления дубликатов при повторных вставках {#enabling-insert-deduplication-on-retries}

### Удаление дубликатов для таблиц {#insert-deduplication-for-tables}

**Только движки `*MergeTree` поддерживают удаление дубликатов при вставке.**

Для движков `*ReplicatedMergeTree` удаление дубликатов включено по умолчанию и контролируется настройками [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated-deduplication-window) и [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated-deduplication-window-seconds). Для нереплицируемых движков `*MergeTree` удаление дубликатов контролируется настройкой [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non-replicated-deduplication-window).

Вышеупомянутые настройки определяют параметры журнала удаления дубликатов для таблицы. Журнал удаления дубликатов хранит конечное количество `block_id`, которые определяют, как работает удаление дубликатов (см. ниже).

### Удаление дубликатов на уровне запроса {#query-level-insert-deduplication}

Настройка `insert_deduplicate=1` включает удаление дубликатов на уровне запроса. Обратите внимание, что если вы вставляете данные с `insert_deduplicate=0`, эти данные не могут быть удалены дубликаты, даже если вы повторяете вставку с `insert_deduplicate=1`. Это связано с тем, что `block_id` не записываются для блоков во время вставок с `insert_deduplicate=0`.

## Как работает удаление дубликатов при вставке {#how-insert-deduplication-works}

Когда данные вставляются в ClickHouse, он разбивает данные на блоки на основе количества строк и байт.

Для таблиц, использующих движки `*MergeTree`, каждому блоку присваивается уникальный `block_id`, который является хешем данных в этом блоке. Этот `block_id` используется в качестве уникального ключа для операции вставки. Если тот же `block_id` найден в журнале удаления дубликатов, блок считается дубликатом и не вставляется в таблицу.

Этот подход хорошо работает для случаев, когда вставки содержат разные данные. Однако, если одни и те же данные вставляются несколько раз намеренно, вам необходимо использовать настройку `insert_deduplication_token`, чтобы контролировать процесс удаления дубликатов. Эта настройка позволяет вам указать уникальный токен для каждой вставки, который ClickHouse использует для определения, являются ли данные дубликатом.

Для запросов `INSERT ... VALUES` разделение вставленных данных на блоки является детерминированным и определяется настройками. Поэтому пользователи должны повторять вставки с теми же значениями настроек, что и в первоначальной операции.

Для запросов `INSERT ... SELECT` важно, чтобы часть `SELECT` возвращала одни и те же данные в том же порядке для каждой операции. Обратите внимание, что это сложно достижимо на практике. Чтобы обеспечить стабильный порядок данных при повторных попытках, определите точный раздел `ORDER BY` в части `SELECT` запроса. Имейте в виду, что возможно, что выбранная таблица может быть обновлена между повторными вставками: результат данных мог измениться и удаление дубликатов не произойдет. Кроме того, в ситуациях, когда вы вставляете большие объемы данных, возможно, что количество блоков после вставок может переполнить окно журнала удаления дубликатов, и ClickHouse не узнает, чтобы удалить дубликаты.

## Удаление дубликатов при вставке с материализованными представлениями {#insert-deduplication-with-materialized-views}

Когда таблица имеет одно или несколько материализованных представлений, вставленные данные также вставляются в место назначения этих представлений с определенными преобразованиями. Преобразованные данные также удаляются дубликаты при повторных попытках. ClickHouse выполняет удаление дубликатов для материализованных представлений так же, как он удаляет данные, вставленные в целевую таблицу.

Вы можете контролировать этот процесс с помощью следующих настроек для исходной таблицы:

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated-deduplication-window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated-deduplication-window-seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non-replicated-deduplication-window)

Вы также можете использовать настройку профиля пользователя [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views).

При вставке блоков в таблицы под материализованными представлениями ClickHouse рассчитывает `block_id`, хешируя строку, которая объединяет `block_id` из исходной таблицы и дополнительные идентификаторы. Это гарантирует точное удаление дубликатов внутри материализованных представлений, позволяя различать данные на основе их первоначальной вставки, независимо от каких-либо преобразований, примененных до достижения целевой таблицы под материализованным представлением.

## Примеры {#examples}

### Идентичные блоки после преобразований материализованного представления {#identical-blocks-after-materialized-view-transformations}

Идентичные блоки, которые были сгенерированы во время преобразования внутри материализованного представления, не удаляются как дубликаты, потому что они основаны на разных вставленных данных.

Вот пример:

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000
AS SELECT
    0 AS key,
    value AS value
FROM dst;
```

```sql
SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

Вышеуказанные настройки позволяют нам выбирать из таблицы с серией блоков, содержащих только одну строку. Эти маленькие блоки не объединяются и остаются одинаковыми до вставки в таблицу.

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

Нам необходимо включить удаление дубликатов в материализованном представлении:

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER by all;

┌─key─┬─value─┬─_part─────┐
│   1 │ B     │ all_0_0_0 │
│   2 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

Здесь мы видим, что два блока были вставлены в таблицу `dst`. 2 блока из выборки -- 2 блока при вставке. Блоки содержат разные данные.

```sql
SELECT
    *,
    _part
FROM mv_dst
ORDER by all;

┌─key─┬─value─┬─_part─────┐
│   0 │ B     │ all_0_0_0 │
│   0 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

Здесь мы видим, что 2 блока были вставлены в таблицу `mv_dst`. Эти блоки содержат одни и те же данные, однако они не удалены как дубликаты.

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER by all;

┌─key─┬─value─┬─_part─────┐
│   1 │ B     │ all_0_0_0 │
│   2 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘

SELECT
    *,
    _part
FROM mv_dst
ORDER by all;

┌─key─┬─value─┬─_part─────┐
│   0 │ B     │ all_0_0_0 │
│   0 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

Здесь мы видим, что при повторной вставке все данные удаляются как дубликаты. Удаление дубликатов работает как для таблицы `dst`, так и для таблицы `mv_dst`.

### Идентичные блоки при вставке {#identical-blocks-on-insertion}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

Вставка:

```sql
INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2);

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘
```

С указанными выше настройками, из выборки получается два блока — как результат, должно быть два блока для вставки в таблицу `dst`. Однако мы видим, что в таблицу `dst` был вставлен только один блок. Это произошло, потому что второй блок был удален как дубликат. Он имеет одни и те же данные и ключ для удаления дубликатов `block_id`, который рассчитывается как хеш от вставленных данных. Это поведение не является ожидаемым. Такие случаи являются редким явлением, но теоретически возможны. Для правильного решения таких случаев, пользователь должен предоставить `insert_deduplication_token`. Давайте исправим это следующими примерами:

### Идентичные блоки при вставке с `insert_deduplication_token` {#identical-blocks-in-insertion-with-insert-deduplication_token}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

Вставка:

```sql
INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

Два идентичных блока были вставлены, как и ожидалось.

```sql
select 'second attempt';

INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

Повторная вставка удалена как дубликат, как и ожидалось.

```sql
select 'third attempt';

INSERT INTO dst SELECT
    1 AS key,
    'b' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

Такая вставка также удалена как дубликат, хотя она содержит разные вставленные данные. Обратите внимание, что `insert_deduplication_token` имеет более высокий приоритет: ClickHouse не использует хеш-сумму данных, когда предоставлен `insert_deduplication_token`.

### Разные операции вставки генерируют одни и те же данные после преобразования в целевой таблице материализованного представления {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000
AS SELECT
    0 AS key,
    value AS value
FROM dst;

SET deduplicate_blocks_in_dependent_materialized_views=1;

select 'first attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
└───────────────┴─────┴───────┴───────────┘

select 'second attempt';

INSERT INTO dst VALUES (2, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
│ from dst   │   2 │ A     │ all_1_1_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

Мы вставляем разные данные каждый раз. Однако одни и те же данные вставляются в таблицу `mv_dst`. Данные не удаляются дубликаты, потому что исходные данные были разными.

### Разные материализованные представления вставляют в одну целевую таблицу с эквивалентными данными {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE TABLE mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_first
TO mv_dst
AS SELECT
    0 AS key,
    value AS value
FROM dst;

CREATE MATERIALIZED VIEW mv_second
TO mv_dst
AS SELECT
    0 AS key,
    value AS value
FROM dst;

SET deduplicate_blocks_in_dependent_materialized_views=1;

select 'first attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

В таблицу `mv_dst` вставлены два равных блока (как ожидалось).

```sql
select 'second attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

Эта операция повторной попытки удалена как дубликат в обеих таблицах `dst` и `mv_dst`.
