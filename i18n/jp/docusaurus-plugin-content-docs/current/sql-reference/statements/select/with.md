---
slug: /sql-reference/statements/select/with
sidebar_label: WITH
---


# WITH句

ClickHouseは共通テーブル式（[CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)）をサポートしており、`WITH`句で定義されたコードは、`SELECT`クエリの残りのすべての使用箇所で置き換えられます。名前付きのサブクエリは、テーブルオブジェクトが許可されている場所で現在および子クエリのコンテキストに含めることができます。再帰は、現在のレベルのCTEをWITH式から隠すことで防がれます。

CTEが呼ばれるすべての場所で同じ結果を保証するわけではないことに注意してください。なぜなら、クエリは使用ケースごとに再実行されるからです。

そのような動作の例は以下の通りです。
``` sql
with cte_numbers as
(
    select
        num
    from generateRandom('num UInt64', NULL)
    limit 1000000
)
select
    count()
from cte_numbers
where num in (select num from cte_numbers)
```
CTEが結果そのものを渡すのではなく、コードの一部だけを渡すので、常に `1000000` が表示されるわけではありません。

ただし、`cte_numbers` を2回参照しているため、毎回ランダムな数が生成され、それに応じて異なるランダムな結果、`280501, 392454, 261636, 196227` などが表示されることになります。

## 構文 {#syntax}

``` sql
WITH <expression> AS <identifier>
```
または
``` sql
WITH <identifier> AS <subquery expression>
```

## 例 {#examples}

**例 1:** 定数式を「変数」として使用

``` sql
WITH '2019-08-01 15:23:00' as ts_upper_bound
SELECT *
FROM hits
WHERE
    EventDate = toDate(ts_upper_bound) AND
    EventTime <= ts_upper_bound;
```

**例 2:** SELECT句のカラムリストから sum(bytes) 結果を削除

``` sql
WITH sum(bytes) as s
SELECT
    formatReadableSize(s),
    table
FROM system.parts
GROUP BY table
ORDER BY s;
```

**例 3:** スカラサブクエリの結果を使用

``` sql
/* この例は、最も巨大なテーブルのTOP 10を返します */
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

**例 4:** サブクエリでの式の再利用

``` sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```

## 再帰クエリ {#recursive-queries}

オプションの RECURSIVE 修飾子を使用すると、WITHクエリが自身の出力を参照できるようになります。例:

**例:** 1から100までの整数を合計

```sql
WITH RECURSIVE test_table AS (
    SELECT 1 AS number
UNION ALL
    SELECT number + 1 FROM test_table WHERE number < 100
)
SELECT sum(number) FROM test_table;
```

``` text
┌─sum(number)─┐
│        5050 │
└─────────────┘
```

:::note
再帰CTEは、バージョン **`24.3`** で導入された [新しいクエリアナライザー](/operations/analyzer) に依存しています。バージョン **`24.3+`** を使用していて、**`(UNKNOWN_TABLE)`** または **`(UNSUPPORTED_METHOD)`** 例外に遭遇した場合、これは新しいアナライザーがインスタンス、ロール、またはプロファイルで無効になっていることを示しています。アナライザーを有効にするには、設定 **`allow_experimental_analyzer`** を有効にするか、**`compatibility`** 設定をより新しいバージョンに更新してください。
バージョン `24.8` からは新しいアナライザーが生産環境で完全に推奨され、設定 `allow_experimental_analyzer` は `enable_analyzer` に名前が変更されました。
:::

再帰的な `WITH` クエリの一般的な形式は、常に非再帰的な項、次に `UNION ALL`、その後に再帰的な項を含みます。再帰的な項にのみ、クエリ自身の出力への参照を含めることができます。再帰CTEクエリは次のように実行されます：

1. 非再帰的な項を評価します。非再帰的な項のクエリの結果を一時的な作業テーブルに置きます。
2. 作業テーブルが空でない限り、これらのステップを繰り返します：
    1. 再帰的な項を評価し、作業テーブルの現在の内容を再帰的な自己参照に置き換えます。再帰的な項のクエリの結果を一時的な中間テーブルに置きます。
    2. 作業テーブルの内容を中間テーブルの内容で置き換え、中間テーブルを空にします。

再帰クエリは通常、階層データまたはツリー構造データを操作するために使用されます。たとえば、ツリーのトラバーサルを実行するクエリを書くことができます：

**例:** ツリーのトラバーサル

まず、ツリーテーブルを作成します：

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

そのツリーを以下のクエリでトラバースできます：

**例:** ツリーのトラバーサル
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

### 探索順序 {#search-order}

深さ優先の順序を作成するために、訪れた行の配列を各結果行に対して計算します：

**例:** ツリーのトラバーサル深さ優先順序
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

幅優先の順序を作成するための標準的な方法は、探索の深さを追跡するカラムを追加することです：

**例:** ツリーのトラバーサル幅優先順序
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

### サイクル検出 {#cycle-detection}

まず、グラフテーブルを作成しましょう：

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

次のクエリでグラフをトラバースできます：

**例:** サイクル検出なしでのグラフトラバース
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

しかし、そのグラフにサイクルを追加すると、前のクエリは `Maximum recursive CTE evaluation depth` エラーで失敗します：

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
Code: 306. DB::Exception: Received from localhost:9000. DB::Exception: Maximum recursive CTE evaluation depth (1000) exceeded, during evaluation of search_graph AS (SELECT from, to, label FROM graph AS g UNION ALL SELECT g.from, g.to, g.label FROM graph AS g, search_graph AS sg WHERE g.from = sg.to). Consider raising max_recursive_cte_evaluation_depth setting.: While executing RecursiveCTESource. (TOO_DEEP_RECURSION)
```

サイクルを処理するための標準方法は、すでに訪れたノードの配列を計算することです：

**例:** サイクル検出を伴うグラフトラバース
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

### 無限クエリ {#infinite-queries}

また、外側のクエリで `LIMIT` を使用する場合、無限再帰CTEクエリを使用することも可能です：

**例:** 無限再帰CTEクエリ
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
