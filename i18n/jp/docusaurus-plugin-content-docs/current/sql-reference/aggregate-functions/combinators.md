---
'description': 'Aggregate Function Combinatorsのドキュメント'
'sidebar_label': 'コンビネーター'
'sidebar_position': 37
'slug': '/sql-reference/aggregate-functions/combinators'
'title': '集約関数コンビネーター'
'doc_type': 'reference'
---


# 集約関数コンビネータ

集約関数の名前には接尾辞を追加することができます。これにより、集約関数の動作が変わります。

## -If {#-if}

接尾辞 -If は、任意の集約関数の名前に追加できます。この場合、集約関数は追加の引数（Uint8型）を受け取ります。集約関数は、条件をトリガーする行のみを処理します。条件が一度もトリガーされなかった場合、デフォルト値（通常はゼロまたは空文字列）が返されます。

例： `sumIf(column, cond)`、`countIf(cond)`、`avgIf(x, cond)`、`quantilesTimingIf(level1, level2)(x, cond)`、`argMinIf(arg, val, cond)` など。

条件付き集約関数を使用すると、サブクエリや `JOIN` を使用せずに、複数の条件に対して同時に集約を計算できます。たとえば、条件付き集約関数を使用してセグメント比較機能を実装できます。

## -Array {#-array}

接尾辞 -Array は、任意の集約関数に追加できます。この場合、集約関数は'Type(T)'型の引数（配列）を受け取ります。集約関数が複数の引数を受け取る場合、これは等しい長さの配列でなければなりません。配列を処理する際、集約関数はすべての配列要素に対して元の集約関数のように動作します。

例 1： `sumArray(arr)` - すべての 'arr' 配列の要素を合計します。この例では、より簡単に書くことができました： `sum(arraySum(arr))`。

例 2： `uniqArray(arr)` – すべての 'arr' 配列のユニークな要素の数をカウントします。これは簡単な方法で行うことができました： `uniq(arrayJoin(arr))`、ただし、クエリに 'arrayJoin' を追加することが常に可能であるわけではありません。

-If および -Array は組み合わせ可能です。ただし、'Array' が最初に来なければならず、その後に 'If' が来ます。例： `uniqArrayIf(arr, cond)`、`quantilesTimingArrayIf(level1, level2)(arr, cond)`。この順序のため、'cond' 引数は配列ではありません。

## -Map {#-map}

接尾辞 -Map は、任意の集約関数に追加できます。これにより、引数として Map 型を受け取り、指定した集約関数を使用してマップの各キーの値を個別に集約する集約関数が作成されます。結果も Map 型になります。

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

このコンビネータを適用すると、集約関数は同じ値を返しますが、異なる型になります。これは、[SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md) で、[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルと操作するためにテーブルに格納できます。

**構文**

```sql
<aggFunction>SimpleState(x)
```

**引数**

- `x` — 集約関数パラメータ。

**返される値**

`SimpleAggregateFunction(...)` 型の集約関数の値。

**例**

クエリ：

```sql
WITH anySimpleState(number) AS c SELECT toTypeName(c), c FROM numbers(1);
```

結果：

```text
┌─toTypeName(c)────────────────────────┬─c─┐
│ SimpleAggregateFunction(any, UInt64) │ 0 │
└──────────────────────────────────────┴───┘
```

## -State {#-state}

このコンビネータを適用すると、集約関数は結果の値（たとえば、[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数のユニークな値の数）を返すのではなく、集約の中間状態を返します（`uniq` にとっては、ユニークな値の数を計算するためのハッシュテーブルです）。これは、さらなる処理に使用することができる `AggregateFunction(...)` であり、後で集約を完了するためにテーブルに格納できます。

:::note
-MapState は、中間状態におけるデータの順序が変わる可能性があるため、同じデータに対する不変条件ではないことに注意してください。ただし、データの取り込みには影響しません。
:::

これらの状態を操作するには、次のものを使用してください：

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルエンジン。
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeaggregation) 関数。
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningaccumulate) 関数。
- [-Merge](#-merge) コンビネータ。
- [-MergeState](#-mergestate) コンビネータ。

## -Merge {#-merge}

このコンビネータを適用すると、集約関数は中間集約状態を引数として受け取り、状態を結合して集約を完了し、結果の値を返します。

## -MergeState {#-mergestate}

中間集約状態を -Merge コンビネータと同様に結合します。ただし、結果の値は返さず、-State コンビネータに似た中間集約状態を返します。

## -ForEach {#-foreach}

テーブル用の集約関数を配列用の集約関数に変換し、対応する配列アイテムを集約して結果の配列を返します。たとえば、`sumForEach` は、配列 `[1, 2]`、`[3, 4, 5]`、および `[6, 7]` に対して、対応する配列アイテムを足し合わせた結果として `[10, 13, 5]` を返します。

## -Distinct {#-distinct}

すべての引数のユニークな組み合わせは、一度だけ集約されます。繰り返される値は無視されます。
例： `sum(DISTINCT x)`（または `sumDistinct(x)`）、`groupArray(DISTINCT x)`（または `groupArrayDistinct(x)`）、`corrStable(DISTINCT x, y)`（または `corrStableDistinct(x, y)`）など。

## -OrDefault {#-ordefault}

集約関数の動作を変更します。

集約関数に入力値がない場合、このコンビネータを使用すると、その返却データ型のデフォルト値を返します。これは、空の入力データを受け取れる集約関数に適用されます。

`-OrDefault` は他のコンビネータと組み合わせて使用できます。

**構文**

```sql
<aggFunction>OrDefault(x)
```

**引数**

- `x` — 集約関数パラメータ。

**返される値**

集約するものがない場合は、集約関数の返却型のデフォルト値を返します。

型は使用される集約関数によって異なります。

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

また、 `-OrDefault` は他のコンビネータとも組み合わせて使用できます。これは、集約関数が空の入力を受け付けないときに有用です。

クエリ：

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

## -OrNull {#-ornull}

集約関数の動作を変更します。

このコンビネータは、集約関数の結果を [Nullable](../../sql-reference/data-types/nullable.md) データ型に変換します。集約関数に計算するための値がない場合、[NULL](/operations/settings/formats#input_format_null_as_default) を返します。

`-OrNull` は他のコンビネータと組み合わせて使用できます。

**構文**

```sql
<aggFunction>OrNull(x)
```

**引数**

- `x` — 集約関数パラメータ。

**返される値**

- 集約関数の結果で、`Nullable` データ型に変換されたもの。
- 集約するものがない場合は `NULL`。

型： `Nullable(集約関数の返却型)`。

**例**

集約関数の末尾に `-orNull` を追加します。

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

また、 `-OrNull` は他のコンビネータとも組み合わせて使用できます。これは、集約関数が空の入力を受け付けないときに有用です。

クエリ：

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

## -Resample {#-resample}

データをグループに分割し、それぞれのグループ内のデータを個別に集約することを可能にします。グループは、1つのカラムの値を間隔に分割することによって作成されます。

```sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**引数**

- `start` — `resampling_key` の値に必要な全体の間隔の開始値。
- `stop` — `resampling_key` の値に必要な全体の間隔の終了値。全体の間隔には `stop` 値は含まれません `[start, stop)`。
- `step` — 全体の間隔を細分間隔に分けるためのステップ。`aggFunction` は、それらの細分間隔の各々に対して独立して実行されます。
- `resampling_key` — データを間隔に分けるために使用されるカラムの値。
- `aggFunction_params` — `aggFunction` パラメータ。

**返される値**

- 各細分間隔に対する `aggFunction` の結果の配列。

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

`[30,60)` と `[60,75)` の間の年齢に該当する人の名前を取得しましょう。年齢の整数表現を使用しているため、`[30, 59]` および `[60,74]` の間隔の年齢が得られます。

配列内の名前を集約するために、[groupArray](/sql-reference/aggregate-functions/reference/grouparray) 集約関数を使用します。この関数は1つの引数を取ります。我々のケースでは、`name` カラムです。`groupArrayResample` 関数は、年齢ごとに名前を集約するために `age` カラムを使用する必要があります。必要な間隔を定義するために、`groupArrayResample` 関数に `30, 75, 30` の引数を渡します。

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

```text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

結果を見てみましょう。

`John` は若すぎるためサンプルから外れています。他の人々は指定された年齢の間隔に従って分配されています。

次に、指定された年齢間隔での総人数と平均賃金をカウントします。

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

接尾辞 -ArgMin は、任意の集約関数の名前に追加できます。この場合、集約関数は、任意の比較可能な式を受け取る追加の引数を受け取ります。集約関数は、指定された追加の式の最小値を持つ行のみを処理します。

例： `sumArgMin(column, expr)`、`countArgMin(expr)`、`avgArgMin(x, expr)` など。

## -ArgMax {#-argmax}

接尾辞 -ArgMin と同様ですが、指定された追加の式の最大値を持つ行のみを処理します。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
