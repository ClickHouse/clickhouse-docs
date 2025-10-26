---
'description': 'WITH 子句的文档'
'sidebar_label': 'WITH'
'slug': '/sql-reference/statements/select/with'
'title': 'WITH 子句'
'doc_type': 'reference'
---


# WITH 子句

ClickHouse 支持公共表表达式 ([CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL))、公共标量表达式和递归查询。

## 公共表表达式 {#common-table-expressions}

公共表表达式表示命名的子查询。
可以在任何允许表表达式的 `SELECT` 查询中通过名称引用它们。
命名的子查询可以在当前查询的作用域或子查询的作用域中通过名称引用。

在 `SELECT` 查询中对公共表表达式的每个引用总是由其定义中的子查询替换。
通过在标识符解析过程中隐藏当前 CTE 来防止递归。

请注意，CTE 在调用的所有地方不保证返回相同的结果，因为查询会根据每个用例重新执行。

### 语法 {#common-table-expressions-syntax}

```sql
WITH <identifier> AS <subquery expression>
```

### 示例 {#common-table-expressions-example}

一个子查询被重新执行的示例：
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
如果 CTE 传递的结果是确切的，而不只是代码片段，您将始终看到 `1000000`

然而，由于我们两次引用了 `cte_numbers`，每次都会生成随机数字，因此我们看到不同的随机结果，`280501, 392454, 261636, 196227` 等等...

## 公共标量表达式 {#common-scalar-expressions}

ClickHouse 允许您在 `WITH` 子句中声明任意标量表达式的别名。
公共标量表达式可以在查询的任何地方引用。

:::note
如果公共标量表达式引用的是常量文字之外的内容，则该表达式可能会导致存在 [自由变量](https://en.wikipedia.org/wiki/Free_variables_and_bound_variables)。
ClickHouse 在可能的最近作用域中解析任何标识符，这意味着自由变量可能会引用意外的实体（在名称冲突的情况下）或可能导致相关子查询。
建议将 CSE 定义为 [lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda)（仅在启用 [分析器](/operations/analyzer) 时可能），绑定所有使用的标识符，以实现更可预测的表达式标识符解析行为。
:::

### 语法 {#common-scalar-expressions-syntax}

```sql
WITH <expression> AS <identifier>
```

### 示例 {#common-scalar-expressions-examples}

**示例 1:** 使用常量表达式作为 "变量"

```sql
WITH '2019-08-01 15:23:00' AS ts_upper_bound
SELECT *
FROM hits
WHERE
    EventDate = toDate(ts_upper_bound) AND
    EventTime <= ts_upper_bound;
```

**示例 2:** 使用高阶函数绑定标识符

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

**示例 3:** 使用自由变量的高阶函数

以下示例查询显示，没有绑定的标识符在最接近的作用域中解析为一个实体。
在这里，`extension` 在 `gen_name` lambda 函数体中未绑定。
尽管 `extension` 在 `generated_names` 的定义和使用范围内被定义为常量 `'.txt'`，但它被解析为表 `extension_list` 的一列，因为它在 `generated_names` 子查询中是可用的。

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

**示例 4:** 从 SELECT 子句列列表中驱逐 sum(bytes) 表达式结果

```sql
WITH sum(bytes) AS s
SELECT
    formatReadableSize(s),
    table
FROM system.parts
GROUP BY table
ORDER BY s;
```

**示例 5:** 使用标量子查询的结果

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

**示例 6:** 在子查询中复用表达式

```sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```

## 递归查询 {#recursive-queries}

可选的 `RECURSIVE` 修饰符允许 WITH 查询引用其自身的输出。示例：

**示例:** 从 1 到 100 的整数求和

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
递归 CTE 依赖于在版本 **`24.3`** 中引入的 [新查询分析器](/operations/analyzer)。如果您使用版本 **`24.3+`** 并遇到 **`(UNKNOWN_TABLE)`** 或 **`(UNSUPPORTED_METHOD)`** 异常，则表明您的实例、角色或配置文件中禁用了新分析器。要激活分析器，请启用设置 **`allow_experimental_analyzer`** 或将 **`compatibility`** 设置更新为较新版本。
从版本 `24.8` 开始，新分析器已完全推广到生产，设置 `allow_experimental_analyzer` 已重命名为 `enable_analyzer`。
:::

递归 `WITH` 查询的一般形式始终是一个非递归项，然后是 `UNION ALL`，然后是一个递归项，其中只有递归项可以包含对查询自身输出的引用。递归 CTE 查询的执行过程如下：

1. 评估非递归项。将非递归项查询的结果放在临时工作表中。
2. 只要工作表不为空，就重复以下步骤：
    1. 评估递归项，将工作表的当前内容替换为递归自引用。将递归项查询的结果放在临时中间表中。
    2. 用中间表的内容替换工作表的内容，然后清空中间表。

递归查询通常用于处理分层或树状结构数据。例如，我们可以写一个执行树遍历的查询：

**示例:** 树遍历

首先，让我们创建树表：

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

我们可以用这样的查询遍历这些树：

**示例:** 树遍历
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

### 搜索顺序 {#search-order}

为了创建深度优先顺序，我们为每个结果行计算一个我们已经访问过的行的数组：

**示例:** 树遍历深度优先顺序
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

为了创建广度优先顺序，标准方法是添加一个跟踪搜索深度的列：

**示例:** 树遍历广度优先顺序
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

### 循环检测 {#cycle-detection}

首先让我们创建图表：

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

我们可以用这样的查询遍历该图：

**示例:** 不带循环检测的图遍历
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

但是，如果我们在图中添加循环，之前的查询将因 `Maximum recursive CTE evaluation depth` 错误而失败：

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

处理循环的标准方法是计算一个已访问节点的数组：

**示例:** 带有循环检测的图遍历
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

### 无限查询 {#infinite-queries}

如果在外部查询中使用 `LIMIT`，还可以使用无限递归 CTE 查询：

**示例:** 无限递归 CTE 查询
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
