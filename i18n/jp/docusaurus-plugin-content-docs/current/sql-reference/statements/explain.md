---
description: 'EXPLAIN のドキュメント'
sidebar_label: 'EXPLAIN'
sidebar_position: 39
slug: /sql-reference/statements/explain
title: 'EXPLAIN ステートメント'
doc_type: 'reference'
---

SQL ステートメントの実行計画を表示します。

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

構文:

```sql
EXPLAIN [AST | SYNTAX | QUERY TREE | PLAN | PIPELINE | ESTIMATE | TABLE OVERRIDE] [setting = value, ...]
    [
      SELECT ... |
      tableFunction(...) [COLUMNS (...)] [ORDER BY ...] [PARTITION BY ...] [PRIMARY KEY] [SAMPLE BY ...] [TTL ...]
    ]
    [FORMAT ...]
```

例：

```sql
EXPLAIN SELECT sum(number) FROM numbers(10) UNION ALL SELECT sum(number) FROM numbers(10) ORDER BY sum(number) ASC FORMAT TSV;
```

```sql
Union
  Expression (Projection)
    Expression (ORDER BY および SELECT の前)
      Aggregating
        Expression (GROUP BY の前)
          SettingQuotaAndLimits (ストレージからの読み取り後に制限とクォータを設定)
            ReadFromStorage (SystemNumbers)
  Expression (Projection)
    MergingSorted (ORDER BY 用にソート済みストリームをマージ)
      MergeSorting (ORDER BY 用にソート済みブロックをマージ)
        PartialSorting (ORDER BY 用に各ブロックをソート)
          Expression (ORDER BY および SELECT の前)
            Aggregating
              Expression (GROUP BY の前)
                SettingQuotaAndLimits (ストレージからの読み取り後に制限とクォータを設定)
                  ReadFromStorage (SystemNumbers)
```


## EXPLAIN の種類

* `AST` — 抽象構文木 (Abstract Syntax Tree)。
* `SYNTAX` — AST レベルの最適化後のクエリテキスト。
* `QUERY TREE` — Query Tree レベルの最適化後のクエリツリー。
* `PLAN` — クエリ実行プラン。
* `PIPELINE` — クエリ実行パイプライン。

### EXPLAIN AST

クエリの AST をダンプします。`SELECT` だけでなく、あらゆる種類のクエリをサポートします。

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

### EXPLAIN SYNTAX

クエリの構文解析後の抽象構文木 (AST) を表示します。

クエリをパースしてクエリ AST とクエリツリーを構築し、必要に応じてクエリアナライザと最適化パスを実行し、その後クエリツリーを再度クエリ AST に変換することで動作します。

設定:

* `oneline` – クエリを 1 行で出力します。デフォルト: `0`。
* `run_query_tree_passes` – クエリツリーを出力する前に、クエリツリーに対する各種パスを実行します。デフォルト: `0`。
* `query_tree_passes` – `run_query_tree_passes` が設定されている場合に、実行するパスの回数を指定します。`query_tree_passes` を指定しない場合は、すべてのパスを実行します。

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

`run_query_tree_passes` を使用した場合:

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

### EXPLAIN QUERY TREE

設定:

* `run_passes` — クエリツリーをダンプする前にすべてのクエリツリーパスを実行します。デフォルト: `1`。
* `dump_passes` — クエリツリーをダンプする前に、使用したパスに関する情報をダンプします。デフォルト: `0`。
* `passes` — 実行するパスの数を指定します。`-1` に設定すると、すべてのパスを実行します。デフォルト: `-1`。
* `dump_tree` — クエリツリーを表示します。デフォルト: `1`。
* `dump_ast` — クエリツリーから生成されたクエリの AST を表示します。デフォルト: `0`。

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

### EXPLAIN PLAN

クエリプランのステップを出力します。

設定：


* `header` — ステップの出力ヘッダーを表示します。デフォルト: 0。
* `description` — ステップの説明を表示します。デフォルト: 1。
* `indexes` — 使用されたインデックス、それぞれのインデックスに対してフィルタリングされたパーツ数およびフィルタリングされたグラニュール数を表示します。デフォルト: 0。[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルでサポートされています。ClickHouse &gt;= v25.9 以降、このステートメントは `SETTINGS use_query_condition_cache = 0, use_skip_indexes_on_data_read = 0` と組み合わせて使用した場合にのみ、意味のある出力を返します。
* `projections` — 解析されたすべてのプロジェクションと、そのプロジェクションの主キー条件に基づくパーツレベルでのフィルタリングへの影響を表示します。各プロジェクションについて、このセクションには、プロジェクションの主キーを用いて評価されたパーツ数、行数、マーク数、およびレンジ数といった統計情報が含まれます。また、プロジェクション自体を読み取ることなく、このフィルタリングによってスキップされたデータパーツの数も表示されます。プロジェクションが実際に読み取りに使用されたのか、フィルタリングのために解析されただけなのかは、`description` フィールドで判別できます。デフォルト: 0。[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルでサポートされています。
* `actions` — ステップアクションに関する詳細情報を表示します。デフォルト: 0。
* `json` — クエリプランのステップを [JSON](/interfaces/formats/JSON) フォーマットの 1 行として表示します。デフォルト: 0。不要なエスケープを避けるために [TabSeparatedRaw (TSVRaw)](/interfaces/formats/TabSeparatedRaw) フォーマットの使用を推奨します。
* `input_headers` — ステップの入力ヘッダーを表示します。デフォルト: 0。主に、入出力ヘッダーの不整合に関連する問題をデバッグする開発者にとって有用です。

`json=1` の場合、ステップ名には一意のステップ識別子を含む追加のサフィックスが付きます。

Example:

```sql
EXPLAIN SELECT sum(number) FROM numbers(10) GROUP BY number % 4;
```

```sql
Union
  Expression (Projection)
  Expression (Before ORDER BY and SELECT)
    Aggregating
      Expression (Before GROUP BY)
        SettingQuotaAndLimits (ストレージ読み取り後の制限とクォータの設定)
          ReadFromStorage (SystemNumbers)
```

:::note
ステップおよびクエリのコスト推定はサポートされていません。
:::

`json = 1` の場合、クエリプランは JSON 形式で表現されます。すべてのノードは、必ず `Node Type` と `Plans` というキーを持つ辞書です。`Node Type` はステップ名を表す文字列です。`Plans` は子ステップの説明を含む配列です。その他の任意のキーは、ノードの種類および設定に応じて追加される場合があります。

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

`description` = 1 の場合、そのステップに `Description` キーが追加されます。

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

`header` を 1 に設定すると、`Header` キーが列の配列としてステップに追加されます。

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


`indexes` = 1 の場合、`Indexes` キーが追加されます。そこには使用されたインデックスの配列が含まれます。各インデックスは、`Type` キー（文字列 `MinMax`、`Partition`、`PrimaryKey` または `Skip`）と、以下の任意のキーを持つ JSON として記述されます:

* `Name` — インデックス名（現在は `Skip` インデックスでのみ使用されます）。
* `Keys` — インデックスで使用される列の配列。
* `Condition` — 使用された条件式。
* `Description` — インデックスの説明（現在は `Skip` インデックスでのみ使用されます）。
* `Parts` — インデックス適用前後のパーツ数。
* `Granules` — インデックス適用前後のグラニュール数。
* `Ranges` — インデックス適用後のグラニュール範囲の数。

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

`projections` = 1 の場合、`Projections` キーが追加されます。このキーには解析されたプロジェクションの配列が含まれます。各プロジェクションは、以下のキーを持つ JSON として表されます:

* `Name` — プロジェクション名。
* `Condition` — そのプロジェクションで使用される主キー条件。
* `Description` — プロジェクションの利用方法の説明（例: パートレベルでのフィルタリング）。
* `Selected Parts` — プロジェクションによって選択されたパート数。
* `Selected Marks` — 選択されたマーク数。
* `Selected Ranges` — 選択された範囲数。
* `Selected Rows` — 選択された行数。
* `Filtered Parts` — パートレベルのフィルタリングによりスキップされたパート数。

例:

```json
"Node Type": "ReadFromMergeTree",
"Projections": [
  {
    "Name": "region_proj",
    "Description": "プロジェクションが解析され、パートレベルフィルタリングに使用されています",
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
    "Description": "プロジェクションが解析され、パートレベルフィルタリングに使用されています",
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

`actions` = 1 の場合、追加されるキーはステップの種類に依存します。

例：

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

### EXPLAIN PIPELINE

設定:

* `header` — 各出力ポートのヘッダーを出力します。デフォルト: 0。
* `graph` — [DOT](https://en.wikipedia.org/wiki/DOT_\(graph_description_language\)) グラフ記述言語で表現されたグラフを出力します。デフォルト: 0。
* `compact` — `graph` 設定が有効な場合に、グラフをコンパクトモードで出力します。デフォルト: 1。

`compact=0` かつ `graph=1` のとき、プロセッサ名には一意のプロセッサ識別子を含む追加のサフィックスが付きます。

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

### EXPLAIN ESTIMATE

クエリを処理する際にテーブルから読み取られる行数・マーク数・パーツ数の推定値を表示します。[MergeTree](/engines/table-engines/mergetree-family/mergetree) ファミリーのテーブルで使用できます。

**例**

テーブルの作成：

```sql
CREATE TABLE ttt (i Int64) ENGINE = MergeTree() ORDER BY i SETTINGS index_granularity = 16, write_final_mark = 0;
INSERT INTO ttt SELECT number FROM numbers(128);
OPTIMIZE TABLE ttt;
```

クエリ：

```sql
EXPLAIN ESTIMATE SELECT * FROM ttt;
```

結果：

```text
┌─database─┬─table─┬─parts─┬─rows─┬─marks─┐
│ default  │ ttt   │     1 │  128 │     8 │
└──────────┴───────┴───────┴──────┴───────┘
```

### EXPLAIN TABLE OVERRIDE

テーブル関数経由でアクセスするテーブルスキーマに対してテーブルオーバーライドを適用した結果を表示します。
また、オーバーライドによって不整合やエラーが発生する場合には、例外をスローするなどの検証も行います。

**例**

次のようなリモートの MySQL テーブルがあるとします。

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

結果：

```text
┌─explain─────────────────────────────────────────────────┐
│ PARTITION BY 使用カラム: `created` Nullable(DateTime) │
└─────────────────────────────────────────────────────────┘
```

:::note
検証は完了していないため、クエリが成功しても、その override によって問題が発生しないことは保証されません。
:::
