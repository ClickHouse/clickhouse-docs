---
description: 'Explainのドキュメント'
sidebar_label: 'EXPLAIN'
sidebar_position: 39
slug: /sql-reference/statements/explain
title: 'EXPLAINステートメント'
---

ステートメントの実行計画を表示します。

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
          SettingQuotaAndLimits (ストレージから読み取った後に制限とクォータを設定)
            ReadFromStorage (SystemNumbers)
  Expression (Projection)
    MergingSorted (ORDER BY のためにソートされたストリームをマージ)
      MergeSorting (ORDER BY のためにソートされたブロックをマージ)
        PartialSorting (ORDER BY のために各ブロックをソート)
          Expression (Before ORDER BY and SELECT)
            Aggregating
              Expression (Before GROUP BY)
                SettingQuotaAndLimits (ストレージから読み取った後に制限とクォータを設定)
                  ReadFromStorage (SystemNumbers)
```

## EXPLAINのタイプ {#explain-types}

- `AST` — 抽象構文木。
- `SYNTAX` — ASTレベルの最適化後のクエリテキスト。
- `QUERY TREE` — クエリツリーのクエリツリーレベルの最適化後の状態。
- `PLAN` — クエリ実行計画。
- `PIPELINE` — クエリ実行パイプライン。

### EXPLAIN AST {#explain-ast}

クエリのASTをダンプします。すべてのタイプのクエリをサポートしており、`SELECT`だけでなく、他のクエリも含まれます。

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

最適化後のクエリを返します。

例:

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

設定:

- `run_passes` — クエリツリーをダンプする前にすべてのクエリツリーパスを実行します。デフォルト: `1`。
- `dump_passes` — クエリツリーをダンプする前に使用されたパスについての情報をダンプします。デフォルト: `0`。
- `passes` — 実行すべきパスの数を指定します。`-1`に設定すると、すべてのパスを実行します。デフォルト: `-1`。

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

クエリプランステップをダンプします。

設定:

- `header` — ステップの出力ヘッダーを印刷します。デフォルト: 0。
- `description` — ステップの説明を印刷します。デフォルト: 1。
- `indexes` — 使用されたインデックス、フィルターされたパーツの数、および適用されたインデックスごとにフィルターされたグラニュールの数を示します。デフォルト: 0。 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルでサポートされています。
- `actions` — ステップアクションに関する詳細情報を印刷します。デフォルト: 0。
- `json` — クエリプランステップを[JSON](../../interfaces/formats.md#json)フォーマットの行として印刷します。デフォルト: 0。他の不必要なエスケープを避けるために[TSVRaw](../../interfaces/formats.md#tabseparatedraw)フォーマットを使用することをお勧めします。

`json=1`の場合、ステップ名には一意のステップ識別子を含む追加の接尾辞が含まれます。

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
        SettingQuotaAndLimits (ストレージから読み取った後に制限とクォータを設定)
          ReadFromStorage (SystemNumbers)
```

:::note    
ステップとクエリコストの推定はサポートされていません。
:::

`json = 1`の場合、クエリプランはJSONフォーマットで表されます。各ノードは、常に`Node Type`と`Plans`のキーを持つ辞書です。`Node Type`はステップ名の文字列です。`Plans`は子ステップの説明の配列です。他のオプションのキーは、ノードタイプと設定に応じて追加される場合があります。

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

`description` = 1 の場合、`Description`キーがステップに追加されます:

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

`header` = 1 の場合、ステップにカラムの配列として`Header`キーが追加されます。

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

`indexes` = 1 の場合、`Indexes`キーが追加されます。このキーは使用されたインデックスの配列を含みます。各インデックスは、`Type`キー（`MinMax`、`Partition`、`PrimaryKey`または`Skip`の文字列）およびオプションのキーを持つJSONで記述されます。

- `Name` — インデックス名（現在は`Skip`インデックスの場合のみ使用）。
- `Keys` — インデックスで使用されるカラムの配列。
- `Condition` — 使用された条件。
- `Description` — インデックスの説明（現在は`Skip`インデックスの場合のみ使用）。
- `Parts` — インデックスが適用される前/後のパーツの数。
- `Granules` — インデックスが適用される前/後のグラニュールの数。

例:

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

`actions` = 1 の場合、追加されるキーはステップタイプに依存します。

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
- `graph` — [DOT](https://en.wikipedia.org/wiki/DOT_(graph_description_language))グラフ記述言語で記述されたグラフを印刷します。デフォルト: 0。
- `compact` — `graph`設定が有効な場合、コンパクトモードでグラフを印刷します。デフォルト: 1。

`compact=0`かつ`graph=1`の場合、プロセッサ名には一意のプロセッサ識別子を含む追加の接尾辞が含まれます。

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

クエリ処理中にテーブルから読み取られる行、マーク、およびパーツの推定数を表示します。[MergeTree](/engines/table-engines/mergetree-family/mergetree)ファミリーのテーブルで機能します。

**例**

テーブルを作成する:

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

テーブル関数を通じてアクセスされるテーブルスキーマの上書きの結果を表示します。
また、上書きが失敗を引き起こす可能性がある場合は例外を投げて検証を行います。

**例**

リモートMySQLテーブルが次のようになっていると仮定します:

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
検証は完全ではないため、成功したクエリが上書きによって問題が発生しないことを保証するものではありません。
:::
