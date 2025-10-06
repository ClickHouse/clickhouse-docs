---
'description': 'ARRAY JOIN 句に関するドキュメント'
'sidebar_label': 'ARRAY JOIN'
'slug': '/sql-reference/statements/select/array-join'
'title': 'ARRAY JOIN 句'
'doc_type': 'reference'
---



# ARRAY JOIN句

配列カラムを含むテーブルの一般的な操作は、最初のカラムの各個々の配列要素を持つ行がある新しいテーブルを生成し、他のカラムの値が重複することです。これが `ARRAY JOIN`句が行う基本的なケースです。

その名前は、配列やネストされたデータ構造で `JOIN` を実行するように見えることから来ています。意図は [arrayJoin](/sql-reference/functions/array-join) 関数と似ていますが、句の機能はより広範です。

構文：

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

サポートされている `ARRAY JOIN` のタイプは以下に示されています：

- `ARRAY JOIN` - 基本ケースでは、空の配列は `JOIN` の結果に含まれません。
- `LEFT ARRAY JOIN` - `JOIN` の結果には空の配列を持つ行が含まれます。空の配列の値は、配列要素の型のデフォルト値（通常は 0、空文字列または NULL）に設定されます。

## 基本的なARRAY JOINの例 {#basic-array-join-examples}

### ARRAY JOIN と LEFT ARRAY JOIN {#array-join-left-array-join-examples}

以下の例は、`ARRAY JOIN` と `LEFT ARRAY JOIN` 句の使用法を示しています。[Array](../../../sql-reference/data-types/array.md) 型のカラムを持つテーブルを作成し、それに値を挿入します：

```sql
CREATE TABLE arrays_test
(
    s String,
    arr Array(UInt8)
) ENGINE = Memory;

INSERT INTO arrays_test
VALUES ('Hello', [1,2]), ('World', [3,4,5]), ('Goodbye', []);
```

```response
┌─s───────────┬─arr─────┐
│ Hello       │ [1,2]   │
│ World       │ [3,4,5] │
│ Goodbye     │ []      │
└─────────────┴─────────┘
```

以下の例では `ARRAY JOIN` 句を使用しています：

```sql
SELECT s, arr
FROM arrays_test
ARRAY JOIN arr;
```

```response
┌─s─────┬─arr─┐
│ Hello │   1 │
│ Hello │   2 │
│ World │   3 │
│ World │   4 │
│ World │   5 │
└───────┴─────┘
```

次の例では `LEFT ARRAY JOIN` 句を使用しています：

```sql
SELECT s, arr
FROM arrays_test
LEFT ARRAY JOIN arr;
```

```response
┌─s───────────┬─arr─┐
│ Hello       │   1 │
│ Hello       │   2 │
│ World       │   3 │
│ World       │   4 │
│ World       │   5 │
│ Goodbye     │   0 │
└─────────────┴─────┘
```

### ARRAY JOIN と arrayEnumerate 関数 {#array-join-arrayEnumerate}

この関数は通常 `ARRAY JOIN` と一緒に使用されます。`ARRAY JOIN` を適用した後に各配列について何かを一度だけカウントすることを可能にします。例：

```sql
SELECT
    count() AS Reaches,
    countIf(num = 1) AS Hits
FROM test.hits
ARRAY JOIN
    GoalsReached,
    arrayEnumerate(GoalsReached) AS num
WHERE CounterID = 160656
LIMIT 10
```

```text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

この例では、Reaches はコンバージョンの数（`ARRAY JOIN` を適用した後に得られた文字列）、Hits はページビューの数（`ARRAY JOIN` 前の文字列）です。この特定のケースでは、より簡単な方法で同じ結果を得ることができます：

```sql
SELECT
    sum(length(GoalsReached)) AS Reaches,
    count() AS Hits
FROM test.hits
WHERE (CounterID = 160656) AND notEmpty(GoalsReached)
```

```text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

### ARRAY JOIN と arrayEnumerateUniq {#array_join_arrayEnumerateUniq}

この関数は `ARRAY JOIN` を使用して配列要素を集計する際に有用です。

この例では、各ゴールIDに対してコンバージョンの数（Goals のネストされたデータ構造の各要素は到達したゴールであり、これをコンバージョンと呼びます）とセッションの数を計算します。`ARRAY JOIN` なしでは、セッションの数を sum(Sign) としてカウントしていました。しかしこの特定のケースでは、行がネストされた Goals 構造によって乗算されたため、この後に各セッションを一度だけカウントするために、`arrayEnumerateUniq(Goals.ID)` 関数の値に条件を適用します。

```sql
SELECT
    Goals.ID AS GoalID,
    sum(Sign) AS Reaches,
    sumIf(Sign, num = 1) AS Visits
FROM test.visits
ARRAY JOIN
    Goals,
    arrayEnumerateUniq(Goals.ID) AS num
WHERE CounterID = 160656
GROUP BY GoalID
ORDER BY Reaches DESC
LIMIT 10
```

```text
┌──GoalID─┬─Reaches─┬─Visits─┐
│   53225 │    3214 │   1097 │
│ 2825062 │    3188 │   1097 │
│   56600 │    2803 │    488 │
│ 1989037 │    2401 │    365 │
│ 2830064 │    2396 │    910 │
│ 1113562 │    2372 │    373 │
│ 3270895 │    2262 │    812 │
│ 1084657 │    2262 │    345 │
│   56599 │    2260 │    799 │
│ 3271094 │    2256 │    812 │
└─────────┴─────────┴────────┘
```

## エイリアスの使用 {#using-aliases}

`ARRAY JOIN` 句では配列にエイリアスを指定できます。この場合、配列アイテムはこのエイリアスでアクセスできますが、配列自体には元の名前でアクセスします。例：

```sql
SELECT s, arr, a
FROM arrays_test
ARRAY JOIN arr AS a;
```

```response
┌─s─────┬─arr─────┬─a─┐
│ Hello │ [1,2]   │ 1 │
│ Hello │ [1,2]   │ 2 │
│ World │ [3,4,5] │ 3 │
│ World │ [3,4,5] │ 4 │
│ World │ [3,4,5] │ 5 │
└───────┴─────────┴───┘
```

エイリアスを使用すると、外部配列で `ARRAY JOIN` を行うことができます。例えば：

```sql
SELECT s, arr_external
FROM arrays_test
ARRAY JOIN [1, 2, 3] AS arr_external;
```

```response
┌─s───────────┬─arr_external─┐
│ Hello       │            1 │
│ Hello       │            2 │
│ Hello       │            3 │
│ World       │            1 │
│ World       │            2 │
│ World       │            3 │
│ Goodbye     │            1 │
│ Goodbye     │            2 │
│ Goodbye     │            3 │
└─────────────┴──────────────┘
```

複数の配列は `ARRAY JOIN` 句でカンマ区切りで指定できます。この場合、`JOIN` はそれらを同時に行います（直接の合計であり、直積ではありません）。全ての配列はデフォルトで同じサイズである必要があります。例：

```sql
SELECT s, arr, a, num, mapped
FROM arrays_test
ARRAY JOIN arr AS a, arrayEnumerate(arr) AS num, arrayMap(x -> x + 1, arr) AS mapped;
```

```response
┌─s─────┬─arr─────┬─a─┬─num─┬─mapped─┐
│ Hello │ [1,2]   │ 1 │   1 │      2 │
│ Hello │ [1,2]   │ 2 │   2 │      3 │
│ World │ [3,4,5] │ 3 │   1 │      4 │
│ World │ [3,4,5] │ 4 │   2 │      5 │
│ World │ [3,4,5] │ 5 │   3 │      6 │
└───────┴─────────┴───┴─────┴────────┘
```

以下の例では [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 関数を使用しています：

```sql
SELECT s, arr, a, num, arrayEnumerate(arr)
FROM arrays_test
ARRAY JOIN arr AS a, arrayEnumerate(arr) AS num;
```

```response
┌─s─────┬─arr─────┬─a─┬─num─┬─arrayEnumerate(arr)─┐
│ Hello │ [1,2]   │ 1 │   1 │ [1,2]               │
│ Hello │ [1,2]   │ 2 │   2 │ [1,2]               │
│ World │ [3,4,5] │ 3 │   1 │ [1,2,3]             │
│ World │ [3,4,5] │ 4 │   2 │ [1,2,3]             │
│ World │ [3,4,5] │ 5 │   3 │ [1,2,3]             │
└───────┴─────────┴───┴─────┴─────────────────────┘
```

異なるサイズの複数の配列を結合するには： `SETTINGS enable_unaligned_array_join = 1` を使用することができます。例：

```sql
SELECT s, arr, a, b
FROM arrays_test ARRAY JOIN arr AS a, [['a','b'],['c']] AS b
SETTINGS enable_unaligned_array_join = 1;
```

```response
┌─s───────┬─arr─────┬─a─┬─b─────────┐
│ Hello   │ [1,2]   │ 1 │ ['a','b'] │
│ Hello   │ [1,2]   │ 2 │ ['c']     │
│ World   │ [3,4,5] │ 3 │ ['a','b'] │
│ World   │ [3,4,5] │ 4 │ ['c']     │
│ World   │ [3,4,5] │ 5 │ []        │
│ Goodbye │ []      │ 0 │ ['a','b'] │
│ Goodbye │ []      │ 0 │ ['c']     │
└─────────┴─────────┴───┴───────────┘
```

## ネストされたデータ構造とのARRAY JOIN {#array-join-with-nested-data-structure}

`ARRAY JOIN` は [ネストされたデータ構造](../../../sql-reference/data-types/nested-data-structures/index.md) に対しても機能します：

```sql
CREATE TABLE nested_test
(
    s String,
    nest Nested(
    x UInt8,
    y UInt32)
) ENGINE = Memory;

INSERT INTO nested_test
VALUES ('Hello', [1,2], [10,20]), ('World', [3,4,5], [30,40,50]), ('Goodbye', [], []);
```

```response
┌─s───────┬─nest.x──┬─nest.y─────┐
│ Hello   │ [1,2]   │ [10,20]    │
│ World   │ [3,4,5] │ [30,40,50] │
│ Goodbye │ []      │ []         │
└─────────┴─────────┴────────────┘
```

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN nest;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ Hello │      1 │     10 │
│ Hello │      2 │     20 │
│ World │      3 │     30 │
│ World │      4 │     40 │
│ World │      5 │     50 │
└───────┴────────┴────────┘
```

`ARRAY JOIN` でネストされたデータ構造の名前を指定すると、その意味はその構造が含む全ての配列要素を持つ `ARRAY JOIN` と同じです。以下に例を示します：

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN `nest.x`, `nest.y`;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ Hello │      1 │     10 │
│ Hello │      2 │     20 │
│ World │      3 │     30 │
│ World │      4 │     40 │
│ World │      5 │     50 │
└───────┴────────┴────────┘
```

このバリエーションも意味があります：

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN `nest.x`;
```

```response
┌─s─────┬─nest.x─┬─nest.y─────┐
│ Hello │      1 │ [10,20]    │
│ Hello │      2 │ [10,20]    │
│ World │      3 │ [30,40,50] │
│ World │      4 │ [30,40,50] │
│ World │      5 │ [30,40,50] │
└───────┴────────┴────────────┘
```

ネストされたデータ構造でもエイリアスを使用して、`JOIN` 結果またはソース配列のいずれかを選択できます。例：

```sql
SELECT s, `n.x`, `n.y`, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN nest AS n;
```

```response
┌─s─────┬─n.x─┬─n.y─┬─nest.x──┬─nest.y─────┐
│ Hello │   1 │  10 │ [1,2]   │ [10,20]    │
│ Hello │   2 │  20 │ [1,2]   │ [10,20]    │
│ World │   3 │  30 │ [3,4,5] │ [30,40,50] │
│ World │   4 │  40 │ [3,4,5] │ [30,40,50] │
│ World │   5 │  50 │ [3,4,5] │ [30,40,50] │
└───────┴─────┴─────┴─────────┴────────────┘
```

[arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 関数を使用した例：

```sql
SELECT s, `n.x`, `n.y`, `nest.x`, `nest.y`, num
FROM nested_test
ARRAY JOIN nest AS n, arrayEnumerate(`nest.x`) AS num;
```

```response
┌─s─────┬─n.x─┬─n.y─┬─nest.x──┬─nest.y─────┬─num─┐
│ Hello │   1 │  10 │ [1,2]   │ [10,20]    │   1 │
│ Hello │   2 │  20 │ [1,2]   │ [10,20]    │   2 │
│ World │   3 │  30 │ [3,4,5] │ [30,40,50] │   1 │
│ World │   4 │  40 │ [3,4,5] │ [30,40,50] │   2 │
│ World │   5 │  50 │ [3,4,5] │ [30,40,50] │   3 │
└───────┴─────┴─────┴─────────┴────────────┴─────┘
```

## 実装の詳細 {#implementation-details}

クエリの実行順序は、`ARRAY JOIN` を実行する際に最適化されます。`ARRAY JOIN` は常にクエリ内の [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) 句の前に指定する必要がありますが、実際には結果の `ARRAY JOIN` がフィルタリングに使用されない限り、任意の順序で実行できます。処理順序はクエリオプティマイザによって制御されます。

### ショートサーキット関数評価との互換性のない場合 {#incompatibility-with-short-circuit-function-evaluation}

[ショートサーキット関数評価](/operations/settings/settings#short_circuit_function_evaluation) は、`if`、`multiIf`、`and`、および `or` などの特定の関数における複雑な式の実行を最適化する機能です。これにより、ゼロ除算などの潜在的な例外がこれらの関数の実行中に発生することを防ぎます。

`arrayJoin` は常に実行され、ショートサーキット関数評価には対応していません。これは、クエリ分析および実行中に他の全ての関数とは別に処理されるユニークな関数であり、ショートサーキット関数実行では機能しない追加のロジックを必要とするためです。その理由は、結果の行数は `arrayJoin` の結果に依存し、`arrayJoin` の遅延実行を実装するのがあまりにも複雑で高価であるからです。

## 関連内容 {#related-content}

- ブログ: [ClickHouseでの時系列データの操作](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
