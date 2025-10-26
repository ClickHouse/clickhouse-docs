---
'description': 'WITH 句に関するドキュメント'
'sidebar_label': 'WITH'
'slug': '/sql-reference/statements/select/with'
'title': 'WITH 句'
'doc_type': 'reference'
---


# WITH句

ClickHouseは共通テーブル式（[CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)）、共通スカラ式、再帰クエリをサポートしています。

## 共通テーブル式 {#common-table-expressions}

共通テーブル式は名前付きのサブクエリを表します。
それらは、テーブル式が許可されている`SELECT`クエリのどこでも名前で参照できます。
名前付きサブクエリは、現在のクエリのスコープまたは子サブクエリのスコープで名前で参照できます。

`SELECT`クエリにおける共通テーブル式への参照は、常にその定義からのサブクエリに置き換えられます。
再帰は、現在のCTEを識別子解決プロセスから隠すことによって防止されます。

CTEは、呼ばれるすべての場所で同じ結果を保証しないことに注意してください。なぜなら、クエリは各使用ケースのために再実行されるからです。

### 構文 {#common-table-expressions-syntax}

```sql
WITH <identifier> AS <subquery expression>
```

### 例 {#common-table-expressions-example}

サブクエリが再実行される例：
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
もしCTEが結果を正確に渡し、単なるコードの一部ではない場合、常に`1000000`が表示されます。

しかし、`cte_numbers`を二回参照しているため、毎回ランダムな数字が生成され、その結果として異なるランダムな結果`280501, 392454, 261636, 196227`などが見られます...

## 共通スカラ式 {#common-scalar-expressions}

ClickHouseは、`WITH`句内の任意のスカラ式に別名を宣言することを許可します。
共通スカラ式は、クエリのどこでも参照できます。

:::note
共通スカラ式が定数リテラル以外を参照する場合、[自由変数](https://en.wikipedia.org/wiki/Free_variables_and_bound_variables)の存在を引き起こす可能性があります。
ClickHouseは、最も近いスコープで識別子を解決するため、名前の衝突が発生した場合、自由変数が予期しないエンティティを参照したり、相関サブクエリを引き起こす可能性があります。
CSEを[ラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)として定義し（これは[analyzer](/operations/analyzer)が有効になっている場合のみ可能）、使用されるすべての識別子をバインディングすることをお勧めします。これにより、式の識別子解決の動作がより予測可能になります。
:::

### 構文 {#common-scalar-expressions-syntax}

```sql
WITH <expression> AS <identifier>
```

### 例 {#common-scalar-expressions-examples}

**例 1:** 定数式を「変数」として使用

```sql
WITH '2019-08-01 15:23:00' AS ts_upper_bound
SELECT *
FROM hits
WHERE
    EventDate = toDate(ts_upper_bound) AND
    EventTime <= ts_upper_bound;
```

**例 2:** 識別子を束縛する高階関数の使用

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

**例 3:** 自由変数を持つ高階関数の使用

次のクエリは、束縛されていない識別子が最も近いスコープのエンティティに解決されることを示しています。
ここで、`extension`は`gen_name`ラムダ関数の本体ではバインドされていません。
`extension`は`generated_names`定義および使用のスコープ内で共通スカラ式として`'.txt'`に定義されていますが、`generated_names`サブクエリで利用可能であるため、テーブル`extension_list`のカラムに解決されます。

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

**例 4:** SELECT句のカラムリストからsum(bytes)式の結果を排除する

```sql
WITH sum(bytes) AS s
SELECT
    formatReadableSize(s),
    table
FROM system.parts
GROUP BY table
ORDER BY s;
```

**例 5:** スカラサブクエリの結果を使用

```sql
/* this example would return TOP 10 of most huge tables */
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

**例 6:** サブクエリでの式の再利用

```sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```

## 再帰クエリ {#recursive-queries}

オプションの`RECURSIVE`修飾子により、WITHクエリは自分自身の出力を参照できます。例：

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
再帰CTEは、バージョン**`24.3`**で導入された[新しいクエリアナライザー](/operations/analyzer)に依存しています。バージョン**`24.3+`**を使用しており、**`(UNKNOWN_TABLE)`**または**`(UNSUPPORTED_METHOD)`**例外が発生した場合は、新しいアナライザーがインスタンス、ロール、またはプロファイルで無効になっていることを示唆しています。アナライザーを有効にするには、設定**`allow_experimental_analyzer`**を有効にするか、**`compatibility`**設定を最新のバージョンに更新してください。
バージョン`24.8`から、新しいアナライザーは本番環境に完全に昇格され、設定`allow_experimental_analyzer`は`enable_analyzer`に名前変更されました。
:::

再帰的な`WITH`クエリの一般的な形式は、常に非再帰項、次に`UNION ALL`、再帰項であり、再帰項のみがクエリの自身の出力を参照できます。再帰CTEクエリは次のように実行されます：

1. 非再帰項を評価します。非再帰項クエリの結果を一時作業テーブルに置きます。
2. 作業テーブルが空でない限り、次の手順を繰り返します：
    1. 再帰項を評価し、現在の作業テーブルの内容を再帰的な自己参照に置き換えます。再帰項クエリの結果を一時中間テーブルに置きます。
    2. 作業テーブルの内容を中間テーブルの内容で置き換え、その後中間テーブルを空にします。

再帰クエリは、通常、階層的または木構造データを扱うために使用されます。たとえば、木の走査を行うクエリを書くことができます：

**例:** 木の走査

まず、木テーブルを作成します：

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

次のクエリでこれらの木を走査できます：

**例:** 木の走査
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

深さ優先の順序を作成するために、各結果行に対して、すでに訪れた行の配列を計算します：

**例:** 深さ優先の木の走査
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

幅優先の順序を作成するための標準的なアプローチは、探索の深さを追跡するカラムを追加することです：

**例:** 幅優先の木の走査
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

まず、グラフテーブルを作成します：

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

次のクエリでそのグラフを走査できます：

**例:** サイクル検出なしのグラフの走査
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

しかし、グラフにサイクルを追加すると、前のクエリは`最大再帰CTE評価深度`エラーで失敗します：

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

サイクルを処理するための標準的な方法は、すでに訪れたノードの配列を計算することです：

**例:** サイクル検出を伴うグラフの走査
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

外部クエリで`LIMIT`が使用される場合、無限再帰CTEクエリを使用することも可能です：

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
