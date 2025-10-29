---
'description': 'EXPLAINに関するドキュメント'
'sidebar_label': 'EXPLAIN'
'sidebar_position': 39
'slug': '/sql-reference/statements/explain'
'title': 'EXPLAIN ステートメント'
'doc_type': 'reference'
---

実行計画を表示します。

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

構文:

```sql
EXPLAIN [AST | SYNTAX | QUERY TREE | PLAN | PIPELINE | ESTIMATE | TABLE OVERRIDE] [setting = value, ...]
    [
      SELECT ... |
      tableFunction(...) [COLUMNS (...)] [ORDER BY ...] [PARTITION BY ...] [PRIMARY KEY] [SAMPLE BY ...] [TTL ...]
    ]
    [FORMAT ...]
```

例:

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

## EXPLAIN タイプ {#explain-types}

- `AST` — 抽象構文木。
- `SYNTAX` — ASTレベルの最適化後のクエリテキスト。
- `QUERY TREE` — クエリツリーのクエリツリー レベルの最適化後。
- `PLAN` — クエリ実行計画。
- `PIPELINE` — クエリ実行パイプライン。

### EXPLAIN AST {#explain-ast}

クエリ AST をダンプします。すべてのタイプのクエリをサポートしており、`SELECT` のみではありません。

例:

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

構文解析後のクエリの抽象構文木 (AST) を表示します。

これは、クエリを解析し、クエリ AST とクエリツリーを構築し、オプションでクエリアナライザーと最適化パスを実行し、その後クエリツリーをクエリ AST に戻すことで行われます。

設定:

- `oneline` – クエリを 1 行で印刷します。デフォルト: `0`。
- `run_query_tree_passes` – クエリツリーをダンプする前にクエリツリーパスを実行します。デフォルト: `0`。
- `query_tree_passes` – `run_query_tree_passes` が設定されている場合、実行するパスの数を指定します。`query_tree_passes`を指定しない場合は、すべてのパスを実行します。

例:

```sql
EXPLAIN SYNTAX SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

出力:

```sql
SELECT *
FROM system.numbers AS a, system.numbers AS b, system.numbers AS c
WHERE (a.number = b.number) AND (b.number = c.number)
```

`run_query_tree_passes`を使用した場合:

```sql
EXPLAIN SYNTAX run_query_tree_passes = 1 SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

出力:

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

設定:

- `run_passes` — クエリツリーをダンプする前にすべてのクエリツリーパスを実行します。デフォルト: `1`。
- `dump_passes` — クエリツリーをダンプする前に使用されたパスに関する情報をダンプします。デフォルト: `0`。
- `passes` — 実行するパスの数を指定します。`-1` に設定すると、すべてのパスを実行します。デフォルト: `-1`。
- `dump_tree` — クエリツリーを表示します。デフォルト: `1`。
- `dump_ast` — クエリツリーから生成されたクエリ AST を表示します。デフォルト: `0`。

例:
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

クエリ計画ステップをダンプします。

設定:

- `header` — ステップの出力ヘッダーを印刷します。デフォルト: 0。
- `description` — ステップの説明を印刷します。デフォルト: 1。
- `indexes` — 適用された各インデックスについて、使用されているインデックス、フィルタリングされたパーツの数、およびフィルタリングされたグラニュールの数を表示します。デフォルト: 0。 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルでサポートされています。
- `projections` — プロジェクションの主キー条件に基づいて、パーツレベルのフィルタリングに対する影響を示すすべての解析プロジェクションを表示します。各プロジェクションのこのセクションには、評価されたパーツ、行、マーク、および範囲の数などの統計情報が含まれています。また、このフィルタリングによりスキップされたデータパーツの数を表示し、プロジェクション自体から読み取らずに済みます。プロジェクションが実際に読み取りに使用されたか、フィルタリングのためにのみ分析されたかは、`description` フィールドによって判断できます。デフォルト: 0。 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルでサポートされています。
- `actions` — ステップアクションに関する詳細情報を印刷します。デフォルト: 0。
- `json` — クエリ計画ステップを [JSON](../../interfaces/formats.md#json) 形式の行として印刷します。デフォルト: 0。不要なエスケープを避けるために、[TSVRaw](../../interfaces/formats.md#tabseparatedraw) 形式を使用することをお勧めします。

`json=1` の場合、ステップ名にはユニークなステップ識別子を含む追加のサフィックスが含まれます。

例:

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
ステップとクエリコストの推定はサポートされていません。
:::

`json = 1` の場合、クエリ計画は JSON 形式で表されます。各ノードは `Node Type` と `Plans` のキーを持つ辞書です。`Node Type` はステップ名の文字列です。`Plans` は子ステップの説明の配列です。その他のオプショナルキーは、ノードのタイプと設定に応じて追加できます。

例:

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

`description` = 1 の場合、ステップには `Description` キーが追加されます:

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

`header` = 1 の場合、ステップには列の配列として `Header` キーが追加されます。

例:

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

`indexes` = 1 の場合、`Indexes` キーが追加されます。これには使用されたインデックスの配列が含まれます。各インデックスは `Type` キー (文字列 `MinMax`、`Partition`、`PrimaryKey`、`Skip` のいずれか) を持ち、次のオプショナルキーが含まれます:

- `Name` — インデックス名 (現在は `Skip` インデックスでのみ使用されます)。
- `Keys` — インデックスで使用されるカラムの配列。
- `Condition` — 使用された条件。
- `Description` — インデックスの説明 (現在は `Skip` インデックスでのみ使用されます)。
- `Parts` — インデックスが適用された後または前のパーツの数。
- `Granules` — インデックスが適用された後または前のグラニュールの数。
- `Ranges` — インデックスが適用された後のグラニュール範囲の数。

例:

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

`projections` = 1 の場合、`Projections` キーが追加されます。これには解析されたプロジェクションの配列が含まれます。各プロジェクションは次のキーを持つ JSON 形式で説明されます:

- `Name` — プロジェクション名。
- `Condition` — 使用されたプロジェクション主キー条件。
- `Description` — プロジェクションの使用方法の説明 (例: パーツレベルのフィルタリング)。
- `Selected Parts` — プロジェクションによって選択されたパーツの数。
- `Selected Marks` — 選択されたマークの数。
- `Selected Ranges` — 選択された範囲の数。
- `Selected Rows` — 選択された行の数。
- `Filtered Parts` — パーツレベルのフィルタリングによりスキップされたパーツの数。

例:

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

`actions` = 1 の場合、追加されるキーはステップのタイプによって異なります。

例:

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

設定:

- `header` — 各出力ポートのヘッダーを印刷します。デフォルト: 0。
- `graph` — [DOT](https://en.wikipedia.org/wiki/DOT_(graph_description_language)) グラフ記述言語で記述されたグラフを印刷します。デフォルト: 0。
- `compact` — `graph` 設定が有効な場合、コンパクトモードでグラフを印刷します。デフォルト: 1。

`compact=0` および `graph=1` の場合、プロセッサ名にはユニークなプロセッサ識別子を含む追加のサフィックスが含まれます。

例:

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

クエリを処理している間にテーブルから読み取る必要がある行、マーク、およびパーツの推定数を表示します。 [MergeTree](/engines/table-engines/mergetree-family/mergetree) ファミリーのテーブルで動作します。

**例**

テーブルの作成:

```sql
CREATE TABLE ttt (i Int64) ENGINE = MergeTree() ORDER BY i SETTINGS index_granularity = 16, write_final_mark = 0;
INSERT INTO ttt SELECT number FROM numbers(128);
OPTIMIZE TABLE ttt;
```

クエリ:

```sql
EXPLAIN ESTIMATE SELECT * FROM ttt;
```

結果:

```text
┌─database─┬─table─┬─parts─┬─rows─┬─marks─┐
│ default  │ ttt   │     1 │  128 │     8 │
└──────────┴───────┴───────┴──────┴───────┘
```

### EXPLAIN TABLE OVERRIDE {#explain-table-override}

テーブル関数を介してアクセスされるテーブルスキーマのテーブルオーバーライドの結果を表示します。また、オーバーライドが問題を引き起こす原因となった場合に例外をスローするいくつかの検証を行います。

**例**

リモート MySQL テーブルが次のようになっていると仮定します:

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

結果:

```text
┌─explain─────────────────────────────────────────────────┐
│ PARTITION BY uses columns: `created` Nullable(DateTime) │
└─────────────────────────────────────────────────────────┘
```

:::note
検証は完全ではないため、成功したクエリがオーバーライドによって問題が発生しないことを保証するものではありません。
:::
