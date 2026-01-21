---
description: 'WITH 句のドキュメント'
sidebar_label: 'WITH'
slug: /sql-reference/statements/select/with
title: 'WITH 句'
doc_type: 'reference'
---

# WITH 句 \{#with-clause\}

ClickHouse は、共通テーブル式（Common Table Expressions、[CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)）、共通スカラ―式（Common Scalar Expressions）、および再帰クエリ（Recursive Queries）をサポートしています。

## 共通テーブル式 \{#common-table-expressions\}

共通テーブル式（CTE）は、名前付きサブクエリを表します。
`SELECT` クエリ内でテーブル式が許可されている任意の場所で、その名前を使って参照できます。
名前付きサブクエリは、現在のクエリのスコープおよび子サブクエリのスコープ内で名前により参照できます。

`SELECT` クエリにおける共通テーブル式へのすべての参照は、常にその定義にあるサブクエリに展開されます。
再帰は、現在の CTE を識別子解決処理から隠すことで防止されます。

CTE は、参照されるすべての箇所で同一の結果を保証するものではない点に注意してください。これは、利用されるたびにクエリが再実行されるためです。

### 構文 \{#common-table-expressions-syntax\}

```sql
WITH <identifier> AS <subquery expression>
```

### 例 \{#common-table-expressions-example\}

サブクエリが再実行される場合の例:

```sql
WITH cte_numbers AS
(
    SELECT
        num
    FROM generateRandom('num UInt64', NULL)
    LIMIT 1000000
)
SELECT
    count()
FROM cte_numbers
WHERE num IN (SELECT num FROM cte_numbers)
```

もし CTE が単なるコード片ではなく、その結果そのものを正確に渡す仕様だったとしたら、常に `1000000` が表示されるはずです。

しかし、`cte_numbers` を 2 回参照しているため、そのたびに乱数が生成され、その結果として `280501, 392454, 261636, 196227` などのように毎回異なる乱数結果が表示されます。

## 共通スカラ式 \{#common-scalar-expressions\}

ClickHouse では、`WITH` 句で任意のスカラ式に対するエイリアスを宣言できます。
共通スカラ式はクエリ内の任意の場所で参照できます。

:::note
共通スカラ式が定数リテラル以外を参照する場合、その式は[自由変数](https://en.wikipedia.org/wiki/Free_variables_and_bound_variables)の発生を招く可能性があります。
ClickHouse は識別子を可能な限り最も近いスコープで解決するため、名前の衝突がある場合に自由変数が想定外のエンティティを参照したり、相関サブクエリを引き起こしたりする可能性があります。
式中の識別子の解決挙動をより予測可能にするために、使用するすべての識別子をバインドする [ラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)（[analyzer](/operations/analyzer) を有効にしている場合のみ利用可能）として CSE を定義することを推奨します。
:::

### 構文 \{#common-scalar-expressions-syntax\}

```sql
WITH <式> AS <識別子>
```

### 例 \{#common-scalar-expressions-examples\}

**例 1:** 定数式を「変数」として使う

```sql
WITH '2019-08-01 15:23:00' AS ts_upper_bound
SELECT *
FROM hits
WHERE
    EventDate = toDate(ts_upper_bound) AND
    EventTime <= ts_upper_bound;
```

**例 2:** 高階関数を用いて識別子を束縛する

```sql
WITH
    '.txt' as extension,
    (id, extension) -> concat(lower(id), extension) AS gen_name
SELECT gen_name('test', '.sql') as file_name;
```

```response
   ┌─file_name─┐
1. │ test.sql  │
   └───────────┘
```

**例 3:** 自由変数を伴う高階関数の使用

次のクエリ例は、束縛されていない識別子が最も近いスコープ内のエンティティに解決されることを示しています。
ここでは、`gen_name` ラムダ関数本体内で `extension` は束縛されていません。
`generated_names` が定義および使用されるスコープでは、`extension` は共通スカラー式として `'.txt'` に定義されていますが、`generated_names` サブクエリ内で参照可能であるため、テーブル `extension_list` の列として解決されます。

```sql
CREATE TABLE extension_list
(
    extension String
)
ORDER BY extension
AS SELECT '.sql';

WITH
    '.txt' as extension,
    generated_names as (
        WITH
            (id) -> concat(lower(id), extension) AS gen_name
        SELECT gen_name('test') as file_name FROM extension_list
    )
SELECT file_name FROM generated_names;
```

```response
   ┌─file_name─┐
1. │ test.sql  │
   └───────────┘
```

**例 4:** `sum(bytes)` 式の結果を `SELECT` 句の列リストから削除する

```sql
WITH sum(bytes) AS s
SELECT
    formatReadableSize(s),
    table
FROM system.parts
GROUP BY table
ORDER BY s;
```

**例 5:** スカラーサブクエリ結果の使用

```sql
/* この例は最も大きいテーブルの上位10件を返します */
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

**例 6:** サブクエリ内での式の再利用

```sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```

## 再帰クエリ \{#recursive-queries\}

オプションの `RECURSIVE` 修飾子を指定すると、`WITH` 句のクエリが自身の出力を参照できるようになります。例:

**例:** 1 から 100 までの整数を合計する

```sql
WITH RECURSIVE test_table AS (
    SELECT 1 AS number
UNION ALL
    SELECT number + 1 FROM test_table WHERE number < 100
)
SELECT sum(number) FROM test_table;
```

```text
┌─sum(number)─┐
│        5050 │
└─────────────┘
```

:::note
再帰 CTE は、バージョン **`24.3`** で導入された [新しいクエリアナライザー](/operations/analyzer) に依存しています。バージョン **`24.3+`** を使用していて **`(UNKNOWN_TABLE)`** や **`(UNSUPPORTED_METHOD)`** という例外が発生する場合は、そのインスタンス、ロール、またはプロファイルで新しいアナライザーが無効になっていることを示しています。アナライザーを有効にするには、設定 **`allow_experimental_analyzer`** を有効化するか、**`compatibility`** 設定をより新しいバージョンに更新してください。
バージョン `24.8` 以降では、新しいアナライザーは本番環境での利用向けに正式採用されており、設定 `allow_experimental_analyzer` は `enable_analyzer` に名称変更されています。
:::

再帰的な `WITH` クエリの一般的な形式は、常に非再帰項、続いて `UNION ALL`、その後に再帰項という順序になっており、クエリ自身の出力への参照を含めることができるのは再帰項のみです。再帰 CTE クエリは次のように実行されます。

1. 非再帰項を評価します。非再帰項クエリの結果を一時作業テーブルに格納します。
2. 作業テーブルが空でない限り、以下の手順を繰り返します。
   1. 作業テーブルの現在の内容を、再帰的な自己参照の代わりに代入して再帰項を評価します。再帰項クエリの結果を一時中間テーブルに格納します。
   2. 作業テーブルの内容を中間テーブルの内容で置き換え、その後、中間テーブルを空にします。

再帰クエリは通常、階層データや木構造データを扱うために使用されます。例えば、木構造を走査するクエリを書くことができます。

**例:** 木構造の走査

まずは木構造用のテーブルを作成します。

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

それらのツリーを次のようなクエリを使って走査できます。

**例:** ツリー走査

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

### 探索順序 \{#search-order\}

深さ優先の順序を生成するために、各結果行ごとに、これまでに訪れた行の配列を求めます。

**例:** ツリーの深さ優先探索順序

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

幅優先の順序付けを行うには、検索の深さを記録する列を追加するのが標準的なアプローチです。

**例:** 木構造走査の幅優先順序

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

### サイクル検出 \{#cycle-detection\}

まずはグラフテーブルを作成します。

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

このグラフは次のクエリで走査できます。

**例:** サイクル検出なしでのグラフ走査

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

しかし、そのグラフにサイクルを追加すると、前のクエリは `Maximum recursive CTE evaluation depth` というエラーが発生して失敗します。

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
コード: 306. DB::Exception: localhost:9000 から受信。DB::Exception: 再帰 CTE の評価深度の最大値 (1000) を超過しました。評価対象: search_graph AS (SELECT from, to, label FROM graph AS g UNION ALL SELECT g.from, g.to, g.label FROM graph AS g, search_graph AS sg WHERE g.from = sg.to)。max_recursive_cte_evaluation_depth 設定値の引き上げを検討してください。: RecursiveCTESource の実行中。(TOO_DEEP_RECURSION)
```

サイクルを処理する標準的な方法は、すでに訪問済みのノードを保持する配列を計算することです。

**例:** サイクル検出付きグラフ探索

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

### 無限クエリ \{#infinite-queries\}

外側のクエリで `LIMIT` を使用している場合、無限再帰 CTE クエリを使用することもできます。

**例:** 無限再帰 CTE クエリ

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
