---
description: 'EXPLAIN 文档'
sidebar_label: 'EXPLAIN'
sidebar_position: 39
slug: /sql-reference/statements/explain
title: 'EXPLAIN 语句'
doc_type: 'reference'
---

显示语句的执行计划。

<div class="vimeo-container">
  <iframe
    src="//www.youtube.com/embed/hP6G2Nlz_cA"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
fullscreen;
picture-in-picture"
    allowfullscreen
  />
</div>

语法:

```sql
EXPLAIN [AST | SYNTAX | QUERY TREE | PLAN | PIPELINE | ESTIMATE | TABLE OVERRIDE] [setting = value, ...]
    [
      SELECT ... |
      tableFunction(...) [COLUMNS (...)] [ORDER BY ...] [PARTITION BY ...] [PRIMARY KEY] [SAMPLE BY ...] [TTL ...]
    ]
    [FORMAT ...]
```

示例：

```sql
EXPLAIN SELECT sum(number) FROM numbers(10) UNION ALL SELECT sum(number) FROM numbers(10) ORDER BY sum(number) ASC FORMAT TSV;
```

```sql
Union
  Expression (Projection)
    Expression (Before ORDER BY and SELECT)
      Aggregating
        Expression (Before GROUP BY)
          SettingQuotaAndLimits (Set limits and quota after reading from storage)
            ReadFromStorage (SystemNumbers)
  Expression (Projection)
    MergingSorted (Merge sorted streams for ORDER BY)
      MergeSorting (Merge sorted blocks for ORDER BY)
        PartialSorting (Sort each block for ORDER BY)
          Expression (Before ORDER BY and SELECT)
            Aggregating
              Expression (Before GROUP BY)
                SettingQuotaAndLimits (Set limits and quota after reading from storage)
                  ReadFromStorage (SystemNumbers)
```

## EXPLAIN 类型 {#explain-types}

- `AST` — 抽象语法树。
- `SYNTAX` — 经过 AST 级优化后的查询文本。
- `QUERY TREE` — 经过 Query Tree 级优化后的查询树。
- `PLAN` — 查询执行计划。
- `PIPELINE` — 查询执行流水线。

### EXPLAIN AST {#explain-ast}

输出查询的 AST。支持所有类型的查询，而不仅仅是 `SELECT`。

示例：

```sql
EXPLAIN AST SELECT 1;
```

```sql
SelectWithUnionQuery (children 1)
 ExpressionList (children 1)
  SelectQuery (children 1)
   ExpressionList (children 1)
    Literal UInt64_1
```

```sql
EXPLAIN AST ALTER TABLE t1 DELETE WHERE date = today();
```

```sql
  explain
  AlterQuery  t1 (children 1)
   ExpressionList (children 1)
    AlterCommand 27 (children 1)
     Function equals (children 1)
      ExpressionList (children 2)
       Identifier date
       Function today (children 1)
        ExpressionList
```

### EXPLAIN SYNTAX {#explain-syntax}

在语法分析之后显示查询的抽象语法树（AST）。

该过程通过解析查询、构建查询 AST 和查询树，可选地运行查询分析器和优化 pass，随后将查询树转换回查询 AST 来完成。

Settings:

* `oneline` – 将查询打印为单行。默认值：`0`。
* `run_query_tree_passes` – 在输出查询树之前运行查询树 passes。默认值：`0`。
* `query_tree_passes` – 如果设置了 `run_query_tree_passes`，指定要运行多少次 pass。如果不指定 `query_tree_passes`，则会运行所有 pass。

Examples:

```sql
EXPLAIN SYNTAX SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

输出结果：

```sql
SELECT *
FROM system.numbers AS a, system.numbers AS b, system.numbers AS c
WHERE (a.number = b.number) AND (b.number = c.number)
```

使用 `run_query_tree_passes`：

```sql
EXPLAIN SYNTAX run_query_tree_passes = 1 SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

输出结果：

```sql
SELECT
    __table1.number AS `a.number`,
    __table2.number AS `b.number`,
    __table3.number AS `c.number`
FROM system.numbers AS __table1
ALL INNER JOIN system.numbers AS __table2 ON __table1.number = __table2.number
ALL INNER JOIN system.numbers AS __table3 ON __table2.number = __table3.number
```

### EXPLAIN QUERY TREE {#explain-query-tree}

设置：

* `run_passes` — 在转储查询树之前运行所有查询树 passes。默认值：`1`。
* `dump_passes` — 在转储查询树之前转储所使用 passes 的信息。默认值：`0`。
* `passes` — 指定要运行多少个 passes。如果设置为 `-1`，则运行所有 passes。默认值：`-1`。
* `dump_tree` — 显示查询树。默认值：`1`。
* `dump_ast` — 显示由查询树生成的查询 AST。默认值：`0`。

示例：

```sql
EXPLAIN QUERY TREE SELECT id, value FROM test_table;
```

```sql
QUERY id: 0
  PROJECTION COLUMNS
    id UInt64
    value String
  PROJECTION
    LIST id: 1, nodes: 2
      COLUMN id: 2, column_name: id, result_type: UInt64, source_id: 3
      COLUMN id: 4, column_name: value, result_type: String, source_id: 3
  JOIN TREE
    TABLE id: 3, table_name: default.test_table
```

### EXPLAIN PLAN {#explain-plan}

输出查询计划步骤。

设置：

* `header` — 为每个步骤打印输出头部信息。默认值：0。
* `description` — 打印步骤描述。默认值：1。
* `indexes` — 显示已使用的索引、每个应用索引过滤的分区片段数量以及过滤的粒度数量。默认值：0。支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表。从 ClickHouse &gt;= v25.9 开始，仅在与 `SETTINGS use_query_condition_cache = 0, use_skip_indexes_on_data_read = 0` 一起使用时，该语句才会输出有意义的结果。
* `projections` — 显示所有已分析的投影，以及它们基于投影主键条件在分区片段级别过滤方面的效果。对于每个投影，本部分包含统计信息，例如使用该投影主键进行评估的分区片段、行、标记和范围数量。它还会显示由于该过滤而被跳过的数据分区片段数量，而无需从投影本身读取数据。投影是实际用于读取，还是仅用于过滤分析，可以通过 `description` 字段判断。默认值：0。支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表。
* `actions` — 打印关于步骤执行行为的详细信息。默认值：0。
* `json` — 以 [JSON](/interfaces/formats/JSON) 格式将查询计划步骤输出为一行。默认值：0。建议使用 [TabSeparatedRaw (TSVRaw)](/interfaces/formats/TabSeparatedRaw) 格式以避免不必要的转义。
* `input_headers` - 为每个步骤打印输入头部信息。默认值：0。主要仅对开发人员在调试与输入输出头部不匹配相关的问题时有用。
* `column_structure` - 除名称和类型外，还打印头部中列的结构信息。默认值：0。主要仅对开发人员在调试与输入输出头部不匹配相关的问题时有用。
* `distributed` — 显示在远程节点上针对分布式表或并行副本执行的查询计划。默认值：0。

当 `json=1` 时，步骤名称将包含一个带有唯一步骤标识符的额外后缀。

示例：

```sql
EXPLAIN SELECT sum(number) FROM numbers(10) GROUP BY number % 4;
```

```sql
Union
  Expression (Projection)
  Expression (Before ORDER BY and SELECT)
    Aggregating
      Expression (Before GROUP BY)
        SettingQuotaAndLimits (Set limits and quota after reading from storage)
          ReadFromStorage (SystemNumbers)
```

:::note
不支持执行步骤和查询代价估算。
:::

当 `json = 1` 时，查询计划以 JSON 格式表示。每个节点是一个字典对象，并且始终包含键 `Node Type` 和 `Plans`。`Node Type` 是表示步骤名称的字符串。`Plans` 是一个数组，包含子步骤的描述。根据节点类型和设置，还可以添加其他可选键。

示例：

```sql
EXPLAIN json = 1, description = 0 SELECT 1 UNION ALL SELECT 2 FORMAT TSVRaw;
```

```json
[
  {
    "Plan": {
      "Node Type": "Union",
      "Node Id": "Union_10",
      "Plans": [
        {
          "Node Type": "Expression",
          "Node Id": "Expression_13",
          "Plans": [
            {
              "Node Type": "ReadFromStorage",
              "Node Id": "ReadFromStorage_0"
            }
          ]
        },
        {
          "Node Type": "Expression",
          "Node Id": "Expression_16",
          "Plans": [
            {
              "Node Type": "ReadFromStorage",
              "Node Id": "ReadFromStorage_4"
            }
          ]
        }
      ]
    }
  }
]
```

将 `description` 设为 1 时，会向该步骤添加 `Description` 键：

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

当 `header` = 1 时，`Header` 键会作为列数组添加到该步骤中。

示例：

```sql
EXPLAIN json = 1, description = 0, header = 1 SELECT 1, 2 + dummy;
```


```json
[
  {
    "Plan": {
      "Node Type": "Expression",
      "Node Id": "Expression_5",
      "Header": [
        {
          "Name": "1",
          "Type": "UInt8"
        },
        {
          "Name": "plus(2, dummy)",
          "Type": "UInt16"
        }
      ],
      "Plans": [
        {
          "Node Type": "ReadFromStorage",
          "Node Id": "ReadFromStorage_0",
          "Header": [
            {
              "Name": "dummy",
              "Type": "UInt8"
            }
          ]
        }
      ]
    }
  }
]
```

当 `indexes` = 1 时，会添加 `Indexes` 键。它包含一个已使用索引的数组。每个索引以 JSON 对象形式描述，具有 `Type` 键（字符串 `MinMax`、`Partition`、`PrimaryKey` 或 `Skip`）以及可选键：

* `Name` — 索引名称（目前仅用于 `Skip` 索引）。
* `Keys` — 索引使用的列数组。
* `Condition` — 实际使用的条件。
* `Description` — 索引描述（目前仅用于 `Skip` 索引）。
* `Parts` — 应用索引之前/之后的分区片段数量。
* `Granules` — 应用索引之前/之后的粒度数量。
* `Ranges` — 应用索引之后的粒度区间数量。

示例：

```json
"Node Type": "ReadFromMergeTree",
"Indexes": [
  {
    "Type": "MinMax",
    "Keys": ["y"],
    "Condition": "(y in [1, +inf))",
    "Parts": 4/5,
    "Granules": 11/12
  },
  {
    "Type": "Partition",
    "Keys": ["y", "bitAnd(z, 3)"],
    "Condition": "and((bitAnd(z, 3) not in [1, 1]), and((y in [1, +inf)), (bitAnd(z, 3) not in [1, 1])))",
    "Parts": 3/4,
    "Granules": 10/11
  },
  {
    "Type": "PrimaryKey",
    "Keys": ["x", "y"],
    "Condition": "and((x in [11, +inf)), (y in [1, +inf)))",
    "Parts": 2/3,
    "Granules": 6/10,
    "Search Algorithm": "generic exclusion search"
  },
  {
    "Type": "Skip",
    "Name": "t_minmax",
    "Description": "minmax GRANULARITY 2",
    "Parts": 1/2,
    "Granules": 2/6
  },
  {
    "Type": "Skip",
    "Name": "t_set",
    "Description": "set GRANULARITY 2",
    "": 1/1,
    "Granules": 1/2
  }
]
```

当 `projections` = 1 时，会新增 `Projections` 键。它包含一个已分析 projection 的数组。每个 projection 以 JSON 形式描述，包含以下键：

* `Name` — projection 名称。
* `Condition` — 使用的 projection 主键条件。
* `Description` — projection 的使用方式说明（例如 part-level 过滤）。
* `Selected Parts` — 该 projection 选中的分区片段数量。
* `Selected Marks` — 选中的 marks 数量。
* `Selected Ranges` — 选中的 ranges 数量。
* `Selected Rows` — 选中的行数量。
* `Filtered Parts` — 由于 part-level 过滤而被跳过的分区片段数量。

示例：

```json
"Node Type": "ReadFromMergeTree",
"Projections": [
  {
    "Name": "region_proj",
    "Description": "Projection has been analyzed and is used for part-level filtering",
    "Condition": "(region in ['us_west', 'us_west'])",
    "Search Algorithm": "binary search",
    "Selected Parts": 3,
    "Selected Marks": 3,
    "Selected Ranges": 3,
    "Selected Rows": 3,
    "Filtered Parts": 2
  },
  {
    "Name": "user_id_proj",
    "Description": "Projection has been analyzed and is used for part-level filtering",
    "Condition": "(user_id in [107, 107])",
    "Search Algorithm": "binary search",
    "Selected Parts": 1,
    "Selected Marks": 1,
    "Selected Ranges": 1,
    "Selected Rows": 1,
    "Filtered Parts": 2
  }
]
```

当 `actions` = 1 时，添加的键取决于步骤类型。

示例：

```sql
EXPLAIN json = 1, actions = 1, description = 0 SELECT 1 FORMAT TSVRaw;
```

```json
[
  {
    "Plan": {
      "Node Type": "Expression",
      "Node Id": "Expression_5",
      "Expression": {
        "Inputs": [
          {
            "Name": "dummy",
            "Type": "UInt8"
          }
        ],
        "Actions": [
          {
            "Node Type": "INPUT",
            "Result Type": "UInt8",
            "Result Name": "dummy",
            "Arguments": [0],
            "Removed Arguments": [0],
            "Result": 0
          },
          {
            "Node Type": "COLUMN",
            "Result Type": "UInt8",
            "Result Name": "1",
            "Column": "Const(UInt8)",
            "Arguments": [],
            "Removed Arguments": [],
            "Result": 1
          }
        ],
        "Outputs": [
          {
            "Name": "1",
            "Type": "UInt8"
          }
        ],
        "Positions": [1]
      },
      "Plans": [
        {
          "Node Type": "ReadFromStorage",
          "Node Id": "ReadFromStorage_0"
        }
      ]
    }
  }
]
```

当 `distributed` = 1 时，输出不仅包含本地查询计划，还包含将在远程节点上执行的查询计划。这对于分析和调试分布式查询非常有用。

分布式表示例：

```sql
EXPLAIN distributed=1 SELECT * FROM remote('127.0.0.{1,2}', numbers(2)) WHERE number = 1;
```

```sql
Union
  Expression ((Project names + (Projection + (Change column names to column identifiers + (Project names + Projection)))))
    Filter ((WHERE + Change column names to column identifiers))
      ReadFromSystemNumbers
  Expression ((Project names + (Projection + Change column names to column identifiers)))
    ReadFromRemote (Read from remote replica)
      Expression ((Project names + Projection))
        Filter ((WHERE + Change column names to column identifiers))
          ReadFromSystemNumbers
```

并行副本示例：

```sql
SET enable_parallel_replicas = 2, max_parallel_replicas = 2, cluster_for_parallel_replicas = 'default';

EXPLAIN distributed=1 SELECT sum(number) FROM test_table GROUP BY number % 4;
```

```sql
Expression ((Project names + Projection))
  MergingAggregated
    Union
      Aggregating
        Expression ((Before GROUP BY + Change column names to column identifiers))
          ReadFromMergeTree (default.test_table)
      ReadFromRemoteParallelReplicas
        BlocksMarshalling
          Aggregating
            Expression ((Before GROUP BY + Change column names to column identifiers))
              ReadFromMergeTree (default.test_table)
```

在这两个示例中，查询计划显示了整个执行流程，包括本地和远程步骤。


### EXPLAIN PIPELINE {#explain-pipeline}

设置：

* `header` — 为每个输出端口打印头部信息。默认值：0。
* `graph` — 使用 [DOT](https://en.wikipedia.org/wiki/DOT_\(graph_description_language\)) 图描述语言打印图。默认值：0。
* `compact` — 当启用 `graph` 设置时，以紧凑模式打印图。默认值：1。

当 `compact=0` 且 `graph=1` 时，处理器名称会附加一个包含唯一处理器标识符的后缀。

示例：

```sql
EXPLAIN PIPELINE SELECT sum(number) FROM numbers_mt(100000) GROUP BY number % 4;
```

```sql
(Union)
(Expression)
ExpressionTransform
  (Expression)
  ExpressionTransform
    (Aggregating)
    Resize 2 → 1
      AggregatingTransform × 2
        (Expression)
        ExpressionTransform × 2
          (SettingQuotaAndLimits)
            (ReadFromStorage)
            NumbersRange × 2 0 → 1
```

### EXPLAIN ESTIMATE {#explain-estimate}

显示在处理查询时预计将从表中读取的行数、标记数和分区片段数。适用于 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 系列表。

**示例**

创建一个表：

```sql
CREATE TABLE ttt (i Int64) ENGINE = MergeTree() ORDER BY i SETTINGS index_granularity = 16, write_final_mark = 0;
INSERT INTO ttt SELECT number FROM numbers(128);
OPTIMIZE TABLE ttt;
```

查询：

```sql
EXPLAIN ESTIMATE SELECT * FROM ttt;
```

结果：

```text
┌─database─┬─table─┬─parts─┬─rows─┬─marks─┐
│ default  │ ttt   │     1 │  128 │     8 │
└──────────┴───────┴───────┴──────┴───────┘
```

### EXPLAIN TABLE OVERRIDE {#explain-table-override}

显示通过 `table function` 访问的表，在应用 `table override` 之后的表结构结果。
同时会执行一些校验，如果该 override 会导致某种失败，则会抛出异常。

**示例**

假设你有一个远程的 MySQL 表，如下所示：

```sql
CREATE TABLE db.tbl (
    id INT PRIMARY KEY,
    created DATETIME DEFAULT now()
)
```

```sql
EXPLAIN TABLE OVERRIDE mysql('127.0.0.1:3306', 'db', 'tbl', 'root', 'clickhouse')
PARTITION BY toYYYYMM(assumeNotNull(created))
```

结果：

```text
┌─explain─────────────────────────────────────────────────┐
│ PARTITION BY uses columns: `created` Nullable(DateTime) │
└─────────────────────────────────────────────────────────┘
```

:::note
验证尚未完成，因此即便查询成功，也不能保证此 override 不会引发问题。
:::
