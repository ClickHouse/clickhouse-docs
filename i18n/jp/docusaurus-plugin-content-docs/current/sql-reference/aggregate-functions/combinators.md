---
description: '集約関数コンビネータに関するリファレンス'
sidebar_label: 'コンビネータ'
sidebar_position: 37
slug: /sql-reference/aggregate-functions/combinators
title: '集約関数コンビネータ'
doc_type: 'reference'
---

# 集約関数のコンビネーター \\{#aggregate-function-combinators\\}

集約関数の名前には、接尾辞を付けることができます。これにより、その集約関数の挙動が変化します。

## -If \\{#-if\\}

サフィックス -If は、任意の集約関数名に付与できます。この場合、集約関数は追加の引数として条件（`UInt8` 型）を受け取ります。集約関数は、その条件が真となる行だけを処理します。条件が一度も真とならなかった場合、デフォルト値（通常はゼロまたは空文字列）を返します。

例: `sumIf(column, cond)`, `countIf(cond)`, `avgIf(x, cond)`, `quantilesTimingIf(level1, level2)(x, cond)`, `argMinIf(arg, val, cond)` など。

条件付き集約関数を使用すると、サブクエリや `JOIN` を使わずに、複数の条件に対する集約値を同時に計算できます。たとえば、条件付き集約関数を用いてセグメント比較機能を実装できます。

## -Array \\{#-array\\}

-Array サフィックスは、任意の集約関数に付加できます。この場合、集約関数は引数として型 'T' ではなく、型 'Array(T)'（配列）を取ります。集約関数が複数の引数を受け取る場合、これらの引数はすべて長さが等しい配列でなければなりません。配列を処理する際、集約関数は、すべての配列要素に対して元の集約関数と同様に動作します。

例 1: `sumArray(arr)` - すべての 'arr' 配列に含まれるすべての要素を合計します。この例では、より単純に `sum(arraySum(arr))` と書くこともできます。

例 2: `uniqArray(arr)` – すべての 'arr' 配列に含まれる一意な要素の数を数えます。これは、より簡単な方法として `uniq(arrayJoin(arr))` でも実行できますが、常にクエリに 'arrayJoin' を追加できるとは限りません。

-If と -Array は組み合わせて使用できます。ただし、'Array' を先に、次に 'If' を付ける必要があります。例: `uniqArrayIf(arr, cond)`, `quantilesTimingArrayIf(level1, level2)(arr, cond)`。この順序により、'cond' 引数は配列型の引数にはなりません。

## -Map \\{#-map\\}

`-Map` サフィックスは、任意の集約関数に付加して使用できます。これにより、引数として `Map` 型を受け取り、指定した集約関数を用いてマップ内の各キーに対応する値を個別に集約する集約関数が作成されます。結果も `Map` 型となります。

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

## -SimpleState \\{#-simplestate\\}

このコンビネータを適用すると、集約関数は同じ値を返しますが、型が異なるようになります。これは、テーブルに保存して [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルで使用できる [SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md) 型です。

**構文**

```sql
<aggFunction>SimpleState(x)
```

**引数**

* `x` — 集約関数のパラメータ。

**戻り値**

`SimpleAggregateFunction(...)` 型の集約関数の値。

**例**

クエリ:

```sql
WITH anySimpleState(number) AS c SELECT toTypeName(c), c FROM numbers(1);
```

結果：

```text
┌─toTypeName(c)────────────────────────┬─c─┐
│ SimpleAggregateFunction(any, UInt64) │ 0 │
└──────────────────────────────────────┴───┘
```

## -State \\{#-state\\}

このコンビネータを適用すると、集約関数は結果の値（[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数における一意な値の個数など）ではなく、集約の中間状態（`uniq` では、一意な値の数を計算するためのハッシュテーブル）を返します。これは `AggregateFunction(...)` 型であり、さらなる処理に利用したり、テーブルに保存して後から集約処理を完了させたりできます。

:::note
同一のデータに対しても、-MapState は中間状態におけるデータの順序が変化しうるため不変ではないことに注意してください。ただし、これはこのデータのインジェストには影響しません。
:::

これらの状態を扱うには、次を使用します。

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルエンジン
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeAggregation) 関数
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningAccumulate) 関数
- [-Merge](#-merge) コンビネータ
- [-MergeState](#-mergestate) コンビネータ

## -Merge \\{#-merge\\}

このコンビネータを適用すると、集約関数は引数として中間集約状態を受け取り、それらを結合して集約を完了し、その結果の値を返します。

## -MergeState \\{#-mergestate\\}

`-Merge` コンビネータと同様に中間集約状態をマージします。ただし、結果の値は返さず、`-State` コンビネータと同様に中間集約状態を返します。

## -ForEach \\{#-foreach\\}

テーブルに対する集約関数を、対応する配列要素ごとに集約を行い、その結果を配列で返す配列向けの集約関数に変換します。たとえば、配列 `[1, 2]`、`[3, 4, 5]`、`[6, 7]` に対する `sumForEach` は、対応する配列要素を加算した結果として `[10, 13, 5]` を返します。

## -Distinct \\{#-distinct\\}

引数の一意な組み合わせごとに、集約は 1 回だけ行われます。重複する値は無視されます。
例: `sum(DISTINCT x)`（または `sumDistinct(x)`）、`groupArray(DISTINCT x)`（または `groupArrayDistinct(x)`）、`corrStable(DISTINCT x, y)`（または `corrStableDistinct(x, y)`）など。

## -OrDefault \\{#-ordefault\\}

集約関数の動作を変更します。

集約関数に入力値がまったくない場合、このコンビネータを使用すると、その戻り値のデータ型に対するデフォルト値を返します。空の入力データを取り得る集約関数に適用できます。

`-OrDefault` は他のコンビネータと併用できます。

**構文**

```sql
<aggFunction>OrDefault(x)
```

**引数**

* `x` — 集約関数のパラメータ。

**戻り値**

集約する対象が何もない場合、集約関数の戻り値の型に対するデフォルト値を返します。

型は使用する集約関数に依存します。

**例**

クエリ：

```sql
SELECT avg(number), avgOrDefault(number) FROM numbers(0)
```

結果：

```text
┌─avg(number)─┬─avgOrDefault(number)─┐
│         nan │                    0 │
└─────────────┴──────────────────────┘
```

また `-OrDefault` は他のコンビネータと組み合わせて使用できます。これは、集約関数が空の入力を受け付けない場合に有用です。

クエリ:

```sql
SELECT avgOrDefaultIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

結果：

```text
┌─avgOrDefaultIf(x, greater(x, 10))─┐
│                              0.00 │
└───────────────────────────────────┘
```

## -OrNull \\{#-ornull\\}

集約関数の動作を変更します。

このコンビネータは、集約関数の結果を [Nullable](../../sql-reference/data-types/nullable.md) データ型に変換します。集約関数に集計対象の値が存在しない場合は、[NULL](/operations/settings/formats#input_format_null_as_default) を返します。

`-OrNull` は他のコンビネータと組み合わせて使用できます。

**構文**

```sql
<aggFunction>OrNull(x)
```

**引数**

* `x` — 集約関数のパラメーター。

**戻り値**

* 集約関数の結果を `Nullable` データ型に変換した値。
* 集約対象の値が存在しない場合は `NULL`。

型: `Nullable(集約関数の戻り値の型)`。

**例**

集約関数名の末尾に `-orNull` を追加します。

クエリ：

```sql
SELECT sumOrNull(number), toTypeName(sumOrNull(number)) FROM numbers(10) WHERE number > 10
```

結果：

```text
┌─sumOrNull(number)─┬─toTypeName(sumOrNull(number))─┐
│              ᴺᵁᴸᴸ │ Nullable(UInt64)              │
└───────────────────┴───────────────────────────────┘
```

`-OrNull` は他のコンビネータと組み合わせて使用することもできます。これは、集約関数が空の入力を許容しない場合に有用です。

クエリ:

```sql
SELECT avgOrNullIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

結果：

```text
┌─avgOrNullIf(x, greater(x, 10))─┐
│                           ᴺᵁᴸᴸ │
└────────────────────────────────┘
```

## -Resample \\{#-resample\\}

データをグループに分割し、その各グループ内で個別にデータを集計できるようにします。グループは、1 列の値を区間ごとに分割することで作成されます。

```sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**引数**

* `start` — `resampling_key` の値に対する対象となる全区間の開始値。
* `stop` — `resampling_key` の値に対する対象となる全区間の終了値。この全区間には `stop` の値は含まれず、`[start, stop)` となります。
* `step` — 全区間をサブ区間に分割する際のステップ幅。`aggFunction` はそれぞれのサブ区間ごとに独立して実行されます。
* `resampling_key` — データを区間に分割するために使用される値を持つカラム。
* `aggFunction_params` — `aggFunction` のパラメータ。

**戻り値**

* 各サブ区間に対する `aggFunction` の結果の配列。

**例**

次のデータを持つ `people` テーブルを想定します。

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

`[30,60)` および `[60,75)` の区間に年齢が含まれる人の名前を取得しましょう。年齢は整数で表現しているため、実際には `[30, 59]` および `[60,74]` の区間の年齢が対象になります。

名前を配列に集約するには、集約関数 [groupArray](/sql-reference/aggregate-functions/reference/grouparray) を使用します。この関数は 1 つの引数を取ります。ここでは `name` 列を渡します。`groupArrayResample` 関数では、`age` 列を使用して年齢ごとに名前を集約します。必要な区間を定義するために、`groupArrayResample` 関数には引数として `30, 75, 30` を渡します。

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

```text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

結果を確認します。

`John` は年齢が若すぎるため、サンプルには含まれていません。他の人たちは、指定した年齢区間に従って分布しています。

次に、指定した年齢区間ごとに、総人数と平均賃金を求めましょう。

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

## -ArgMin \\{#-argmin\\}

接尾辞 -ArgMin は、任意の集約関数の名前に付加できます。この場合、その集約関数は追加の引数を 1 つ受け取り、この引数には任意の比較可能な式を指定できます。集約関数は、指定された追加の式が最小値となる行だけを処理します。

例: `sumArgMin(column, expr)`, `countArgMin(expr)`, `avgArgMin(x, expr)` など。

## -ArgMax \\{#-argmax\\}

サフィックス -ArgMin と同様ですが、指定された追加の式に対して最大値を持つ行だけを処理します。

## 関連コンテンツ \\{#related-content\\}

- ブログ記事: [Using Aggregate Combinators in ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
