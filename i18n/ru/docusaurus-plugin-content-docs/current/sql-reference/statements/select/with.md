---
description: 'Документация по конструкции WITH'
sidebar_label: 'WITH'
slug: /sql-reference/statements/select/with
title: 'Конструкция WITH'
doc_type: 'reference'
---

# Клауза WITH \\{#with-clause\\}

ClickHouse поддерживает общие табличные выражения ([CTE, Common Table Expressions](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)), общие скалярные выражения и рекурсивные запросы.

## Общие табличные выражения \\{#common-table-expressions\\}

Общие табличные выражения (CTE) представляют собой именованные подзапросы.
К ним можно обращаться по имени в любом месте `SELECT`-запроса, где допускается табличное выражение.
Именованные подзапросы могут использоваться по имени в области видимости текущего запроса или во внутренних областях видимости дочерних подзапросов.

Каждое обращение к общему табличному выражению в `SELECT`-запросах всегда подменяется подзапросом из его определения.
Рекурсия предотвращается за счёт исключения текущего CTE на этапе разрешения идентификаторов.

Обратите внимание, что CTE не гарантируют одинаковые результаты во всех местах, где они используются, поскольку запрос будет выполняться повторно для каждого использования.

### Синтаксис \\{#common-table-expressions-syntax\\}

```sql
WITH <identifier> AS <subquery expression>
```

### Пример \\{#common-table-expressions-example\\}

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

Если бы CTE возвращали именно результаты, а не просто фрагмент кода, то вы бы всегда видели `1000000`.

Однако из-за того, что мы обращаемся к `cte_numbers` дважды, случайные числа генерируются каждый раз заново и, соответственно, мы видим разные случайные результаты: `280501, 392454, 261636, 196227` и так далее...

## Общие скалярные выражения \\{#common-scalar-expressions\\}

ClickHouse позволяет объявлять псевдонимы для произвольных скалярных выражений в предложении `WITH`.
Общие скалярные выражения могут использоваться в любой части запроса.

:::note
Если общее скалярное выражение ссылается на что‑то отличное от константного литерала, выражение может привести к появлению [свободных переменных](https://en.wikipedia.org/wiki/Free_variables_and_bound_variables).
ClickHouse разрешает любой идентификатор в ближайшей возможной области видимости, поэтому свободные переменные могут ссылаться на неожиданные сущности в случае конфликтов имён или привести к коррелированному подзапросу.
Рекомендуется определять CSE как [лямбда‑функцию](/sql-reference/functions/overview#arrow-operator-and-lambda) (возможно только при включённом [analyzer](/operations/analyzer)), связывающую все используемые идентификаторы, чтобы добиться более предсказуемого поведения при разрешении идентификаторов в выражениях.
:::

### Синтаксис \\{#common-scalar-expressions-syntax\\}

```sql
WITH <expression> AS <identifier>
```

### Примеры \\{#common-scalar-expressions-examples\\}

**Пример 1:** Использование константного выражения в роли &quot;переменной&quot;

```sql
WITH '2019-08-01 15:23:00' AS ts_upper_bound
SELECT *
FROM hits
WHERE
    EventDate = toDate(ts_upper_bound) AND
    EventTime <= ts_upper_bound;
```

**Пример 2:** Использование функций высшего порядка для ограничения идентификаторов

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

Следующие примеры запросов показывают, что несвязанные (unbound) идентификаторы разрешаются в сущности из ближайшей области видимости.
Здесь идентификатор `extension` не привязан в теле лямбда-функции `gen_name`.
Хотя `extension` определён как `'.txt'` в виде общего скалярного выражения в области определения и использования `generated_names`, он разрешается в столбец таблицы `extension_list`, потому что этот столбец доступен в подзапросе `generated_names`.

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

**Пример 4:** Удаление результата выражения sum(bytes) из списка столбцов в предложении SELECT

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

## Рекурсивные запросы \\{#recursive-queries\\}

Необязательный модификатор `RECURSIVE` позволяет запросу WITH ссылаться на результат собственного выполнения. Пример:

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
Рекурсивные CTE зависят от [нового анализатора запросов](/operations/analyzer), представленного в версии **`24.3`**. Если вы используете версию **`24.3+`** и сталкиваетесь с исключением **`(UNKNOWN_TABLE)`** или **`(UNSUPPORTED_METHOD)`**, это означает, что новый анализатор отключён для вашего экземпляра, роли или профиля. Чтобы активировать анализатор, включите настройку **`allow_experimental_analyzer`** или обновите настройку **`compatibility`** до более новой версии.
Начиная с версии `24.8` новый анализатор полностью переведён в продуктивный режим, а настройка `allow_experimental_analyzer` была переименована в `enable_analyzer`.
:::

Общая форма рекурсивного запроса `WITH` всегда состоит из нерекурсивного выражения, затем `UNION ALL`, затем рекурсивного выражения, при этом только рекурсивное выражение может содержать ссылку на собственный результат запроса. Рекурсивный CTE-запрос выполняется следующим образом:

1. Выполнить нерекурсивное выражение. Поместить результат выполнения нерекурсивного выражения во временную рабочую таблицу.
2. Пока рабочая таблица не пуста, повторять следующие шаги:
   1. Выполнить рекурсивное выражение, подставив текущее содержимое рабочей таблицы вместо рекурсивной самоссылки. Поместить результат выполнения рекурсивного выражения во временную промежуточную таблицу.
   2. Заменить содержимое рабочей таблицы содержимым промежуточной таблицы, затем очистить промежуточную таблицу.

Рекурсивные запросы обычно используются для работы с иерархическими или древовидными данными. Например, мы можем написать запрос, который выполняет обход дерева:

**Пример:** Обход дерева

Сначала создадим таблицу для дерева:

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

### Порядок обхода \\{#search-order\\}

Чтобы создать порядок обхода в глубину, для каждой строки результата мы вычисляем массив уже посещённых строк:

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

Чтобы создать порядок обхода в ширину, стандартный подход — добавить столбец, который хранит глубину поиска:

**Пример:** Обход дерева в порядке обхода в ширину

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

### Обнаружение циклов \\{#cycle-detection\\}

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

Мы можем обойти этот граф с помощью такого запроса:

**Пример:** Обход графа без проверки на циклы

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

Но если мы добавим цикл в этом графе, предыдущий запрос приведёт к ошибке `Maximum recursive CTE evaluation depth`:

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

Стандартный способ обработки циклов состоит в том, чтобы вычислить массив уже посещённых узлов:

**Пример:** обход графа с обнаружением циклов

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

### Бесконечные запросы \\{#infinite-queries\\}

Также можно использовать бесконечные рекурсивные CTE-запросы, если во внешнем запросе используется `LIMIT`:

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
