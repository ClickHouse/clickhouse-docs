---
slug: /sql-reference/statements/select/with
sidebar_label: 'WITH'
---


# WITH 子句

ClickHouse 支持公共表表达式（[CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)），并将 `WITH` 子句中定义的代码在 `SELECT` 查询的所有使用位置进行替换。命名子查询可以在允许表对象的地方被包含到当前和子查询上下文中。通过隐藏当前级别的 CTE 来防止递归。

请注意，CTE 在被调用的所有地方并不能保证返回相同的结果，因为查询会为每个用例重新执行。

以下是这样的行为的示例：
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
如果 CTE 传递的是确切的结果而不仅仅是一段代码，你总会看到 `1000000`。

然而，由于我们两次引用了 `cte_numbers`，每次都会生成随机数字，因此我们看到不同的随机结果，如 `280501, 392454, 261636, 196227` 等等...

## 语法 {#syntax}

``` sql
WITH <expression> AS <identifier>
```
或
``` sql
WITH <identifier> AS <subquery expression>
```

## 示例 {#examples}

**示例 1：** 使用常量表达式作为“变量”

``` sql
WITH '2019-08-01 15:23:00' as ts_upper_bound
SELECT *
FROM hits
WHERE
    EventDate = toDate(ts_upper_bound) AND
    EventTime <= ts_upper_bound;
```

**示例 2：** 从 SELECT 子句列列表中排除 sum(bytes) 表达式结果

``` sql
WITH sum(bytes) as s
SELECT
    formatReadableSize(s),
    table
FROM system.parts
GROUP BY table
ORDER BY s;
```

**示例 3：** 使用标量子查询的结果

``` sql
/* 该示例将返回最大的 10 个表 */
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

**示例 4：** 在子查询中重用表达式

``` sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```

## 递归查询 {#recursive-queries}

可选的 RECURSIVE 修饰符允许 WITH 查询引用其自身的输出。示例：

**示例：** 求 1 到 100 的整数和

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
递归 CTE 依赖于在版本 **`24.3`** 中引入的 [新查询分析器](/operations/analyzer)。如果你使用的是版本 **`24.3+`** 并遇到 **`(UNKNOWN_TABLE)`** 或 **`(UNSUPPORTED_METHOD)`** 异常，这表明新分析器在你的实例、角色或配置中已被禁用。要启用分析器，请开启 **`allow_experimental_analyzer`** 设置或将 **`compatibility`** 设置更新为更高版本。
从版本 `24.8` 开始，新分析器已完全推广到生产环境，设置 `allow_experimental_analyzer` 已更名为 `enable_analyzer`。
:::

递归 `WITH` 查询的一般形式始终是一个非递归项，然后是 `UNION ALL`，接着是一个递归项，其中只有递归项可以包含对查询自身输出的引用。递归 CTE 查询执行的步骤如下：

1. 评估非递归项。将非递归项查询的结果放入临时工作表中。
2. 只要工作表不为空，重复以下步骤：
    1. 评估递归项，替换工作表当前内容为递归自引用。将递归项查询的结果放入临时中间表中。
    2. 用中间表的内容替换工作表的内容，然后清空中间表。

递归查询通常用于处理层次结构或树状结构数据。例如，我们可以编写一个执行树遍历的查询：

**示例：** 树遍历

首先，我们创建树表：

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

**示例：** 树遍历
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

为了创建深度优先顺序，我们为每个结果行计算一个已访问行的数组：

**示例：** 树遍历深度优先顺序
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

为了创建宽度优先顺序，标准的方法是添加一个跟踪搜索深度的列：

**示例：** 树遍历宽度优先顺序
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

首先，创建图表：

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

我们可以用这样的查询遍历图表：

**示例：** 无循环检测的图表遍历
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

但如果我们在图表中添加循环，之前的查询将失败并出现 `Maximum recursive CTE evaluation depth` 错误：

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

处理循环的标准方法是计算一个已经访问的节点数组：

**示例：** 带有循环检测的图形遍历
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

如果在外部查询中使用 `LIMIT`，也可以使用无限递归的 CTE 查询：

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
