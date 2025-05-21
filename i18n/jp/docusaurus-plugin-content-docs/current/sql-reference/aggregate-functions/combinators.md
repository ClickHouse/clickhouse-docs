description: '集約関数コンビネータに関するドキュメント'
sidebar_label: 'コンビネータ'
sidebar_position: 37
slug: /sql-reference/aggregate-functions/combinators
title: '集約関数コンビネータ'
```


# 集約関数コンビネータ

集約関数の名前にはサフィックスを追加することができます。これにより、集約関数の動作が変更されます。

## -If {#-if}

サフィックス -If は、任意の集約関数の名前に追加することができます。この場合、集約関数は追加の引数 - 条件（Uint8 型）を受け取ります。集約関数は、条件がトリガーされた行のみを処理します。条件が一度もトリガーされなかった場合、デフォルト値（通常はゼロまたは空の文字列）を返します。

例: `sumIf(column, cond)`、`countIf(cond)`、`avgIf(x, cond)`、`quantilesTimingIf(level1, level2)(x, cond)`、`argMinIf(arg, val, cond)` など。

条件付き集約関数を使用すると、サブクエリや `JOIN` を使用せずに、いくつかの条件に対して集約を同時に計算できます。たとえば、条件付き集約関数を使用して、セグメント比較機能を実装することができます。

## -Array {#-array}

サフィックス -Array は、任意の集約関数に追加することができます。この場合、集約関数は 'T' 型引数の代わりに 'Array(T)' 型（配列）の引数を取ります。集約関数が複数の引数を受け入れる場合、これらは等しい長さの配列でなければなりません。配列を処理する際、集約関数はすべての配列要素に対して元の集約関数のように動作します。

例 1: `sumArray(arr)` - すべての 'arr' 配列のすべての要素を合計します。この例では、より簡単に書くことも可能でした: `sum(arraySum(arr))`。

例 2: `uniqArray(arr)` – すべての 'arr' 配列内のユニークな要素の数をカウントします。これはより簡単な方法で実行できます: `uniq(arrayJoin(arr))`、ただし、常に `arrayJoin` をクエリに追加できるわけではありません。

-If と -Array は組み合わせることができます。ただし、'Array' が先に来て、その後 'If' が来る必要があります。例: `uniqArrayIf(arr, cond)`、`quantilesTimingArrayIf(level1, level2)(arr, cond)`。この順序のため、'cond' 引数は配列ではありません。

## -Map {#-map}

サフィックス -Map は、任意の集約関数に追加することができます。これにより、引数として Map 型を受け取る集約関数が作成され、指定された集約関数を使用してマップの各キーの値を個別に集約します。結果もマップ型です。

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

このコンビネータを適用すると、集約関数は同じ値を返しますが、異なる型になります。これは [SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md) であり、[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルで動作するためにテーブルに格納できます。

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

このコンビネータを適用すると、集約関数は結果の値（[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数のユニークな値の数のような）を返すのではなく、集約の中間状態を返します（`uniq` の場合、これはユニークな値の数を計算するためのハッシュテーブルです）。これは `AggregateFunction(...)` であり、さらなる処理に使用することができるか、後で集約を完了するためにテーブルに格納できます。

:::note
-MapState が同じデータに対して不変でないことに注意してください。中間状態でデータの順序が変わる可能性があるためです。ただし、このデータの取り込みには影響しません。
:::

これらの状態を操作するには、以下を使用します:

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルエンジン。
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeaggregation) 関数。
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningaccumulate) 関数。
- [-Merge](#-merge) コンビネータ。
- [-MergeState](#-mergestate) コンビネータ。

## -Merge {#-merge}

このコンビネータを適用すると、集約関数は中間集約状態を引数として取り、その状態を結合して集約を完了し、結果の値を返します。

## -MergeState {#-mergestate}

-Merge コンビネータと同様に、中間集約状態を結合します。ただし、結果の値を返すのではなく、-State コンビネータに似た中間集約状態を返します。

## -ForEach {#-foreach}

テーブル用の集約関数を、対応する配列項目を集約し、結果の配列を返す配列用の集約関数に変換します。たとえば、配列 `[1, 2]`、`[3, 4, 5]`、`[6, 7]` に対する `sumForEach` は、対応する配列項目を加算した後に結果 `[10, 13, 5]` を返します。

## -Distinct {#-distinct}

引数のユニークな組み合わせは、1 回だけ集約されます。繰り返しの値は無視されます。
例: `sum(DISTINCT x)`（または `sumDistinct(x)`）、`groupArray(DISTINCT x)`（または `groupArrayDistinct(x)`）、`corrStable(DISTINCT x, y)`（または `corrStableDistinct(x, y)`）など。

## -OrDefault {#-ordefault}

集約関数の動作を変更します。

集約関数に入力値が存在しない場合、このコンビネータを使用することで、その戻りデータ型のデフォルト値を返します。これは、空の入力データを受け取ることができる集約関数に適用されます。

`-OrDefault` は他のコンビネータと一緒に使用することができます。

**構文**

```sql
<aggFunction>OrDefault(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**返される値**

集約するものが何もない場合、集約関数の戻り型のデフォルト値を返します。

型は使用される集約関数によって異なります。

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

また、`-OrDefault` は他のコンビネータと一緒に使用することができます。これは、集約関数が空の入力を受け入れないときに便利です。

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

このコンビネータは、集約関数の結果を [Nullable](../../sql-reference/data-types/nullable.md) データ型に変換します。集約関数に計算する値がない場合、[NULL](/operations/settings/formats#input_format_null_as_default) を返します。

`-OrNull` は他のコンビネータと一緒に使用することができます。

**構文**

```sql
<aggFunction>OrNull(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**返される値**

- 集約関数の結果を `Nullable` データ型に変換したもの。
- 集約するものが何もない場合、`NULL`。

型: `Nullable(集約関数の戻り型)`。

**例**

集約関数の最後に `-orNull` を追加します。

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

また、`-OrNull` は他のコンビネータと一緒に使用することができます。これは、集約関数が空の入力を受け付けない場合に便利です。

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

データをグループに分け、そのグループ内のデータをそれぞれ集約することを許可します。グループは、1 つの列の値を区間に分割することによって作成されます。

```sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**引数**

- `start` — `resampling_key` 値全体の必要な区間の開始値。
- `stop` — `resampling_key` 値全体の必要な区間の終了値。全体の区間は `stop` 値を含まない `[start, stop)`。
- `step` — 全体の区間をサブ区間に分けるためのステップ。`aggFunction` は各サブ区間に対して独立して実行されます。
- `resampling_key` — データを区間に分けるために使用される列の値。
- `aggFunction_params` — `aggFunction` のパラメータ。

**返される値**

- 各サブ区間に対する `aggFunction` の結果の配列。

**例**

次のデータを持つ `people` テーブルを考えます:

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

年齢が `[30,60)` および `[60,75)` の範囲にある人々の名前を取得しましょう。年齢の整数表現を使用するため、`[30, 59]` および `[60,74]` の範囲の年齢が得られます。

名前を配列として集約するには、[groupArray](/sql-reference/aggregate-functions/reference/grouparray) 集約関数を使用します。引数は 1 つです。この場合は `name` 列です。年齢で名前を集約するために、`groupArrayResample` 関数は `age` 列を使用する必要があります。必要な区間を定義するために、`30, 75, 30` の引数を `groupArrayResample` 関数に渡します。

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

```text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

結果を考えてみましょう。

`John` は若すぎるため、サンプルから外れます。他の人々は指定された年齢区間に従って分布しています。

次に、指定された年齢区間内の人々の総数と平均賃金をカウントします。

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

サフィックス -ArgMin は、任意の集約関数の名前に追加することができます。この場合、集約関数は追加の引数を受け取ります。これは、比較可能な任意の式である必要があります。集約関数は、指定された追加式の最小値を持つ行のみを処理します。

例: `sumArgMin(column, expr)`、`countArgMin(expr)`、`avgArgMin(x, expr)` など。

## -ArgMax {#-argmax}

サフィックス -ArgMin に似ていますが、指定された追加式の最大値を持つ行のみを処理します。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
