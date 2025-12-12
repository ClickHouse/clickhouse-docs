---
title: 'ClickHouse で配列を扱う'
description: 'ClickHouse で配列を使うための入門ガイド'
keywords: ['配列']
sidebar_label: 'ClickHouse で配列を扱う'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> このガイドでは、ClickHouse での配列の使い方と、よく使用される[配列関数](/sql-reference/functions/array-functions)のいくつかについて学びます。

## 配列の概要 {#array-basics}

配列は、値をひとまとめにするインメモリのデータ構造です。
これらの値を配列の *要素* と呼び、各要素はインデックスで参照できます。インデックスは、配列内での要素の位置を示します。

ClickHouse では、[`array`](/sql-reference/data-types/array) 関数を使用して配列を作成できます。

```sql
array(T)
```

または、角かっこを使う方法もあります：

```sql
[]
```

例えば、数値の配列を作成できます。

```sql
SELECT array(1, 2, 3) AS numeric_array

┌─numeric_array─┐
│ [1,2,3]       │
└───────────────┘
```

あるいは文字列の配列：

```sql
SELECT array('hello', 'world') AS string_array

┌─string_array──────┐
│ ['hello','world'] │
└───────────────────┘
```

あるいは、[tuple](/sql-reference/data-types/tuple) のようなネストした型の配列：

```sql
SELECT array(tuple(1, 2), tuple(3, 4))

┌─[(1, 2), (3, 4)]─┐
│ [(1,2),(3,4)]    │
└──────────────────┘
```

次のように異なる型の要素を含む配列を作りたくなるかもしれません：

```sql
SELECT array('Hello', 'world', 1, 2, 3)
```

ただし、配列の要素は常に共通のスーパータイプを持つ必要があります。スーパータイプとは、2つ以上の異なる型の値を損失なく表現でき、それらをまとめて扱える最小のデータ型のことです。
共通のスーパータイプが存在しない場合、配列を作成しようとすると例外が発生します。

```sql
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

配列をその場で作成する場合、ClickHouse はすべての要素が収まる最も狭い型を選択します。
たとえば、整数と浮動小数点数からなる配列を作成すると、浮動小数点型のスーパータイプが選択されます。

```sql
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

<details>
  <summary>異なる型の配列を作成する</summary>

  上で説明したデフォルトの動作は、`use_variant_as_common_type` 設定を使って変更できます。
  これにより、引数の型に共通のデータ型がない場合でも、`if` / `multiIf` / `array` / `map` 関数の結果型として [Variant](/sql-reference/data-types/variant) 型を使用できるようになります。

  例:

  ```sql
SELECT
    [1, 'ClickHouse', ['Another', 'Array']] AS array,
    toTypeName(array)
SETTINGS use_variant_as_common_type = 1;
```

  ```response
┌─array────────────────────────────────┬─toTypeName(array)────────────────────────────┐
│ [1,'ClickHouse',['Another','Array']] │ Array(Variant(Array(String), String, UInt8)) │
└──────────────────────────────────────┴──────────────────────────────────────────────┘
```

  この設定により、配列から型名を指定して値を読み出すこともできます:

  ```sql
SELECT
    [1, 'ClickHouse', ['Another', 'Array']] AS array,
    array.UInt8,
    array.String,
    array.`Array(String)`
SETTINGS use_variant_as_common_type = 1;
```

  ```response
┌─array────────────────────────────────┬─array.UInt8───┬─array.String─────────────┬─array.Array(String)─────────┐
│ [1,'ClickHouse',['Another','Array']] │ [1,NULL,NULL] │ [NULL,'ClickHouse',NULL] │ [[],[],['Another','Array']] │
└──────────────────────────────────────┴───────────────┴──────────────────────────┴─────────────────────────────┘
```
</details>

角括弧を使ったインデックス指定は、配列要素にアクセスする便利な方法です。
ClickHouse では、配列インデックスが常に **1** から始まることを知っておくことが重要です。
これは、他の多くのプログラミング言語で配列が 0 始まり（ゼロインデックス）であることに慣れている場合とは異なる点です。

例えば、配列がある場合、次のように書くことでその先頭要素を取得できます。

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[1];

┌─arrayElement⋯g_array, 1)─┐
│ hello                    │
└──────────────────────────┘
```

負のインデックスを使用することもできます。
このように、末尾の要素を基準に要素を選択できます。

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[-1];

┌─arrayElement⋯g_array, -1)─┐
│ world                     │
└───────────────────────────┘
```

配列は 1 始まりのインデックスを持ちますが、インデックス 0 の要素にもアクセスできます。
返される値は、その配列型の *デフォルト値* になります。
以下の例では、文字列データ型のデフォルト値である空文字列が返されます。

```sql
WITH ['hello', 'world', 'arrays are great aren\'t they?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```

## 配列関数 {#array-functions}

ClickHouse には、配列に対して適用できる有用な関数が数多く用意されています。
このセクションでは、最も単純なものから始めて、徐々に複雑なものへと進みながら、特に有用な関数をいくつか見ていきます。

### length, arrayEnumerate, indexOf, has* 関数 {#length-arrayEnumerate-indexOf-has-functions}

`length` 関数は、配列内の要素数を返します。

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT length(string_array);

┌─length(string_array)─┐
│                    3 │
└──────────────────────┘
```

[`arrayEnumerate`](/sql-reference/functions/array-functions#arrayEnumerate) 関数を使用して、要素のインデックスからなる配列を返すこともできます：

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT arrayEnumerate(string_array);

┌─arrayEnumerate(string_array)─┐
│ [1,2,3]                      │
└──────────────────────────────┘
```

特定の値のインデックスを取得するには、`indexOf` 関数を使用します。

```sql
SELECT indexOf([4, 2, 8, 8, 9], 8);

┌─indexOf([4, 2, 8, 8, 9], 8)─┐
│                           3 │
└─────────────────────────────┘
```

この関数は、配列内に同一の値が複数存在する場合は、最初に見つかった要素のインデックスを返す点に注意してください。
配列要素が昇順にソートされている場合は、[`indexOfAssumeSorted`](/sql-reference/functions/array-functions#indexOfAssumeSorted) 関数を使用できます。

関数 `has`、`hasAll`、`hasAny` は、配列が指定した値を含んでいるかどうかを判定するのに有用です。
次の例を考えてみましょう。

```sql
WITH ['Airbus A380', 'Airbus A350', 'Airbus A220', 'Boeing 737', 'Boeing 747-400'] AS airplanes
SELECT
    has(airplanes, 'Airbus A350') AS has_true,
    has(airplanes, 'Lockheed Martin F-22 Raptor') AS has_false,
    hasAny(airplanes, ['Boeing 737', 'Eurofighter Typhoon']) AS hasAny_true,
    hasAny(airplanes, ['Lockheed Martin F-22 Raptor', 'Eurofighter Typhoon']) AS hasAny_false,
    hasAll(airplanes, ['Boeing 737', 'Boeing 747-400']) AS hasAll_true,
    hasAll(airplanes, ['Boeing 737', 'Eurofighter Typhoon']) AS hasAll_false
FORMAT Vertical;
```

```response
has_true:     1
has_false:    0
hasAny_true:  1
hasAny_false: 0
hasAll_true:  1
hasAll_false: 0
```

## 配列関数を使ったフライトデータの探索 {#exploring-flight-data-with-array-functions}

ここまでの例は比較的シンプルなものでした。
配列の有用性は、実際のデータセットに対して使用したときに真価を発揮します。

ここでは、米国運輸統計局のフライトデータを含む [ontime dataset](/getting-started/example-datasets/ontime) を使用します。
このデータセットは [SQL playground](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K) 上で確認できます。

このデータセットを選んだのは、配列が時系列データの処理に適していることが多く、
複雑になりがちなクエリを簡潔にできるためです。

:::tip
下の「play」ボタンをクリックすると、ドキュメント内でクエリをそのまま実行し、その場で結果を確認できます。
:::

### groupArray {#grouparray}

このデータセットには多くのカラムがありますが、ここではその一部に注目します。
次のクエリを実行して、データの内容を確認してみましょう:

```sql runnable
-- SELECT
-- *
-- FROM ontime.ontime LIMIT 100

SELECT
    FlightDate,
    Origin,
    OriginCityName,
    Dest,
    DestCityName,
    DepTime,
    DepDelayMinutes,
    ArrTime,
    ArrDelayMinutes
FROM ontime.ontime LIMIT 5
```

Let's take a look at the top 10 busiest airports in the US on a particular day chosen at random, say '2024-01-01'.
We're interested in understanding how many flights depart from each airport.
Our data contains one row per flight, but it would be convenient if we could group the data by the origin airport and roll the destinations into an array.

To achieve this we can use the [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) aggregate function, which takes values of the specified column from each row and groups them in an array.

Run the query below to see how it works:

```sql runnable
SELECT
    FlightDate,
    Origin,
    groupArray(toStringCutToZero(Dest)) AS Destinations
FROM ontime.ontime
WHERE Origin IN ('ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'LAS', 'CLT', 'SFO', 'SEA') AND FlightDate='2024-01-01'
GROUP BY FlightDate, Origin
ORDER BY length(Destinations)
```

The [`toStringCutToZero`](/sql-reference/functions/type-conversion-functions#tostringcuttozero) in the query above is used to remove null characters which appear after some of the airport's 3 letter designation.

With the data in this format, we can easily find the order of the busiest airports by finding the length of the rolled up "Destinations" arrays:

```sql runnable
WITH
    '2024-01-01' AS date,
    busy_airports AS (
    SELECT
    FlightDate,
    Origin,
--highlight-next-line
    groupArray(toStringCutToZero(Dest)) AS Destinations
    FROM ontime.ontime
    WHERE Origin IN ('ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'LAS', 'CLT', 'SFO', 'SEA')
    AND FlightDate = date
    GROUP BY FlightDate, Origin
    ORDER BY length(Destinations)
    )
SELECT
    Origin,
    length(Destinations) AS outward_flights
FROM busy_airports
ORDER BY outward_flights DESC
```

### arrayMap and arrayZip {#arraymap}

We saw in the previous query that Denver International Airport was the airport with the most outward flights for our particular chosen day.
Let's take a look at how many of those flights were on-time, delayed by 15-30 minutes or delayed by more than 30 minutes.

Many of the array functions in ClickHouse are so-called ["higher-order functions"](/sql-reference/functions/overview#higher-order-functions) and accept a lambda function as the first parameter.
The [`arrayMap`](/sql-reference/functions/array-functions#arrayMap) function is an example of one such higher-order function and returns a new array from the provided array by applying a lambda function to each element of the original array.

Run the query below which uses the `arrayMap` function to see which flights were delayed or on-time.
For pairs of origin/destinations, it shows the tail number and status for every flight:

```sql runnable
WITH arrayMap(
              d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME')),
              groupArray(DepDelayMinutes)
    ) AS statuses
```

In the above query, the `arrayMap` function takes a single-element array `[DepDelayMinutes]` and applies the lambda function `d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'` to categorize it.
Then the first element of the resulting array is extracted with `[DepDelayMinutes][1]`.
The [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) function combines the `Tail_Number` array and the `statuses` array into a single array.

### arrayFilter {#arrayfilter}

Next we'll look only at the number of flights that were delayed by 30 minutes or more, for airports `DEN`, `ATL` and `DFW`:

````

上記のクエリでは、`arrayMap`関数が単一要素の配列`[DepDelayMinutes]`を受け取り、ラムダ関数`d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'`を適用して分類を行います。
次に、結果の配列の最初の要素が`[DepDelayMinutes][1]`で抽出されます。
[`arrayZip`](/sql-reference/functions/array-functions#arrayZip)関数は、`Tail_Number`配列と`statuses`配列を単一の配列に結合します。

### arrayFilter                {#arrayfilter}

次に、空港`DEN`、`ATL`、`DFW`について、30分以上遅延したフライトの数のみを確認します:

```sql runnable
SELECT
    Origin,
    OriginCityName,
--highlight-next-line
    length(arrayFilter(d -> d >= 30, groupArray(ArrDelayMinutes))) AS num_delays_30_min_or_more
FROM ontime.ontime
WHERE Origin IN ('DEN', 'ATL', 'DFW')
    AND FlightDate = '2024-01-01'
GROUP BY Origin, OriginCityName
ORDER BY num_delays_30_min_or_more DESC
````

In the query above we pass a lambda function as the first argument to the [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) function.
This lambda function itself takes the delay in minutes (d) and returns `1` if the condition is met, else `0`.

```sql
d -> d >= 30
```

### arraySort and arrayIntersect {#arraysort-and-arrayintersect}

Next, we'll figure out which pairs of major US airports serve the most common destinations with the help of the [`arraySort`](/sql-reference/functions/array-functions#arraySort) and [`arrayIntersect`](/sql-reference/functions/array-functions#arrayIntersect) functions.
`arraySort` takes an array and sorts the elements in ascending order by default, although you can also pass a lambda function to it to define the sorting order.
`arrayIntersect` takes multiple arrays and returns an array which contains elements present in all the arrays.

Run the query below to see these two array functions in action:

```sql runnable
WITH airport_routes AS (
    SELECT 
        Origin,
--highlight-next-line
        arraySort(groupArray(DISTINCT toStringCutToZero(Dest))) AS destinations
    FROM ontime.ontime
    WHERE FlightDate = '2024-01-01'
    GROUP BY Origin
)
SELECT 
    a1.Origin AS airport1,
    a2.Origin AS airport2,
--highlight-next-line
    length(arrayIntersect(a1.destinations, a2.destinations)) AS common_destinations
FROM airport_routes a1
CROSS JOIN airport_routes a2
WHERE a1.Origin < a2.Origin
    AND a1.Origin IN ('DEN', 'ATL', 'DFW', 'ORD', 'LAS')
    AND a2.Origin IN ('DEN', 'ATL', 'DFW', 'ORD', 'LAS')
ORDER BY common_destinations DESC
LIMIT 10
```

The query works in two main stages.
First, it creates a temporary dataset called `airport_routes` using a Common Table Expression (CTE) that looks at all flights on January 1, 2024, and for each origin airport, builds a sorted list of every unique destination which that airport serves.
In the `airport_routes` result set, for example, DEN might have an array containing all the cities it flies to, like `['ATL', 'BOS', 'LAX', 'MIA', ...]` and so on.

In the second stage, the query takes five major US hub airports (`DEN`, `ATL`, `DFW`, `ORD`, and `LAS`) and compares every possible pair of them.
It does this using a cross join, which creates all combinations of these airports.
Then, for each pair, it uses the `arrayIntersect` function to find which destinations appear in both airports' lists.
The length function counts how many destinations they have in common.

The condition `a1.Origin < a2.Origin`, ensures that each pair only appears once.
Without this, you'd get both JFK-LAX and LAX-JFK as separate results, which would be redundant since they represent the same comparison.
Finally, the query sorts the results to show which airport pairs have the highest number of shared destinations and returns just the top 10.
This reveals which major hubs have the most overlapping route networks, which could indicate competitive markets where multiple airlines are serving the same city pairs, or hubs that serve similar geographic regions and could potentially be used as alternative connection points for travelers.

### arrayReduce {#arrayReduce}

While we're looking at delays, let's use yet another higher-order array function, `arrayReduce`, to find the average and maximum delay
for each route from Denver International Airport:

```sql runnable
SELECT
    Origin,
    toStringCutToZero(Dest) AS Destination,
    groupArray(DepDelayMinutes) AS delays,
--highlight-start
    round(arrayReduce('avg', groupArray(DepDelayMinutes)), 2) AS avg_delay,
    round(arrayReduce('max', groupArray(DepDelayMinutes)), 2) AS worst_delay
--highlight-end
FROM ontime.ontime
WHERE Origin = 'DEN'
    AND FlightDate = '2024-01-01'
    AND DepDelayMinutes IS NOT NULL
GROUP BY Origin, Destination
ORDER BY avg_delay DESC
```

In the example above, we used `arrayReduce` to find the average and maximum delays for various outward flights from `DEN`.
`arrayReduce` applies an aggregate function, specified in the first parameter to the function, to the elements of the provided array, specified in the second parameter of the function.

### arrayJoin {#arrayJoin}

Regular functions in ClickHouse have the property that they return the same number of rows than they receive.
There is however, one interesting and unique function that breaks this rule, which is worth learning about - the `arrayJoin` function.

`arrayJoin` "explodes" an array by taking it and creating a separate row for each element.
This is similar to the `UNNEST` or `EXPLODE` SQL functions in other databases.

Unlike most array functions that return arrays or scalar values, `arrayJoin` fundamentally changes the result set by multiplying the number of rows.

Consider the query below which returns an array of values from 0 to 100 in steps of 10.
We could consider the array to be different delay times: 0 minutes, 10 minutes, 20 minutes, and so on.

```sql runnable
WITH range(0, 100, 10) AS delay
SELECT delay
```

We can write a query using `arrayJoin` to work out how many delays there were of up to that number of minutes between two airports.
The query below creates a histogram showing the distribution of flight delays from Denver (DEN) to Miami (MIA) on January 1, 2024, using cumulative delay buckets:

```sql runnable
WITH range(0, 100, 10) AS delay,
    toStringCutToZero(Dest) AS Destination

SELECT
    'Up to ' || arrayJoin(delay) || ' minutes' AS delayTime,
    countIf(DepDelayMinutes >= arrayJoin(delay)) AS flightsDelayed
FROM ontime.ontime
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY delayTime
ORDER BY flightsDelayed DESC
```

In the query above we return an array of delays using a CTE clause (`WITH` clause).
`Destination` converts the destination code to a string.

We use `arrayJoin` to explode the delay array into separate rows.
Each value from the `delay` array becomes its own row with alias `del`,
and we get 10 rows: one for `del=0`, one for `del=10`, one for `del=20`, etc.
For each delay threshold (`del`), the query counts how many flights had delays greater than or equal to that threshold
using `countIf(DepDelayMinutes >= del)`.

`arrayJoin` also has a SQL command equivalent `ARRAY JOIN`.
The query above is reproduced below with the SQL command equivalent for comparison:

```sql runnable
WITH range(0, 100, 10) AS delay, 
     toStringCutToZero(Dest) AS Destination

SELECT    
    del || '分まで' AS delayTime,
    countIf(DepDelayMinutes >= del) flightsDelayed
FROM ontime.ontime
ARRAY JOIN delay AS del
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY ALL
ORDER BY flightsDelayed DESC
```

## 次のステップ {#next-steps}

おめでとうございます！このガイドを通じて、ClickHouse における配列について、基本的な配列の作成とインデックス付けから、`groupArray`、`arrayFilter`、`arrayMap`、`arrayReduce`、`arrayJoin` といった強力な関数まで一通り学びました。
学習をさらに進めるには、配列関数の完全なリファレンスを参照し、`arrayFlatten`、`arrayReverse`、`arrayDistinct` などの追加の関数も確認してください。
[`tuples`](/sql-reference/data-types/tuple#creating-tuples)、[JSON](/sql-reference/data-types/newjson)、[Map](/sql-reference/data-types/map) 型など、配列と相性の良い関連データ構造について学ぶのもよいでしょう。
これらのコンセプトを自身のデータセットに適用して練習し、SQL Playground やその他のサンプルデータセット上でさまざまなクエリを試してみてください。

配列は ClickHouse における基本機能であり、効率的な分析クエリを可能にする重要な機能です。配列関数に慣れてくると、複雑な集計処理や時系列分析を劇的に簡素化できることがわかるはずです。
配列をさらに深く学びたい場合は、当社のデータ専門家 Mark による、以下の YouTube 動画をおすすめします。

<iframe width="560" height="315" src="https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>