---
slug: /guides/developer/deduplicating-inserts-on-retries
title: 'Дедупликация вставок при повторных попытках'
description: 'Предотвращение дублирования данных при повторных операциях вставки'
keywords: ['deduplication', 'deduplicate', 'insert retries', 'inserts']
doc_type: 'guide'
---

Операции вставки иногда могут завершаться с ошибкой, например из‑за таймаутов. Если вставка завершилась с ошибкой, данные могли как успешно сохраниться, так и нет. В этом руководстве описано, как включить дедупликацию при повторных попытках вставки, чтобы одни и те же данные не вставлялись более одного раза.

Когда вставка выполняется повторно, ClickHouse пытается определить, были ли данные уже успешно вставлены. Если вставленные данные помечаются как дубликат, ClickHouse не вставляет их в целевую таблицу. Однако пользователь всё равно получит статус успешного выполнения операции, как если бы данные были вставлены обычным образом.



## Ограничения {#limitations}

### Неопределённый статус вставки {#uncertain-insert-status}

Пользователь должен повторять операцию вставки до тех пор, пока она не завершится успешно. Если все попытки завершаются неудачей, невозможно определить, были ли данные вставлены. При использовании материализованных представлений также неясно, в какие таблицы могли попасть данные. Материализованные представления могут оказаться рассинхронизированными с исходной таблицей.

### Ограничение окна дедупликации {#deduplication-window-limit}

Если во время последовательности повторных попыток происходит более `*_deduplication_window` других операций вставки, дедупликация может работать некорректно. В этом случае одни и те же данные могут быть вставлены многократно.


## Включение дедупликации вставок при повторных попытках {#enabling-insert-deduplication-on-retries}

### Дедупликация вставок для таблиц {#insert-deduplication-for-tables}

**Только движки семейства `*MergeTree` поддерживают дедупликацию при вставке.**

Для движков семейства `*ReplicatedMergeTree` дедупликация вставок включена по умолчанию и управляется настройками [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) и [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds). Для нереплицируемых движков семейства `*MergeTree` дедупликация управляется настройкой [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window).

Указанные выше настройки определяют параметры журнала дедупликации для таблицы. Журнал дедупликации хранит ограниченное количество `block_id`, которые определяют механизм работы дедупликации (см. ниже).

### Дедупликация вставок на уровне запроса {#query-level-insert-deduplication}

Настройка `insert_deduplicate=1` включает дедупликацию на уровне запроса. Обратите внимание, что если вы вставляете данные с `insert_deduplicate=0`, эти данные не могут быть дедуплицированы, даже если вы повторите вставку с `insert_deduplicate=1`. Это связано с тем, что `block_id` не записываются для блоков при вставках с `insert_deduplicate=0`.


## Как работает дедупликация вставок {#how-insert-deduplication-works}

При вставке данных в ClickHouse они разбиваются на блоки в зависимости от количества строк и байтов.

Для таблиц, использующих движки семейства `*MergeTree`, каждому блоку присваивается уникальный идентификатор `block_id`, представляющий собой хеш данных в этом блоке. Этот `block_id` используется в качестве уникального ключа для операции вставки. Если такой же `block_id` обнаружен в журнале дедупликации, блок считается дубликатом и не вставляется в таблицу.

Этот подход хорошо работает в случаях, когда вставки содержат разные данные. Однако если одни и те же данные намеренно вставляются несколько раз, необходимо использовать настройку `insert_deduplication_token` для управления процессом дедупликации. Эта настройка позволяет указать уникальный токен для каждой вставки, который ClickHouse использует для определения того, являются ли данные дубликатом.

Для запросов `INSERT ... VALUES` разбиение вставляемых данных на блоки является детерминированным и определяется настройками. Поэтому при повторных попытках вставки следует использовать те же значения настроек, что и в исходной операции.

Для запросов `INSERT ... SELECT` важно, чтобы часть `SELECT` возвращала одни и те же данные в одном и том же порядке при каждой операции. Обратите внимание, что на практике этого сложно достичь. Чтобы обеспечить стабильный порядок данных при повторных попытках, укажите точную секцию `ORDER BY` в части `SELECT` запроса. Имейте в виду, что исходная таблица может быть обновлена между повторными попытками: результирующие данные могут измениться, и дедупликация не произойдет. Кроме того, при вставке больших объемов данных возможна ситуация, когда количество блоков после вставок превысит размер окна журнала дедупликации, и ClickHouse не сможет выполнить дедупликацию блоков.


## Дедупликация вставок с материализованными представлениями {#insert-deduplication-with-materialized-views}

Когда у таблицы есть одно или несколько материализованных представлений, вставляемые данные также вставляются в целевые таблицы этих представлений с заданными преобразованиями. Преобразованные данные также дедуплицируются при повторных попытках. ClickHouse выполняет дедупликацию для материализованных представлений так же, как и для данных, вставляемых в целевую таблицу.

Управлять этим процессом можно с помощью следующих настроек исходной таблицы:

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

Также необходимо включить настройку профиля пользователя [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views).
При включённой настройке `insert_deduplicate=1` вставляемые данные дедуплицируются в исходной таблице. Настройка `deduplicate_blocks_in_dependent_materialized_views=1` дополнительно включает дедупликацию в зависимых таблицах. Для полной дедупликации необходимо включить обе настройки.

При вставке блоков в таблицы материализованных представлений ClickHouse вычисляет `block_id` путём хеширования строки, которая объединяет `block_id` из исходной таблицы и дополнительные идентификаторы. Это обеспечивает точную дедупликацию внутри материализованных представлений, позволяя различать данные на основе их исходной вставки независимо от преобразований, применённых перед попаданием в целевую таблицу материализованного представления.


## Примеры {#examples}

### Идентичные блоки после преобразований материализованного представления {#identical-blocks-after-materialized-view-transformations}

Идентичные блоки, сгенерированные в процессе преобразования внутри материализованного представления, не дедуплицируются, так как они основаны на разных вставленных данных.

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

Приведенные выше настройки позволяют выполнять выборку из таблицы с серией блоков, содержащих только одну строку. Эти небольшие блоки не объединяются и остаются неизменными до момента их вставки в таблицу.

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

Здесь видно, что в таблицу `dst` были вставлены два куска. 2 блока из select — 2 куска при вставке. Куски содержат разные данные.

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

Здесь видно, что в таблицу `mv_dst` были вставлены 2 куска. Эти куски содержат одинаковые данные, однако они не дедуплицированы.

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

Здесь видно, что при повторной вставке все данные дедуплицируются. Дедупликация работает как для таблицы `dst`, так и для `mv_dst`.

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

```


┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst │ 0 │ A │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

````

При указанных выше настройках запрос select возвращает два блока — соответственно, должна быть выполнена вставка двух блоков в таблицу `dst`. Однако мы видим, что в таблицу `dst` был вставлен только один блок. Это произошло из-за дедупликации второго блока. Он содержит те же данные и ключ дедупликации `block_id`, который вычисляется как хеш от вставляемых данных. Такое поведение не соответствует ожиданиям. Подобные случаи встречаются редко, но теоретически возможны. Для корректной обработки таких случаев пользователь должен указать `insert_deduplication_token`. Рассмотрим, как это исправить, на следующих примерах:

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
````

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

Эта вставка также дедуплицирована, несмотря на то что содержит другие данные. Обратите внимание, что `insert_deduplication_token` имеет более высокий приоритет: ClickHouse не использует хеш-сумму данных, когда указан `insert_deduplication_token`.

### Различные операции вставки генерируют одинаковые данные после преобразования в целевой таблице материализованного представления {#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view}

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


SET deduplicate&#95;blocks&#95;in&#95;dependent&#95;materialized&#95;views=1;

select &#39;первая попытка&#39;;

INSERT INTO dst VALUES (1, &#39;A&#39;);

SELECT
&#39;from dst&#39;,
*,
&#95;part
FROM dst
ORDER by all;

┌─&#39;from dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from dst   │   1 │ A     │ all&#95;0&#95;0&#95;0 │
└────────────┴─────┴───────┴───────────┘

SELECT
&#39;from mv&#95;dst&#39;,
*,
&#95;part
FROM mv&#95;dst
ORDER by all;

┌─&#39;from mv&#95;dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from mv&#95;dst   │   0 │ A     │ all&#95;0&#95;0&#95;0 │
└───────────────┴─────┴───────┴───────────┘

select &#39;вторая попытка&#39;;

INSERT INTO dst VALUES (2, &#39;A&#39;);

SELECT
&#39;from dst&#39;,
*,
&#95;part
FROM dst
ORDER by all;

┌─&#39;from dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from dst   │   1 │ A     │ all&#95;0&#95;0&#95;0 │
│ from dst   │   2 │ A     │ all&#95;1&#95;1&#95;0 │
└────────────┴─────┴───────┴───────────┘

SELECT
&#39;from mv&#95;dst&#39;,
*,
&#95;part
FROM mv&#95;dst
ORDER by all;

┌─&#39;from mv&#95;dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from mv&#95;dst   │   0 │ A     │ all&#95;0&#95;0&#95;0 │
│ from mv&#95;dst   │   0 │ A     │ all&#95;1&#95;1&#95;0 │
└───────────────┴─────┴───────┴───────────┘

````

Мы вставляем разные данные каждый раз. Однако в таблицу `mv_dst` вставляются одинаковые данные. Данные не подвергаются дедупликации, поскольку исходные данные были разными.

### Вставки из разных материализованных представлений в одну базовую таблицу с эквивалентными данными {#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data}

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
````

В таблицу `mv_dst` добавлены два одинаковых блока (как и ожидалось).

```sql
SELECT 'вторая попытка';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'из dst',
    *,
    _part
FROM dst
ORDER BY all;
```


┌─&#39;from dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from dst   │   1 │ A     │ all&#95;0&#95;0&#95;0 │
└────────────┴─────┴───────┴───────────┘

SELECT
&#39;from mv&#95;dst&#39;,
*,
&#95;part
FROM mv&#95;dst
ORDER by all;

┌─&#39;from mv&#95;dst&#39;─┬─key─┬─value─┬─&#95;part─────┐
│ from mv&#95;dst   │   0 │ A     │ all&#95;0&#95;0&#95;0 │
│ from mv&#95;dst   │   0 │ A     │ all&#95;1&#95;1&#95;0 │
└───────────────┴─────┴───────┴───────────┘

```

Эта операция повтора дедуплицируется в обеих таблицах `dst` и `mv_dst`.
```
