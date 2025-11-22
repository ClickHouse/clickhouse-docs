---
description: 'ARRAY JOIN 句に関するドキュメント'
sidebar_label: 'ARRAY JOIN'
slug: /sql-reference/statements/select/array-join
title: 'ARRAY JOIN 句'
doc_type: 'reference'
---



# ARRAY JOIN 句

配列カラムを含むテーブルに対して、元のカラム内の各配列要素ごとに 1 行を持つ新しいテーブルを生成し、他のカラムの値は複製するという操作はよく行われます。これは、`ARRAY JOIN` 句が行う最も基本的なケースです。

この名前は、配列またはネストしたデータ構造に対して `JOIN` を実行しているものとみなせることに由来します。意図としては [arrayJoin](/sql-reference/functions/array-join) 関数と似ていますが、句としての機能はそれよりも広範です。

構文:

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

`ARRAY JOIN` のサポートされている種類は次のとおりです。

* `ARRAY JOIN` - 通常、空配列は `JOIN` の結果に含まれません。
* `LEFT ARRAY JOIN` - `JOIN` の結果には、空配列を持つ行も含まれます。空配列に対する値は、その配列要素型のデフォルト値（通常は 0、空文字列、または NULL）に設定されます。


## 基本的なARRAY JOINの例 {#basic-array-join-examples}

### ARRAY JOINとLEFT ARRAY JOIN {#array-join-left-array-join-examples}

以下の例では、`ARRAY JOIN`句と`LEFT ARRAY JOIN`句の使用方法を示します。[Array](../../../sql-reference/data-types/array.md)型の列を持つテーブルを作成し、値を挿入してみましょう:

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

以下の例では`ARRAY JOIN`句を使用します:

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

次の例では`LEFT ARRAY JOIN`句を使用します:

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

### ARRAY JOINとarrayEnumerate関数 {#array-join-arrayEnumerate}

この関数は通常`ARRAY JOIN`と共に使用されます。`ARRAY JOIN`を適用した後、各配列に対して要素を一度だけカウントすることができます。例:

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

この例では、Reachesはコンバージョン数(`ARRAY JOIN`を適用した後に得られた行数)であり、Hitsはページビュー数(`ARRAY JOIN`前の行数)です。この特定のケースでは、より簡単な方法で同じ結果を得ることができます:

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

### ARRAY JOINとarrayEnumerateUniq {#array_join_arrayEnumerateUniq}

この関数は、`ARRAY JOIN`を使用して配列要素を集計する際に便利です。

この例では、各ゴールIDに対してコンバージョン数(Goalsネスト構造の各要素は達成されたゴールであり、これをコンバージョンと呼びます)とセッション数が計算されます。`ARRAY JOIN`を使用しない場合、セッション数はsum(Sign)としてカウントされます。しかし、この特定のケースでは、行がネストされたGoals構造によって展開されるため、各セッションを一度だけカウントするために、`arrayEnumerateUniq(Goals.ID)`関数の値に条件を適用します。

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

`ARRAY JOIN`句では、配列に対してエイリアスを指定できます。この場合、配列の要素はこのエイリアスでアクセスできますが、配列自体は元の名前でアクセスされます。例:

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

エイリアスを使用することで、外部配列に対して`ARRAY JOIN`を実行できます。例:

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

`ARRAY JOIN`句では、複数の配列をカンマで区切って指定できます。この場合、`JOIN`はそれらに対して同時に実行されます(直和であり、直積ではありません)。デフォルトでは、すべての配列が同じサイズである必要があることに注意してください。例:

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

以下の例では、[arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate)関数を使用しています:

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

異なるサイズの複数の配列は、`SETTINGS enable_unaligned_array_join = 1`を使用することで結合できます。例:

```sql
SELECT s, arr, a, b
FROM arrays_test ARRAY JOIN arr AS a, [['a','b'],['c']] AS b
SETTINGS enable_unaligned_array_join = 1;
```


```response
┌─s───────┬─arr─────┬─a─┬─b─────────┐
│ こんにちは   │ [1,2]   │ 1 │ ['a','b'] │
│ こんにちは   │ [1,2]   │ 2 │ ['c']     │
│ 世界   │ [3,4,5] │ 3 │ ['a','b'] │
│ 世界   │ [3,4,5] │ 4 │ ['c']     │
│ 世界   │ [3,4,5] │ 5 │ []        │
│ さようなら │ []      │ 0 │ ['a','b'] │
│ さようなら │ []      │ 0 │ ['c']     │
└─────────┴─────────┴───┴───────────┘
```


## ネストされたデータ構造でのARRAY JOIN {#array-join-with-nested-data-structure}

`ARRAY JOIN`は[ネストされたデータ構造](../../../sql-reference/data-types/nested-data-structures/index.md)でも使用できます:

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

`ARRAY JOIN`でネストされたデータ構造の名前を指定した場合、それを構成するすべての配列要素に対して`ARRAY JOIN`を実行した場合と同じ意味になります。以下に例を示します:

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

次のような記述も可能です:

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

ネストされたデータ構造に対してエイリアスを使用することで、`JOIN`結果または元の配列のいずれかを選択できます。例:

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

[arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate)関数を使用した例:

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

`ARRAY JOIN`の実行時、クエリの実行順序は最適化されます。クエリ内では`ARRAY JOIN`は常に[WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md)句の前に指定する必要がありますが、`ARRAY JOIN`の結果がフィルタリングに使用されない限り、技術的には任意の順序で実行可能です。処理順序はクエリオプティマイザによって制御されます。

### 短絡評価との非互換性 {#incompatibility-with-short-circuit-function-evaluation}

[短絡評価](/operations/settings/settings#short_circuit_function_evaluation)は、`if`、`multiIf`、`and`、`or`などの特定の関数における複雑な式の実行を最適化する機能です。この機能により、これらの関数の実行中にゼロ除算などの潜在的な例外の発生を防ぎます。

`arrayJoin`は常に実行され、短絡評価には対応していません。これは、クエリの解析と実行時に他のすべての関数とは別に処理される特殊な関数であり、短絡評価では機能しない追加のロジックが必要なためです。結果の行数が`arrayJoin`の結果に依存しており、`arrayJoin`の遅延実行を実装するには複雑でコストがかかりすぎることが理由です。


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
