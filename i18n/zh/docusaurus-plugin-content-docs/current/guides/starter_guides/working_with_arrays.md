---
title: '在 ClickHouse 中使用数组'
description: '在 ClickHouse 中使用数组的入门指南'
keywords: ['Arrays']
sidebar_label: '在 ClickHouse 中使用数组'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> 在本指南中，你将学习如何在 ClickHouse 中使用数组，以及一些最常用的[数组函数](/sql-reference/functions/array-functions)。



## 数组简介 {#array-basics}

数组是一种内存数据结构,用于将多个值组合在一起。
我们将这些值称为数组的_元素_,每个元素可以通过索引来引用,索引表示元素在该组合中的位置。

在 ClickHouse 中,可以使用 [`array`](/sql-reference/data-types/array) 函数来创建数组:

```sql
array(T)
```

或者,也可以使用方括号:

```sql
[]
```

例如,您可以创建一个数字数组:

```sql
SELECT array(1, 2, 3) AS numeric_array

┌─numeric_array─┐
│ [1,2,3]       │
└───────────────┘
```

或者创建一个字符串数组:

```sql
SELECT array('hello', 'world') AS string_array

┌─string_array──────┐
│ ['hello','world'] │
└───────────────────┘
```

或者创建嵌套类型的数组,例如 [元组](/sql-reference/data-types/tuple):

```sql
SELECT array(tuple(1, 2), tuple(3, 4))

┌─[(1, 2), (3, 4)]─┐
│ [(1,2),(3,4)]    │
└──────────────────┘
```

您可能会尝试创建一个包含不同类型的数组,如下所示:

```sql
SELECT array('Hello', 'world', 1, 2, 3)
```

然而,数组元素应始终具有一个公共超类型,即能够无损地表示两种或多种不同类型值的最小数据类型,从而允许它们一起使用。
如果不存在公共超类型,在尝试创建数组时将会收到异常:

```sql
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

在动态创建数组时,ClickHouse 会选择能够容纳所有元素的最窄类型。
例如,如果您创建一个包含整数和浮点数的数组,将选择浮点数作为超类型:

```sql
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

<details>
<summary>创建不同类型的数组</summary>

您可以使用 `use_variant_as_common_type` 设置来改变上述默认行为。
这允许您在参数类型没有公共类型时,将 [Variant](/sql-reference/data-types/variant) 类型用作 `if`/`multiIf`/`array`/`map` 函数的结果类型。

例如:

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

然后,您还可以按类型名称从数组中读取类型:

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

使用方括号中的索引提供了一种便捷的方式来访问数组元素。
在 ClickHouse 中,需要注意的是数组索引始终从 **1** 开始。
这可能与您习惯使用的其他编程语言不同,在那些语言中数组是从零开始索引的。


例如，假设有一个数组，你可以通过编写以下代码来选择数组的第一个元素：

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[1];

┌─arrayElement⋯g_array, 1)─┐
│ hello                    │
└──────────────────────────┘
```

也可以使用负索引。
通过这种方式，您可以基于最后一个元素来选择其他元素：

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[-1];

┌─arrayElement⋯g_array, -1)─┐
│ world                     │
└───────────────────────────┘
```

尽管数组是从 1 开始索引的，你仍然可以访问位置 0 的元素。
返回值将是该数组类型的 *默认值*。
在下面的示例中，返回的是空字符串，因为这是字符串数据类型的默认值：

```sql
WITH ['hello', 'world', '数组很好用,不是吗?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```


## 数组函数 {#array-functions}

ClickHouse 提供了大量用于操作数组的实用函数。
本节将介绍一些最常用的函数,从最简单的开始,逐步深入到更复杂的内容。

### length、arrayEnumerate、indexOf、has\* 函数 {#length-arrayEnumerate-indexOf-has-functions}

`length` 函数用于返回数组中的元素数量:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT length(string_array);

┌─length(string_array)─┐
│                    3 │
└──────────────────────┘
```

您还可以使用 [`arrayEnumerate`](/sql-reference/functions/array-functions#arrayEnumerate) 函数返回元素索引的数组:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT arrayEnumerate(string_array);

┌─arrayEnumerate(string_array)─┐
│ [1,2,3]                      │
└──────────────────────────────┘
```

如果要查找特定值的索引,可以使用 `indexOf` 函数:

```sql
SELECT indexOf([4, 2, 8, 8, 9], 8);

┌─indexOf([4, 2, 8, 8, 9], 8)─┐
│                           3 │
└─────────────────────────────┘
```

请注意,如果数组中存在多个相同的值,此函数将返回遇到的第一个索引。
如果数组元素按升序排序,则可以使用 [`indexOfAssumeSorted`](/sql-reference/functions/array-functions#indexOfAssumeSorted) 函数。

`has`、`hasAll` 和 `hasAny` 函数用于判断数组是否包含给定值。
请看以下示例:

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

到目前为止,示例都比较简单。
数组的实用性在应用于真实数据集时才能真正体现出来。

我们将使用 [ontime 数据集](/getting-started/example-datasets/ontime),该数据集包含来自美国交通统计局的航班数据。
您可以在 [SQL playground](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K) 上找到此数据集。

我们选择此数据集是因为数组通常非常适合处理时间序列数据,并且可以帮助简化原本复杂的查询。

:::tip
点击下方的"播放"按钮可以直接在文档中运行查询并实时查看结果。
:::

### groupArray {#grouparray}

此数据集中有许多列,但我们将重点关注其中的一部分列。
运行下面的查询以查看我们的数据:

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

让我们看看随机选择的某一天(比如 '2024-01-01')美国最繁忙的前 10 个机场。
我们想了解每个机场有多少航班起飞。
我们的数据每个航班占一行,但如果能按起飞机场对数据进行分组并将目的地汇总到一个数组中会更方便。

为了实现这一点,我们可以使用 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数,该函数从每一行中获取指定列的值并将它们分组到一个数组中。

运行下面的查询以查看它的工作原理:

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

上述查询中的 [`toStringCutToZero`](/sql-reference/functions/type-conversion-functions#tostringcuttozero) 用于删除某些机场 3 字母代码后出现的空字符。

有了这种格式的数据,我们可以通过查找汇总的 "Destinations" 数组的长度来轻松找到最繁忙机场的排序:

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

### arrayMap 和 arrayZip {#arraymap}

我们在前面的查询中看到,丹佛国际机场是我们选择的特定日期中出港航班最多的机场。
让我们看看这些航班中有多少是准点的、延误 15-30 分钟的或延误超过 30 分钟的。

ClickHouse 中的许多数组函数都是所谓的["高阶函数"](/sql-reference/functions/overview#higher-order-functions),并接受 lambda 函数作为第一个参数。
[`arrayMap`](/sql-reference/functions/array-functions#arrayMap) 函数就是这样一个高阶函数的例子,它通过对原始数组的每个元素应用 lambda 函数,从提供的数组返回一个新数组。

运行下面使用 `arrayMap` 函数的查询,以查看哪些航班延误或准点。
对于起飞/目的地对,它显示每个航班的机尾编号和状态:

```sql runnable
WITH arrayMap(
              d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME')),
              groupArray(DepDelayMinutes)
    ) AS statuses

```


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

````

在上述查询中,`arrayMap` 函数接收一个单元素数组 `[DepDelayMinutes]`,并应用 lambda 函数 `d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'` 对其进行分类。
然后通过 `[DepDelayMinutes][1]` 提取结果数组的第一个元素。
[`arrayZip`](/sql-reference/functions/array-functions#arrayZip) 函数将 `Tail_Number` 数组和 `statuses` 数组合并为一个数组。

### arrayFilter {#arrayfilter}

接下来,我们将只查看机场 `DEN`、`ATL` 和 `DFW` 中延误 30 分钟或更长时间的航班数量:

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

在上述查询中,我们将一个 lambda 函数作为第一个参数传递给 [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) 函数。
该 lambda 函数接收延误分钟数 (d),如果满足条件则返回 `1`,否则返回 `0`。

```sql
d -> d >= 30
```

### arraySort 和 arrayIntersect {#arraysort-and-arrayintersect}

接下来,我们将借助 [`arraySort`](/sql-reference/functions/array-functions#arraySort) 和 [`arrayIntersect`](/sql-reference/functions/array-functions#arrayIntersect) 函数来确定哪些美国主要机场对拥有最多的共同目的地。
`arraySort` 接收一个数组并默认按升序对元素进行排序,您也可以向其传递 lambda 函数来自定义排序顺序。
`arrayIntersect` 接收多个数组并返回一个包含所有数组中共有元素的数组。

运行以下查询以查看这两个数组函数的实际应用:

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
首先,它使用公共表表达式 (CTE) 创建一个名为 `airport_routes` 的临时数据集,该数据集查看 2024 年 1 月 1 日的所有航班,并为每个出发机场构建该机场所服务的所有唯一目的地的排序列表。
例如,在 `airport_routes` 结果集中,DEN 可能包含一个数组,其中列出了它飞往的所有城市,如 `['ATL', 'BOS', 'LAX', 'MIA', ...]` 等。

在第二阶段,查询选取五个美国主要枢纽机场(`DEN`、`ATL`、`DFW`、`ORD` 和 `LAS`)并比较它们之间的每一个可能的配对。
它通过交叉连接来实现这一点,交叉连接会创建这些机场的所有组合。
然后,对于每一对机场,它使用 `arrayIntersect` 函数来查找同时出现在两个机场列表中的目的地。
length 函数统计它们有多少个共同目的地。


条件 `a1.Origin < a2.Origin` 确保每对机场只出现一次。
如果没有这个条件,你会同时得到 JFK-LAX 和 LAX-JFK 两个独立的结果,这是冗余的,因为它们代表的是同一个比较。
最后,查询对结果进行排序,显示哪些机场对拥有最多的共同目的地,并只返回前 10 个结果。
这揭示了哪些主要枢纽拥有最多重叠的航线网络,这可能表明存在多家航空公司服务相同城市对的竞争市场,或者表明这些枢纽服务于相似的地理区域,可以作为旅客的替代中转点。

### arrayReduce {#arrayReduce}

在分析延误数据时,让我们使用另一个高阶数组函数 `arrayReduce`,来查找从丹佛国际机场出发的每条航线的平均延误和最大延误:

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

在上面的示例中,我们使用 `arrayReduce` 来查找从 `DEN` 出发的各个航班的平均延误和最大延误。
`arrayReduce` 将聚合函数(在函数的第一个参数中指定)应用于提供的数组元素(在函数的第二个参数中指定)。

### arrayJoin {#arrayJoin}

ClickHouse 中的常规函数具有返回与接收相同行数的特性。
然而,有一个有趣且独特的函数打破了这一规则,值得学习 - 即 `arrayJoin` 函数。

`arrayJoin` 通过"展开"数组,为每个元素创建单独的行。
这类似于其他数据库中的 `UNNEST` 或 `EXPLODE` SQL 函数。

与大多数返回数组或标量值的数组函数不同,`arrayJoin` 通过增加行数从根本上改变了结果集。

考虑下面的查询,它返回一个从 0 到 100、步长为 10 的值数组。
我们可以将该数组视为不同的延误时间:0 分钟、10 分钟、20 分钟,依此类推。

```sql runnable
WITH range(0, 100, 10) AS delay
SELECT delay
```

我们可以编写一个使用 `arrayJoin` 的查询,来计算两个机场之间延误达到指定分钟数的航班数量。
下面的查询创建了一个直方图,显示 2024 年 1 月 1 日从丹佛 (DEN) 到迈阿密 (MIA) 的航班延误分布,使用累积延误区间:

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

在上面的查询中,我们使用 CTE 子句(`WITH` 子句)返回一个延误数组。
`Destination` 将目的地代码转换为字符串。

我们使用 `arrayJoin` 将延误数组展开为单独的行。
`delay` 数组中的每个值都成为带有别名 `del` 的独立行,
我们得到 10 行:一行用于 `del=0`,一行用于 `del=10`,一行用于 `del=20`,依此类推。
对于每个延误阈值 (`del`),查询使用 `countIf(DepDelayMinutes >= del)` 计算延误大于或等于该阈值的航班数量。

`arrayJoin` 还有一个等效的 SQL 命令 `ARRAY JOIN`。
下面使用等效的 SQL 命令重现了上面的查询,以便进行比较:

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


## 下一步 {#next-steps}

恭喜!您已经学会了如何在 ClickHouse 中使用数组,从基本的数组创建和索引到强大的函数,如 `groupArray`、`arrayFilter`、`arrayMap`、`arrayReduce` 和 `arrayJoin`。
要继续您的学习之旅,请查阅完整的数组函数参考文档,了解更多函数,如 `arrayFlatten`、`arrayReverse` 和 `arrayDistinct`。
您可能还想了解相关的数据结构,例如 [`tuples`](/sql-reference/data-types/tuple#creating-tuples)、[JSON](/sql-reference/data-types/newjson) 和 [Map](/sql-reference/data-types/map) 类型,它们与数组配合使用效果很好。
建议将这些概念应用到您自己的数据集中进行实践,并在 SQL playground 或其他示例数据集上尝试不同的查询。

数组是 ClickHouse 中的一项基础功能,能够实现高效的分析查询——随着您对数组函数越来越熟悉,您会发现它们可以极大地简化复杂的聚合和时间序列分析。
要获得更多关于数组的精彩内容,我们推荐观看下面来自我们的常驻数据专家 Mark 的 YouTube 视频:

<iframe
  width='560'
  height='315'
  src='https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX'
  title='YouTube 视频播放器'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>
