---
slug: /guides/developer/deduplicating-inserts-on-retries
title: 'Удаление дубликатов при повторных вставках'
description: 'Предотвращение дублирования данных при повторных операциях вставки'
keywords: ['удаление дубликатов', 'дедупликация', 'повторные вставки', 'операции вставки']
doc_type: 'guide'
---

Операции вставки иногда могут завершаться сбоем из-за ошибок, например тайм-аутов. Когда вставка завершается неудачно, данные могли как записаться, так и не записаться. В этом руководстве описано, как включить дедупликацию при повторных попытках вставки, чтобы одни и те же данные не записывались более одного раза.

Когда выполняется повторная попытка вставки, ClickHouse пытается определить, были ли данные уже успешно записаны. Если вставленные данные помечены как дубликат, ClickHouse не вставляет их в целевую таблицу. Однако пользователь по-прежнему получит статус успешного выполнения операции, как если бы данные были вставлены обычным образом.

## Ограничения {#limitations}

### Неопределённый статус вставки {#uncertain-insert-status}

Пользователь должен повторять операцию вставки до тех пор, пока она не завершится успешно. Если все попытки оказываются неудачными, невозможно определить, были ли данные вставлены или нет. Когда задействованы материализованные представления, также неясно, в каких таблицах могли появиться данные. Материализованные представления могут быть рассинхронизированы с исходной таблицей.

### Ограничение окна дедупликации {#deduplication-window-limit}

Если во время последовательности повторных попыток выполняется более `*_deduplication_window` других операций вставки, дедупликация может работать не так, как ожидается. В этом случае одни и те же данные могут быть вставлены несколько раз.

## Включение дедупликации вставок при повторах {#enabling-insert-deduplication-on-retries}

### Дедупликация вставок для таблиц {#insert-deduplication-for-tables}

**Только движки `*MergeTree` поддерживают дедупликацию при вставке.**

Для движков `*ReplicatedMergeTree` дедупликация вставок включена по умолчанию и управляется настройками [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) и [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds). Для нереплицируемых движков `*MergeTree` дедупликация управляется настройкой [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window).

Указанные выше настройки определяют параметры журнала дедупликации для таблицы. Журнал дедупликации хранит ограниченное число значений `block_id`, которые определяют работу механизма дедупликации (см. ниже).

### Дедупликация вставок на уровне запроса {#query-level-insert-deduplication}

Настройка `insert_deduplicate=1` включает дедупликацию на уровне запроса. Обратите внимание, что если вы вставляете данные с `insert_deduplicate=0`, эти данные не могут быть дедуплицированы, даже если вы повторите вставку с `insert_deduplicate=1`. Это связано с тем, что `block_id` не записываются для блоков при вставках с `insert_deduplicate=0`.

## Как работает дедупликация вставок {#how-insert-deduplication-works}

Когда данные вставляются в ClickHouse, они разбиваются на блоки в зависимости от количества строк и объема данных в байтах.

Для таблиц, использующих движки `*MergeTree`, каждому блоку присваивается уникальный `block_id`, который представляет собой хэш данных в этом блоке. Этот `block_id` используется как уникальный ключ для операции вставки. Если тот же `block_id` найден в журнале дедупликации, блок считается дубликатом и не вставляется в таблицу.

Этот подход хорошо работает в случаях, когда вставки содержат разные данные. Однако если одни и те же данные намеренно вставляются несколько раз, необходимо использовать настройку `insert_deduplication_token` для управления процессом дедупликации. Эта настройка позволяет указать уникальный токен для каждой вставки, который ClickHouse использует для определения того, являются ли данные дубликатом.

Для запросов `INSERT ... VALUES` разбиение вставляемых данных на блоки является детерминированным и зависит от настроек. Поэтому вам следует повторять вставки с теми же значениями настроек, что и в исходной операции.

Для запросов `INSERT ... SELECT` важно, чтобы часть запроса `SELECT` возвращала одни и те же данные в том же порядке при каждой операции. Учтите, что этого сложно добиться на практике. Чтобы обеспечить стабильный порядок данных при повторных попытках, задайте секцию `ORDER BY ALL` в части запроса `SELECT`. В данный момент в запросе нужно использовать именно `ORDER BY ALL`. Поддержка `ORDER BY` пока не реализована, и часть запроса `SELECT` не будет считаться стабильной. Имейте в виду, что выбранная таблица может быть изменена между повторными попытками: результирующие данные могли измениться, и дедупликация не произойдет. Кроме того, в ситуациях, когда вы вставляете большие объемы данных, возможно, что количество блоков после вставок переполнит окно журнала дедупликации, и ClickHouse не сможет определить, что блоки нужно дедуплицировать.

В данный момент поведение для `INSERT ... SELECT` контролируется настройкой [`insert_select_deduplicate`](/operations/settings/settings/#insert_select_deduplicate). Эта настройка определяет, применяется ли дедупликация к данным, вставляемым с помощью запросов `INSERT ... SELECT`. Подробности и примеры использования см. в документации по ссылке.

## Дедупликация вставок с материализованными представлениями {#insert-deduplication-with-materialized-views}

Когда у таблицы есть одно или несколько материализованных представлений, вставленные данные также записываются в целевые таблицы этих представлений с заданными преобразованиями. Преобразованные данные также дедуплицируются при повторных попытках вставки. ClickHouse выполняет дедупликацию для материализованных представлений так же, как он дедуплицирует данные, вставленные в целевую таблицу.

Вы можете управлять этим процессом с помощью следующих настроек для исходной таблицы:

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

Также необходимо включить настройку профиля пользователя [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views).
При включённой настройке `insert_deduplicate=1` вставленные данные дедуплицируются в исходной таблице. Настройка `deduplicate_blocks_in_dependent_materialized_views=1` дополнительно включает дедупликацию в зависимых таблицах. Для полной дедупликации необходимо включить обе настройки.

При вставке блоков в таблицы, которые являются целевыми для материализованных представлений, ClickHouse вычисляет `block_id` путём хеширования строки, объединяющей `block_id` из исходной таблицы и дополнительные идентификаторы. Это обеспечивает корректную дедупликацию в рамках материализованных представлений, позволяя различать данные по их исходной вставке, независимо от любых преобразований, применённых перед попаданием в целевую таблицу материализованного представления.

## Примеры {#examples}

### Идентичные блоки после преобразований в материализованном представлении {#identical-blocks-after-materialized-view-transformations}

Идентичные блоки, сгенерированные в результате преобразования внутри материализованного представления, не удаляются как дубликаты, поскольку они основаны на разных вставленных данных.

Пример:

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

Настройки выше позволяют нам делать выборку из таблицы, в которой данные представлены серией блоков, каждый из которых содержит только одну строку. Эти небольшие блоки не сливаются и остаются неизменными до тех пор, пока не будут вставлены в таблицу.

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

Необходимо включить дедупликацию в материализованном представлении:

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER BY all;

┌─key─┬─value─┬─_part─────┐
│   1 │ B     │ all_0_0_0 │
│   2 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

Здесь мы видим, что в таблицу `dst` были вставлены две части. 2 блока из SELECT — 2 части при INSERT. Эти части содержат разные данные.

```sql
SELECT
    *,
    _part
FROM mv_dst
ORDER BY all;

┌─key─┬─value─┬─_part─────┐
│   0 │ B     │ all_0_0_0 │
│   0 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

Здесь мы видим, что в таблицу `mv_dst` были вставлены 2 части. Эти части содержат одинаковые данные, однако они не были дедуплицированы.

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER BY all;

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

Здесь мы видим, что при повторной вставке все данные дедуплицируются. Дедупликация работает как для таблицы `dst`, так и для таблицы `mv_dst`.


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
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘
```

При указанных выше настройках запрос select возвращает два блока — следовательно, в таблицу `dst` должны быть вставлены два блока. Однако мы видим, что в таблицу `dst` был вставлен только один блок. Это произошло из-за дедупликации второго блока. Он содержит те же данные и ключ дедупликации `block_id`, который вычисляется как хеш вставленных данных. Такое поведение не соответствует ожидаемому. Подобные случаи встречаются редко, но теоретически возможны. Для корректной обработки таких ситуаций необходимо указать `insert_deduplication_token`. Исправим это с помощью следующих примеров:


### Идентичные блоки при вставке с использованием `insert_deduplication_token` {#identical-blocks-in-insertion-with-insert_deduplication_token}

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
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

Два идентичных блока были вставлены, как и ожидалось.

```sql
SELECT 'second attempt';

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
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

Повторная вставка была корректно дедуплицирована.

```sql
SELECT 'third attempt';

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
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

Эта вставка также будет дедуплицирована, даже несмотря на то, что она содержит другие данные. Обратите внимание, что `insert_deduplication_token` имеет более высокий приоритет: ClickHouse не использует хеш-сумму данных, когда указан `insert_deduplication_token`.


### Разные операции вставки приводят к одинаковым данным после преобразования в базовой таблице materialized view {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

Каждый раз мы вставляем разные данные. Однако в таблицу `mv_dst` попадают одни и те же данные. Дедупликация не выполняется, так как исходные данные различались.


### Вставки из разных материализованных представлений в одну целевую таблицу с эквивалентными данными {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

В таблицу `mv_dst` вставлены два идентичных блока (как и ожидалось).

```sql
SELECT 'second attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER BY all;

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

Эта повторная вставка дедуплицируется в обеих таблицах `dst` и `mv_dst`.
