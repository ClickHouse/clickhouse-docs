---
description: 'Documentation for ARRAY JOIN Clause'
sidebar_label: 'ARRAY JOIN'
slug: '/sql-reference/statements/select/array-join'
title: 'ARRAY JOIN Clause'
---




# ARRAY JOIN句

配列カラムを含むテーブルに対して一般的な操作は、新しいテーブルを生成し、そのテーブルには最初のカラムの各個別の配列要素ごとに行があり、他のカラムの値は重複します。これが`ARRAY JOIN`句の基本的な動作です。

その名前は、配列またはネストされたデータ構造に対して`JOIN`を実行することとして見ることができることから来ています。意図は[ arrayJoin ](/sql-reference/functions/array-join)関数に似ていますが、句の機能はより広範です。

構文:

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

サポートされている`ARRAY JOIN`のタイプは以下の通りです。

- `ARRAY JOIN` - 基本ケースでは、空の配列は`JOIN`の結果に含まれません。
- `LEFT ARRAY JOIN` - `JOIN`の結果には空の配列を持つ行が含まれます。空の配列の値は、配列要素の型のデフォルト値（通常は0、空文字列、またはNULL）に設定されます。

## 基本ARRAY JOINの例 {#basic-array-join-examples}

### ARRAY JOINおよびLEFT ARRAY JOIN {#array-join-left-array-join-examples}

以下の例は、`ARRAY JOIN`および`LEFT ARRAY JOIN`句の使用法を示しています。[Array](../../../sql-reference/data-types/array.md)型カラムを持つテーブルを作成し、値を挿入しましょう:

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

以下の例は、`ARRAY JOIN`句を使用しています:

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

次の例は、`LEFT ARRAY JOIN`句を使用しています:

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

### ARRAY JOINおよびarrayEnumerate関数 {#array-join-arrayEnumerate}

この関数は通常`ARRAY JOIN`とともに使用されます。`ARRAY JOIN`を適用した後、各配列の数を一度だけカウントすることを可能にします。例:

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

この例では、Reachesはコンバージョンの数（`ARRAY JOIN`が適用された後に受信された文字列）、Hitsはページビューの数（`ARRAY JOIN`の前の文字列）です。この特定のケースでは、より簡単な方法で同じ結果を得ることができます:

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

### ARRAY JOINおよびarrayEnumerateUniq {#array_join_arrayEnumerateUniq}

この関数は、`ARRAY JOIN`を使用して配列要素を集約する際に役立ちます。

この例では、各目標IDごとのコンバージョンの数（Goalsのネストデータ構造内の各要素は到達された目標であり、これをコンバージョンと呼びます）とセッションの数を計算しています。`ARRAY JOIN`なしでは、セッションの数はsum(Sign)としてカウントされます。しかし、この特定のケースでは、行がネストされたGoals構造によって乗算されているため、これを行った後に各セッションを一度だけカウントするために、`arrayEnumerateUniq(Goals.ID)`関数の値に条件を適用します。

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

`ARRAY JOIN`句で配列のエイリアスを指定することができます。この場合、配列アイテムにはこのエイリアスを介してアクセスできますが、配列自体は元の名前でアクセスされます。例:

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

エイリアスを使用すると、外部配列との`ARRAY JOIN`を行うことができます。例えば:

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

`ARRAY JOIN`句では、複数の配列をカンマで区切って指定できます。この場合、同時に`JOIN`が行われます（直接的な和であり、直積ではありません）。デフォルトでは、すべての配列は同じサイズである必要があります。例:

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

以下の例では、[arrayEnumerate](/sql-reference/functions/array-functions#arrayenumeratearr)関数を使用しています:

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

異なるサイズの複数の配列を結合するには、`SETTINGS enable_unaligned_array_join = 1`を使用します。例:

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

## ネストデータ構造を持つARRAY JOIN {#array-join-with-nested-data-structure}

`ARRAY JOIN`は、[ネストされたデータ構造](../../../sql-reference/data-types/nested-data-structures/index.md)でも機能します:

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

`ARRAY JOIN`でネストデータ構造の名前を指定する際、その意味はそれが構成するすべての配列要素を持つ`ARRAY JOIN`と同じです。以下の例が挙げられます:

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

このバリエーションも意味があります:

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

ネストデータ構造にエイリアスを使用することで、`JOIN`の結果または元の配列のいずれかを選択できます。例:

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

[ arrayEnumerate ](/sql-reference/functions/array-functions#arrayenumeratearr)関数を使用した例:

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

クエリの実行順序は、`ARRAY JOIN`を実行する際に最適化されます。`ARRAY JOIN`は常に[WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md)句の前に指定しなければなりませんが、技術的には`ARRAY JOIN`の結果がフィルタリングに使用されない限り、どの順序でも実行できます。処理の順序はクエリオプティマイザによって制御されます。

### 短絡評価との互換性の無さ {#incompatibility-with-short-circuit-function-evaluation}

[短絡関数評価](/operations/settings/settings#short_circuit_function_evaluation)は、`if`、`multiIf`、`and`、`or`などの特定の関数における複雑な式の実行を最適化する機能です。これは、これらの関数の実行中にゼロ除算などの潜在的な例外が発生するのを防ぎます。

`arrayJoin`は常に実行され、短絡関数評価に対応していません。これは、クエリの解析と実行中にすべての他の関数とは別に処理される特異な関数であり、短絡関数実行に対して機能する追加のロジックを必要とするためです。理由は、結果の行数がarrayJoinの結果に依存し、`arrayJoin`を遅延実行することは非常に複雑でコストがかかるからです。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
