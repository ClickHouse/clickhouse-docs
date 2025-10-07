---
slug: '/sql-reference/statements/select/with'
sidebar_label: WITH
description: 'Документация для WITH Clause'
title: 'Оператор WITH'
doc_type: reference
---
# WITH Оператор

ClickHouse поддерживает Общие Табличные Выражения ([CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)), Общие Скалярные Выражения и Рекурсивные Запросы.

## Общие Табличные Выражения {#common-table-expressions}

Общие Табличные Выражения представляют собой именованные подзапросы.
Их можно ссылаться по имени в любом месте `SELECT` запроса, где допустимо табличное выражение.
Именованные подзапросы могут быть использованы по имени в области текущего запроса или в областях дочерних подзапросов.

Каждая ссылка на Общее Табличное Выражение в запросах `SELECT` всегда заменяется подзапросом из его определения.
Рекурсия предотвращается путем скрытия текущего CTE от процесса разрешения идентификаторов.

Обратите внимание, что CTE не гарантируют одинаковые результаты везде, где они вызываются, так как запрос будет выполняться заново для каждого случая использования.

### Синтаксис {#common-table-expressions-syntax}

```sql
WITH <identifier> AS <subquery expression>
```

### Пример {#common-table-expressions-example}

Пример, когда подзапрос выполняется снова:
```sql
WITH cte_numbers AS
(
    SELECT
        num
    FROM generateRandom('num UInt64', NULL)
    LIMIT 1000000
)
SELECT
    count()
FROM cte_numbers
WHERE num IN (SELECT num FROM cte_numbers)
```
Если бы CTE возвращали именно результаты, а не просто фрагмент кода, вы всегда видели бы `1000000`.

Однако, из-за того, что мы ссылаемся на `cte_numbers` дважды, случайные числа генерируются каждый раз, и, соответственно, мы видим разные случайные результаты, `280501, 392454, 261636, 196227` и так далее...

## Общие Скалярные Выражения {#common-scalar-expressions}

ClickHouse позволяет вам объявлять псевдонимы для произвольных скалярных выражений в операторе `WITH`.
Общие скалярные выражения могут быть использованы в любом месте запроса.

:::note
Если общее скалярное выражение ссылается на что-то, кроме константной литералы, выражение может привести к наличию [свободных переменных](https://en.wikipedia.org/wiki/Free_variables_and_bound_variables).
ClickHouse разрешает любой идентификатор в ближайшей возможной области, что означает, что свободные переменные могут ссылаться на неожиданные сущности в случае конфликтов имен или могут привести к коррелированному подзапросу.
Рекомендуется определять CSE как [лямбда-функцию](/sql-reference/functions/overview#arrow-operator-and-lambda) (возможно только с включенным [анализатором](/operations/analyzer)), связывая все используемые идентификаторы для достижения более предсказуемого поведения разрешения идентификаторов выражений.
:::

### Синтаксис {#common-scalar-expressions-syntax}

```sql
WITH <expression> AS <identifier>
```

### Примеры {#common-scalar-expressions-examples}

**Пример 1:** Использование константного выражения как "переменной"

```sql
WITH '2019-08-01 15:23:00' AS ts_upper_bound
SELECT *
FROM hits
WHERE
    EventDate = toDate(ts_upper_bound) AND
    EventTime <= ts_upper_bound;
```

**Пример 2:** Использование функций высшего порядка для связывания идентификаторов

```sql
WITH
    '.txt' as extension,
    (id, extension) -> concat(lower(id), extension) AS gen_name
SELECT gen_name('test', '.sql') as file_name;
```

```response
   ┌─file_name─┐
1. │ test.sql  │
   └───────────┘
```

**Пример 3:** Использование функций высшего порядка со свободными переменными

Следующие примеры запросов показывают, что не связанные идентификаторы разрешаются в сущность в ближайшей области.
Здесь `extension` не связан в теле лямбда-функции `gen_name`.
Хотя `extension` определено как `'.txt'` в качестве общего скалярного выражения в области определения и использования `generated_names`, оно разрешается в колонку таблицы `extension_list`, потому что доступно в подзапросе `generated_names`.

```sql
CREATE TABLE extension_list
(
    extension String
)
ORDER BY extension
AS SELECT '.sql';

WITH
    '.txt' as extension,
    generated_names as (
        WITH
            (id) -> concat(lower(id), extension) AS gen_name
        SELECT gen_name('test') as file_name FROM extension_list
    )
SELECT file_name FROM generated_names;
```

```response
   ┌─file_name─┐
1. │ test.sql  │
   └───────────┘
```

**Пример 4:** Удаление результата выражения sum(bytes) из списка колонок SELECT

```sql
WITH sum(bytes) AS s
SELECT
    formatReadableSize(s),
    table
FROM system.parts
GROUP BY table
ORDER BY s;
```

**Пример 5:** Использование результатов скалярного подзапроса

```sql
/* this example would return TOP 10 of most huge tables */
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

**Пример 6:** Повторное использование выражения в подзапросе

```sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```

## Рекурсивные Запросы {#recursive-queries}

Дополнительный модификатор `RECURSIVE` позволяет запросу WITH ссылаться на его собственный вывод. Пример:

**Пример:** Сумма целых чисел от 1 до 100

```sql
WITH RECURSIVE test_table AS (
    SELECT 1 AS number
UNION ALL
    SELECT number + 1 FROM test_table WHERE number < 100
)
SELECT sum(number) FROM test_table;
```

```text
┌─sum(number)─┐
│        5050 │
└─────────────┘
```

:::note
Рекурсивные CTE полагаются на [новый анализатор запросов](/operations/analyzer), введенный в версии **`24.3`**. Если вы используете версию **`24.3+`** и сталкиваетесь с исключением **`(UNKNOWN_TABLE)`** или **`(UNSUPPORTED_METHOD)`**, это указывает на то, что новый анализатор отключен на вашем экземпляре, роли или профиле. Чтобы активировать анализатор, включите настройку **`allow_experimental_analyzer`** или обновите настройку **`compatibility`** до более поздней версии.
Начиная с версии `24.8`, новый анализатор был полностью переведен в продакшен, и настройка `allow_experimental_analyzer` была переименована в `enable_analyzer`.
:::

Общая форма рекурсивного запроса `WITH` всегда состоит из нерекурсивного член, затем `UNION ALL`, затем рекурсивного члена, где только рекурсивный член может содержать ссылку на собственный вывод запроса. Запрос рекурсивного CTE выполняется следующим образом:

1. Оцените нерекурсивный член. Поместите результат запроса нерекурсивного члена во временную рабочую таблицу.
2. Пока рабочая таблица не пуста, повторяйте эти шаги:
    1. Оцените рекурсивный член, подставляя текущие содержимое рабочей таблицы в качестве рекурсивной самоссылки. Поместите результат запроса рекурсивного члена во временную промежуточную таблицу.
    2. Замените содержимое рабочей таблицы содержимым промежуточной таблицы, затем очистите промежуточную таблицу.

Рекурсивные запросы обычно используются для работы с иерархическими или древовидными данными. Например, мы можем написать запрос, который выполняет обход дерева:

**Пример:** Обход дерева

Сначала давайте создадим таблицу дерева:

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

Мы можем обойти это дерево с помощью такого запроса:

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

Чтобы создать порядок глубинного поиска, мы вычисляем для каждой строки результата массив строк, которые мы уже посетили:

**Пример:** Обход дерева порядок глубинного поиска
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

Чтобы создать порядок поручного поиска, стандартный подход состоит в том, чтобы добавить колонку, отслеживающую глубину поиска:

**Пример:** Обход дерева порядок поручного поиска
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

Сначала давайте создадим таблицу графа:

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

Мы можем обойти этот граф с помощью такого запроса:

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

Но если мы добавим цикл в этот граф, предыдущий запрос завершится с ошибкой `Максимальная глубина рекурсивной оценки CTE`:

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

Стандартный метод обработки циклов заключается в том, чтобы вычислить массив уже посещенных узлов:

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

Также возможно использовать бесконечные рекурсивные запросы CTE, если в наружном запросе используется `LIMIT`:

**Пример:** Бесконечный рекурсивный запрос CTE
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