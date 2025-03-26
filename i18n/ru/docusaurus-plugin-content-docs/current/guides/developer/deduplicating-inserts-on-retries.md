---
slug: /guides/developer/deduplicating-inserts-on-retries
title: 'Дедупликация вставок при повторных попытках'
description: 'Предотвращение дублирования данных при повторных операциях вставки'
keywords: ['дедупликация', 'дедуплицировать', 'повторные вставки', 'вставки']
---

Операции вставки иногда могут завершаться неудачно из-за ошибок, таких как таймауты. Когда вставки не удаются, данные могут быть успешно вставлены или нет. Этот гид охватывает то, как включить дедупликацию повторных попыток вставки, чтобы одни и те же данные не вставлялись более одного раза.

Когда попытка вставки повторяется, ClickHouse пытается определить, были ли данные уже успешно вставлены. Если вставленные данные помечены как дубликаты, ClickHouse не вставляет их в целевую таблицу. Однако пользователь все равно получит статус успешной операции, как если бы данные были вставлены нормально.

## Включение дедупликации вставок при повторных попытках {#enabling-insert-deduplication-on-retries}

### Дедупликация вставок для таблиц {#insert-deduplication-for-tables}

**Только движки `*MergeTree` поддерживают дедупликацию при вставке.**

Для движков `*ReplicatedMergeTree` дедупликация вставок включена по умолчанию и контролируется настройками [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated-deduplication-window) и [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated-deduplication-window-seconds). Для не реплицированных движков `*MergeTree` дедупликация контролируется настройкой [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non-replicated-deduplication-window).

Указанные выше настройки определяют параметры журнала дедупликации для таблицы. Журнал дедупликации хранит конечное количество `block_id`, которые определяют, как работает дедупликация (см. ниже).

### Дедупликация вставок на уровне запросов {#query-level-insert-deduplication}

Настройка `insert_deduplicate=1` включает дедупликацию на уровне запроса. Обратите внимание, что если вы вставляете данные с `insert_deduplicate=0`, эти данные не могут быть дедуплицированы, даже если вы повторяете вставку с `insert_deduplicate=1`. Это связано с тем, что `block_id` не записываются для блоков при вставках с `insert_deduplicate=0`.

## Как работает дедупликация вставок {#how-insert-deduplication-works}

Когда данные вставляются в ClickHouse, они разбиваются на блоки в зависимости от количества строк и байтов.

Для таблиц, использующих движки `*MergeTree`, каждому блоку присваивается уникальный `block_id`, который является хешем данных в этом блоке. Этот `block_id` используется как уникальный ключ для операции вставки. Если тот же `block_id` обнаружен в журнале дедупликации, блок считается дубликатом и не вставляется в таблицу.

Такой подход хорошо работает в случаях, когда вставки содержат разные данные. Однако, если одни и те же данные вставляются несколько раз намеренно, вам нужно использовать настройку `insert_deduplication_token`, чтобы контролировать процесс дедупликации. Эта настройка позволяет указать уникальный токен для каждой вставки, который ClickHouse использует для определения, является ли данные дубликатом.

Для запросов `INSERT ... VALUES` разделение вставленных данных на блоки является детерминированным и определяется настройками. Поэтому пользователи должны повторять вставки с теми же значениями настроек, что и в начальной операции.

Для запросов `INSERT ... SELECT` важно, чтобы часть `SELECT` запроса возвращала одни и те же данные в одном и том же порядке для каждой операции. Обратите внимание, что достичь этого сложно на практике. Чтобы обеспечить стабильный порядок данных при повторных попытках, определите точный раздел `ORDER BY` в части `SELECT` запроса. Имейте в виду, что возможно, что выбранная таблица может быть обновлена между повторными попытками: результирующие данные могут измениться, и дедупликация не произойдет. Кроме того, в ситуациях, когда вы вставляете большое количество данных, может произойти переполнение окна журнала дедупликации, и ClickHouse не сможет знать, что нужно дедуплицировать блоки.

## Дедупликация вставок с помощью материализованных представлений {#insert-deduplication-with-materialized-views}

Когда у таблицы есть одно или несколько материализованных представлений, вставленные данные также вставляются в назначение этих представлений с применением определенных преобразований. Преобразованные данные также подвергаются дедупликации при повторных попытках. ClickHouse выполняет дедупликацию для материализованных представлений так же, как и для данных, вставленных в целевую таблицу.

Вы можете контролировать этот процесс, используя следующие настройки для исходной таблицы:

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated-deduplication-window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated-deduplication-window-seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non-replicated-deduplication-window)

Вы также можете использовать настройку пользовательского профиля [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views).

При вставке блоков в таблицы под материализованными представлениями ClickHouse вычисляет `block_id`, хешируя строку, которая объединяет `block_id` из исходной таблицы и дополнительные идентификаторы. Это обеспечивает точную дедупликацию внутри материализованных представлений, позволяя отличить данные на основе их первоначальной вставки, независимо от любых преобразований, примененных до достижения целевой таблицы под материализованным представлением.

## Примеры {#examples}

### Идентичные блоки после преобразований материализованного представления {#identical-blocks-after-materialized-view-transformations}

Идентичные блоки, которые были сгенерированы во время преобразования внутри материализованного представления, не подвергаются дедупликации, поскольку они основаны на различных вставленных данных.

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

Указанные выше настройки позволяют нам выбирать из таблицы с серией блоков, содержащих только одну строку. Эти небольшие блоки не объединяются и остаются одинаковыми до тех пор, пока не будут вставлены в таблицу.

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

Нам нужно включить дедупликацию в материализованном представлении:

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

Здесь мы видим, что два куска были вставлены в таблицу `dst`. 2 блока из выборки -- 2 части при вставке. Части содержат разные данные.

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

Здесь мы видим, что 2 части были вставлены в таблицу `mv_dst`. Эти части содержат одни и те же данные, однако они не дедуплицируются.

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

Здесь мы видим, что когда мы повторяем вставки, все данные дедуплицируются. Дедупликация работает как для таблицы `dst`, так и для таблицы `mv_dst`.

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

С указанными выше настройками из выборки получаются два блока - как результат, должно быть два блока для вставки в таблицу `dst`. Однако, мы видим, что только один блок был вставлен в таблицу `dst`. Это произошло потому, что второй блок был дедуплицирован. Он содержит те же данные и ключ для дедупликации `block_id`, который вычисляется как хеш от вставленных данных. Это поведение не было ожидаемым. Такие случаи являются редким явлением, но теоретически возможны. Чтобы правильно обрабатывать такие случаи, пользователю необходимо предоставить `insert_deduplication_token`. Давайте исправим это с помощью следующих примеров:

### Идентичные блоки при вставке с `insert_deduplication_token` {#identical-blocks-in-insertion-with-insert-deduplication-token}

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

Ожидаемо были вставлены два идентичных блока.

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

Повторная вставка дедуплицируется, как и ожидалось.

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

Эта вставка также дедуплицируется, несмотря на то, что она содержит разные вставленные данные. Обратите внимание, что `insert_deduplication_token` имеет более высокий приоритет: ClickHouse не использует хеш суммы данных, когда `insert_deduplication_token` предоставлен.

### Разные операции вставки генерируют одни и те же данные после преобразования в основной таблице материализованного представления {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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

Мы вставляем разные данные каждый раз. Тем не менее, в таблицу `mv_dst` вставляется одни и те же данные. Данные не дедуплицируются, поскольку исходные данные были разными.

### Разные материализованные вставки в одну основную таблицу с эквивалентными данными {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

Операция повторной вставки дедуплицируется как в таблицах `dst`, так и `mv_dst`.
