展示语句的执行计划。

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
- `SYNTAX` — AST 级别优化后的查询文本。
- `QUERY TREE` — 查询树经过查询树级别优化后的结果。
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

返回经过语法优化后的查询。

示例：

```sql
EXPLAIN SYNTAX SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c;
```

```sql
SELECT
    `--a.number` AS `a.number`,
    `--b.number` AS `b.number`,
    number AS `c.number`
FROM
(
    SELECT
        number AS `--a.number`,
        b.number AS `--b.number`
    FROM system.numbers AS a
    CROSS JOIN system.numbers AS b
) AS `--.s`
CROSS JOIN system.numbers AS c
```

### EXPLAIN QUERY TREE {#explain-query-tree}

设置：

- `run_passes` — 在转储查询树之前运行所有查询树的通过。默认值：`1`。
- `dump_passes` — 在转储查询树之前转储有关所用通过的信息。默认值：`0`。
- `passes` — 指定要运行的通过数量。如果设置为 `-1`，则运行所有通过。默认值：`-1`。

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

- `header` — 打印步骤的输出头。默认值：0。
- `description` — 打印步骤描述。默认值：1。
- `indexes` — 显示所用索引、过滤的部分数量和每个应用的索引的过滤粒度数量。默认值：0。支持 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表。
- `actions` — 打印步骤操作的详细信息。默认值：0。
- `json` — 以 [JSON](../../interfaces/formats.md#json) 格式打印查询计划步骤作为行。默认值：0。建议使用 [TSVRaw](../../interfaces/formats.md#tabseparatedraw) 格式以避免不必要的转义。

当 `json=1` 时，步骤名称将包含一个附加后缀，带有唯一步骤标识符。

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
步骤和查询成本估算不支持。
:::

当 `json = 1` 时，查询计划以 JSON 格式表示。每个节点都是一个字典，始终具有 `Node Type` 和 `Plans` 键。`Node Type` 是一个字符串，表示步骤名称。`Plans` 是描述子步骤的数组。根据节点类型和设置，可以添加其他可选键。

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

当 `description` = 1 时，将添加 `Description` 键到步骤中：

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

当 `header` = 1 时，将把 `Header` 键作为列数组添加到步骤中。

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

当 `indexes` = 1 时，添加 `Indexes` 键。它包含一个已用索引的数组。每个索引都以 JSON 形式描述，具有 `Type` 键（字符串 `MinMax`、`Partition`、`PrimaryKey` 或 `Skip`）和可选键：

- `Name` — 索引名称（目前仅用于 `Skip` 索引）。
- `Keys` — 表示索引使用的列的数组。
- `Condition` — 使用的条件。
- `Description` — 索引描述（目前仅用于 `Skip` 索引）。
- `Parts` — 在索引应用前后的部分数量。
- `Granules` — 在索引应用前后的粒度数量。

示例：

```json
"Node Type": "ReadFromMergeTree",
"Indexes": [
  {
    "Type": "MinMax",
    "Keys": ["y"],
    "Condition": "(y in [1, +inf))",
    "Parts": 5/4,
    "Granules": 12/11
  },
  {
    "Type": "Partition",
    "Keys": ["y", "bitAnd(z, 3)"],
    "Condition": "and((bitAnd(z, 3) not in [1, 1]), and((y in [1, +inf)), (bitAnd(z, 3) not in [1, 1])))",
    "Parts": 4/3,
    "Granules": 11/10
  },
  {
    "Type": "PrimaryKey",
    "Keys": ["x", "y"],
    "Condition": "and((x in [11, +inf)), (y in [1, +inf)))",
    "Parts": 3/2,
    "Granules": 10/6
  },
  {
    "Type": "Skip",
    "Name": "t_minmax",
    "Description": "minmax GRANULARITY 2",
    "Parts": 2/1,
    "Granules": 6/2
  },
  {
    "Type": "Skip",
    "Name": "t_set",
    "Description": "set GRANULARITY 2",
    "": 1/1,
    "Granules": 2/1
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

### EXPLAIN PIPELINE {#explain-pipeline}

设置：

- `header` — 为每个输出端口打印头。默认值：0。
- `graph` — 使用 [DOT](https://en.wikipedia.org/wiki/DOT_(graph_description_language)) 图描述语言打印图形。默认值：0。
- `compact` — 如果启用 `graph` 设置，则以紧凑模式打印图形。默认值：1。

当 `compact=0` 和 `graph=1` 时，处理器名称将包含一个附加后缀，带有唯一处理器标识符。

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

显示在处理查询时，从表中读取的估计行数、标记和部分数。适用于 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 系列的表。

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

显示通过表函数访问的表架构上的表覆盖的结果。
同时进行一些验证，如果覆盖会导致某种失败，则抛出异常。

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
验证尚不完整，因此成功的查询并不保证覆盖不会导致问题。
:::
