---
slug: /sql-reference/aggregate-functions/combinators
sidebar_position: 37
sidebar_label: コムビネーター
---


# 集約関数のコムビネーター

集約関数の名前にはサフィックスを追加することができます。これにより、集約関数の動作が変わります。

## -If {#-if}

サフィックス -If は任意の集約関数の名前に追加できます。この場合、集約関数は追加の引数 – 条件 (Uint8 型) を受け取ります。集約関数は、条件をトリガーする行のみを処理します。条件が一度もトリガーされなかった場合、デフォルト値（通常はゼロまたは空文字列）を返します。

例: `sumIf(column, cond)`、`countIf(cond)`、`avgIf(x, cond)`、`quantilesTimingIf(level1, level2)(x, cond)`、`argMinIf(arg, val, cond)` などです。

条件付き集約関数を使用すると、サブクエリや `JOIN` を使わずに、複数の条件に対する集約を同時に計算できます。たとえば、条件付き集約関数はセグメント比較機能を実装するために使用できます。

## -Array {#-array}

サフィックス -Array は任意の集約関数に追加できます。この場合、集約関数は 'T' 型の引数の代わりに 'Array(T)' 型の引数（配列）を受け取ります。集約関数が複数の引数を受け取る場合、これらは同じ長さの配列でなければなりません。配列を処理する際、集約関数はすべての配列要素に対して元の集約関数のように動作します。

例1: `sumArray(arr)` - すべての 'arr' 配列のすべての要素を合計します。この例では、より簡単に書くことができます: `sum(arraySum(arr))`。

例2: `uniqArray(arr)` – すべての 'arr' 配列内のユニークな要素の数をカウントします。これはより簡単な方法で行うこともできます: `uniq(arrayJoin(arr))` ですが、クエリに 'arrayJoin' を追加することは常に可能ではありません。

-If と -Array を組み合わせることができます。ただし、'Array' は最初に来なければならず、次に 'If' が来なければなりません。例: `uniqArrayIf(arr, cond)`、`quantilesTimingArrayIf(level1, level2)(arr, cond)`。この順序のため、'cond' 引数は配列にはなりません。

## -Map {#-map}

サフィックス -Map は任意の集約関数に追加できます。これにより、Map 型を引数として受け取る集約関数が作成され、地図の各キーの値が指定された集約関数を使用して別々に集約されます。結果も Map 型です。

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

このコムビネーターを適用すると、集約関数は同じ値を返しますが、異なる型になります。これは [SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md) であり、テーブルに保存して [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルで作業できます。

**構文**

``` sql
<aggFunction>SimpleState(x)
```

**引数**

- `x` — 集約関数のパラメータ。

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

このコムビネーターを適用すると、集約関数は結果の値（たとえば、[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数のユニークな値の数）を返さず、集約の中間状態を返します（`uniq` の場合、中間状態はユニークな値を計算するためのハッシュテーブルです）。これは `AggregateFunction(...)` であり、さらなる処理に使用したり、後で集約を終了するためにテーブルに保存したりできます。

:::note
-MapState は、データの順序が中間状態で変わるため、同じデータに対して不変ではないことに注意してください。ただし、このデータの取り込みには影響しません。
:::

これらの状態を扱うには使用します：

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルエンジン。
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeaggregation) 関数。
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningaccumulate) 関数。
- [-Merge](#-merge) コムビネーター。
- [-MergeState](#-mergestate) コムビネーター。

## -Merge {#-merge}

このコムビネーターを適用すると、集約関数は中間集約状態を引数として受け取り、状態を組み合わせて集約を完了し、結果の値を返します。

## -MergeState {#-mergestate}

中間集約状態を -Merge コムビネーターと同様にマージします。ただし、結果の値を返さず、-State コムビネーターに似た中間集約状態を返します。

## -ForEach {#-foreach}

テーブルの集約関数を配列の集約関数に変換し、対応する配列アイテムを集約して結果の配列を返します。たとえば、`sumForEach` は配列 `[1, 2]`、`[3, 4, 5]` および `[6, 7]` に対して、対応する配列アイテムを加算した後、結果 `[10, 13, 5]` を返します。

## -Distinct {#-distinct}

引数の各ユニークな組み合わせは一度だけ集約されます。繰り返し値は無視されます。
例: `sum(DISTINCT x)`（または `sumDistinct(x)`）、`groupArray(DISTINCT x)`（または `groupArrayDistinct(x)`）、`corrStable(DISTINCT x, y)`（または `corrStableDistinct(x, y)`）などです。

## -OrDefault {#-ordefault}

集約関数の動作を変更します。

集約関数に入力値がない場合、このコムビネーターを使用すると、その戻りデータ型のデフォルト値を返します。空の入力データを受け取ることができる集約関数に適用されます。

`-OrDefault` は他のコムビネーターと一緒に使用できます。

**構文**

``` sql
<aggFunction>OrDefault(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**返される値**

集約するものがない場合、集約関数の戻り型のデフォルト値を返します。

型は使用される集約関数に依存します。

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

また、`-OrDefault` は他のコムビネーターと一緒に使用できます。これは、集約関数が空の入力を受け入れない場合に役立ちます。

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

このコムビネーターは、集約関数の結果を [Nullable](../../sql-reference/data-types/nullable.md) データ型に変換します。集約関数に計算する値がない場合、[NULL](/operations/settings/formats#input_format_null_as_default) を返します。

`-OrNull` は他のコムビネーターと一緒に使用できます。

**構文**

``` sql
<aggFunction>OrNull(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**返される値**

- 集約関数の結果を `Nullable` データ型に変換したもの。
- 集約するものがない場合、`NULL`。

型: `Nullable(集約関数戻り型)`。

**例**

集約関数の末尾に `-orNull` を追加します。

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

また、`-OrNull` は他のコムビネーターと一緒に使用することができます。集約関数が空の入力を受け入れないときに役立ちます。

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

データをグループに分け、そのグループ内のデータを別々に集約できるようにします。グループは、一つのカラムからの値を間隔で分割することで作成されます。

``` sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**引数**

- `start` — `resampling_key` の値の全体の必要な間隔の開始値。
- `stop` — `resampling_key` の値の全体の必要な間隔の終了値。この全体の間隔には `stop` の値は含まれません `[start, stop)`。
- `step` — 全体の間隔をサブ間隔に分けるためのステップ。`aggFunction` は、それぞれのサブ間隔に対して独立して実行されます。
- `resampling_key` — データを間隔に分けるために使用されるカラム。
- `aggFunction_params` — `aggFunction` のパラメータ。

**返される値**

- 各サブ間隔に対する `aggFunction` の結果の配列。

**例**

次のデータを持つ `people` テーブルを考えます。

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

年齢が `[30,60)` と `[60,75)` の間にある人々の名前を取得しましょう。整数表現を使用しているため、年齢は `[30, 59]` と `[60,74]` の間隔に分けられます。

名前を配列で集約するために、[groupArray](/sql-reference/aggregate-functions/reference/grouparray) 集約関数を使用します。これは一つの引数を取ります。私たちの場合、それは `name` カラムです。`groupArrayResample` 関数は、年齢に基づいて名前を集約するために `age` カラムを使用する必要があります。必要な間隔を定義するために、`30, 75, 30` の引数を `groupArrayResample` 関数に渡します。

``` sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

``` text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

結果を考えます。

`John` は若すぎるためサンプルから外れています。他の人は指定された年齢区間に従って分布しています。

次に、指定された年齢区間の人々の合計数と平均賃金を数えます。

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

サフィックス -ArgMin は任意の集約関数の名前に追加できます。この場合、集約関数は追加の引数を受け取ります。この引数は任意の比較可能な式でなければなりません。集約関数は、指定された追加式の最小値を持つ行のみを処理します。

例: `sumArgMin(column, expr)`、`countArgMin(expr)`、`avgArgMin(x, expr)` などです。

## -ArgMax {#-argmax}

サフィックス -ArgMin に似ていますが、指定された追加式の最大値を持つ行のみを処理します。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における集約コムビネーターの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
