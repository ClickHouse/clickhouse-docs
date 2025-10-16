---
'description': '关于 EXPLAIN 的文档'
'sidebar_label': 'EXPLAIN'
'sidebar_position': 39
'slug': '/sql-reference/statements/explain'
'title': 'EXPLAIN 语句'
'doc_type': 'reference'
---

显示语句的执行计划。

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/hP6G2Nlz_cA"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
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
- `SYNTAX` — 在 AST 层级优化后的查询文本。
- `QUERY TREE` — 在查询树层级优化后的查询树。
- `PLAN` — 查询执行计划。
- `PIPELINE` — 查询执行管道。

### EXPLAIN AST {#explain-ast}

转储查询 AST。支持所有类型的查询，不仅限于 `SELECT`。

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

显示查询的抽象语法树（AST），在语法分析之后。

它通过解析查询，构造查询 AST 和查询树，选择性地运行查询分析器和优化过程，然后将查询树转换回查询 AST。

设置：

- `oneline` – 以一行打印查询。默认: `0`。
- `run_query_tree_passes` – 在转储查询树之前运行查询树过程。默认: `0`。
- `query_tree_passes` – 如果设置了 `run_query_tree_passes`，指定要运行多少次过程。未指定 `query_tree_passes` 时，将运行所有过程。

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

带有 `run_query_tree_passes`：

```sql
EXPLAIN SYNTAX run_query_tree_passes = 1 SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

输出：

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

- `run_passes` — 在转储查询树之前运行所有查询树过程。默认: `1`。
- `dump_passes` — 在转储查询树之前转储所用过程的信息。默认: `0`。
- `passes` — 指定要运行多少次过程。如果设置为 `-1`，则运行所有过程。默认: `-1`。
- `dump_tree` — 显示查询树。默认: `1`。
- `dump_ast` — 显示从查询树生成的查询 AST。默认: `0`。

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

转储查询计划步骤。

设置：

- `header` — 打印步骤的输出头部。默认: 0。
- `description` — 打印步骤描述。默认: 1。
- `indexes` — 显示使用的索引，过滤的部分数量以及每个应用的索引过滤的粒度数量。默认: 0。支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表。
- `projections` — 显示所有分析的投影及其对基于投影主键条件的部分级过滤的影响。对于每个投影，此部分包括统计信息，如评估使用投影主键的部分数量、行数、标记和范围。它还显示由于此过滤而跳过的多少数据部分，而无需从投影本身读取。投影是否实际用于读取或仅用于过滤分析可以通过 `description` 字段判断。默认: 0。支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表。
- `actions` — 打印关于步骤动作的详细信息。默认: 0。
- `json` — 以 [JSON](../../interfaces/formats.md#json) 格式打印查询计划步骤。默认: 0。建议使用 [TSVRaw](../../interfaces/formats.md#tabseparatedraw) 格式以避免不必要的转义。

当 `json=1` 时，步骤名称将包含一个附加后缀，标识唯一的步骤标识符。

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
步骤和查询成本估算不受支持。
:::

当 `json = 1` 时，查询计划表示为 JSON 格式。每个节点是一个字典，始终具有 `Node Type` 和 `Plans` 的键。`Node Type` 是一个包含步骤名称的字符串。`Plans` 是一个包含子步骤描述的数组。根据节点类型和设置，可能会添加其他可选键。

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

当 `description` = 1 时，步骤中将添加 `Description` 键：

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

当 `header` = 1 时，步骤中将添加 `Header` 键，作为一组列的数组。

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

当 `indexes` = 1 时，将添加 `Indexes` 键。它包含一个使用的索引数组。每个索引描述为 JSON，具有 `Type` 键（字符串`MinMax`、`Partition`、`PrimaryKey` 或 `Skip`）及可选键：

- `Name` — 索引名称（当前仅用于 `Skip` 索引）。
- `Keys` — 索引使用的列数组。
- `Condition` — 使用的条件。
- `Description` — 索引描述（当前仅用于 `Skip` 索引）。
- `Parts` — 应用该索引后的部分数量。
- `Granules` — 应用该索引后的粒度数量。
- `Ranges` — 应用索引后粒度范围的数量。

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

当 `projections` = 1 时，将添加 `Projections` 键。它包含一个分析的投影数组。每个投影描述为 JSON，具有以下键：

- `Name` — 投影名称。
- `Condition` — 使用的投影主键条件。
- `Description` — 投影使用的描述（例如，部分级过滤）。
- `Selected Parts` — 被投影选择的部分数量。
- `Selected Marks` — 被选择的标记数量。
- `Selected Ranges` — 被选择的范围数量。
- `Selected Rows` — 被选择的行数量。
- `Filtered Parts` — 由于部分级过滤而跳过的部分数量。

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

当 `actions` = 1 时，添加的键根据步骤类型不同而有所不同。

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

设置：

- `header` — 为每个输出端口打印头。默认: 0。
- `graph` — 打印用 [DOT](https://en.wikipedia.org/wiki/DOT_(graph_description_language)) 图形描述语言描述的图形。默认: 0。
- `compact` — 如果启用 `graph` 设置，则以紧凑模式打印图形。默认: 1。

当 `compact=0` 且 `graph=1` 时，处理器名称将包含一个附加后缀，标识唯一的处理器标识符。

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

显示在处理查询时要从表中读取的估算行数、标记和部分数量。适用于 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 类型的表。

**示例**

创建表：

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

显示通过表函数访问的表模式中的表覆盖结果。
还进行了一些验证，如果覆盖会导致某种类型的失败，将抛出异常。

**示例**

假设您有一个远程 MySQL 表，如下所示：

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
验证并不完整，因此成功的查询并不保证覆盖不会引发问题。
:::
