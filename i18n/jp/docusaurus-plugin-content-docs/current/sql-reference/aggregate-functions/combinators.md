---
description: '集約関数コンビネータのドキュメント'
sidebar_label: 'コンビネータ'
sidebar_position: 37
slug: /sql-reference/aggregate-functions/combinators
title: '集約関数コンビネータ'
doc_type: 'reference'
---



# 集約関数コンビネータ

集約関数の名前の末尾には接尾辞を付けることができ、これによって集約関数の動作が変わります。



## -If {#-if}

接尾辞 -If は、任意の集約関数名に付加することができます。この場合、集約関数は追加の引数として条件(Uint8型)を受け取ります。集約関数は、条件を満たす行のみを処理します。条件が一度も満たされなかった場合は、デフォルト値(通常はゼロまたは空文字列)を返します。

例: `sumIf(column, cond)`、`countIf(cond)`、`avgIf(x, cond)`、`quantilesTimingIf(level1, level2)(x, cond)`、`argMinIf(arg, val, cond)` など。

条件付き集約関数を使用すると、サブクエリや `JOIN` を使用することなく、複数の条件に対する集約を一度に計算できます。例えば、条件付き集約関数を使用してセグメント比較機能を実装することができます。


## -Array {#-array}

-Array接尾辞は、任意の集約関数に付加できます。この場合、集約関数は'T'型の引数ではなく'Array(T)'型(配列)の引数を受け取ります。集約関数が複数の引数を受け取る場合、これらは同じ長さの配列である必要があります。配列を処理する際、集約関数は元の集約関数と同様に、すべての配列要素に対して動作します。

例1: `sumArray(arr)` - すべての'arr'配列のすべての要素を合計します。この例では、より簡潔に`sum(arraySum(arr))`と記述できます。

例2: `uniqArray(arr)` – すべての'arr'配列内の一意な要素の数をカウントします。これはより簡単な方法で実現できます: `uniq(arrayJoin(arr))`。ただし、クエリに'arrayJoin'を追加できない場合もあります。

-Ifと-Arrayは組み合わせることができます。ただし、'Array'を先に、次に'If'を配置する必要があります。例: `uniqArrayIf(arr, cond)`、`quantilesTimingArrayIf(level1, level2)(arr, cond)`。この順序により、'cond'引数は配列になりません。


## -Map {#-map}

-Map接尾辞は任意の集約関数に付加できます。これにより、Map型を引数として受け取り、指定された集約関数を使用してマップの各キーの値を個別に集約する集約関数が作成されます。結果もMap型となります。

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

このコンビネータを適用すると、集約関数は同じ値を異なる型で返します。これは [SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md) であり、[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルで使用するためにテーブルに格納できます。

**構文**

```sql
<aggFunction>SimpleState(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**戻り値**

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

このコンビネータを適用すると、集約関数は結果値([uniq](/sql-reference/aggregate-functions/reference/uniq)関数のユニーク値の数など)を返さず、集約の中間状態を返します(`uniq`の場合、ユニーク値の数を計算するためのハッシュテーブル)。これは`AggregateFunction(...)`型であり、さらなる処理に使用したり、後で集約を完了するためにテーブルに保存したりできます。

:::note
中間状態におけるデータの順序が変わる可能性があるため、-MapStateは同じデータに対して不変ではないことに注意してください。ただし、これはデータの取り込みには影響しません。
:::

これらの状態を扱うには、以下を使用します:

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md)テーブルエンジン
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeAggregation)関数
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningAccumulate)関数
- [-Merge](#-merge)コンビネータ
- [-MergeState](#-mergestate)コンビネータ


## -Merge {#-merge}

このコンビネータを適用すると、集約関数は中間集約状態を引数として受け取り、それらの状態を結合して集約を完了し、結果の値を返します。


## -MergeState {#-mergestate}

-Mergeコンビネータと同じ方法で中間集計状態をマージします。ただし、結果の値を返すのではなく、-Stateコンビネータと同様に中間集計状態を返します。


## -ForEach {#-foreach}

テーブル用の集計関数を配列用の集計関数に変換します。対応する配列要素を集計し、結果の配列を返します。例えば、配列 `[1, 2]`、`[3, 4, 5]`、`[6, 7]` に対して `sumForEach` を適用すると、対応する配列要素を加算した結果 `[10, 13, 5]` が返されます。


## -Distinct {#-distinct}

引数の一意な組み合わせは、それぞれ一度だけ集計されます。重複する値は無視されます。
例: `sum(DISTINCT x)` (または `sumDistinct(x)`)、`groupArray(DISTINCT x)` (または `groupArrayDistinct(x)`)、`corrStable(DISTINCT x, y)` (または `corrStableDistinct(x, y)`) など。


## -OrDefault {#-ordefault}

集約関数の動作を変更します。

集約関数に入力値がない場合、このコンビネータは戻り値のデータ型のデフォルト値を返します。空の入力データを受け取ることができる集約関数に適用されます。

`-OrDefault`は他のコンビネータと組み合わせて使用できます。

**構文**

```sql
<aggFunction>OrDefault(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**戻り値**

集約対象がない場合、集約関数の戻り値型のデフォルト値を返します。

型は使用する集約関数によって異なります。

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

また、`-OrDefault`は他のコンビネータと組み合わせて使用することもできます。これは集約関数が空の入力を受け付けない場合に便利です。

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

このコンビネータは、集約関数の結果を[Nullable](../../sql-reference/data-types/nullable.md)データ型に変換します。集約関数が計算する値を持たない場合、[NULL](/operations/settings/formats#input_format_null_as_default)を返します。

`-OrNull`は他のコンビネータと組み合わせて使用できます。

**構文**

```sql
<aggFunction>OrNull(x)
```

**引数**

- `x` — 集約関数のパラメータ。

**返される値**

- `Nullable`データ型に変換された集約関数の結果。
- 集約するものがない場合は`NULL`。

型: `Nullable(集約関数の戻り値の型)`。

**例**

集約関数の末尾に`-orNull`を追加します。

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

また、`-OrNull`は他のコンビネータと組み合わせて使用できます。これは、集約関数が空の入力を受け付けない場合に便利です。

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

データをグループに分割し、それぞれのグループ内でデータを個別に集計できます。グループは、1つのカラムの値を区間に分割することで作成されます。

```sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**引数**

- `start` — `resampling_key`値の全体区間の開始値。
- `stop` — `resampling_key`値の全体区間の終了値。全体区間には`stop`値は含まれません`[start, stop)`。
- `step` — 全体区間を部分区間に分割するためのステップ。`aggFunction`は各部分区間に対して独立して実行されます。
- `resampling_key` — データを区間に分割するために使用される値を持つカラム。
- `aggFunction_params` — `aggFunction`のパラメータ。

**戻り値**

- 各部分区間に対する`aggFunction`の結果の配列。

**例**

次のデータを持つ`people`テーブルを考えます:

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

年齢が`[30,60)`と`[60,75)`の区間にある人々の名前を取得しましょう。年齢には整数表現を使用するため、`[30, 59]`と`[60,74]`の区間の年齢が得られます。

名前を配列に集計するために、[groupArray](/sql-reference/aggregate-functions/reference/grouparray)集計関数を使用します。この関数は1つの引数を取ります。今回の場合は`name`カラムです。`groupArrayResample`関数は、年齢別に名前を集計するために`age`カラムを使用します。必要な区間を定義するために、`groupArrayResample`関数に`30, 75, 30`の引数を渡します。

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

```text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

結果を見てみましょう。

`John`は若すぎるためサンプルから除外されています。他の人々は指定された年齢区間に従って分布しています。

次に、指定された年齢区間における人数の合計と平均賃金を計算してみましょう。

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

接尾辞 -ArgMin は、任意の集約関数名に付加できます。この場合、集約関数は追加の引数を受け取ります。この引数は比較可能な任意の式である必要があります。集約関数は、指定された追加の式が最小値となる行のみを処理します。

例: `sumArgMin(column, expr)`、`countArgMin(expr)`、`avgArgMin(x, expr)` など。


## -ArgMax {#-argmax}

-ArgMin接尾辞と同様ですが、指定された追加式の最大値を持つ行のみを処理します。


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
