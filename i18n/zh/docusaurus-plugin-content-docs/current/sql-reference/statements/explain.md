---
description: 'EXPLAIN 说明文档'
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

语法：

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
  表达式（投影）
    表达式（ORDER BY 和 SELECT 之前）
      聚合
        表达式（GROUP BY 之前）
          设置配额和限制（从存储读取后设置限制和配额）
            从存储读取（SystemNumbers）
  表达式（投影）
    合并已排序流（为 ORDER BY 合并已排序的流）
      合并排序（为 ORDER BY 合并已排序的块）
        部分排序（为 ORDER BY 对每个块进行排序）
          表达式（ORDER BY 和 SELECT 之前）
            聚合
              表达式（GROUP BY 之前）
                设置配额和限制（从存储读取后设置限制和配额）
                  从存储读取（SystemNumbers）
```


## EXPLAIN 类型 {#explain-types}

- `AST` — 抽象语法树。
- `SYNTAX` — AST 级优化后的查询文本。
- `QUERY TREE` — 查询树级优化后的查询树。
- `PLAN` — 查询执行计划。
- `PIPELINE` — 查询执行流水线。

### EXPLAIN AST {#explain-ast}

转储查询的 AST。支持所有类型的查询,不仅限于 `SELECT`。

示例:

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

显示查询经过语法分析后的抽象语法树 (AST)。

实现方式是:解析查询、构建查询 AST 和查询树、可选地运行查询分析器和优化过程,然后将查询树转换回查询 AST。

设置:

- `oneline` – 在一行中打印查询。默认值:`0`。
- `run_query_tree_passes` – 在转储查询树之前运行查询树优化过程。默认值:`0`。
- `query_tree_passes` – 如果设置了 `run_query_tree_passes`,则指定要运行的优化过程次数。如果未指定 `query_tree_passes`,则运行所有优化过程。

示例:

```sql
EXPLAIN SYNTAX SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

输出:

```sql
SELECT *
FROM system.numbers AS a, system.numbers AS b, system.numbers AS c
WHERE (a.number = b.number) AND (b.number = c.number)
```

使用 `run_query_tree_passes`:

```sql
EXPLAIN SYNTAX run_query_tree_passes = 1 SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

输出:

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

设置:

- `run_passes` — 在转储查询树之前运行所有查询树优化过程。默认值:`1`。
- `dump_passes` — 在转储查询树之前转储已使用的优化过程信息。默认值:`0`。
- `passes` — 指定要运行的优化过程次数。如果设置为 `-1`,则运行所有优化过程。默认值:`-1`。
- `dump_tree` — 显示查询树。默认值:`1`。
- `dump_ast` — 显示从查询树生成的查询 AST。默认值:`0`。

示例:

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

转储查询计划步骤。

设置:


* `header` — 打印该步骤的输出头部信息。默认值：0。
* `description` — 打印步骤描述。默认值：1。
* `indexes` — 显示所使用的索引、每个索引过滤掉的数据部分（part）数量以及过滤掉的 granule 数量。默认值：0。适用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表。从 ClickHouse &gt;= v25.9 开始，仅当与 `SETTINGS use_query_condition_cache = 0, use_skip_indexes_on_data_read = 0` 一起使用时，此选项才会产生有意义的输出。
* `projections` — 显示所有被分析的 projection，以及它们基于 projection 主键条件在数据部分（part）级别过滤上的效果。对于每个 projection，本节包括使用该 projection 主键进行评估的数据部分数、行数、标记（mark）数以及区间数等统计信息。它还会显示在不从 projection 本身读取数据的情况下，由于该过滤而跳过了多少数据部分。projection 实际是否被用于读取，还是仅用于过滤分析，可以通过 `description` 字段判断。默认值：0。适用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表。
* `actions` — 打印关于步骤操作的详细信息。默认值：0。
* `json` — 以 [JSON](/interfaces/formats/JSON) 格式将查询计划步骤作为一行输出。默认值：0。建议使用 [TabSeparatedRaw (TSVRaw)](/interfaces/formats/TabSeparatedRaw) 格式以避免不必要的转义。
* `input_headers` - 打印该步骤的输入头部信息。默认值：0。通常仅在开发人员调试与输入输出头部不匹配相关的问题时有用。

当 `json=1` 时，步骤名称会包含一个附加后缀，作为该步骤的唯一标识符。

示例：

```sql
EXPLAIN SELECT sum(number) FROM numbers(10) GROUP BY number % 4;
```

```sql
Union
  Expression (投影)
  Expression (ORDER BY 和 SELECT 之前)
    Aggregating
      Expression (GROUP BY 之前)
        SettingQuotaAndLimits (从存储读取后设置限制和配额)
          ReadFromStorage (SystemNumbers)
```

:::note
不支持步骤和查询成本估算。
:::

当 `json = 1` 时，查询计划以 JSON 格式呈现。每个节点都是一个字典，并且始终包含键名 `Node Type` 和 `Plans`。`Node Type` 是一个表示步骤名称的字符串，`Plans` 是一个包含子步骤描述的数组。根据节点类型和设置，还可以添加其他可选键。

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

当 `description` = 1 时，会向该步骤添加 `Description` 键：

```json
{
  "节点类型": "ReadFromStorage",
  "描述": "SystemOne"
}
```

当 `header` = 1 时，会将 `Header` 键以列的数组形式添加到该步骤中。

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


当 `indexes` = 1 时，会新增 `Indexes` 键。它包含一个已使用索引的数组。每个索引以 JSON 形式描述，包含 `Type` 键（字符串 `MinMax`、`Partition`、`PrimaryKey` 或 `Skip`）以及以下可选键：

* `Name` — 索引名称（目前仅用于 `Skip` 索引）。
* `Keys` — 索引所使用的列的数组。
* `Condition` — 所使用的条件。
* `Description` — 索引说明（目前仅用于 `Skip` 索引）。
* `Parts` — 应用索引之前/之后的 part 数量。
* `Granules` — 应用索引之前/之后的 granule 数量。
* `Ranges` — 应用索引之后的 granule 范围数量。

示例：

```json
"节点类型": "ReadFromMergeTree",
"索引": [
  {
    "类型": "MinMax",
    "键": ["y"],
    "条件": "(y in [1, +inf))",
    "数据部分": 4/5,
    "颗粒": 11/12
  },
  {
    "类型": "Partition",
    "键": ["y", "bitAnd(z, 3)"],
    "条件": "and((bitAnd(z, 3) not in [1, 1]), and((y in [1, +inf)), (bitAnd(z, 3) not in [1, 1])))",
    "数据部分": 3/4,
    "颗粒": 10/11
  },
  {
    "类型": "PrimaryKey",
    "键": ["x", "y"],
    "条件": "and((x in [11, +inf)), (y in [1, +inf)))",
    "数据部分": 2/3,
    "颗粒": 6/10,
    "搜索算法": "generic exclusion search"
  },
  {
    "类型": "Skip",
    "名称": "t_minmax",
    "描述": "minmax GRANULARITY 2",
    "数据部分": 1/2,
    "颗粒": 2/6
  },
  {
    "类型": "Skip",
    "名称": "t_set",
    "描述": "set GRANULARITY 2",
    "数据部分": 1/1,
    "颗粒": 1/2
  }
]
```

当 `projections` = 1 时，会添加 `Projections` 键。它包含一个已分析的投影数组。每个投影使用 JSON 描述，包含以下键：

* `Name` — 投影名称。
* `Condition` — 使用的投影主键条件。
* `Description` — 对投影使用方式的描述（例如片段级过滤）。
* `Selected Parts` — 由该投影选中的数据片段数量。
* `Selected Marks` — 选中的标记数量。
* `Selected Ranges` — 选中的区间数量。
* `Selected Rows` — 选中的行数。
* `Filtered Parts` — 由于片段级过滤而被跳过的数据片段数量。

示例：

```json
"Node Type": "ReadFromMergeTree",
"Projections": [
  {
    "Name": "region_proj",
    "Description": "投影已分析完成并用于数据分片级别过滤",
    "Condition": "(region in ['us_west', 'us_west'])",
    "Search Algorithm": "二分查找",
    "Selected Parts": 3,
    "Selected Marks": 3,
    "Selected Ranges": 3,
    "Selected Rows": 3,
    "Filtered Parts": 2
  },
  {
    "Name": "user_id_proj",
    "Description": "投影已分析完成并用于数据分片级别过滤",
    "Condition": "(user_id in [107, 107])",
    "Search Algorithm": "二分查找",
    "Selected Parts": 1,
    "Selected Marks": 1,
    "Selected Ranges": 1,
    "Selected Rows": 1,
    "Filtered Parts": 2
  }
]
```

当 `actions` = 1 时，所添加的键取决于步骤类型。

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

### EXPLAIN PIPELINE {#explain-pipeline}

设置项:

- `header` — 为每个输出端口打印头部信息。默认值: 0。
- `graph` — 使用 [DOT](<https://en.wikipedia.org/wiki/DOT_(graph_description_language)>) 图形描述语言打印图形。默认值: 0。
- `compact` — 当 `graph` 设置启用时,以紧凑模式打印图形。默认值: 1。

当 `compact=0` 且 `graph=1` 时,处理器名称将包含一个带有唯一处理器标识符的附加后缀。

示例:

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

显示处理查询时从表中读取的预估行数、标记数和数据部分数。适用于 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 系列表引擎。

**示例**

创建表:

```sql
CREATE TABLE ttt (i Int64) ENGINE = MergeTree() ORDER BY i SETTINGS index_granularity = 16, write_final_mark = 0;
INSERT INTO ttt SELECT number FROM numbers(128);
OPTIMIZE TABLE ttt;
```

查询:

```sql
EXPLAIN ESTIMATE SELECT * FROM ttt;
```

结果:

```text
┌─database─┬─table─┬─parts─┬─rows─┬─marks─┐
│ default  │ ttt   │     1 │  128 │     8 │
└──────────┴───────┴───────┴──────┴───────┘
```

### EXPLAIN TABLE OVERRIDE {#explain-table-override}

显示通过表函数访问的表架构上应用表覆盖的结果。
同时执行一些验证,如果覆盖会导致某种失败,则抛出异常。

**示例**

假设您有一个如下所示的远程 MySQL 表:

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

结果:

```text
┌─explain─────────────────────────────────────────────────┐
│ PARTITION BY uses columns: `created` Nullable(DateTime) │
└─────────────────────────────────────────────────────────┘
```

:::note
验证并不完整,因此成功的查询并不能保证覆盖不会导致问题。
:::
