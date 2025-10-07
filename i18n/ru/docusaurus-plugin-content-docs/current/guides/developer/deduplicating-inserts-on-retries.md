---
slug: '/guides/developer/deduplicating-inserts-on-retries'
description: 'Предотвращение дублирующих данных при повторных операциях вставки'
title: 'Дедупликация вставок при повторных попытках'
keywords: ['дедупликация', 'дедуплицировать', 'повторные вставки', 'вставки']
doc_type: guide
---
Операции вставки иногда могут завершаться неудачей из-за таких ошибок, как таймауты. Когда вставка не удается, данные могут быть либо успешно вставлены, либо нет. Этот руководитель описывает, как включить дедупликацию при повторных попытках вставки, чтобы одни и те же данные не вставлялись более одного раза.

Когда попытка вставки повторяется, ClickHouse пытается определить, были ли данные уже успешно вставлены. Если вставленные данные помечены как дубликаты, ClickHouse не вставляет их в целевую таблицу. Тем не менее, пользователь все равно получает статус успешной операции, как если бы данные были вставлены нормально.

## Ограничения {#limitations}

### Неопределенный статус вставки {#uncertain-insert-status}

Пользователь должен повторять операцию вставки, пока она не будет успешной. Если все попытки завершились неудачей, невозможно определить, были ли данные вставлены или нет. Когда задействованы материализованные представления, также неясно, в каких таблицах могут появиться данные. Материализованные представления могут быть несинхронизированы с源овой таблицей.

### Ограничение окна дедупликации {#deduplication-window-limit}

Если во время последовательности повторных попыток происходит более чем `*_deduplication_window` других операций вставки, дедупликация может не сработать должным образом. В этом случае одни и те же данные могут быть вставлены несколько раз.

## Включение дедупликации вставки при повторных попытках {#enabling-insert-deduplication-on-retries}

### Дедупликация вставки для таблиц {#insert-deduplication-for-tables}

**Только движки `*MergeTree` поддерживают дедупликацию при вставке.**

Для движков `*ReplicatedMergeTree` дедупликация вставки включена по умолчанию и контролируется настройками [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) и [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds). Для недублируемых движков `*MergeTree` дедупликация контролируется настройкой [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window).

Указанные выше настройки определяют параметры журнала дедупликации для таблицы. Журнал дедупликации хранит конечное количество `block_id`, которые определяют, как работает дедупликация (см. ниже).

### Дедупликация вставки на уровне запроса {#query-level-insert-deduplication}

Настройка `insert_deduplicate=1` включает дедупликацию на уровне запроса. Обратите внимание, что если вы вставляете данные с `insert_deduplicate=0`, эти данные не могут быть дедуплицированы, даже если вы повторяете вставку с `insert_deduplicate=1`. Это связано с тем, что `block_id` не записываются для блоков во время вставок с `insert_deduplicate=0`.

## Как работает дедупликация вставки {#how-insert-deduplication-works}

Когда данные вставляются в ClickHouse, они разбиваются на блоки на основе количества строк и байтов.

Для таблиц, использующих движки `*MergeTree`, каждому блоку присваивается уникальный `block_id`, который является хешем данных в этом блоке. Этот `block_id` используется в качестве уникального ключа для операции вставки. Если тот же `block_id` найден в журнале дедупликации, блок считается дубликатом и не вставляется в таблицу.

Этот подход хорошо работает в случаях, когда вставки содержат различные данные. Однако если одни и те же данные вставляются несколько раз намеренно, вам необходимо использовать настройку `insert_deduplication_token`, чтобы контролировать процесс дедупликации. Эта настройка позволяет вам указать уникальный токен для каждой вставки, который ClickHouse использует для определения того, являются ли данные дубликатом.

Для запросов `INSERT ... VALUES` разделение вставленных данных на блоки является детерминированным и определяется настройками. Поэтому пользователи должны повторять вставки с теми же значениями настроек, что и в первоначальной операции.

Для запросов `INSERT ... SELECT` важно, чтобы часть `SELECT` запроса возвращала одни и те же данные в одном и том же порядке для каждой операции. Обратите внимание, что это трудно достичь в практическом использовании. Чтобы обеспечить стабильный порядок данных при повторных попытках, определите точный раздел `ORDER BY` в части `SELECT` запроса. Имейте в виду, что существует вероятность, что выбранная таблица может быть обновлена между повторными попытками: результат данных мог измениться, и дедупликация не произойдет. Кроме того, в ситуациях, когда вы вставляете большие объемы данных, возможно, что количество блоков после вставок может переполнить окно журнала дедупликации, и ClickHouse не будет знать, как дедуплицировать блоки.

## Дедупликация вставок с материализованными представлениями {#insert-deduplication-with-materialized-views}

Когда таблица имеет одно или несколько материализованных представлений, вставленные данные также вставляются в пункт назначения этих представлений с определенными преобразованиями. Преобразованные данные также дедуплицируются при повторных попытках. ClickHouse выполняет дедупликацию для материализованных представлений так же, как он дедуплицирует данные, вставленные в целевую таблицу.

Вы можете контролировать этот процесс, используя следующие настройки для исходной таблицы:

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

Также необходимо включить настройку профиля пользователя [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views). С включенной настройкой `insert_deduplicate=1` вставленные данные дедуплицируются в исходной таблице. Настройка `deduplicate_blocks_in_dependent_materialized_views=1` дополнительно включает дедупликацию в зависимых таблицах. Вам нужно включить обе настройки, если требуется полная дедупликация.

При вставке блоков в таблицы под материализованными представлениями ClickHouse вычисляет `block_id`, хешируя строку, которая сочетает в себе `block_id` из исходной таблицы и дополнительные идентификаторы. Это обеспечивает точную дедупликацию в рамках материализованных представлений, позволяя данным различаться в зависимости от их первоначальной вставки, независимо от любых преобразований, примененных перед достижением целевой таблицы под материализованным представлением.

## Примеры {#examples}

### Идентичные блоки после преобразований материализованного представления {#identical-blocks-after-materialized-view-transformations}

Идентичные блоки, которые были сгенерированы во время преобразования внутри материализованного представления, не подлежат дедупликации, поскольку они основаны на разных вставленных данных.

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

Указанные настройки позволяют нам выбирать из таблицы с серией блоков, содержащих только одну строку. Эти маленькие блоки не сжимаются и остаются одинаковыми до их вставки в таблицу.

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

Мы должны включить дедупликацию в материализованном представлении:

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

Здесь мы видим, что две части были вставлены в таблицу `dst`. 2 блока из выборки -- 2 части при вставке. Части содержат разные данные.

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

Здесь мы видим, что 2 части были вставлены в таблицу `mv_dst`. Эти части содержат одинаковые данные, однако они не дедуплицированы.

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

Здесь мы видим, что когда мы повторили вставки, все данные были дедуплицированы. Дедупликация работает как для таблицы `dst`, так и для таблицы `mv_dst`.

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

С указанными выше параметрами появляются два блока из выборки -- в результате должно быть два блока для вставки в таблицу `dst`. Однако мы видим, что только один блок был вставлен в таблицу `dst`. Это произошло потому, что второй блок был дедуплицирован. Он имеет те же данные и ключ для дедупликации `block_id`, который вычисляется как хеш от вставленных данных. Такое поведение не было ожидаемым. Такие случаи являются редкими, но теоретически возможны. Чтобы правильно обработать такие случаи, пользователю необходимо предоставить `insert_deduplication_token`. Давайте исправим это следующими примерами:

### Идентичные блоки при вставке с `insert_deduplication_token` {#identical-blocks-in-insertion-with-insert_deduplication_token}

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

Повторная вставка дедуплицирована, как и ожидалось.

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

Эта вставка также дедуплицирована, даже если она содержит разные вставленные данные. Обратите внимание, что `insert_deduplication_token` имеет более высокий приоритет: ClickHouse не использует хеш-сумму данных, когда предоставлен `insert_deduplication_token`.

### Разные операции вставки генерируют одни и те же данные после преобразования в исходной таблице материализованного представления {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

Мы каждый раз вставляем разные данные. Тем не менее, одни и те же данные вставляются в таблицу `mv_dst`. Данные не дедуплицируются, потому что исходные данные были разными.

### Разные вставки материализованных представлений в одну исходную таблицу с эквивалентными данными {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

Два одинаковых блока вставлены в таблицу `mv_dst` (как и ожидалось).

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

Эта операция повторной попытки дедуплицирована в обеих таблицах `dst` и `mv_dst`.