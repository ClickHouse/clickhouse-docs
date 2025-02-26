---
slug: /sql-reference/aggregate-functions/combinators
sidebar_position: 37
sidebar_label: 組み合わせ関数
---

# 集約関数の組み合わせ

集約関数の名前には、接尾辞を追加することができます。これにより、集約関数の動作が変更されます。

## -If {#-if}

接尾辞 -If は、任意の集約関数の名前に追加できます。この場合、集約関数は追加の引数 - 条件 (Uint8型) を受け取ります。集約関数は、条件をトリガーする行のみを処理します。条件が一度もトリガーされなかった場合、デフォルト値 (通常はゼロまたは空の文字列) を返します。

例: `sumIf(column, cond)`, `countIf(cond)`, `avgIf(x, cond)`, `quantilesTimingIf(level1, level2)(x, cond)`, `argMinIf(arg, val, cond)` など。

条件付き集約関数を使用すると、サブクエリや `JOIN` を使用することなく、複数の条件の集約を一度に計算できます。例えば、条件付き集約関数はセグメント比較機能を実装するために使用できます。

## -Array {#-array}

接尾辞 -Array は、任意の集約関数に追加できます。この場合、集約関数は 'Array(T)' 型の引数 (配列) を受け取り、'T' 型の引数の代わりに使用します。集約関数が複数の引数を受け取る場合、それらは等しい長さの配列でなければなりません。配列を処理する場合、集約関数はすべての配列要素に対して元の集約関数のように動作します。

例 1: `sumArray(arr)` - すべての 'arr' 配列の要素を合計します。この例では、より単純に書くこともできます: `sum(arraySum(arr))`。

例 2: `uniqArray(arr)` – すべての 'arr' 配列のユニークな要素の数を数えます。これをより簡単な方法で行うこともできます: `uniq(arrayJoin(arr))`、ただし、クエリに 'arrayJoin' を追加することは常に可能ではありません。

-If と -Array は組み合わせて使用できます。ただし、'Array' が先に来て、その後に 'If' が続かなければなりません。例: `uniqArrayIf(arr, cond)`, `quantilesTimingArrayIf(level1, level2)(arr, cond)`。この順序のため、'cond' 引数は配列ではなくなります。

## -Map {#-map}

接尾辞 -Map は、任意の集約関数に追加できます。これにより、Map型を引数として受け取り、指定された集約関数を使用してマップの各キーの値を個別に集約する集約関数が作成されます。結果もマップ型になります。

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

この組み合わせを適用すると、集約関数は同じ値を返しますが、異なる型になります。これは、[SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md) で、[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルで作業するためにテーブルに保存できます。

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

この組み合わせを適用すると、集約関数は結果の値 (例えば、[uniq](../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq) 関数のユニークな値の数) を返さず、集約の中間状態を返します (`uniq` の場合、これはユニークな値の数を計算するためのハッシュテーブルです)。これは、さらなる処理に使用したり、後で集約を完了するためにテーブルに保存できる `AggregateFunction(...)` です。

:::note
-MapState は中間状態でデータの順序が変わるため、同じデータに対する不変ではないことに注意してくださいが、それはこのデータの取り込みに影響を与えません。
:::

これらの状態で作業するには、次のものを使用します:

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルエンジン。
- [finalizeAggregation](../../sql-reference/functions/other-functions.md#function-finalizeaggregation) 関数。
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningaccumulate) 関数。
- [-Merge](#-merge) 組み合わせ。
- [-MergeState](#-mergestate) 組み合わせ。

## -Merge {#-merge}

この組み合わせを適用すると、集約関数は中間集約状態を引数として受け取り、状態を結合して集約を完了し、結果の値を返します。

## -MergeState {#-mergestate}

中間集約状態を -Merge 組み合わせと同じ方法で結合します。ただし、結果の値を返さず、中間集約状態を返します。これは -State 組み合わせに似ています。

## -ForEach {#-foreach}

テーブルの集約関数を配列の集約関数に変換し、対応する配列アイテムを集約して結果の配列を返します。例えば、`sumForEach` は、配列 `[1, 2]`、`[3, 4, 5]`、および `[6, 7]` に対して、対応する配列アイテムを加算した結果として `[10, 13, 5]` を返します。

## -Distinct {#-distinct}

すべてのユニークな引数の組み合わせは、一度だけ集約されます。繰り返しの値は無視されます。
例: `sum(DISTINCT x)` (または `sumDistinct(x)`)、`groupArray(DISTINCT x)` (または `groupArrayDistinct(x)`)、`corrStable(DISTINCT x, y)` (または `corrStableDistinct(x, y)`) など。

## -OrDefault {#-ordefault}

集約関数の動作を変更します。

集約関数に入力値がない場合、この組み合わせを使用すると、その戻りデータ型のデフォルト値を返します。これは、空の入力データを受け取ることができる集約関数に適用されます。

`-OrDefault` は他の組み合わせと一緒に使用できます。

**構文**

``` sql
<aggFunction>OrDefault(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**返される値**

集約するものが何もない場合、集約関数の戻り型のデフォルト値を返します。

型は使用された集約関数に依存します。

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

また、`-OrDefault` は他の組み合わせと一緒に使用できます。これは、集約関数が空の入力を受け入れない場合に便利です。

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

この組み合わせは、集約関数の結果を [Nullable](../../sql-reference/data-types/nullable.md) データ型に変換します。集約関数に計算する値がない場合は、[NULL](../../sql-reference/syntax.md#null-literal) を返します。

`-OrNull` は他の組み合わせと一緒に使用できます。

**構文**

``` sql
<aggFunction>OrNull(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**返される値**

- 集約関数の結果を `Nullable` データ型に変換したもの。
- 集約するものが何もない場合は `NULL`。

型: `Nullable(集約関数の戻り型)`。

**例**

集約関数の最後に `-orNull`を追加します。

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

また、`-OrNull` は他の組み合わせと一緒に使用できます。これは、集約関数が空の入力を受け入れない場合に便利です。

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

データをグループに分割し、それらのグループ内のデータを別々に集約できるようにします。グループは、1つのカラムの値を間隔に分割することによって作成されます。

``` sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**引数**

- `start` — `resampling_key` 値の全体の必要な間隔の開始値。
- `stop` — `resampling_key` 値の全体の必要な間隔の終了値。全体の間隔には `stop` 値は含まれません `[start, stop)`。
- `step` — 全体の間隔をサブインターバルに分割するためのステップ。`aggFunction` はそれぞれのサブインターバルに対して独立して実行されます。
- `resampling_key` — データを間隔に分けるために使用される列。
- `aggFunction_params` — `aggFunction` のパラメータ。

**返される値**

- 各サブインターバルに対する `aggFunction` の結果の配列。

**例**

次のデータを持つ `people` テーブルを考えてみましょう:

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

年齢が `[30,60)` および `[60,75)` の間にある人々の名前を取得しましょう。年齢の整数表現を使用しているため、`[30, 59]` および `[60,74]` の間隔で年齢を取得します。

名前を配列に集約するには、[groupArray](../../sql-reference/aggregate-functions/reference/grouparray.md#agg_function-grouparray) 集約関数を使用します。これは1つの引数を受け取ります。この場合、それは `name` 列です。`groupArrayResample` 関数は、年齢ごとに名前を集約するために `age` 列を使用する必要があります。必要な間隔を定義するために、`30, 75, 30` の引数を `groupArrayResample` 関数に渡します。

``` sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

``` text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

結果を考えてみましょう。

`John` は若すぎるためサンプルから外れています。他の人々は、指定された年齢の間隔に従って分布しています。

次に、指定された年齢間隔で人々の総数と平均給与を数えます。

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

接尾辞 -ArgMin は、任意の集約関数の名前に追加できます。この場合、集約関数は、比較可能な表現の追加引数を受け取ります。集約関数は、指定された追加の表現の最小値を持つ行のみを処理します。

例: `sumArgMin(column, expr)`, `countArgMin(expr)`, `avgArgMin(x, expr)` など。

## -ArgMax {#-argmax}

接尾辞 -ArgMin と似ていますが、指定された追加の表現の最大値を持つ行のみを処理します。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの集約組み合わせの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
