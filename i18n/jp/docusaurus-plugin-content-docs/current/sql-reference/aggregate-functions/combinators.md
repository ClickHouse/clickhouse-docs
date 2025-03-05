---
slug: /sql-reference/aggregate-functions/combinators
sidebar_position: 37
sidebar_label: コンビネーター
---


# 集約関数コンビネーター

集約関数の名前にはサフィックスを追加できます。これにより、集約関数の動作が変わります。

## -If {#-if}

サフィックス -If は、任意の集約関数の名前に追加できます。この場合、集約関数は追加の引数—条件（Uint8 型）を受け取ります。集約関数は、条件が発動した行のみを処理します。条件が一度も発動しなかった場合、デフォルト値（通常はゼロまたは空の文字列）を返します。

例: `sumIf(column, cond)`, `countIf(cond)`, `avgIf(x, cond)`, `quantilesTimingIf(level1, level2)(x, cond)`, `argMinIf(arg, val, cond)` など。

条件付き集約関数を使用すると、サブクエリや `JOIN` を使用することなく、複数の条件に対して同時に集約を計算できます。たとえば、条件付き集約関数はセグメント比較機能を実装するために使用できます。

## -Array {#-array}

-Array サフィックスは任意の集約関数に追加できます。この場合、集約関数は 'T' 型の引数の代わりに 'Array(T)' 型（配列）の引数を取ります。集約関数が複数の引数を受け取る場合、これらは等しい長さの配列でなければなりません。配列を処理する際、集約関数は元の集約関数のすべての配列要素に対して機能します。

例1: `sumArray(arr)` - すべての 'arr' 配列の要素を合計します。この例は、よりシンプルに書くことができます: `sum(arraySum(arr))`。

例2: `uniqArray(arr)` – すべての 'arr' 配列におけるユニークな要素の数をカウントします。これは、`uniq(arrayJoin(arr))` のようにより簡単な方法でも行えますが、クエリに 'arrayJoin' を追加することが常に可能であるわけではありません。

-If と -Array は組み合わせることができます。ただし、'Array' が最初に来て、その後に 'If' が来る必要があります。例: `uniqArrayIf(arr, cond)`, `quantilesTimingArrayIf(level1, level2)(arr, cond)`。この順序により、'cond' 引数は配列ではなくなります。

## -Map {#-map}

-Map サフィックスは任意の集約関数に追加できます。これにより、Map 型を引数に取り、マップの各キーの値を指定された集約関数を使用して個別に集約する集約関数が作成されます。結果も Map 型になります。

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

このコンビネーターを適用すると、集約関数は同じ値を返しますが異なる型になります。これは、[SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md) で、[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルと連携して作業するためにテーブルに保存できます。

**構文**

``` sql
<aggFunction>SimpleState(x)
```

**引数**

- `x` — 集約関数のパラメーター。

**返される値**

`SimpleAggregateFunction(...)` 型の集約関数の値。

**例**

クエリ:

``` sql
WITH anySimpleState(number) AS c SELECT toTypeName(c), c FROM numbers(1);
```

結果:

``` text
┌─toTypeName(c)────────────────────────┬─c─┐
│ SimpleAggregateFunction(any, UInt64) │ 0 │
└──────────────────────────────────────┴───┘
```

## -State {#-state}

このコンビネーターを適用すると、集約関数は結果の値（[uniq](../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq) 関数のユニークな値の数など）を返さず、集約の中間状態を返します（`uniq` にとってこれはユニークな値を計算するためのハッシュテーブルです）。これは、さらに処理するために使用できる `AggregateFunction(...)` であり、後で集約を完了させるためにテーブルに保存されることがあります。

:::note
注意: -MapState は、初期状態のデータの順序が変わるため、同じデータに対して不変ではありませんが、データの取り込みには影響しません。
:::

これらの状態を扱うには、次のものを使用します。

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルエンジン。
- [finalizeAggregation](../../sql-reference/functions/other-functions.md#function-finalizeaggregation) 関数。
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningaccumulate) 関数。
- [-Merge](#-merge) コンビネーター。
- [-MergeState](#-mergestate) コンビネーター。

## -Merge {#-merge}

このコンビネーターを適用すると、集約関数は中間の集約状態を引数として取り、状態を結合して集約を完了し、結果の値を返します。

## -MergeState {#-mergestate}

中間集約状態を -Merge コンビネーターと同様にマージします。ただし、結果の値は返さず、-State コンビネーターに類似した中間集約状態を返します。

## -ForEach {#-foreach}

テーブル用集約関数を配列用集約関数に変換し、対応する配列アイテムを集約し、結果の配列を返します。たとえば、`sumForEach` は配列 `[1, 2]`, `[3, 4, 5]` と `[6, 7]` に対して対応する配列アイテムを加算した後、結果 `[10, 13, 5]` を返します。

## -Distinct {#-distinct}

引数のすべてのユニークな組み合わせは一度だけ集約されます。繰り返しの値は無視されます。
例: `sum(DISTINCT x)`（または `sumDistinct(x)`）、`groupArray(DISTINCT x)`（または `groupArrayDistinct(x)`）、`corrStable(DISTINCT x, y)`（または `corrStableDistinct(x, y)`）など。

## -OrDefault {#-ordefault}

集約関数の動作を変更します。

集約関数に入力値がない場合、このコンビネーターを使用すると、戻り値のデフォルト値が返されます。空の入力データを受け取ることができる集約関数に適用されます。

`-OrDefault` は他のコンビネーターと一緒に使用できます。

**構文**

``` sql
<aggFunction>OrDefault(x)
```

**引数**

- `x` — 集約関数のパラメーター。

**返される値**

集約すべきものがない場合、集約関数の戻り型のデフォルト値を返します。

型は使用する集約関数によります。

**例**

クエリ:

``` sql
SELECT avg(number), avgOrDefault(number) FROM numbers(0)
```

結果:

``` text
┌─avg(number)─┬─avgOrDefault(number)─┐
│         nan │                    0 │
└─────────────┴──────────────────────┘
```

また、`-OrDefault` は他のコンビネーターと一緒に使用できます。集約関数が空の入力を受け取らない場合に便利です。

クエリ:

``` sql
SELECT avgOrDefaultIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

結果:

``` text
┌─avgOrDefaultIf(x, greater(x, 10))─┐
│                              0.00 │
└───────────────────────────────────┘
```

## -OrNull {#-ornull}

集約関数の動作を変更します。

このコンビネーターは、集約関数の結果を [Nullable](../../sql-reference/data-types/nullable.md) データ型に変換します。集約関数に計算する値がない場合は、[NULL](/operations/settings/formats#input_format_null_as_default) を返します。

`-OrNull` は他のコンビネーターと一緒に使用できます。

**構文**

``` sql
<aggFunction>OrNull(x)
```

**引数**

- `x` — 集約関数のパラメーター。

**返される値**

- 集約関数の結果を `Nullable` データ型に変換したもの。
- 集約すべきものがない場合は `NULL`。

型: `Nullable(集約関数の戻り型)`。

**例**

集約関数の最後に `-orNull` を追加します。

クエリ:

``` sql
SELECT sumOrNull(number), toTypeName(sumOrNull(number)) FROM numbers(10) WHERE number > 10
```

結果:

``` text
┌─sumOrNull(number)─┬─toTypeName(sumOrNull(number))─┐
│              ᴺᵁᴸᴸ │ Nullable(UInt64)              │
└───────────────────┴───────────────────────────────┘
```

また、`-OrNull` は他のコンビネーターと一緒に使用できます。集約関数が空の入力を受け取らない場合に便利です。

クエリ:

``` sql
SELECT avgOrNullIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

結果:

``` text
┌─avgOrNullIf(x, greater(x, 10))─┐
│                           ᴺᵁᴸᴸ │
└────────────────────────────────┘
```

## -Resample {#-resample}

データをグループに分け、そのグループ内のデータを別々に集約することを可能にします。グループは、1つのカラムの値をインターバルに分割して作成されます。

``` sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**引数**

- `start` — `resampling_key` の値に対する全体の必要なインターバルの開始値。
- `stop` — `resampling_key` の値に対する全体の必要なインターバルの終了値。全体のインターバルには `stop` 値は含まれません `[start, stop)`。
- `step` — 全体のインターバルをサブインターバルに分割するためのステップ。各サブインターバルに対して独立して `aggFunction` が実行されます。
- `resampling_key` — データをインターバルに分けるために使用されるカラム。
- `aggFunction_params` — `aggFunction` のパラメーター。

**返される値**

各サブインターバルに対する `aggFunction` の結果の配列。

**例**

次のデータを持つ `people` テーブルを考えてみましょう：

``` text
┌─name───┬─age─┬─wage─┐
│ John   │  16 │   10 │
│ Alice  │  30 │   15 │
│ Mary   │  35 │    8 │
│ Evelyn │  48 │ 11.5 │
│ David  │  62 │  9.9 │
│ Brian  │  60 │   16 │
└────────┴─────┴──────┘
```

年齢が `[30,60)` および `[60,75)` のインターバルに含まれる人々の名前を取得します。年齢を整数表現にしているため、`[30, 59]` および `[60,74]` のインターバルが得られます。

名前を配列で集約するには、[groupArray](../../sql-reference/aggregate-functions/reference/grouparray.md#agg_function-grouparray) 集約関数を使用します。これは1つの引数を取り、今回の場合は `name` カラムです。`groupArrayResample` 関数は `age` カラムを使用して年齢ごとに名前を集約する必要があります。必要なインターバルを定義するために、`30, 75, 30` の引数を `groupArrayResample` 関数に渡します。

``` sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

``` text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

結果を考察します。

`John` は年齢が若すぎるためサンプルから外れています。他の人々は指定された年齢のインターバルに従って分配されています。

次に、指定された年齢のインターバル内の人々の合計数と彼らの平均賃金をカウントします。

``` sql
SELECT
    countResample(30, 75, 30)(name, age) AS amount,
    avgResample(30, 75, 30)(wage, age) AS avg_wage
FROM people
```

``` text
┌─amount─┬─avg_wage──────────────────┐
│ [3,2]  │ [11.5,12.949999809265137] │
└────────┴───────────────────────────┘
```

## -ArgMin {#-argmin}

サフィックス -ArgMin は任意の集約関数の名前に追加できます。この場合、集約関数は追加の引数を受け取る必要があり、これは任意の比較可能な表現でなければなりません。集約関数は、指定された追加の表現の最小値を持つ行のみを処理します。

例: `sumArgMin(column, expr)`, `countArgMin(expr)`, `avgArgMin(x, expr)` など。

## -ArgMax {#-argmax}

サフィックス -ArgMin と似ていますが、指定された追加の表現の最大値を持つ行のみを処理します。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における集約コンビネーターの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
