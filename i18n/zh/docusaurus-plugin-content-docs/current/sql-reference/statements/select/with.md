---
description: 'WITH 子句说明'
sidebar_label: 'WITH'
slug: /sql-reference/statements/select/with
title: 'WITH 子句'
doc_type: 'reference'
---



# WITH 子句

ClickHouse 支持公用表表达式（[CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)）、公用标量表达式以及递归查询。



## 公用表表达式 {#common-table-expressions}

公用表表达式(CTE)是命名的子查询。
在 `SELECT` 查询中任何允许使用表表达式的位置,都可以通过名称引用它们。
命名子查询可以在当前查询的作用域内或子查询的作用域内通过名称引用。

在 `SELECT` 查询中,每次对公用表表达式的引用都会被其定义中的子查询所替换。
通过在标识符解析过程中隐藏当前 CTE,可以防止递归。

请注意,CTE 不保证在所有调用位置返回相同的结果,因为每次使用时查询都会被重新执行。

### 语法 {#common-table-expressions-syntax}

```sql
WITH <identifier> AS <subquery expression>
```

### 示例 {#common-table-expressions-example}

以下示例展示了子查询被重新执行的情况:

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

如果 CTE 传递的是确切的结果而不是代码片段,您将始终看到 `1000000`。

然而,由于我们两次引用了 `cte_numbers`,每次都会生成随机数,因此我们会看到不同的随机结果,例如 `280501, 392454, 261636, 196227` 等。


## 通用标量表达式 {#common-scalar-expressions}

ClickHouse 允许您在 `WITH` 子句中为任意标量表达式声明别名。
通用标量表达式可以在查询中的任何位置引用。

:::note
如果通用标量表达式引用的不是常量字面量,该表达式可能会产生[自由变量](https://en.wikipedia.org/wiki/Free_variables_and_bound_variables)。
ClickHouse 会在尽可能最近的作用域中解析标识符,这意味着在发生名称冲突时,自由变量可能会引用意外的实体,或者可能导致相关子查询。
建议将 CSE 定义为 [lambda 函数](/sql-reference/functions/overview#arrow-operator-and-lambda)(仅在启用 [analyzer](/operations/analyzer) 时可用),并绑定所有使用的标识符,以实现更可预测的表达式标识符解析行为。
:::

### 语法 {#common-scalar-expressions-syntax}

```sql
WITH <expression> AS <identifier>
```

### 示例 {#common-scalar-expressions-examples}

**示例 1:** 使用常量表达式作为"变量"

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

**示例 3:** 使用带有自由变量的高阶函数

以下示例查询显示,未绑定的标识符会解析为最近作用域中的实体。
在这里,`extension` 在 `gen_name` lambda 函数体中未被绑定。
尽管在 `generated_names` 定义和使用的作用域中,`extension` 被定义为 `'.txt'` 作为通用标量表达式,但它被解析为表 `extension_list` 的列,因为它在 `generated_names` 子查询中可用。

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

**示例 4:** 从 SELECT 子句列列表中提取 sum(bytes) 表达式结果

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
/* 此示例将返回占用空间最大的 10 个表 */
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

**示例 6:** 在子查询中重用表达式

```sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```


## 递归查询 {#recursive-queries}

可选的 `RECURSIVE` 修饰符允许 WITH 查询引用其自身的输出。示例:

**示例:** 对 1 到 100 的整数求和

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
递归 CTE 依赖于版本 **`24.3`** 中引入的[新查询分析器](/operations/analyzer)。如果您使用的是版本 **`24.3+`** 并遇到 **`(UNKNOWN_TABLE)`** 或 **`(UNSUPPORTED_METHOD)`** 异常,这表明新分析器在您的实例、角色或配置文件中已被禁用。要激活分析器,请启用 **`allow_experimental_analyzer`** 设置或将 **`compatibility`** 设置更新到更新的版本。
从版本 `24.8` 开始,新分析器已完全升级为生产版本,设置 `allow_experimental_analyzer` 已重命名为 `enable_analyzer`。
:::

递归 `WITH` 查询的一般形式始终是一个非递归项,然后是 `UNION ALL`,再然后是一个递归项,其中只有递归项可以包含对查询自身输出的引用。递归 CTE 查询的执行过程如下:

1. 计算非递归项。将非递归项查询的结果放入临时工作表中。
2. 只要工作表不为空,就重复以下步骤:
   1. 计算递归项,用工作表的当前内容替换递归自引用。将递归项查询的结果放入临时中间表中。
   2. 用中间表的内容替换工作表的内容,然后清空中间表。

递归查询通常用于处理层次结构或树形结构数据。例如,我们可以编写一个执行树遍历的查询:

**示例:** 树遍历

首先创建树表:

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

我们可以使用以下查询遍历该树:

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

要创建深度优先顺序,我们为每个结果行计算一个已访问行的数组:

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

要实现广度优先遍历顺序,标准做法是添加一个用于跟踪搜索深度的列:

**示例:** 树的广度优先遍历

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

首先创建图表:

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

可以使用以下查询遍历该图:

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

但如果在图中添加循环,之前的查询将失败并报 `Maximum recursive CTE evaluation depth` 错误:

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

处理循环的标准方法是计算已访问节点的数组:


**示例：** 带循环检测的图遍历

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

如果在外部查询中使用 `LIMIT`，也可以使用无限递归 CTE 查询：

**示例：** 无限递归 CTE 查询

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
