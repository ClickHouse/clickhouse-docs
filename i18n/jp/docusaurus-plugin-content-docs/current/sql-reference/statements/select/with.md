---
description: 'WITH 句に関するドキュメント'
sidebar_label: 'WITH'
slug: /sql-reference/statements/select/with
title: 'WITH 句'
doc_type: 'reference'
---



# WITH 句

ClickHouse は Common Table Expressions（[CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)）、Common Scalar Expressions、および再帰クエリをサポートしています。



## 共通テーブル式 {#common-table-expressions}

共通テーブル式(Common Table Expression)は、名前付きサブクエリを表します。
`SELECT`クエリ内でテーブル式が許可される任意の場所で、名前によって参照できます。
名前付きサブクエリは、現在のクエリのスコープ内、または子サブクエリのスコープ内で名前によって参照できます。

`SELECT`クエリ内の共通テーブル式への各参照は、常にその定義のサブクエリに置き換えられます。
再帰は、識別子解決プロセスから現在のCTEを隠すことによって防止されます。

CTEは、使用箇所ごとにクエリが再実行されるため、呼び出されるすべての場所で同じ結果を保証しないことに注意してください。

### 構文 {#common-table-expressions-syntax}

```sql
WITH <identifier> AS <subquery expression>
```

### 例 {#common-table-expressions-example}

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

CTEがコードの断片ではなく結果そのものを渡す場合、常に`1000000`が表示されます。

しかし、`cte_numbers`を2回参照しているため、毎回乱数が生成され、その結果、`280501, 392454, 261636, 196227`などの異なるランダムな結果が表示されます...


## 共通スカラー式 {#common-scalar-expressions}

ClickHouseでは、`WITH`句で任意のスカラー式に対してエイリアスを宣言できます。
共通スカラー式は、クエリ内の任意の場所で参照できます。

:::note
共通スカラー式が定数リテラル以外のものを参照する場合、その式は[自由変数](https://en.wikipedia.org/wiki/Free_variables_and_bound_variables)の存在につながる可能性があります。
ClickHouseは識別子を可能な限り最も近いスコープで解決するため、自由変数は名前の衝突が発生した場合に予期しないエンティティを参照したり、相関サブクエリにつながる可能性があります。
式の識別子解決のより予測可能な動作を実現するために、使用されるすべての識別子をバインドする[ラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)([analyzer](/operations/analyzer)が有効な場合のみ可能)としてCSEを定義することを推奨します。
:::

### 構文 {#common-scalar-expressions-syntax}

```sql
WITH <expression> AS <identifier>
```

### 例 {#common-scalar-expressions-examples}

**例1:** 定数式を「変数」として使用

```sql
WITH '2019-08-01 15:23:00' AS ts_upper_bound
SELECT *
FROM hits
WHERE
    EventDate = toDate(ts_upper_bound) AND
    EventTime <= ts_upper_bound;
```

**例2:** 高階関数を使用して識別子をバインド

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

**例3:** 自由変数を持つ高階関数の使用

以下のクエリ例は、バインドされていない識別子が最も近いスコープ内のエンティティに解決されることを示しています。
ここでは、`extension`は`gen_name`ラムダ関数本体内でバインドされていません。
`extension`は`generated_names`の定義と使用のスコープ内で共通スカラー式として`'.txt'`に定義されていますが、`generated_names`サブクエリ内で利用可能であるため、テーブル`extension_list`の列に解決されます。

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

**例4:** SELECT句の列リストからsum(bytes)式の結果を除外

```sql
WITH sum(bytes) AS s
SELECT
    formatReadableSize(s),
    table
FROM system.parts
GROUP BY table
ORDER BY s;
```

**例5:** スカラーサブクエリの結果を使用

```sql
/* この例は最も大きいテーブルのTOP 10を返します */
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

**例6:** サブクエリ内で式を再利用

```sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```


## 再帰クエリ {#recursive-queries}

オプションの`RECURSIVE`修飾子を使用すると、WITHクエリが自身の出力を参照できるようになります。例:

**例:** 1から100までの整数の合計

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
再帰CTEは、バージョン**`24.3`**で導入された[新しいクエリアナライザ](/operations/analyzer)に依存しています。バージョン**`24.3+`**を使用していて**`(UNKNOWN_TABLE)`**または**`(UNSUPPORTED_METHOD)`**例外が発生する場合、インスタンス、ロール、またはプロファイルで新しいアナライザが無効になっていることを示しています。アナライザを有効にするには、設定**`allow_experimental_analyzer`**を有効にするか、**`compatibility`**設定をより新しいバージョンに更新してください。
バージョン`24.8`以降、新しいアナライザは本番環境に完全に昇格され、設定`allow_experimental_analyzer`は`enable_analyzer`に名称変更されました。
:::

再帰`WITH`クエリの一般的な形式は、常に非再帰項、次に`UNION ALL`、そして再帰項となり、再帰項のみがクエリ自身の出力への参照を含むことができます。再帰CTEクエリは次のように実行されます:

1. 非再帰項を評価します。非再帰項クエリの結果を一時作業テーブルに配置します。
2. 作業テーブルが空でない限り、以下の手順を繰り返します:
   1. 再帰項を評価し、作業テーブルの現在の内容を再帰的自己参照に置き換えます。再帰項クエリの結果を一時中間テーブルに配置します。
   2. 作業テーブルの内容を中間テーブルの内容で置き換え、その後中間テーブルを空にします。

再帰クエリは通常、階層構造またはツリー構造のデータを扱うために使用されます。例えば、ツリー走査を実行するクエリを記述できます:

**例:** ツリー走査

まず、ツリーテーブルを作成しましょう:

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

このようなクエリでツリーを走査できます:

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

### 検索順序 {#search-order}

深さ優先順序を作成するには、各結果行に対して既に訪問した行の配列を計算します:

**例:** ツリー走査の深さ優先順序

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

幅優先順序を作成するには、検索の深さを追跡する列を追加するのが標準的なアプローチです:

**例:** ツリー走査の幅優先順序

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

まず、グラフテーブルを作成しましょう:

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

次のクエリでこのグラフを走査できます:

**例:** サイクル検出なしのグラフ走査

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

しかし、このグラフにサイクルを追加すると、前のクエリは `Maximum recursive CTE evaluation depth` エラーで失敗します:

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

サイクルを処理する標準的な方法は、既に訪問済みのノードの配列を計算することです:


**例:** サイクル検出を用いたグラフ探索

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

外部クエリで`LIMIT`を使用すれば、無限再帰CTEクエリを使用することも可能です:

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
