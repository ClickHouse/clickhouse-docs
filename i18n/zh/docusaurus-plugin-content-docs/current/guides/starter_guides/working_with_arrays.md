---
title: '在 ClickHouse 中使用数组'
description: '在 ClickHouse 中使用数组的入门指南'
keywords: ['数组']
sidebar_label: '在 ClickHouse 中使用数组'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> 本指南将介绍如何在 ClickHouse 中使用数组，以及一些最常用的[数组函数](/sql-reference/functions/array-functions)。

## 数组简介 {#array-basics}

数组是一种内存中的数据结构，用于将多个值组合在一起。
这些值称为数组的*元素*，每个元素都可以通过索引来访问，该索引表示该元素在这一组中的位置。

在 ClickHouse 中，可以使用 [`array`](/sql-reference/data-types/array) 函数来创建数组：

```sql
array(T)
```

或者，也可以使用方括号：

```sql
[]
```

例如，可以创建一个数字数组：

```sql
SELECT array(1, 2, 3) AS numeric_array

┌─numeric_array─┐
│ [1,2,3]       │
└───────────────┘
```

或者一个字符串数组：

```sql
SELECT array('hello', 'world') AS string_array

┌─string_array──────┐
│ ['hello','world'] │
└───────────────────┘
```

或者是嵌套类型的数组，例如 [tuple](/sql-reference/data-types/tuple)：

```sql
SELECT array(tuple(1, 2), tuple(3, 4))

┌─[(1, 2), (3, 4)]─┐
│ [(1,2),(3,4)]    │
└──────────────────┘
```

你可能会想像这样创建一个包含不同类型的数组：

```sql
SELECT array('Hello', 'world', 1, 2, 3)
```

但是，数组元素始终应具有一个公共超类型，即在不丢失信息的情况下，可以同时表示两种或多种不同类型的值的最小数据类型，从而允许它们一起使用。
如果不存在公共超类型，在尝试构造该数组时将会抛出异常：

```sql
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

在动态创建数组时，ClickHouse 会选择能够容纳所有元素的最窄类型。
例如，如果你创建一个同时包含整数和浮点数的数组，则会选择浮点数的超类型：

```sql
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

<details>
  <summary>创建不同类型的数组</summary>

  你可以使用 `use_variant_as_common_type` 设置来更改上面描述的默认行为。
  这样可以在参数类型之间没有公共类型时，将 [Variant](/sql-reference/data-types/variant) 类型用作 `if`/`multiIf`/`array`/`map` 函数的结果类型。

  例如：

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

  然后你还可以通过类型名称从数组中读取对应类型的元素：

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

使用带方括号的索引提供了一种方便的方式来访问数组元素。
在 ClickHouse 中，需要注意数组索引始终从 **1** 开始。
这可能不同于你习惯使用的其他编程语言，在那些语言中数组通常是从 0 开始编号的。

例如，给定一个数组，可以这样选取该数组的第一个元素：

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[1];

┌─arrayElement⋯g_array, 1)─┐
│ hello                    │
└──────────────────────────┘
```

也可以使用负索引。
这样，你可以相对于最后一个元素来选择元素：

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[-1];

┌─arrayElement⋯g_array, -1)─┐
│ world                     │
└───────────────────────────┘
```

尽管数组的索引从 1 开始，你仍然可以访问下标为 0 的元素。
返回的值将是该数组元素类型的 *默认值*。
在下面的示例中，返回的是一个空字符串，因为这是字符串数据类型的默认值：

```sql
WITH ['hello', 'world', 'arrays are great aren\'t they?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```

## 数组函数 {#array-functions}

ClickHouse 提供了大量用于数组操作的实用函数。
本节中，我们将从最简单的函数开始，依次介绍一些最常用且逐步增加复杂度的函数。

### length、arrayEnumerate、indexOf、has* 函数 {#length-arrayEnumerate-indexOf-has-functions}

`length` 函数用于返回数组中的元素个数：

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT length(string_array);

┌─length(string_array)─┐
│                    3 │
└──────────────────────┘
```

你也可以使用 [`arrayEnumerate`](/sql-reference/functions/array-functions#arrayEnumerate) 函数返回由元素索引组成的数组：

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT arrayEnumerate(string_array);

┌─arrayEnumerate(string_array)─┐
│ [1,2,3]                      │
└──────────────────────────────┘
```

如果你想查找某个特定值的索引，可以使用 `indexOf` 函数：

```sql
SELECT indexOf([4, 2, 8, 8, 9], 8);

┌─indexOf([4, 2, 8, 8, 9], 8)─┐
│                           3 │
└─────────────────────────────┘
```

请注意，如果数组中存在多个相同的值，该函数会返回它遇到的第一个索引。
如果数组元素按升序排序，则可以使用 [`indexOfAssumeSorted`](/sql-reference/functions/array-functions#indexOfAssumeSorted) 函数。

函数 `has`、`hasAll` 和 `hasAny` 可用于判断数组是否包含给定的值。
请看以下示例：

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

## 使用数组函数探索航班数据 {#exploring-flight-data-with-array-functions}

到目前为止，我们的示例都相当简单。
在实际数据集上使用时，数组的实用性才能真正体现出来。

我们将使用 [ontime 数据集](/getting-started/example-datasets/ontime)，其中包含来自美国交通统计局的航班数据。
你可以在 [SQL playground](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K) 上找到该数据集。

我们选择这个数据集，是因为数组通常非常适合处理时序数据，并且可以帮助简化原本复杂的查询。

:::tip
单击下面的 “play” 按钮，在文档中直接运行查询并实时查看结果。
:::

### groupArray {#grouparray}

该数据集中有许多列，但我们将重点关注其中一部分。
运行下面的查询来查看我们的数据大致长什么样：

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
              d -> if(d >= 30, '延误', if(d >= 15, '预警', '准点')),
              groupArray(DepDelayMinutes)
    ) AS statuses
```

In the above query, the `arrayMap` function takes a single-element array `[DepDelayMinutes]` and applies the lambda function `d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'` to categorize it.
Then the first element of the resulting array is extracted with `[DepDelayMinutes][1]`.
The [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) function combines the `Tail_Number` array and the `statuses` array into a single array.

### arrayFilter {#arrayfilter}

Next we'll look only at the number of flights that were delayed by 30 minutes or more, for airports `DEN`, `ATL` and `DFW`:

````

在上述查询中,`arrayMap` 函数接收单元素数组 `[DepDelayMinutes]`,并应用 lambda 函数 `d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'` 对其进行分类。
然后通过 `[DepDelayMinutes][1]` 提取结果数组的第一个元素。
[`arrayZip`](/sql-reference/functions/array-functions#arrayZip) 函数将 `Tail_Number` 数组和 `statuses` 数组合并为单个数组。

### arrayFilter                {#arrayfilter}

接下来,我们将仅查看机场 `DEN`、`ATL` 和 `DFW` 中延误 30 分钟或更长时间的航班数量:

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
    '最多 ' || arrayJoin(delay) || ' 分钟' AS delayTime,
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
    '最多 ' || del || ' 分钟' AS delayTime,
    countIf(DepDelayMinutes >= del) flightsDelayed
FROM ontime.ontime
ARRAY JOIN delay AS del
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY ALL
ORDER BY flightsDelayed DESC
```

## 后续步骤 {#next-steps}

恭喜！您已经学会了如何在 ClickHouse 中使用数组，从基础的数组创建和索引操作，到 `groupArray`、`arrayFilter`、`arrayMap`、`arrayReduce` 和 `arrayJoin` 等强大函数。
如需继续深入学习，请查阅完整的数组函数参考文档，了解更多函数，例如 `arrayFlatten`、`arrayReverse` 和 `arrayDistinct`。
您也可以进一步学习相关的数据结构，例如与数组配合良好的 [`tuples`](/sql-reference/data-types/tuple#creating-tuples)、[JSON](/sql-reference/data-types/newjson) 和 [Map](/sql-reference/data-types/map) 类型。
练习将这些概念应用到您自己的数据集上，并在 SQL playground 或其他示例数据集上尝试不同的查询。

数组是 ClickHouse 中的一项基础功能，可以支撑高效的分析型查询；随着您对数组函数越来越熟悉，您会发现它们能够显著简化复杂的聚合和时序分析。
如果您还想继续探索数组相关内容，我们推荐观看下面由我们的数据专家 Mark 录制的 YouTube 视频：

<iframe width="560" height="315" src="https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>