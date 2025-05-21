description: 'ARRAY JOIN 句に関するドキュメント'
sidebar_label: 'ARRAY JOIN'
slug: /sql-reference/statements/select/array-join
title: 'ARRAY JOIN 句'
```


# ARRAY JOIN 句

配列カラムを持つテーブルに対して一般的な操作は、最初のカラムの各個別の配列要素を持つ行で新しいテーブルを生成し、他のカラムの値が複製されることです。これが `ARRAY JOIN` 句の基本的な機能です。

その名前は、配列またはネステッドデータ構造を持つ `JOIN` を実行することができるという事実に由来しています。意図は [arrayJoin](/sql-reference/functions/array-join) 関数と似ていますが、句の機能はより広範囲です。

構文：

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

サポートされている `ARRAY JOIN` の種類は以下の通りです：

- `ARRAY JOIN` - 基本ケースでは、空の配列は `JOIN` の結果に含まれません。
- `LEFT ARRAY JOIN` - `JOIN` の結果には空の配列を持つ行が含まれます。空の配列の値は、配列要素タイプのデフォルト値（通常は 0, 空文字列、または NULL）に設定されます。

## 基本的な ARRAY JOIN の例 {#basic-array-join-examples}

### ARRAY JOIN と LEFT ARRAY JOIN {#array-join-left-array-join-examples}

以下の例は `ARRAY JOIN` および `LEFT ARRAY JOIN` 句の使用法を示します。まず、[Array](../../../sql-reference/data-types/array.md) 型のカラムを持つテーブルを作成し、値を挿入します：

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

以下の例は `ARRAY JOIN` 句を使用しています：

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

次の例は `LEFT ARRAY JOIN` 句を使用しています：

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

この関数は通常、`ARRAY JOIN` と共に使用されます。`ARRAY JOIN` を適用した後に各配列を一度だけカウントできるようにします。例：

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

この例では、Reaches はコンバージョンの数（`ARRAY JOIN` を適用した後に受け取った文字列）で、Hits はページビューの数（`ARRAY JOIN` 前の文字列）です。この特定のケースでは、より簡単な方法で同じ結果を得ることができます：

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

この関数は `ARRAY JOIN` を使用し、配列要素を集約する際に便利です。

この例では、各目標 ID に対してコンバージョンの数（Goals ネステッドデータ構造の各要素は到達した目標で、コンバージョンと呼びます）とセッションの数の計算が行われます。`ARRAY JOIN` がない場合、セッションの数は sum(Sign) としてカウントされていました。しかし、この特定のケースでは、行がネステッド Goals 構造によって乗算されているため、これを行った後に各セッションを一度だけカウントするために、`arrayEnumerateUniq(Goals.ID)` 関数の値に条件を適用します。

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

`ARRAY JOIN` 句において配列にエイリアスを指定できます。この場合、配列アイテムにはこのエイリアスでアクセスできますが、配列自体には元の名前でアクセスされます。例：

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

エイリアスを使用することで、外部配列との `ARRAY JOIN` を実行できます。例えば：

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

複数の配列をカンマで区切って `ARRAY JOIN` 句に指定できます。この場合、それらに対して同時に `JOIN` が行われます（直積ではなく直接の合計）。注意すべきは、すべての配列はデフォルトで同じサイズでなければならないということです。例：

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

以下の例は [arrayEnumerate](/sql-reference/functions/array-functions#arrayenumeratearr) 関数を使用しています：

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

異なるサイズの複数の配列を結合するには、次のように `SETTINGS enable_unaligned_array_join = 1` を使用します。例：

```sql
SELECT s, arr, a, b
FROM arrays_test ARRAY JOIN arr as a, [['a','b'],['c']] as b
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

## ネステッドデータ構造による ARRAY JOIN {#array-join-with-nested-data-structure}

`ARRAY JOIN` は [ネステッドデータ構造](../../../sql-reference/data-types/nested-data-structures/index.md) に対しても機能します：

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

`ARRAY JOIN` でネステッドデータ構造の名前を指定する場合、意味はその要素で構成された配列すべてに対する `ARRAY JOIN` と同じです。以下に例を示します：

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

このバリエーションも意味が成り立ちます：

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

ネステッドデータ構造についてエイリアスを使用することで、`JOIN` 結果またはソース配列のいずれかを選択できます。例：

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

[ arrayEnumerate ](/sql-reference/functions/array-functions#arrayenumeratearr) 関数を使用した例：

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

`ARRAY JOIN` を実行する際、クエリの実行順序は最適化されます。`ARRAY JOIN` は常にクエリの [WHERE](../../../sql-reference/statements/select/where.md) / [PREWHERE](../../../sql-reference/statements/select/prewhere.md) 句の前に指定する必要がありますが、技術的には、`ARRAY JOIN` の結果がフィルタリングに使用されていない限り、任意の順序で実行することができます。処理順序はクエリオプティマイザーによって制御されます。

### 短絡関数の評価との非互換性 {#incompatibility-with-short-circuit-function-evaluation}

[短絡関数の評価](/operations/settings/settings#short_circuit_function_evaluation) は、`if`、`multiIf`、`and`、`or` などの特定の関数の複雑な式の実行を最適化する機能です。これにより、これらの関数の実行中に発生する可能性のある例外（たとえば、ゼロ除算）を防ぎます。

`arrayJoin` は常に実行され、短絡関数の評価には対応していません。これは、クエリの分析と実行中に他のすべての関数とは別に処理されるユニークな関数であり、短絡関数の実行と連携しない追加のロジックが必要です。つまるところ、結果の行数は `arrayJoin` の結果に依存し、`arrayJoin` の遅延実行を実装するのは非常に複雑でコストがかかります。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
