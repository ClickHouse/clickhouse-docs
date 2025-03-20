---
slug: /sql-reference/statements/select/with
sidebar_label: WITH
---


# Клаузула WITH

ClickHouse поддерживает общие табличные выражения ([CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)) и заменяет код, определенный в клаузуле `WITH`, во всех местах использования для оставшейся части запроса `SELECT`. Именованные подзапросы могут быть включены в текущий контекст запроса и дочерних запросов в местах, где допускаются табличные объекты. Рекурсия предотвращается скрытием CTE текущего уровня из выражения WITH.

Обратите внимание, что CTE не гарантируют одинаковые результаты во всех местах, где они вызываются, поскольку запрос будет повторно выполняться для каждого случая использования.

Пример такого поведения приведен ниже:
``` sql
with cte_numbers as
(
    select
        num
    from generateRandom('num UInt64', NULL)
    limit 1000000
)
select
    count()
from cte_numbers
where num in (select num from cte_numbers)
```
Если бы CTE возвращали именно результаты, а не просто кусок кода, вы бы всегда видели `1000000`.

Однако, из-за того что мы ссылаемся на `cte_numbers` дважды, случайные числа генерируются каждый раз и, соответственно, мы видим различные случайные результаты, такие как `280501, 392454, 261636, 196227` и так далее...

## Синтаксис {#syntax}

``` sql
WITH <expression> AS <identifier>
```
или
``` sql
WITH <identifier> AS <subquery expression>
```

## Примеры {#examples}

**Пример 1:** Использование постоянного выражения как "переменной"

``` sql
WITH '2019-08-01 15:23:00' as ts_upper_bound
SELECT *
FROM hits
WHERE
    EventDate = toDate(ts_upper_bound) AND
    EventTime <= ts_upper_bound;
```

**Пример 2:** Удаление результата выражения sum(bytes) из списка колонок в клаузуле SELECT

``` sql
WITH sum(bytes) as s
SELECT
    formatReadableSize(s),
    table
FROM system.parts
GROUP BY table
ORDER BY s;
```

**Пример 3:** Использование результатов скалярного подзапроса

``` sql
/* этот пример вернет TOP 10 самых больших таблиц */
WITH
    (
        SELECT sum(bytes)
        FROM system.parts
        WHERE active
    ) AS total_disk_usage
SELECT
    (sum(bytes) / total_disk_usage) * 100 AS table_disk_usage,
    table
FROM system.parts
GROUP BY table
ORDER BY table_disk_usage DESC
LIMIT 10;
```

**Пример 4:** Повторное использование выражения в подзапросе

``` sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```

## Рекурсивные запросы {#recursive-queries}

Дополнительный модификатор RECURSIVE позволяет WITH запросу ссылаться на свои собственные выходные данные. Пример:

**Пример:** Сумма целых чисел от 1 до 100

```sql
WITH RECURSIVE test_table AS (
    SELECT 1 AS number
UNION ALL
    SELECT number + 1 FROM test_table WHERE number < 100
)
SELECT sum(number) FROM test_table;
```

``` text
┌─sum(number)─┐
│        5050 │
└─────────────┘
```

:::note
Рекурсивные CTE зависят от [нового анализатора запросов](/operations/analyzer), введенного в версии **`24.3`**. Если вы используете версию **`24.3+`** и сталкиваетесь с исключением **`(UNKNOWN_TABLE)`** или **`(UNSUPPORTED_METHOD)`**, это говорит о том, что новый анализатор отключен на вашей инстанции, роли или профиле. Чтобы активировать анализатор, включите настройку **`allow_experimental_analyzer`** или обновите настройку **`compatibility`** до более новой версии.
Начиная с версии `24.8`, новый анализатор был полностью переведен в продукцию, и настройка `allow_experimental_analyzer` была переименована в `enable_analyzer`.
:::

Общая форма рекурсивного запроса `WITH` всегда начинается с нерекурсивного термина, затем `UNION ALL`, затем рекурсивный термин, где только рекурсивный термин может содержать ссылку на собственные выходные данные запроса. Рекурсивный CTE запрос выполняется следующим образом:

1. Оцените нерекурсивный термин. Поместите результат запроса нерекурсивного термина во временную рабочую таблицу.
2. Пока рабочая таблица не пуста, повторяйте эти шаги:
    1. Оцените рекурсивный термин, подставляя текущие содержимое рабочей таблицы для рекурсивной самоссылки. Поместите результат запроса рекурсивного термина во временную промежуточную таблицу.
    2. Замените содержимое рабочей таблицы содержимым промежуточной таблицы, затем опустошите промежуточную таблицу.

Рекурсивные запросы обычно используются для работы с иерархическими или древовидными структурами данных. Например, мы можем написать запрос, который выполняет обход дерева:

**Пример:** Обход дерева

Сначала создадим таблицу дерева:

```sql
DROP TABLE IF EXISTS tree;
CREATE TABLE tree
(
    id UInt64,
    parent_id Nullable(UInt64),
    data String
) ENGINE = MergeTree ORDER BY id;

INSERT INTO tree VALUES (0, NULL, 'ROOT'), (1, 0, 'Child_1'), (2, 0, 'Child_2'), (3, 1, 'Child_1_1');
```

Мы можем обойти это дерево с помощью следующего запроса:

**Пример:** Обход дерева
```sql
WITH RECURSIVE search_tree AS (
    SELECT id, parent_id, data
    FROM tree t
    WHERE t.id = 0
UNION ALL
    SELECT t.id, t.parent_id, t.data
    FROM tree t, search_tree st
    WHERE t.parent_id = st.id
)
SELECT * FROM search_tree;
```

```text
┌─id─┬─parent_id─┬─data──────┐
│  0 │      ᴺᵁᴸᴸ │ ROOT      │
│  1 │         0 │ Child_1   │
│  2 │         0 │ Child_2   │
│  3 │         1 │ Child_1_1 │
└────┴───────────┴───────────┘
```

### Порядок поиска {#search-order}

Чтобы создать порядок обхода в глубину, мы вычисляем для каждой строки результата массив строк, которые мы уже посетили:

**Пример:** Обход дерева в порядке глубины
```sql
WITH RECURSIVE search_tree AS (
    SELECT id, parent_id, data, [t.id] AS path
    FROM tree t
    WHERE t.id = 0
UNION ALL
    SELECT t.id, t.parent_id, t.data, arrayConcat(path, [t.id])
    FROM tree t, search_tree st
    WHERE t.parent_id = st.id
)
SELECT * FROM search_tree ORDER BY path;
```

```text
┌─id─┬─parent_id─┬─data──────┬─path────┐
│  0 │      ᴺᵁᴸᴸ │ ROOT      │ [0]     │
│  1 │         0 │ Child_1   │ [0,1]   │
│  3 │         1 │ Child_1_1 │ [0,1,3] │
│  2 │         0 │ Child_2   │ [0,2]   │
└────┴───────────┴───────────┴─────────┘
```

Чтобы создать порядок обхода в ширину, стандартный подход заключается в добавлении колонки, которая отслеживает глубину поиска:

**Пример:** Обход дерева в порядке ширины
```sql
WITH RECURSIVE search_tree AS (
    SELECT id, parent_id, data, [t.id] AS path, toUInt64(0) AS depth
    FROM tree t
    WHERE t.id = 0
UNION ALL
    SELECT t.id, t.parent_id, t.data, arrayConcat(path, [t.id]), depth + 1
    FROM tree t, search_tree st
    WHERE t.parent_id = st.id
)
SELECT * FROM search_tree ORDER BY depth;
```

```text
┌─id─┬─link─┬─data──────┬─path────┬─depth─┐
│  0 │ ᴺᵁᴸᴸ │ ROOT      │ [0]     │     0 │
│  1 │    0 │ Child_1   │ [0,1]   │     1 │
│  2 │    0 │ Child_2   │ [0,2]   │     1 │
│  3 │    1 │ Child_1_1 │ [0,1,3] │     2 │
└────┴──────┴───────────┴─────────┴───────┘
```

### Обнаружение циклов {#cycle-detection}

Сначала создадим таблицу графа:

```sql
DROP TABLE IF EXISTS graph;
CREATE TABLE graph
(
    from UInt64,
    to UInt64,
    label String
) ENGINE = MergeTree ORDER BY (from, to);

INSERT INTO graph VALUES (1, 2, '1 -> 2'), (1, 3, '1 -> 3'), (2, 3, '2 -> 3'), (1, 4, '1 -> 4'), (4, 5, '4 -> 5');
```

Мы можем обойти этот граф с помощью следующего запроса:

**Пример:** Обход графа без обнаружения циклов
```sql
WITH RECURSIVE search_graph AS (
    SELECT from, to, label FROM graph g
    UNION ALL
    SELECT g.from, g.to, g.label
    FROM graph g, search_graph sg
    WHERE g.from = sg.to
)
SELECT DISTINCT * FROM search_graph ORDER BY from;
```
```text
┌─from─┬─to─┬─label──┐
│    1 │  4 │ 1 -> 4 │
│    1 │  2 │ 1 -> 2 │
│    1 │  3 │ 1 -> 3 │
│    2 │  3 │ 2 -> 3 │
│    4 │  5 │ 4 -> 5 │
└──────┴────┴────────┘
```

Но если мы добавим цикл в этот граф, предыдущий запрос завершится с ошибкой `Maximum recursive CTE evaluation depth`:

```sql
INSERT INTO graph VALUES (5, 1, '5 -> 1');

WITH RECURSIVE search_graph AS (
    SELECT from, to, label FROM graph g
UNION ALL
    SELECT g.from, g.to, g.label
    FROM graph g, search_graph sg
    WHERE g.from = sg.to
)
SELECT DISTINCT * FROM search_graph ORDER BY from;
```

```text
Code: 306. DB::Exception: Received from localhost:9000. DB::Exception: Maximum recursive CTE evaluation depth (1000) exceeded, during evaluation of search_graph AS (SELECT from, to, label FROM graph AS g UNION ALL SELECT g.from, g.to, g.label FROM graph AS g, search_graph AS sg WHERE g.from = sg.to). Consider raising max_recursive_cte_evaluation_depth setting.: While executing RecursiveCTESource. (TOO_DEEP_RECURSION)
```

Стандартный метод обработки циклов заключается в вычислении массива уже посещенных узлов:

**Пример:** Обход графа с обнаружением циклов
```sql
WITH RECURSIVE search_graph AS (
    SELECT from, to, label, false AS is_cycle, [tuple(g.from, g.to)] AS path FROM graph g
UNION ALL
    SELECT g.from, g.to, g.label, has(path, tuple(g.from, g.to)), arrayConcat(sg.path, [tuple(g.from, g.to)])
    FROM graph g, search_graph sg
    WHERE g.from = sg.to AND NOT is_cycle
)
SELECT * FROM search_graph WHERE is_cycle ORDER BY from;
```

```text
┌─from─┬─to─┬─label──┬─is_cycle─┬─path──────────────────────┐
│    1 │  4 │ 1 -> 4 │ true     │ [(1,4),(4,5),(5,1),(1,4)] │
│    4 │  5 │ 4 -> 5 │ true     │ [(4,5),(5,1),(1,4),(4,5)] │
│    5 │  1 │ 5 -> 1 │ true     │ [(5,1),(1,4),(4,5),(5,1)] │
└──────┴────┴────────┴──────────┴───────────────────────────┘
```

### Бесконечные запросы {#infinite-queries}

Также возможно использование бесконечных рекурсивных CTE запросов, если в внешнем запросе используется `LIMIT`:

**Пример:** Бесконечный рекурсивный CTE запрос
```sql
WITH RECURSIVE test_table AS (
    SELECT 1 AS number
UNION ALL
    SELECT number + 1 FROM test_table
)
SELECT sum(number) FROM (SELECT number FROM test_table LIMIT 100);
```

```text
┌─sum(number)─┐
│        5050 │
└─────────────┘
```
