---
slug: /guides/developer/deduplicating-inserts-on-retries
title: 'Дедупликация вставок при повторных попытках'
description: 'Предотвращение дублирования данных при повторных операциях вставки'
keywords: ['дедупликация', 'дедуплицировать', 'повторные вставки', 'вставки']
---

Операции вставки иногда могут завершаться с ошибками, такими как тайм-ауты. Когда вставки завершаются неудачно, данные могли быть успешно вставлены или нет. Этот гайд охватывает способ включения механизма дедупликации для повторных попыток вставки, чтобы одни и те же данные не вставлялись более одного раза.

Когда вставка повторяется, ClickHouse пытается определить, были ли данные уже успешно вставлены. Если вставленные данные маркируются как дубликаты, ClickHouse не вставляет их в целевую таблицу. Однако пользователь все равно получит статус успешной операции, как если бы данные были вставлены нормально.

## Включение дедупликации вставок при повторных попытках {#enabling-insert-deduplication-on-retries}

### Дедупликация вставок для таблиц {#insert-deduplication-for-tables}

**Только движки `*MergeTree` поддерживают дедупликацию при вставке.**

Для движков `*ReplicatedMergeTree` дедупликация вставок включена по умолчанию и контролируется настройками [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) и [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds). Для нереплицированных движков `*MergeTree` дедупликация контролируется настройкой [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window).

Указанные настройки определяют параметры журнала дедупликации для таблицы. Журнал дедупликации хранит конечное количество `block_id`, которые определяют, как работает дедупликация (см. ниже).

### Дедупликация вставок на уровне запроса {#query-level-insert-deduplication}

Настройка `insert_deduplicate=1` включает дедупликацию на уровне запроса. Обратите внимание, что если вы вставляете данные с `insert_deduplicate=0`, эти данные не могут быть дедуплицированы, даже если вы повторите вставку с `insert_deduplicate=1`. Это связано с тем, что `block_id` не записываются для блоков во время вставок с `insert_deduplicate=0`.

## Как работает дедупликация вставок {#how-insert-deduplication-works}

Когда данные вставляются в ClickHouse, они разбиваются на блоки в зависимости от количества строк и байтов.

Для таблиц, использующих движки `*MergeTree`, каждому блоку присваивается уникальный `block_id`, который является хешем данных в этом блоке. Этот `block_id` используется в качестве уникального ключа для операции вставки. Если тот же `block_id` найден в журнале дедупликации, блок считается дубликатом и не вставляется в таблицу.

Этот подход хорошо работает для случаев, когда вставки содержат разные данные. Однако если одни и те же данные намеренно вставляются несколько раз, вам нужно будет использовать настройку `insert_deduplication_token`, чтобы контролировать процесс дедупликации. Эта настройка позволяет вам указать уникальный токен для каждой вставки, который ClickHouse использует для определения, являются ли данные дубликатом.

Для запросов `INSERT ... VALUES` разделение вставленных данных на блоки является детерминированным и определяется настройками. Поэтому пользователи должны повторять вставки с теми же значениями настроек, что и в начальной операции.

Для запросов `INSERT ... SELECT` важно, чтобы `SELECT`-часть запроса возвращала одинаковые данные в одном и том же порядке для каждой операции. Обратите внимание, что добиться этого на практике сложно. Чтобы обеспечить стабильный порядок данных при повторных попытках, определите точную секцию `ORDER BY` в `SELECT`-части запроса. Также имейте в виду, что существует вероятность обновления выбранной таблицы между повторными попытками: результат данных может измениться, и дедупликация не произойдет. Кроме того, в ситуациях, когда вы вставляете большие объемы данных, возможно, что количество блоков после вставок может переполнить окно журнала дедупликации, и ClickHouse не сможет идентифицировать блоки для дедупликации.

## Дедупликация вставок с материализованными представлениями {#insert-deduplication-with-materialized-views}

Когда у таблицы есть одно или несколько материализованных представлений, вставленные данные также вставляются в назначения этих представлений с заданными преобразованиями. Преобразованные данные также дедуплицируются при повторных попытках. ClickHouse выполняет дедупликации для материализованных представлений так же, как дедуплицирует данные, вставленные в целевую таблицу.

Вы можете контролировать этот процесс, используя следующие настройки для исходной таблицы:

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

Вы также можете использовать настройку пользовательского профиля [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views).

При вставке блоков в таблицы под материализованными представлениями ClickHouse вычисляет `block_id`, хешируя строку, которая объединяет `block_id` из исходной таблицы и дополнительные идентификаторы. Это гарантирует точную дедупликацию в рамках материализованных представлений, позволяя различать данные на основе их первоначальной вставки, независимо от любых преобразований, примененных до достижения целевой таблицы под материализованным представлением.

## Примеры {#examples}

### Идентичные блоки после преобразований материализованного представления {#identical-blocks-after-materialized-view-transformations}

Идентичные блоки, которые были сгенерированы во время преобразования внутри материализованного представления, не дедуплицируются, потому что они основаны на разных вставленных данных.

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

Указанные настройки позволяют нам выбирать из таблицы с серией блоков, содержащих только одну строку. Эти маленькие блоки не объединяются и остаются одинаковыми, пока не будут вставлены в таблицу.

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
ORDER BY all;

┌─key─┬─value─┬─_part─────┐
│   1 │ B     │ all_0_0_0 │
│   2 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

Здесь мы видим, что в таблицу `dst` были вставлены две части. 2 блока из выбора -- 2 части при вставке. Части содержат разные данные.

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

Здесь мы видим, что в таблицу `mv_dst` были вставлены 2 части. Эти части содержат одни и те же данные, однако они не дедуплицируются.

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
ORDER BY all;

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
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘
```

С этими настройками выше два блока являются результатом выборки — таким образом, должно быть два блока для вставки в таблицу `dst`. Однако мы видим, что только один блок был вставлен в таблицу `dst`. Это произошло потому, что второй блок был дедуплицирован. Он имеет одинаковые данные и ключ для дедупликации `block_id`, который вычисляется как хеш от вставленных данных. Такое поведение не было ожидаемым. Подобные случаи являются редкими, но теоретически возможными. Для правильной обработки таких случаев пользователю необходимо предоставить `insert_deduplication_token`. Исправим это с помощью следующих примеров:

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

Повторная вставка дедуплицируется, как и ожидалось.

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

Эта вставка также дедуплицируется, хотя она содержит разные вставленные данные. Обратите внимание, что `insert_deduplication_token` имеет более высокий приоритет: ClickHouse не использует хеш-сумму данных, когда предоставлен `insert_deduplication_token`.

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

SELECT 'first attempt';

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
ORDER BY all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
└───────────────┴─────┴───────┴───────────┘

SELECT 'second attempt';

INSERT INTO dst VALUES (2, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
│ from dst   │   2 │ A     │ all_1_1_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER BY all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

Мы вставляем разные данные каждый раз. Однако одни и те же данные вставляются в таблицу `mv_dst`. Данные не дедуплицируются, потому что исходные данные были разными.

### Разные вставки в материализованное представление в одну исходную таблицу с эквивалентными данными {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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

SELECT 'first attempt';

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
ORDER BY all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

В две равные блока вставлены в таблицу `mv_dst` (как и ожидалось).

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
ORDER BY all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

Эта операция повторной попытки дедуплицируется как в таблицах `dst`, так и `mv_dst`.
