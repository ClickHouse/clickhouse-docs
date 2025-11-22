---
description: 'Документация по предложению WITH'
sidebar_label: 'WITH'
slug: /sql-reference/statements/select/with
title: 'Предложение WITH'
doc_type: 'reference'
---



# Оператор WITH

ClickHouse поддерживает общие табличные выражения ([CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)), общие скалярные выражения и рекурсивные запросы.



## Обобщённые табличные выражения {#common-table-expressions}

Обобщённые табличные выражения представляют собой именованные подзапросы.
На них можно ссылаться по имени в любом месте запроса `SELECT`, где допускается табличное выражение.
Именованные подзапросы можно использовать по имени в области видимости текущего запроса или в областях видимости вложенных подзапросов.

Каждая ссылка на обобщённое табличное выражение в запросах `SELECT` всегда заменяется подзапросом из его определения.
Рекурсия предотвращается путём исключения текущего CTE из процесса разрешения идентификаторов.

Обратите внимание, что CTE не гарантируют одинаковые результаты во всех местах их использования, поскольку запрос будет выполняться заново для каждого случая применения.

### Синтаксис {#common-table-expressions-syntax}

```sql
WITH <идентификатор> AS <выражение подзапроса>
```

### Пример {#common-table-expressions-example}

Пример повторного выполнения подзапроса:

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

Если бы CTE передавали именно результаты, а не фрагмент кода, вы всегда видели бы `1000000`

Однако из-за того, что мы ссылаемся на `cte_numbers` дважды, случайные числа генерируются каждый раз заново, и, соответственно, мы видим различные случайные результаты: `280501, 392454, 261636, 196227` и так далее...


## Общие скалярные выражения {#common-scalar-expressions}

ClickHouse позволяет объявлять псевдонимы для произвольных скалярных выражений в секции `WITH`.
На общие скалярные выражения можно ссылаться в любом месте запроса.

:::note
Если общее скалярное выражение ссылается на что-то, отличное от константного литерала, это может привести к появлению [свободных переменных](https://en.wikipedia.org/wiki/Free_variables_and_bound_variables).
ClickHouse разрешает любой идентификатор в ближайшей доступной области видимости, что означает, что свободные переменные могут ссылаться на неожиданные сущности в случае конфликта имен или приводить к коррелированному подзапросу.
Рекомендуется определять CSE как [лямбда-функцию](/sql-reference/functions/overview#arrow-operator-and-lambda) (возможно только при включенном [анализаторе](/operations/analyzer)), связывая все используемые идентификаторы, чтобы обеспечить более предсказуемое поведение при разрешении идентификаторов выражений.
:::

### Синтаксис {#common-scalar-expressions-syntax}

```sql
WITH <expression> AS <identifier>
```

### Примеры {#common-scalar-expressions-examples}

**Пример 1:** Использование константного выражения в качестве «переменной»

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

Следующие примеры запросов показывают, что несвязанные идентификаторы разрешаются в сущность в ближайшей области видимости.
Здесь `extension` не связан в теле лямбда-функции `gen_name`.
Хотя `extension` определен как `'.txt'` в качестве общего скалярного выражения в области определения и использования `generated_names`, он разрешается в столбец таблицы `extension_list`, поскольку он доступен в подзапросе `generated_names`.

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

**Пример 4:** Вынесение результата выражения sum(bytes) из списка столбцов секции SELECT

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

**Пример 6:** Повторное использование выражения в подзапросе

```sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```


## Рекурсивные запросы {#recursive-queries}

Необязательный модификатор `RECURSIVE` позволяет запросу WITH ссылаться на собственный результат. Пример:

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
Рекурсивные CTE используют [новый анализатор запросов](/operations/analyzer), представленный в версии **`24.3`**. Если вы используете версию **`24.3+`** и сталкиваетесь с исключением **`(UNKNOWN_TABLE)`** или **`(UNSUPPORTED_METHOD)`**, это означает, что новый анализатор отключен для вашего экземпляра, роли или профиля. Чтобы активировать анализатор, включите настройку **`allow_experimental_analyzer`** или обновите настройку **`compatibility`** до более новой версии.
Начиная с версии `24.8`, новый анализатор полностью переведен в продакшн, а настройка `allow_experimental_analyzer` переименована в `enable_analyzer`.
:::

Общая форма рекурсивного запроса `WITH` всегда состоит из нерекурсивного члена, затем `UNION ALL`, затем рекурсивного члена, где только рекурсивный член может содержать ссылку на собственный результат запроса. Рекурсивный CTE-запрос выполняется следующим образом:

1. Вычислить нерекурсивный член. Поместить результат запроса нерекурсивного члена во временную рабочую таблицу.
2. Пока рабочая таблица не пуста, повторять следующие шаги:
   1. Вычислить рекурсивный член, подставляя текущее содержимое рабочей таблицы вместо рекурсивной самоссылки. Поместить результат запроса рекурсивного члена во временную промежуточную таблицу.
   2. Заменить содержимое рабочей таблицы содержимым промежуточной таблицы, затем очистить промежуточную таблицу.

Рекурсивные запросы обычно используются для работы с иерархическими данными или данными древовидной структуры. Например, можно написать запрос, выполняющий обход дерева:

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

Можно обойти это дерево следующим запросом:

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

### Порядок обхода {#search-order}

Чтобы создать порядок обхода в глубину, вычислим для каждой строки результата массив строк, которые уже были посещены:

**Пример:** Обход дерева в глубину

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

Для создания обхода в ширину стандартным подходом является добавление столбца, отслеживающего глубину поиска:

**Пример:** Обход дерева в ширину

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

Обойти этот граф можно следующим запросом:

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

Однако если добавить в граф цикл, предыдущий запрос завершится с ошибкой `Maximum recursive CTE evaluation depth`:

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
Code: 306. DB::Exception: Received from localhost:9000. DB::Exception: Превышена максимальная глубина вычисления рекурсивного CTE (1000) во время вычисления search_graph AS (SELECT from, to, label FROM graph AS g UNION ALL SELECT g.from, g.to, g.label FROM graph AS g, search_graph AS sg WHERE g.from = sg.to). Рассмотрите возможность увеличения параметра max_recursive_cte_evaluation_depth.: При выполнении RecursiveCTESource. (TOO_DEEP_RECURSION)
```

Стандартным методом обработки циклов является вычисление массива уже посещённых узлов:


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

Также можно использовать бесконечные рекурсивные CTE-запросы, если во внешнем запросе указан `LIMIT`:

**Пример:** Бесконечный рекурсивный CTE-запрос

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
