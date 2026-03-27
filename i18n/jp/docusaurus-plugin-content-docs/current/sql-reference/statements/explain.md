---
description: 'EXPLAIN に関するドキュメント'
sidebar_label: 'EXPLAIN'
sidebar_position: 39
slug: /sql-reference/statements/explain
title: 'EXPLAIN 文'
doc_type: 'reference'
---

文の実行計画を表示します。

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

## EXPLAIN の種類 \{#explain-types\}

- `AST` — 抽象構文木 (Abstract Syntax Tree)。
- `SYNTAX` — AST レベルの最適化後のクエリテキスト。
- `QUERY TREE` — Query Tree レベルでの最適化後のクエリツリー。
- `PLAN` — クエリ実行プラン。
- `PIPELINE` — クエリ実行パイプライン。

### EXPLAIN AST \{#explain-ast\}

クエリの AST をダンプします。`SELECT` だけでなく、あらゆる種類のクエリをサポートします。

設定:

* `graph` – AST を、[DOT](https://en.wikipedia.org/wiki/DOT_\(graph_description_language\)) グラフ記述言語で記述されたグラフとして出力します。デフォルト値: 0。

例：

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


### EXPLAIN SYNTAX \{#explain-syntax\}

構文解析後のクエリの抽象構文木 (AST) を表示します。

これは、クエリを解析してクエリ AST とクエリツリーを構築し、必要に応じてクエリアナライザーと最適化パスを実行し、その後クエリツリーをクエリ AST に戻すことで行われます。

設定:

* `oneline` – クエリを1行で出力します。デフォルト: `0`。
* `run_query_tree_passes` – クエリツリーをダンプする前にクエリツリーのパス処理を実行します。デフォルト: `0`。
* `query_tree_passes` – `run_query_tree_passes` が有効な場合に、実行するパス処理の回数を指定します。`query_tree_passes` を指定しない場合は、すべてのパス処理を実行します。

例:

```sql
EXPLAIN SYNTAX SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

Output:

```sql
SELECT *
FROM system.numbers AS a, system.numbers AS b, system.numbers AS c
WHERE (a.number = b.number) AND (b.number = c.number)
```

`run_query_tree_passes` を有効にした場合：

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

### EXPLAIN QUERY TREE \{#explain-query-tree\}

Settings:

* `run_passes` — クエリツリーをダンプする前に、すべてのクエリツリーパスを実行します。デフォルト: `1`。
* `dump_passes` — クエリツリーをダンプする前に、使用されたパスに関する情報をダンプします。デフォルト: `0`。
* `passes` — 実行するパスの数を指定します。`-1` に設定すると、すべてのパスを実行します。デフォルト: `-1`。
* `dump_tree` — クエリツリーを表示します。デフォルト: `1`。
* `dump_ast` — クエリツリーから生成されたクエリ AST を表示します。デフォルト: `0`。

Example:

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

### EXPLAIN PLAN \{#explain-plan\}

クエリプランのステップを出力します。

Settings:

* `optimize` — プランを表示する前にクエリプランの最適化を適用するかどうかを制御します。デフォルト: 1。
* `header` — ステップの出力ヘッダーを表示します。デフォルト: 0。
* `description` — ステップの説明を表示します。デフォルト: 1。
* `indexes` — 使用された索引、それぞれの索引に対してフィルタリングされたパーツ数およびフィルタリングされた granule 数を表示します。デフォルト: 0。[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルでサポートされています。ClickHouse &gt;= v25.9 以降、このステートメントは `SETTINGS use_query_condition_cache = 0, use_skip_indexes_on_data_read = 0` と併用した場合にのみ適切な出力を表示します。
* `projections` — 解析されたすべてのプロジェクションと、プロジェクションの主キー条件に基づくパートレベルのフィルタリングへの影響を表示します。各プロジェクションについて、このセクションには、プロジェクションの主キーを使用して評価されたパーツ数、行数、マーク数、レンジ数などの統計情報が含まれます。また、プロジェクション自体を読み取ることなく、このフィルタリングによってスキップされたデータパートの数も表示します。プロジェクションが実際に読み取りに使用されたのか、それともフィルタリングのために解析されたのみなのかは、`description` フィールドによって判別できます。デフォルト: 0。[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルでサポートされています。
* `actions` — ステップのアクションに関する詳細情報を表示します。デフォルト: 0。
* `sorting` — ソート済みの出力を生成する各プランステップについて、ソート内容の説明を表示します。デフォルト: 0。
* `keep_logical_steps` — JOIN に対する論理プランステップを、物理的な JOIN 実装へ変換せずに保持します。デフォルト: 0。
* `json` — クエリプランのステップを [JSON](/interfaces/formats/JSON) 形式の 1 行として表示します。デフォルト: 0。[TabSeparatedRaw (TSVRaw)](/interfaces/formats/TabSeparatedRaw) 形式を使用して不要なエスケープを避けることを推奨します。
* `input_headers` — ステップの入力ヘッダーを表示します。デフォルト: 0。主に入力と出力のヘッダー不一致に関連する問題をデバッグする開発者にとって有用です。
* `column_structure` — 名前と型に加えて、ヘッダー内のカラム構造も表示します。デフォルト: 0。主に入力と出力のヘッダー不一致に関連する問題をデバッグする開発者にとって有用です。
* `distributed` — 分散テーブルまたは並列レプリカに対してリモートノード上で実行されたクエリプランを表示します。デフォルト: 0。
* `compact` — 有効にすると、式ステップと詳細なアクション情報 (入力、関数、別名、出力位置) をプランから非表示にします。`actions = 1` の場合にのみ効果があります。デフォルト: 0。
* `pretty` — 階層を視覚化するために、インデントの代わりに罫線文字 (├──, └──, │) を使用してプランツリーを表示します。また、JOIN ステップのプロパティをインラインで整形します。デフォルト: 0。

`json=1` の場合、ステップ名には一意なステップ識別子を含む追加のサフィックスが付きます。

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
ステップおよびクエリコストの見積もりには対応していません。
:::

`json = 1` のとき、クエリプランは JSON 形式で表現されます。各ノードは、常に `Node Type` と `Plans` というキーを持つ Dictionary です。`Node Type` はステップ名を表す文字列です。`Plans` は子ステップの説明を含む配列です。その他の任意のキーが、ノードの種類や設定に応じて追加される場合があります。

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

`description` = 1 を指定すると、`Description` キーがステップに追加されます。

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```


`header` = 1 の場合、カラムの配列として `Header` キーがステップに追加されます。

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

`indexes` = 1 の場合、`Indexes` キーが追加されます。`Indexes` キーには、使用される索引の配列が含まれます。各索引は JSON オブジェクトで表され、`Type` キー (文字列 `MinMax`、`Partition`、`PrimaryKey` または `Skip`) と、以下の任意のキーを持ちます:

* `Name` — 索引名 (現在は `Skip` 索引用でのみ使用されます) 。
* `Keys` — 索引で使用されるカラムの配列。
* `Condition` — 使用される条件。
* `Description` — 索引の説明 (現在は `Skip` 索引用でのみ使用されます) 。
* `Parts` — 索引が適用される前後のパーツ数。
* `Granules` — 索引が適用される前後のグラニュール数。
* `Ranges` — 索引が適用された後のグラニュール範囲の数。

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

`projections` = 1 の場合、`Projections` キーが追加されます。これは解析済みプロジェクションの配列を含みます。各プロジェクションは、以下のキーを持つ JSON として記述されます。

* `Name` — プロジェクション名。
* `Condition` — そのプロジェクションで使用されるプライマリキー条件。
* `Description` — プロジェクションの使用方法の説明 (例：パーツレベルのフィルタリング) 。
* `Selected Parts` — プロジェクションによって選択されたパーツ数。
* `Selected Marks` — 選択されたマーク数。
* `Selected Ranges` — 選択されたレンジ数。
* `Selected Rows` — 選択された行数。
* `Filtered Parts` — パーツレベルのフィルタリングによりスキップされたパーツ数。

例：


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

`actions` = 1 の場合、どのキーが追加されるかはステップの種類によって異なります。

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

`compact = 1` の場合、各 `Expression` ステップは削除されます。これに加えて、`actions = 1` が設定されている場合は、`Actions` 行と `Positions` 行が非表示になり、ステップの説明だけが残ります。

```sql
EXPLAIN actions = 1, compact = 1 SELECT sum(number) FROM numbers(10) GROUP BY number % 4 FORMAT Raw;
```

```text
Aggregating
Keys: modulo(__table1.number, 4_UInt8)
Aggregates:
    sum(__table1.number)
      Function: sum(UInt64) → UInt64
      Arguments: __table1.number
Skip merging: 0
  ReadFromSystemNumbers
```

`distributed` = 1 の場合、出力にはローカルのクエリプランだけでなく、リモートノード上で実行されるクエリプランも含まれます。これは分散クエリの分析やデバッグに役立ちます。

分散テーブルを用いた例：

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

並列レプリカの例:

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

どちらの例でも、クエリプランはローカルおよびリモートのステップを含む実行フロー全体を示します。

`pretty` = 1 の場合、プランツリーはインデントの代わりに線描文字を使って表示され、主要なステップに関する追加情報も表示されます:

* **クエリの出力カラム**は、計画の先頭に表示されます。
* **ソースステップ** (`ReadFromMergeTree` など) には、その出力カラムが表示されます。
* **Join ステップ**には、数学的な表記による結合関係、推定結果行数、
  および各出力カラムが左側と右側のどちらに由来するかが表示されます。異なる join 種別を
  表すために、次の記号を使用します。

| Symbol                 | Join Type |
| ---------------------- | --------- |
| `⋈`                    | 内部結合      |
| `⟕`                    | 左結合       |
| `⟖`                    | 右結合       |
| `⟗`                    | 完全結合      |
| `⋉`                    | 左セミ結合     |
| `⋊`                    | 右セミ結合     |
| `⋉` with strikethrough | 左アンチ結合    |
| `⋊` with strikethrough | 右アンチ結合    |
| `×`                    | クロス結合     |

たとえば、`t1 ⟕ t2` はテーブル `t1` と `t2` の左結合を意味します。
テーブル名の後の角括弧内の数値 (例: `t1[100]`) は、テーブル統計を利用できる場合の
推定行数を示します。

`pretty` オプションは `compact = 1` と併用すると効果的で、`Expression` ステップや
詳細なアクション情報を非表示にできるため、計画が読みやすくなります。

```sql
EXPLAIN pretty = 1 SELECT sum(number) FROM numbers(10) GROUP BY number % 4 FORMAT Raw;
```

```text
Expression ((Project names + Projection))
└──Aggregating
   └──Expression ((Before GROUP BY + Change column names to column identifiers))
      └──ReadFromSystemNumbers
```

JOINを使った、より詳しい例:

```sql
CREATE TABLE t1 (id UInt64, value String) ENGINE = MergeTree ORDER BY id;
CREATE TABLE t2 (id UInt64, value String) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 SELECT number, toString(number) FROM numbers(100);
INSERT INTO t2 SELECT number, toString(number) FROM numbers(100);

EXPLAIN actions = 1, compact = 1, pretty = 1
SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.id FORMAT Raw;
```

```text
Output: id, value, t2.id, t2.value

Join (JOIN FillRightFirst)
│  t1[100] ⋈ t2[100]
│  Type: inner | Strictness: all | Algorithm: ConcurrentHashJoin
│  Result rows: 100
│  Join conditions: [(__table1.id) = (__table2.id)]
│  Output:
│    Left:  id, value
│    Right: id, value
├──ReadFromMergeTree (default.t1)
│     Read type: Default
│     Parts: 1 | Granules: 1
│     Output: id, value
└──ReadFromMergeTree (default.t2)
      Read type: Default
      Parts: 1 | Granules: 1
      Output: id, value
```


### EXPLAIN PIPELINE \{#explain-pipeline\}

設定：

* `header` — 各出力ポートのヘッダーを出力します。デフォルト: 0。
* `graph` — [DOT](https://en.wikipedia.org/wiki/DOT_\(graph_description_language\)) グラフ記述言語で記述されたグラフを出力します。デフォルト: 0。
* `compact` — `graph` 設定が有効な場合、グラフをコンパクトモードで出力します。デフォルト: 1。

`compact=0` かつ `graph=1` の場合、プロセッサ名には一意のプロセッサ識別子を含む追加のサフィックスが付与されます。

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


### EXPLAIN ESTIMATE \{#explain-estimate\}

クエリを実行する際に、テーブルから読み取られる推定行数、マーク数、およびパーツ数を表示します。[MergeTree](/engines/table-engines/mergetree-family/mergetree) ファミリーのテーブルで利用できます。

**例**

テーブルの作成:

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

### EXPLAIN TABLE OVERRIDE \{#explain-table-override\}

テーブル関数経由でアクセスされるテーブルスキーマに対して、テーブルオーバーライドを適用した結果を表示します。
さらに検証も行い、オーバーライドによって何らかの不具合が発生する場合には例外をスローします。

**例**

次のようなリモートの MySQL テーブルがあるとします：

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
│ PARTITION BY uses columns: `created` Nullable(DateTime) │
└─────────────────────────────────────────────────────────┘
```

:::note
検証は完全ではないため、クエリが成功しても、そのオーバーライドによって問題が発生しないことは保証されません。
:::
