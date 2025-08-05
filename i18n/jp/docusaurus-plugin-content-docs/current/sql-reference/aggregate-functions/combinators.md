---
description: 'Documentation for Aggregate Function Combinators'
sidebar_label: 'Combinators'
sidebar_position: 37
slug: '/sql-reference/aggregate-functions/combinators'
title: 'Aggregate Function Combinators'
---




# 集約関数コンビネータ

集約関数の名前には、サフィックスを追加することができます。これにより、集約関数の動作が変更されます。

## -If {#-if}

サフィックス -If は、任意の集約関数の名前に追加できます。この場合、集約関数は追加の引数—条件（Uint8型）—を受け入れます。集約関数は、条件をトリガーする行のみを処理します。条件が一度もトリガーされなかった場合、デフォルト値（通常はゼロまたは空の文字列）が返されます。

例: `sumIf(column, cond)`、`countIf(cond)`、`avgIf(x, cond)`、`quantilesTimingIf(level1, level2)(x, cond)`、`argMinIf(arg, val, cond)`など。

条件付き集約関数を使用すると、サブクエリや `JOIN` を使わずに、複数の条件に対する集約を同時に計算できます。例えば、条件付き集約関数を使用してセグメント比較機能を実装することができます。

## -Array {#-array}

-Array サフィックスは、任意の集約関数に追加できます。この場合、集約関数は 'T' 型引数の代わりに 'Array(T)' 型（配列）の引数を受け取ります。集約関数が複数の引数を受け入れる場合、それは等しい長さの配列でなければなりません。配列を処理する際、集約関数はすべての配列要素に対して元の集約関数のように動作します。

例 1: `sumArray(arr)` - すべての 'arr' 配列のすべての要素を合計します。この場合、次のようにより単純に書くことができます: `sum(arraySum(arr))`。

例 2: `uniqArray(arr)` – すべての 'arr' 配列のユニークな要素の数をカウントします。これは次のように簡単に行うことができます: `uniq(arrayJoin(arr))`、ただし、常に 'arrayJoin' をクエリに追加できるわけではありません。

-If と -Array を組み合わせることができます。しかし、'Array' が先に来て、その後に 'If' が来なければなりません。例: `uniqArrayIf(arr, cond)`、`quantilesTimingArrayIf(level1, level2)(arr, cond)`。この順序により、'cond' 引数は配列になりません。

## -Map {#-map}

-Map サフィックスは、任意の集約関数に追加できます。これにより、Map型を引数として受け取り、指定された集約関数を使用してマップの各キーの値を別々に集約する集約関数が作成されます。結果も Map 型になります。

**例**

```sql
CREATE TABLE map_map(
    date Date,
    timeslot DateTime,
    status Map(String, UInt64)
) ENGINE = Log;

INSERT INTO map_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', (['a', 'b', 'c'], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:00:00', (['c', 'd', 'e'], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', (['d', 'e', 'f'], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', (['f', 'g', 'g'], [10, 10, 10]));

SELECT
    timeslot,
    sumMap(status),
    avgMap(status),
    minMap(status)
FROM map_map
GROUP BY timeslot;

┌────────────timeslot─┬─sumMap(status)───────────────────────┬─avgMap(status)───────────────────────┬─minMap(status)───────────────────────┐
│ 2000-01-01 00:00:00 │ {'a':10,'b':10,'c':20,'d':10,'e':10} │ {'a':10,'b':10,'c':10,'d':10,'e':10} │ {'a':10,'b':10,'c':10,'d':10,'e':10} │
│ 2000-01-01 00:01:00 │ {'d':10,'e':10,'f':20,'g':20}        │ {'d':10,'e':10,'f':10,'g':10}        │ {'d':10,'e':10,'f':10,'g':10}        │
└─────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┘
```

## -SimpleState {#-simplestate}

このコンビネータを適用すると、集約関数は同じ値を返しますが、別の型で返されます。これは [SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md) であり、 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルで作業するためにテーブルに格納できます。

**構文**

```sql
<aggFunction>SimpleState(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**返される値**

`SimpleAggregateFunction(...)` 型の集約関数の値。

**例**

クエリ:

```sql
WITH anySimpleState(number) AS c SELECT toTypeName(c), c FROM numbers(1);
```

結果:

```text
┌─toTypeName(c)────────────────────────┬─c─┐
│ SimpleAggregateFunction(any, UInt64) │ 0 │
└──────────────────────────────────────┴───┘
```

## -State {#-state}

このコンビネータを適用すると、集約関数は結果の値（[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数のユニークな値の数など）を返すのではなく、集約の中間状態を返します（`uniq` の場合、これはユニークな値の数を計算するためのハッシュテーブルです）。これは、さらなる処理に使用することができる `AggregateFunction(...)` であり、後で集約を完了するためにテーブルに格納できます。

:::note
注意してください。-MapState は、データの中間状態の順序が変わる可能性があるため、同じデータに対する不変ではありませんが、このデータの取り込みには影響を与えません。
:::

これらの状態を操作するには、次を使用します:

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルエンジン。
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeaggregation) 関数。
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningaccumulate) 関数。
- [-Merge](#-merge) コンビネータ。
- [-MergeState](#-mergestate) コンビネータ。

## -Merge {#-merge}

このコンビネータを適用すると、集約関数は中間集約状態を引数として受け取り、その状態を結合して集約を完了し、結果の値を返します。

## -MergeState {#-mergestate}

中間集約状態を同じ方法で結合します- -Mergeコンビネータと。同様に、結果の値を返さず、中間集約状態を返します。これは、-State コンビネータのようなものです。

## -ForEach {#-foreach}

テーブルの集約関数を配列の集約関数に変換し、対応する配列アイテムを集約して結果の配列を返します。例えば、`sumForEach`は、配列 `[1, 2]`、`[3, 4, 5]` および `[6, 7]` に対して、対応する配列アイテムを合算して`[10, 13, 5]`の結果を返します。

## -Distinct {#-distinct}

すべてのユニークな引数の組み合わせは、一度だけ集約されます。繰り返しの値は無視されます。
例: `sum(DISTINCT x)`（または `sumDistinct(x)`）、`groupArray(DISTINCT x)`（または `groupArrayDistinct(x)`）、`corrStable(DISTINCT x, y)`（または `corrStableDistinct(x, y)`）など。

## -OrDefault {#-ordefault}

集約関数の動作を変更します。

集約関数に入力値がない場合、このコンビネータを使用すると、戻りデータ型のデフォルト値を返します。これは、空の入力データを受け入れられる集約関数に適用されます。

`-OrDefault` は他のコンビネータと一緒に使用できます。

**構文**

```sql
<aggFunction>OrDefault(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**返される値**

集約するものがない場合、集約関数の戻り型のデフォルト値を返します。

型は使用される集約関数に依存します。

**例**

クエリ:

```sql
SELECT avg(number), avgOrDefault(number) FROM numbers(0)
```

結果:

```text
┌─avg(number)─┬─avgOrDefault(number)─┐
│         nan │                    0 │
└─────────────┴──────────────────────┘
```

また、`-OrDefault` は他のコンビネータと一緒に使用できます。これは、集約関数が空の入力を受け入れない場合に便利です。

クエリ:

```sql
SELECT avgOrDefaultIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

結果:

```text
┌─avgOrDefaultIf(x, greater(x, 10))─┐
│                              0.00 │
└───────────────────────────────────┘
```

## -OrNull {#-ornull}

集約関数の動作を変更します。

このコンビネータは、集約関数の結果を [Nullable](../../sql-reference/data-types/nullable.md) データ型に変換します。集約関数が計算するための値がない場合、[NULL](/operations/settings/formats#input_format_null_as_default) を返します。

`-OrNull`は他のコンビネータと一緒に使用できます。

**構文**

```sql
<aggFunction>OrNull(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**返される値**

- 集約関数の結果で、`Nullable` データ型に変換されたもの。
- 集約するものがない場合は `NULL`。

型: `Nullable(集約関数の戻り型)`。

**例**

集約関数の末尾に `-orNull` を追加します。

クエリ:

```sql
SELECT sumOrNull(number), toTypeName(sumOrNull(number)) FROM numbers(10) WHERE number > 10
```

結果:

```text
┌─sumOrNull(number)─┬─toTypeName(sumOrNull(number))─┐
│              ᴺᵁᴸᴸ │ Nullable(UInt64)              │
└───────────────────┴───────────────────────────────┘
```

また、`-OrNull`は他のコンビネータと一緒に使用できます。これは、集約関数が空の入力を受け入れない場合に便利です。

クエリ:

```sql
SELECT avgOrNullIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

結果:

```text
┌─avgOrNullIf(x, greater(x, 10))─┐
│                           ᴺᵁᴸᴸ │
└────────────────────────────────┘
```

## -Resample {#-resample}

データをグループに分け、そのグループ内のデータを別々に集約します。グループは、1つのカラムからの値を間隔で分割することで作成されます。

```sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**引数**

- `start` — `resampling_key`の値に対する全体の必須間隔の開始値。
- `stop` — `resampling_key`の値に対する全体の必須間隔の終了値。全体の間隔には `stop` 値は含まれません `[start, stop)`。
- `step` — 全体の間隔をサブ間隔に分割するためのステップ。`aggFunction`は、これらのサブ間隔ごとに独立して実行されます。
- `resampling_key` — データを間隔に分けるための値が使用されるカラム。
- `aggFunction_params` — `aggFunction` のパラメータ。

**返される値**

- 各サブ間隔に対する `aggFunction` の結果の配列。

**例**

次のデータを持つ `people` テーブルを考えます：

```text
┌─name───┬─age─┬─wage─┐
│ John   │  16 │   10 │
│ Alice  │  30 │   15 │
│ Mary   │  35 │    8 │
│ Evelyn │  48 │ 11.5 │
│ David  │  62 │  9.9 │
│ Brian  │  60 │   16 │
└────────┴─────┴──────┘
```

年齢が `[30,60)` および `[60,75)` の範囲にある人の名前を取得しましょう。整数で年齢を表現するため、`[30, 59]` および `[60,74]` の範囲の年齢が得られます。

名前を配列に集約するには、[groupArray](/sql-reference/aggregate-functions/reference/grouparray) 集約関数を使用します。これは、一つの引数を取ります。私たちのケースでは、`name` カラムです。`groupArrayResample` 関数は、年齢によって名前を集約するために、`age` カラムを使用する必要があります。必要な間隔を定義するために、`30, 75, 30` の引数を `groupArrayResample` 関数に渡します。

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

```text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

結果を考えてみましょう。

`John` は年齢が若すぎるため、サンプルには含まれません。他の人は指定された年齢の範囲に応じて分配されています。

次に、指定された年齢の範囲内の人々の総数とその平均賃金を数えます。

```sql
SELECT
    countResample(30, 75, 30)(name, age) AS amount,
    avgResample(30, 75, 30)(wage, age) AS avg_wage
FROM people
```

```text
┌─amount─┬─avg_wage──────────────────┐
│ [3,2]  │ [11.5,12.949999809265137] │
└────────┴───────────────────────────┘
```

## -ArgMin {#-argmin}

サフィックス -ArgMin は、任意の集約関数の名前に追加できます。この場合、集約関数は追加の引数を受け入れなければなりません。これは任意の比較可能な式である必要があります。集約関数は、指定された追加の式に対して最小値を持つ行のみを処理します。

例: `sumArgMin(column, expr)`、`countArgMin(expr)`、`avgArgMin(x, expr)` など。

## -ArgMax {#-argmax}

サフィックス -ArgMin に類似していますが、指定された追加の式に対して最大値を持つ行のみを処理します。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約コンビネータの使用法](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
