---
title: '在 ClickHouse 中使用数组'
description: '在 ClickHouse 中使用数组的入门指南'
keywords: ['数组']
sidebar_label: '在 ClickHouse 中使用数组'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> 本指南将介绍如何在 ClickHouse 中使用数组，以及一些最常用的[数组函数](/sql-reference/functions/array-functions)。

## 数组简介 \{#array-basics\}

数组是一种内存中的数据结构，用于将多个值组合在一起。
这些值称为数组的*元素*，每个元素都可以通过索引来访问，该索引表示该元素在这一组中的位置。

在 ClickHouse 中，可以使用 [`array`](/sql-reference/data-types/array) 函数来创建数组：

```sql
array(T)
```

或者,也可以使用方括号:

```sql
[]
```

例如,可以创建一个数字数组:

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

或者是嵌套类型的数组,例如 [tuple](/sql-reference/data-types/tuple):

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

但是,数组元素始终应具有一个公共超类型,即在不丢失信息的情况下,可以同时表示两种或多种不同类型的值的最小数据类型,从而允许它们一起使用。
如果不存在公共超类型,在尝试构造该数组时将会抛出异常:

```sql
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

在动态创建数组时,ClickHouse 会选择能够容纳所有元素的最窄类型。
例如,如果你创建一个同时包含整数和浮点数的数组,则会选择浮点数的超类型:

```sql
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

<details>
  <summary>创建不同类型的数组</summary>

  你可以使用 `use_variant_as_common_type` 设置来更改上文描述的默认行为。
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

  然后你还可以按类型名称从数组中读取各类型的元素：

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
在 ClickHouse 中,需要注意数组索引始终从 **1** 开始。
这可能不同于你习惯使用的其他编程语言,在那些语言中数组通常是从 0 开始编号的。

例如，给定一个数组，可以通过以下方式选择数组的第一个元素：

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


## 数组函数 \{#array-functions\}

ClickHouse 提供了大量用于数组操作的实用函数。
本节中，我们将从最简单的函数开始，依次介绍一些最常用且逐步增加复杂度的函数。

### length、arrayEnumerate、indexOf、has* 函数 \{#length-arrayEnumerate-indexOf-has-functions\}

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


## 使用数组函数探索航班数据 \{#exploring-flight-data-with-array-functions\}

到目前为止，我们的示例都相当简单。
在实际数据集上使用时，数组的实用性才能真正体现出来。

我们将使用 [ontime 数据集](/getting-started/example-datasets/ontime)，其中包含来自美国交通统计局的航班数据。
你可以在 [SQL playground](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K) 上找到该数据集。

我们选择这个数据集，是因为数组通常非常适合处理时序数据，并且可以帮助简化原本复杂的查询。

:::tip
单击下面的 “play” 按钮，在文档中直接运行查询并实时查看结果。
:::

### groupArray \{#grouparray\}

该数据集中有许多列，但我们将重点关注其中一部分。
运行下面的查询来查看我们的数据是什么样的：

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

我们来看看在某个随机选取的日期（例如 &#39;2024-01-01&#39;）美国最繁忙的前 10 个机场。
我们希望了解从每个机场出发的航班数量。
我们的数据是每行对应一个航班，但如果能按始发机场对数据进行分组，并将所有目的地汇总到一个数组中会更加方便。

为此，我们可以使用 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数，它会从每一行中获取指定列的值，并将它们收集到一个数组中。

运行下面的查询来看看它是如何工作的：

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

上面的查询中使用了 [`toStringCutToZero`](/sql-reference/functions/type-conversion-functions#toStringCutToZero)，用于移除出现在部分机场三字代码后面的 null 字符。

在这种数据格式下，我们可以通过计算汇总后的 “Destinations” 数组长度，轻松确定各个最繁忙机场的先后顺序：

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


### arrayMap 和 arrayZip \{#arraymap\}

在前一个查询中，我们看到丹佛国际机场是在我们选定的那一天中出港航班数量最多的机场。
现在来看一下，这些航班中有多少是准点的，有多少延误了 15–30 分钟，以及有多少延误了超过 30 分钟。

ClickHouse 中的许多数组函数是所谓的[“高阶函数”](/sql-reference/functions/overview#higher-order-functions)，它们将 lambda 函数作为第一个参数。
[`arrayMap`](/sql-reference/functions/array-functions#arrayMap) 函数就是此类高阶函数的一个示例，它通过对原始数组的每个元素应用一个 lambda 函数，在给定数组的基础上返回一个新的数组。

运行下面使用 `arrayMap` 函数的查询，以查看哪些航班是延误的，哪些是准点的。
对于每一对出发/到达机场组合，它都会显示每个航班的机尾编号和状态：

```sql runnable
WITH arrayMap(
              d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME')),
              groupArray(DepDelayMinutes)
    ) AS statuses

SELECT
    Origin,
    toStringCutToZero(Dest) AS Destination,
    arrayZip(groupArray(Tail_Number), statuses) as tailNumberStatuses
FROM ontime.ontime
WHERE Origin = 'DEN'
  AND FlightDate = '2024-01-01'
  AND DepTime IS NOT NULL
  AND DepDelayMinutes IS NOT NULL
GROUP BY ALL
```

在上面的查询中，`arrayMap` 函数接收一个仅包含单个元素的数组 `[DepDelayMinutes]`，并应用 lambda 函数 `d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'` 对其进行分类。
然后通过 `[DepDelayMinutes][1]` 取出结果数组的第一个元素。
[`arrayZip`](/sql-reference/functions/array-functions#arrayZip) 函数会将 `Tail_Number` 数组和 `statuses` 数组合并成一个数组。


### arrayFilter \{#arrayfilter\}

接下来，我们只查看机场 `DEN`、`ATL` 和 `DFW` 中延误 30 分钟及以上的航班数量：

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
```

在上面的查询中，我们将一个 lambda 函数作为第一个参数传递给 [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) 函数。
该 lambda 函数接收以分钟为单位的延迟时间 `d`，如果条件满足则返回 `1`，否则返回 `0`。

```sql
d -> d >= 30
```


### arraySort 和 arrayIntersect \{#arraysort-and-arrayintersect\}

接下来，我们将借助 [`arraySort`](/sql-reference/functions/array-functions#arraySort) 和 [`arrayIntersect`](/sql-reference/functions/array-functions#arrayIntersect) 函数，找出哪些美国主要机场组合拥有最多共同目的地。
`arraySort` 接收一个数组，默认按升序对元素进行排序，你也可以向其传入一个 lambda 函数来自定义排序顺序。
`arrayIntersect` 接收多个数组，并返回一个数组，其中包含所有这些数组中都存在的元素。

运行下面的查询，查看这两个数组函数的实际效果：

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

该查询分两个主要阶段执行。
首先，它使用一个公共表表达式（CTE）创建一个名为 `airport_routes` 的临时数据集，从中筛选出 2024 年 1 月 1 日的所有航班，并针对每个始发机场构建一个排好序的、由该机场服务的所有唯一目的地组成的列表。
例如，在 `airport_routes` 结果集中，DEN 可能有一个包含其飞往所有城市的数组，如 `['ATL', 'BOS', 'LAX', 'MIA', ...]` 等。

在第二个阶段中，查询取出五个主要的美国枢纽机场（`DEN`、`ATL`、`DFW`、`ORD` 和 `LAS`），并比较它们之间的所有可能组合。
它通过使用交叉连接（cross join）实现这一点，该操作会生成这些机场的所有组合。
然后，对每一对机场，使用 `arrayIntersect` 函数找出在两个机场目的地列表中都出现的目的地。
`length` 函数则统计它们共有多少个相同的目的地。

条件 `a1.Origin < a2.Origin` 确保每一对机场只出现一次。
如果没有这个条件，你会得到 JFK-LAX 和 LAX-JFK 这两条单独的结果，而这实际上是同一组对比，属于冗余。
最后，查询对结果进行排序，以显示哪些机场对拥有最多的共同目的地，并仅返回前 10 名。
这揭示了哪些主要枢纽机场的航线网络重叠最多，这可能表明多个航空公司在同一城市对之间展开竞争，或者这些枢纽服务于类似的地理区域，因此潜在地可以作为旅客的替代中转点。


### arrayReduce \{#arrayReduce\}

在继续研究延误数据的同时，让我们使用另一个高阶数组函数 `arrayReduce`，来计算从丹佛国际机场出发的每条航线的平均和最大延误时间：

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

在上面的示例中，我们使用 `arrayReduce` 来计算从 `DEN` 出发的各个航班的平均和最大延误时间。
`arrayReduce` 会将一个聚合函数（在第一个参数中指定）应用到提供的数组（在第二个参数中指定）的各个元素上。


### arrayJoin \{#arrayJoin\}

ClickHouse 中的一般函数都有一个特性：返回的行数与输入的行数相同。
不过，有一个有趣且独特的函数打破了这一规则，值得单独了解 —— `arrayJoin` 函数。

`arrayJoin` 通过“展开”数组，为数组中的每个元素各生成一行。
这类似于其他数据库中的 `UNNEST` 或 `EXPLODE` SQL 函数。

与大多数返回数组或标量值的数组函数不同，`arrayJoin` 会从根本上改变结果集，将行数成倍放大。

考虑下面的查询，它返回一个从 0 到 100、步长为 10 的值数组。
我们可以将该数组视为不同的延误时间：0 分钟、10 分钟、20 分钟，等等。

```sql runnable
WITH range(0, 100, 10) AS delay
SELECT delay
```

我们可以使用 `arrayJoin` 编写查询，计算两个机场之间在各个给定分钟阈值以内的航班延误次数。
下面的查询使用累积延误桶，创建了一个直方图，展示 2024 年 1 月 1 日从丹佛（DEN）到迈阿密（MIA）航班延误时长的分布情况：

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

在上面的查询中，我们使用一个 CTE（`WITH`）子句返回一个包含延迟时间的数组。
`Destination` 会将目的地代码转换为字符串。

我们使用 `arrayJoin` 将延迟数组展开为多行。
`delay` 数组中的每个值都会变成一行，并使用别名 `del`，
因此得到 10 行：一行是 `del=0`，一行是 `del=10`，一行是 `del=20`，等等。
对于每个延迟阈值（`del`），查询会使用 `countIf(DepDelayMinutes >= del)` 统计延迟时间大于等于该阈值的航班数量。

`arrayJoin` 在 SQL 中也有等价命令 `ARRAY JOIN`。
上面的查询在下方使用等价的 SQL 命令进行了重现，以便对比：

```sql runnable
WITH range(0, 100, 10) AS delay, 
     toStringCutToZero(Dest) AS Destination

SELECT    
    'Up to ' || del || ' minutes' AS delayTime,
    countIf(DepDelayMinutes >= del) flightsDelayed
FROM ontime.ontime
ARRAY JOIN delay AS del
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY ALL
ORDER BY flightsDelayed DESC
```


## 后续步骤 \{#next-steps\}

恭喜！您已经学会了如何在 ClickHouse 中使用数组，从基础的数组创建和索引操作，到 `groupArray`、`arrayFilter`、`arrayMap`、`arrayReduce` 和 `arrayJoin` 等强大函数。
如需继续深入学习，请查阅完整的数组函数参考文档，了解更多函数，例如 `arrayFlatten`、`arrayReverse` 和 `arrayDistinct`。
您也可以进一步学习相关的数据结构，例如与数组配合良好的 [`tuples`](/sql-reference/data-types/tuple#creating-tuples)、[JSON](/sql-reference/data-types/newjson) 和 [Map](/sql-reference/data-types/map) 类型。
练习将这些概念应用到您自己的数据集上，并在 SQL playground 或其他示例数据集上尝试不同的查询。

数组是 ClickHouse 中的一项基础功能，可以支撑高效的分析型查询；随着您对数组函数越来越熟悉，您会发现它们能够显著简化复杂的聚合和时序分析。
如果您还想继续探索数组相关内容，我们推荐观看下面由我们的数据专家 Mark 录制的 YouTube 视频：

<iframe width="560" height="315" src="https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>