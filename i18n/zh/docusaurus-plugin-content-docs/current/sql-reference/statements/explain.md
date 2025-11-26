---
description: 'EXPLAIN 语句文档'
sidebar_label: 'EXPLAIN'
sidebar_position: 39
slug: /sql-reference/statements/explain
title: 'EXPLAIN 语句'
doc_type: 'reference'
---

显示一条语句的执行计划。

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
EXPLAIN [AST | 语法 | 查询树 | 计划 | 流水线 | 估算 | 表覆盖] [设置 = 值, ...]
    [
      SELECT ... |
      tableFunction(...) [列 (...)] [ORDER BY ...] [PARTITION BY ...] [主键] [按样本 ...] [TTL ...]
    ]
    [格式 ...]
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
          SettingQuotaAndLimits (从存储读取后设置限制和配额)
            ReadFromStorage (SystemNumbers)
  Expression (Projection)
    MergingSorted (合并已排序的流以执行 ORDER BY)
      MergeSorting (合并已排序的块以执行 ORDER BY)
        PartialSorting (对每个块进行排序以执行 ORDER BY)
          Expression (Before ORDER BY and SELECT)
            Aggregating
              Expression (Before GROUP BY)
                SettingQuotaAndLimits (从存储读取后设置限制和配额)
                  ReadFromStorage (SystemNumbers)
```


## EXPLAIN 类型

* `AST` — 抽象语法树。
* `SYNTAX` — 经过 AST 级别优化后的查询文本。
* `QUERY TREE` — 经过 Query Tree 级别优化后的查询树。
* `PLAN` — 查询执行计划。
* `PIPELINE` — 查询执行流水线。

### EXPLAIN AST

输出查询 AST。支持所有类型的查询，而不仅仅是 `SELECT`。

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

### EXPLAIN SYNTAX

在语法分析后显示查询的抽象语法树（AST）。

该过程包括解析查询、构建查询 AST 和查询树，可选地运行查询分析器和若干优化阶段，然后再将查询树转换回查询 AST。

设置项：

* `oneline` – 以单行形式输出查询。默认值：`0`。
* `run_query_tree_passes` – 在输出查询树之前运行查询树 pass。默认值：`0`。
* `query_tree_passes` – 如果设置了 `run_query_tree_passes`，则指定要运行的 pass 次数。未指定 `query_tree_passes` 时将运行所有 pass。

示例：

```sql
EXPLAIN SYNTAX SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

输出：

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

### EXPLAIN QUERY TREE

设置：

* `run_passes` — 在转储查询树之前先运行查询树的所有 pass。默认值：`1`。
* `dump_passes` — 在转储查询树之前转储所使用的 pass 信息。默认值：`0`。
* `passes` — 指定要运行多少个 pass。若设置为 `-1`，则运行所有 pass。默认值：`-1`。
* `dump_tree` — 显示查询树。默认值：`1`。
* `dump_ast` — 显示由查询树生成的查询 AST。默认值：`0`。

示例：

```sql
EXPLAIN QUERY TREE SELECT id, value FROM test_table;
```

```sql
查询 id: 0
  投影列
    id UInt64
    value String
  投影
    列表 id: 1, 节点: 2
      列 id: 2, 列名: id, 结果类型: UInt64, 源 id: 3
      列 id: 4, 列名: value, 结果类型: String, 源 id: 3
  连接树
    表 id: 3, 表名: default.test_table
```

### EXPLAIN PLAN（执行计划）

输出查询计划的各个步骤。

设置：


* `header` — 打印步骤的输出头。默认值：0。
* `description` — 打印步骤描述。默认值：1。
* `indexes` — 显示所使用的索引，以及每个索引应用时被过滤的 part 数量和被过滤的 granule 数量。默认值：0。支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表。从 ClickHouse &gt;= v25.9 开始，仅当与 `SETTINGS use_query_condition_cache = 0, use_skip_indexes_on_data_read = 0` 一起使用时，该选项的输出才具有参考价值。
* `projections` — 显示所有已分析的 projection 及其基于 projection 主键条件对 part 级别过滤的影响。对于每个 projection，本节包含统计信息，例如使用该 projection 主键评估的 part、行、mark 和 range 的数量。还会显示由于该过滤而跳过了多少数据 part，而无需从 projection 本身读取。是否真正使用了 projection 进行读取，还是仅用于过滤分析，可以通过 `description` 字段来判断。默认值：0。支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表。
* `actions` — 打印关于步骤操作的详细信息。默认值：0。
* `json` — 以 [JSON](/interfaces/formats/JSON) 格式将查询计划步骤打印为一行记录。默认值：0。建议使用 [TabSeparatedRaw (TSVRaw)](/interfaces/formats/TabSeparatedRaw) 格式以避免不必要的转义。
* `input_headers` - 打印步骤的输入头。默认值：0。主要仅供开发人员用于调试与输入输出头不匹配相关的问题。

当 `json=1` 时，步骤名称会带有一个额外后缀，包含唯一的步骤标识符。

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
        SettingQuotaAndLimits (从存储读取后设置限制和配额)
          ReadFromStorage (SystemNumbers)
```

:::note
不支持对步骤和查询进行成本估算。
:::

当 `json = 1` 时，查询计划会以 JSON 格式表示。每个节点都是一个字典，并且始终包含键 `Node Type` 和 `Plans`。`Node Type` 是一个字符串，表示步骤名称；`Plans` 是一个数组，包含子步骤的描述。根据节点类型和设置，还可能添加其他可选键。

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

当 `description` = 1 时，会在该步骤中添加 `Description` 键：

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "系统一"
}
```

当 `header` = 1 时，会将 `Header` 键作为列数组添加到该步骤中。

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


当将 `indexes` 设为 1 时，会添加 `Indexes` 键。它包含一个已使用索引的数组。每个索引使用 JSON 描述，包含 `Type` 键（字符串 `MinMax`、`Partition`、`PrimaryKey` 或 `Skip`）以及以下可选键：

* `Name` — 索引名称（当前仅用于 `Skip` 索引）。
* `Keys` — 索引所使用的列数组。
* `Condition` — 使用的条件。
* `Description` — 索引的描述（当前仅用于 `Skip` 索引）。
* `Parts` — 应用索引前/后的 part 数量。
* `Granules` — 应用索引前/后的 granule 数量。
* `Ranges` — 应用索引后 granule 范围的数量。

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

当 `projections` 设置为 1 时，会添加 `Projections` 键。它包含一个经分析的投影数组。每个投影以 JSON 形式描述，包含以下键：

* `Name` — 投影名称。
* `Condition` — 该投影使用的主键条件。
* `Description` — 描述投影是如何使用的（例如数据块级过滤）。
* `Selected Parts` — 通过投影选中的数据块数量。
* `Selected Marks` — 选中的标记数量。
* `Selected Ranges` — 选中的范围数量。
* `Selected Rows` — 选中的行数。
* `Filtered Parts` — 因数据块级过滤而被跳过的数据块数量。

示例：

```json
"Node Type": "ReadFromMergeTree",
"Projections": [
  {
    "Name": "region_proj",
    "Description": "投影已分析完成并用于数据分片级别过滤",
    "Condition": "(region in ['us_west', 'us_west'])",
    "Search Algorithm": "二分搜索",
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
    "Search Algorithm": "二分搜索",
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
      "Node Type": "表达式",
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
            "Node Type": "输入",
            "Result Type": "UInt8",
            "Result Name": "dummy",
            "Arguments": [0],
            "Removed Arguments": [0],
            "Result": 0
          },
          {
            "Node Type": "列",
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
          "Node Type": "从存储读取",
          "Node Id": "ReadFromStorage_0"
        }
      ]
    }
  }
]
```

### EXPLAIN PIPELINE

设置：

* `header` — 为每个输出端口打印标题行。默认值：0。
* `graph` — 打印一幅使用 [DOT](https://en.wikipedia.org/wiki/DOT_\(graph_description_language\)) 图描述语言定义的图。默认值：0。
* `compact` — 当启用 `graph` 设置时，以紧凑模式打印图。默认值：1。

当 `compact=0` 且 `graph=1` 时，处理器名称会包含一个带唯一处理器标识符的额外后缀。

示例：

```sql
EXPLAIN PIPELINE SELECT sum(number) FROM numbers_mt(100000) GROUP BY number % 4;
```

```sql
(联合)
(表达式)
表达式变换
  (表达式)
  表达式变换
    (聚合)
    调整大小 2 → 1
      聚合变换 × 2
        (表达式)
        表达式变换 × 2
          (设置配额和限制)
            (从存储读取)
            数字范围 × 2 0 → 1
```

### EXPLAIN ESTIMATE

显示在处理查询时，从表中预计要读取的行数、标记（marks）数和数据片段（parts）数。适用于 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 引擎族的表。

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

### EXPLAIN TABLE OVERRIDE

显示在通过表函数访问的表结构上应用 TABLE OVERRIDE 后的结果。
同时还会执行一些校验，如果该覆盖会导致某种错误，则抛出异常。

**示例**

假设你有一个远程 MySQL 表，如下所示：

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
│ PARTITION BY 使用的列：`created` Nullable(DateTime) │
└─────────────────────────────────────────────────────────┘
```

:::note
验证尚未完成，因此查询成功并不能保证该覆盖不会引发问题。
:::
