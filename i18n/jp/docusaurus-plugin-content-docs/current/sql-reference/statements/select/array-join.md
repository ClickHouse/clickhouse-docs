---
slug: '/sql-reference/statements/select/array-join'
sidebar_label: 'ARRAY JOIN'
---


# ARRAY JOIN 句

配列カラムを含むテーブルにとって一般的な操作は、その初期カラムの各個々の配列要素を持つカラムを持つ新しいテーブルを生成し、他のカラムの値は複製されることです。これが `ARRAY JOIN` 句の基本的なケースです。

その名前は、配列やネストされたデータ構造との `JOIN` を実行するものとして見ることができるという事実から来ています。意図は [arrayJoin](/sql-reference/functions/array-join) 関数に似ていますが、この句の機能はより広範です。

構文:

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

サポートされている `ARRAY JOIN` のタイプは以下の通りです：

- `ARRAY JOIN` - 基本ケースでは、空の配列は `JOIN` の結果には含まれません。
- `LEFT ARRAY JOIN` - `JOIN` の結果には空の配列を持つ行が含まれます。空の配列の場合、その値は配列要素タイプのデフォルト値（通常は0、空文字列またはNULL）に設定されます。

## 基本的な ARRAY JOIN の例 {#basic-array-join-examples}

以下の例は、`ARRAY JOIN` および `LEFT ARRAY JOIN` 句の使用法を示しています。[Array](../../../sql-reference/data-types/array.md) タイプのカラムを持つテーブルを作成し、値を挿入します：

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

以下の例では、`ARRAY JOIN` 句を使用します：

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

次の例では、`LEFT ARRAY JOIN` 句を使用します：

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

`ARRAY JOIN` 句では、配列にエイリアスを指定できます。この場合、配列要素にはこのエイリアスを使用してアクセスできますが、配列自体には元の名前でアクセスします。例：

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

エイリアスを使用することで、外部配列で `ARRAY JOIN` を実行できます。例えば：

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

`ARRAY JOIN` 句では、複数の配列をカンマで区切ることができます。この場合、同時に `JOIN` が実行されます（直和ではなく、デカルト積ではない）。すべての配列はデフォルトで同じサイズである必要があります。例：

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

以下の例では、[arrayEnumerate](/sql-reference/functions/array-functions#arrayenumeratearr) 関数を使用します：

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

異なるサイズの複数の配列を結合するには、以下のようにします： `SETTINGS enable_unaligned_array_join = 1`。例：

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

`ARRAY JOIN` は [ネストされたデータ構造](../../../sql-reference/data-types/nested-data-structures/index.md) にも対応しています：

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

ネストされたデータ構造の名前を `ARRAY JOIN` で指定する場合の意味は、構成するすべての配列要素を持つ `ARRAY JOIN` と同じです。以下の例を参照してください：

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

ネストされたデータ構造にエイリアスを使用して、`JOIN` 結果またはソース配列のいずれかを選択できます。例：

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

[ARRAY JOIN](/sql-reference/functions/array-functions#arrayenumeratearr) 関数の使用例：

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

`ARRAY JOIN` の実行順序は最適化されています。`ARRAY JOIN` は常にクエリ内の [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) 句の前に指定する必要がありますが、技術的には、`ARRAY JOIN` の結果がフィルタリングに使用されない限り、任意の順序で実行できます。処理順序は、クエリオプティマイザによって制御されます。

### 短絡条件の関数評価との互換性の欠如 {#incompatibility-with-short-circuit-function-evaluation}

[短絡条件の関数評価](/operations/settings/settings#short_circuit_function_evaluation)は、`if`、`multiIf`、`and`、および`or`の特定の関数における複雑な式の実行を最適化する機能です。これにより、ゼロ除算のような潜在的な例外が、これらの関数の実行中に発生するのを防ぎます。

`arrayJoin` は常に実行され、短絡条件の関数評価にはサポートされていません。これは、`arrayJoin` がクエリ分析と実行中に他のすべての関数とは別に処理され、短絡条件の関数実行で機能しない追加のロジックが必要であるためです。その理由は、結果の行数が `arrayJoin` の結果に依存し、それを遅延実行するのは実装が複雑でコストがかかりすぎるからです。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
