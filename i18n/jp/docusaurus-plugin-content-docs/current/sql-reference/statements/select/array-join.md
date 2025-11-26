---
description: 'ARRAY JOIN 句に関するドキュメント'
sidebar_label: 'ARRAY JOIN'
slug: /sql-reference/statements/select/array-join
title: 'ARRAY JOIN 句'
doc_type: 'reference'
---



# ARRAY JOIN 句

配列カラムを含むテーブルに対して、元の配列カラムの各要素ごとに 1 行を持つ新しいテーブルを生成し、その他のカラムの値は複製するという操作は一般的です。これは `ARRAY JOIN` 句が行う処理の基本的なケースです。

この名前は、配列やネストされたデータ構造に対して `JOIN` を実行するものとして考えられることに由来します。意図としては [arrayJoin](/sql-reference/functions/array-join) 関数と似ていますが、句としての機能はより汎用的です。

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
* `LEFT ARRAY JOIN` - `JOIN` の結果には、空配列を持つ行も含まれます。空配列に対する値は、その配列要素の型のデフォルト値（通常は 0、空文字列、または NULL）に設定されます。


## 基本的な ARRAY JOIN の例

### ARRAY JOIN と LEFT ARRAY JOIN

以下の例では、`ARRAY JOIN` 句と `LEFT ARRAY JOIN` 句の使用方法を示します。[Array](../../../sql-reference/data-types/array.md) 型のカラムを持つテーブルを作成し、値を挿入します。

```sql
CREATE TABLE arrays_test
(
    s String,
    arr Array(UInt8)
) ENGINE = Memory;

INSERT INTO arrays_test
VALUES ('こんにちは', [1,2]), ('世界', [3,4,5]), ('さようなら', []);
```

```response
┌─s───────────┬─arr─────┐
│ こんにちは  │ [1,2]   │
│ 世界        │ [3,4,5] │
│ さようなら  │ []      │
└─────────────┴─────────┘
```

次の例では、`ARRAY JOIN` 句を使用しています。

```sql
SELECT s, arr
FROM arrays_test
ARRAY JOIN arr;
```

```response
┌─s─────┬─arr─┐
│ こんにちは │   1 │
│ こんにちは │   2 │
│ 世界 │   3 │
│ 世界 │   4 │
│ 世界 │   5 │
└───────┴─────┘
```

以下の例では、`LEFT ARRAY JOIN` 句を使用します。

```sql
SELECT s, arr
FROM arrays_test
LEFT ARRAY JOIN arr;
```

```response
┌─s───────────┬─arr─┐
│ こんにちは    │   1 │
│ こんにちは    │   2 │
│ 世界         │   3 │
│ 世界         │   4 │
│ 世界         │   5 │
│ さようなら    │   0 │
└─────────────┴─────┘
```

### ARRAY JOIN と arrayEnumerate 関数

この関数は通常、`ARRAY JOIN` と組み合わせて使用されます。`ARRAY JOIN` を適用したあと、各配列ごとに一度だけ値をカウントできるようにします。例:

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

この例では、Reaches はコンバージョン数（`ARRAY JOIN` を適用した後に得られる文字列数）、Hits はページビュー数（`ARRAY JOIN` を適用する前の文字列数）を表します。このケースでは、同じ結果をより簡単な方法で得ることができます。

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

### ARRAY JOIN と arrayEnumerateUniq

この関数は、`ARRAY JOIN` を使用して配列要素を集約する場合に役立ちます。

この例では、各 goal ID について、コンバージョン数（ネストされた Goals データ構造内の各要素は達成されたゴールであり、これをコンバージョンと呼びます）とセッション数を計算しています。`ARRAY JOIN` を使わなければ、セッション数は sum(Sign) として数えます。しかしこのケースでは、行がネストされた Goals 構造によって増えているため、その後に各セッションを 1 回だけ数えるには、`arrayEnumerateUniq(Goals.ID)` 関数の値に条件を適用します。

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
┌──ゴールID─┬─到達数─┬─訪問数─┐
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


## エイリアスの使用

`ARRAY JOIN` 句では、配列にエイリアスを指定できます。この場合、配列要素にはそのエイリアスを用いてアクセスできますが、配列自体には元の名前でアクセスします。例：

```sql
SELECT s, arr, a
FROM arrays_test
ARRAY JOIN arr AS a;
```

```response
┌─s─────┬─arr─────┬─a─┐
│ こんにちは │ [1,2]   │ 1 │
│ こんにちは │ [1,2]   │ 2 │
│ 世界 │ [3,4,5] │ 3 │
│ 世界 │ [3,4,5] │ 4 │
│ 世界 │ [3,4,5] │ 5 │
└───────┴─────────┴───┘
```

エイリアスを使用すると、外部配列に対して `ARRAY JOIN` を実行できます。たとえば、次のように記述します。

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

複数の配列を `ARRAY JOIN` 句でカンマ区切りで指定できます。この場合、`JOIN` はそれらに対して同時に実行されます（デカルト積ではなく直和となります）。デフォルトでは、すべての配列は同じサイズである必要がある点に注意してください。例:

```sql
SELECT s, arr, a, num, mapped
FROM arrays_test
ARRAY JOIN arr AS a, arrayEnumerate(arr) AS num, arrayMap(x -> x + 1, arr) AS mapped;
```

```response
┌─s─────┬─arr─────┬─a─┬─num─┬─mapped─┐
│ こんにちは │ [1,2]   │ 1 │   1 │      2 │
│ こんにちは │ [1,2]   │ 2 │   2 │      3 │
│ 世界       │ [3,4,5] │ 3 │   1 │      4 │
│ 世界       │ [3,4,5] │ 4 │   2 │      5 │
│ 世界       │ [3,4,5] │ 5 │   3 │      6 │
└───────┴─────────┴───┴─────┴────────┘
```

次の例では、[arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 関数を使用しています。

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

`SETTINGS enable_unaligned_array_join = 1` を設定すると、サイズの異なる複数の配列を結合できます。例：

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


## ネストされたデータ構造での ARRAY JOIN

`ARRAY JOIN` は [ネストされたデータ構造](../../../sql-reference/data-types/nested-data-structures/index.md) に対しても使用できます。

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
│ こんにちは   │ [1,2]   │ [10,20]    │
│ 世界       │ [3,4,5] │ [30,40,50] │
│ さようなら │ []      │ []         │
└─────────┴─────────┴────────────┘
```

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN nest;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ こんにちは │      1 │     10 │
│ こんにちは │      2 │     20 │
│ 世界 │      3 │     30 │
│ 世界 │      4 │     40 │
│ 世界 │      5 │     50 │
└───────┴────────┴────────┘
```

`ARRAY JOIN` でネストされたデータ構造の名前を指定する場合、その意味は、そのデータ構造を構成するすべての配列要素に対して `ARRAY JOIN` を適用する場合と同じになります。例を以下に示します。

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN `nest.x`, `nest.y`;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ こんにちは │      1 │     10 │
│ こんにちは │      2 │     20 │
│ 世界 │      3 │     30 │
│ 世界 │      4 │     40 │
│ 世界 │      5 │     50 │
└───────┴────────┴────────┘
```

このバリエーションも妥当です。

```sql
SELECT s、`nest.x`、`nest.y`
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

ネストされたデータ構造に対してエイリアスを使用することで、`JOIN` の結果か元の配列かを選択できます。例:

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

[arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 関数の使用例：

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

`ARRAY JOIN` を実行する際、クエリの実行順序は最適化されます。クエリ内では `ARRAY JOIN` は常に [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) 句より前に指定する必要がありますが、技術的には、`ARRAY JOIN` の結果がフィルタリングに使用されない限り、どの順序で実行されても問題ありません。処理順序はクエリオプティマイザによって制御されます。

### ショートサーキット関数評価との非互換性 {#incompatibility-with-short-circuit-function-evaluation}

[ショートサーキット関数評価](/operations/settings/settings#short_circuit_function_evaluation) は、`if`、`multiIf`、`and`、`or` などの特定の関数において、複雑な式の実行を最適化するための機能です。これにより、ゼロ除算のような、これらの関数の実行中に発生しうる例外を防止します。

`arrayJoin` は常に実行され、ショートサーキット関数評価をサポートしません。これは、クエリ解析および実行時に他のすべての関数とは別に処理される特殊な関数であり、ショートサーキット関数実行とは両立しない追加のロジックを必要とするためです。その理由は、結果の行数が `arrayJoin` の結果に依存しており、`arrayJoin` の遅延実行を実装するのはあまりに複雑かつ高コストであるためです。



## 関連コンテンツ {#related-content}

- ブログ記事: [ClickHouse における時系列データの扱い方](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
