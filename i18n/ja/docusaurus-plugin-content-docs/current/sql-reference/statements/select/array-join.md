---
slug: /sql-reference/statements/select/array-join
sidebar_label: ARRAY JOIN
---

# ARRAY JOIN句

配列カラムを含むテーブルにとって一般的な操作は、その初期カラムの各個別の配列要素を含むカラムを持つ新しいテーブルを生成することであり、他のカラムの値は重複します。これが `ARRAY JOIN` 句の基本的な機能です。

その名前は、配列またはネストされたデータ構造との `JOIN` を実行するものと見なすことができることから来ています。意図は、[arrayJoin](../../../sql-reference/functions/array-join.md#functions_arrayjoin) 関数に似ていますが、句の機能はそれよりも広範囲です。

構文:

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

サポートされている `ARRAY JOIN` の型は以下の通りです：

- `ARRAY JOIN` - 基本ケースでは、空の配列は `JOIN` の結果に含まれません。
- `LEFT ARRAY JOIN` - `JOIN` の結果には空の配列を持つ行が含まれます。空の配列の値は、配列要素の型のデフォルト値（通常は0、空文字列またはNULL）に設定されます。

## 基本的な ARRAY JOIN の例 {#basic-array-join-examples}

以下の例では、`ARRAY JOIN` と `LEFT ARRAY JOIN` 句の使用法を示します。まず、[Array](../../../sql-reference/data-types/array.md) 型のカラムを持つテーブルを作成し、値を挿入します：

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

## エイリアスの使用 {#using-aliases}

`ARRAY JOIN` 句で配列にエイリアスを指定できます。この場合、配列アイテムはこのエイリアスでアクセスできますが、配列自体は元の名前でアクセスされます。例：

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

エイリアスを使用すると、外部配列に対して `ARRAY JOIN` を実行できます。例えば：

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

複数の配列を `ARRAY JOIN` 句でカンマ区切りで指定できます。この場合、同時に `JOIN` が行われます（直和であり、直積ではありません）。デフォルトではすべての配列は同じサイズでなければなりません。例：

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

以下の例では、[arrayEnumerate](../../../sql-reference/functions/array-functions.md#array_functions-arrayenumerate) 関数を使用しています：

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

異なるサイズの複数の配列を結合するには、`SETTINGS enable_unaligned_array_join = 1` を使用します。例：

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

## ネストされたデータ構造との ARRAY JOIN {#array-join-with-nested-data-structure}

`ARRAY JOIN` は[ネストされたデータ構造](../../../sql-reference/data-types/nested-data-structures/index.md)でも機能します：

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

`ARRAY JOIN` でネストされたデータ構造の名前を指定する場合、その意味はそれが含むすべての配列要素との `ARRAY JOIN` と同じです。以下に例を示します：

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

ネストされたデータ構造のためにエイリアスを使用することで、`JOIN` 結果または元の配列のいずれかを選択できます。例：

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

[ arrayEnumerate](../../../sql-reference/functions/array-functions.md#array_functions-arrayenumerate) 関数を使用した例：

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

クエリの実行順序は、`ARRAY JOIN` を実行する際に最適化されています。`ARRAY JOIN` は常にクエリ内の[WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) 句の前に指定しなければなりませんが、技術的にはどの順でも実行可能です。ただし、`ARRAY JOIN` の結果がフィルタリングに使用される場合はこの限りではありません。処理順序はクエリオプティマイザによって制御されます。

### 短絡評価に関する非互換性 {#incompatibility-with-short-circuit-function-evaluation}

[短絡評価](../../../operations/settings/overview#short-circuit-function-evaluation)は、`if`、`multiIf`、`and`、および`or`などの特定の関数における複雑な式の実行を最適化する機能です。この機能は、これらの関数の実行中に発生する可能性のある例外（例えばゼロ除算）を防ぎます。

`arrayJoin` は常に実行され、短絡評価には対応していません。これは、クエリ分析と実行中に他のすべての関数から独立して処理される独自の関数であり、短絡評価の実行では機能しない追加のロジックが必要なためです。理由は、結果の行数が `arrayJoin` の結果に依存するためであり、`arrayJoin` の遅延実行を実装するのが非常に複雑でコストがかかるためです。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの時系列データの操作](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
