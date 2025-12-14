---
title: 'Работа с массивами в ClickHouse'
description: 'Вводное руководство по работе с массивами в ClickHouse'
keywords: ['Массивы']
sidebar_label: 'Работа с массивами в ClickHouse'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> В этом руководстве вы узнаете, как использовать массивы в ClickHouse, а также познакомитесь с некоторыми наиболее часто используемыми [функциями работы с массивами](/sql-reference/functions/array-functions).

## Введение в массивы {#array-basics}

Массив — это хранящаяся в памяти структура данных, которая группирует значения.
Мы называем эти значения *элементами* массива, и к каждому элементу можно обратиться по индексу, который указывает положение элемента в этой группе.

Массивы в ClickHouse могут быть созданы с помощью функции [`array`](/sql-reference/data-types/array):

```sql
array(T)
```

Либо с использованием квадратных скобок:

```sql
[]
```

Например, вы можете создать массив чисел:

```sql
SELECT array(1, 2, 3) AS numeric_array

┌─numeric_array─┐
│ [1,2,3]       │
└───────────────┘
```

Или массив строк:

```sql
SELECT array('hello', 'world') AS string_array

┌─string_array──────┐
│ ['hello','world'] │
└───────────────────┘
```

Или массив вложенных типов, например [кортежей](/sql-reference/data-types/tuple):

```sql
SELECT array(tuple(1, 2), tuple(3, 4))

┌─[(1, 2), (3, 4)]─┐
│ [(1,2),(3,4)]    │
└──────────────────┘
```

Может возникнуть соблазн создать массив значений разных типов, например так:

```sql
SELECT array('Hello', 'world', 1, 2, 3)
```

Однако элементы массива всегда должны иметь общий супертип — наименьший тип данных, способный без потерь представлять значения из двух или более различных типов и тем самым позволяющий использовать их совместно.
Если общего супертипа нет, вы получите исключение при попытке сформировать массив:

```sql
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

При создании массивов на лету ClickHouse выбирает самый узкий тип, который подходит для всех элементов.
Например, если вы создаёте массив из целых и вещественных чисел, выбирается надтип вещественного числа:

```sql
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

<details>
  <summary>Создание массивов с элементами разных типов</summary>

  Вы можете использовать настройку `use_variant_as_common_type`, чтобы изменить описанное выше поведение по умолчанию.
  Это позволяет использовать тип [Variant](/sql-reference/data-types/variant) в качестве результирующего типа для функций `if`/`multiIf`/`array`/`map`, когда для типов аргументов нет общего типа.

  Например:

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

  Кроме того, вы можете получать значения из массива по имени типа:

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

Использование индекса в квадратных скобках — удобный способ обращаться к элементам массива.
В ClickHouse важно учитывать, что индексация массивов всегда начинается с **1**.
Это может отличаться от других языков программирования, к которым вы привыкли, где массивы индексируются с нуля.

Например, для заданного массива можно выбрать его первый элемент, написав:

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[1];

┌─arrayElement⋯g_array, 1)─┐
│ hello                    │
└──────────────────────────┘
```

Можно также использовать отрицательные индексы.
Таким образом, можно выбирать элементы относительно последнего элемента:

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[-1];

┌─arrayElement⋯g_array, -1)─┐
│ world                     │
└───────────────────────────┘
```

Несмотря на то, что массивы индексируются с 1, вы всё равно можете обращаться к элементу с индексом 0.
Возвращаемым значением будет *значение по умолчанию* для типа элементов массива.
В примере ниже возвращается пустая строка, так как это значение по умолчанию для строкового типа данных:

```sql
WITH ['hello', 'world', 'arrays are great aren\'t they?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```

## Функции для работы с массивами {#array-functions}

ClickHouse предоставляет множество полезных функций для работы с массивами.
В этом разделе мы рассмотрим некоторые из наиболее полезных, начиная с самых простых и переходя к более сложным.

### length, arrayEnumerate, indexOf, функции has* {#length-arrayEnumerate-indexOf-has-functions}

Функция `length` возвращает количество элементов в массиве:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT length(string_array);

┌─length(string_array)─┐
│                    3 │
└──────────────────────┘
```

Вы также можете использовать функцию [`arrayEnumerate`](/sql-reference/functions/array-functions#arrayEnumerate), чтобы получить массив индексов элементов массива:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT arrayEnumerate(string_array);

┌─arrayEnumerate(string_array)─┐
│ [1,2,3]                      │
└──────────────────────────────┘
```

Если вам нужно найти индекс конкретного значения, вы можете использовать функцию `indexOf`:

```sql
SELECT indexOf([4, 2, 8, 8, 9], 8);

┌─indexOf([4, 2, 8, 8, 9], 8)─┐
│                           3 │
└─────────────────────────────┘
```

Обратите внимание, что эта функция вернет первый индекс, соответствующий этому значению, если в массиве есть несколько одинаковых значений.
Если элементы массива отсортированы по возрастанию, можно использовать функцию [`indexOfAssumeSorted`](/sql-reference/functions/array-functions#indexOfAssumeSorted).

Функции `has`, `hasAll` и `hasAny` полезны для определения того, содержит ли массив заданное значение.
Рассмотрите следующий пример:

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

## Исследование данных о перелётах с помощью массивов {#exploring-flight-data-with-array-functions}

До сих пор примеры были довольно простыми.
Преимущества массивов особенно заметны при работе с реальным набором данных.

Мы будем использовать [набор данных ontime](/getting-started/example-datasets/ontime), который содержит данные о рейсах из Бюро транспортной статистики.
Этот набор данных можно найти в [SQL playground](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K).

Мы выбрали этот набор данных, поскольку массивы часто хорошо подходят для работы с временными рядами и помогают упростить
в противном случае сложные запросы.

:::tip
Нажмите кнопку «Play» ниже, чтобы выполнить запросы прямо в документации и увидеть результат в реальном времени.
:::

### groupArray {#grouparray}

В этом наборе данных много столбцов, но мы сосредоточимся на их подмножестве.
Выполните приведённый ниже запрос, чтобы увидеть, как выглядят наши данные:

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

Функция [`toStringCutToZero`](/sql-reference/functions/type-conversion-functions#toStringCutToZero) в приведённом выше запросе используется для удаления нулевых символов, которые появляются после некоторых трёхбуквенных кодов аэропортов.

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
              d -> if(d >= 30, 'ЗАДЕРЖКА', if(d >= 15, 'ПРЕДУПРЕЖДЕНИЕ', 'ВОВРЕМЯ')),
              groupArray(DepDelayMinutes)
    ) AS statuses
```

In the above query, the `arrayMap` function takes a single-element array `[DepDelayMinutes]` and applies the lambda function `d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'` to categorize it.
Then the first element of the resulting array is extracted with `[DepDelayMinutes][1]`.
The [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) function combines the `Tail_Number` array and the `statuses` array into a single array.

### arrayFilter {#arrayfilter}

Next we'll look only at the number of flights that were delayed by 30 minutes or more, for airports `DEN`, `ATL` and `DFW`:

```

В приведённом выше запросе функция `arrayMap` принимает одноэлементный массив `[DepDelayMinutes]` и применяет лямбда-функцию `d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'` для его категоризации.
Затем первый элемент полученного массива извлекается с помощью `[DepDelayMinutes][1]`.
Функция [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) объединяет массивы `Tail_Number` и `statuses` в единый массив.

### arrayFilter                {#arrayfilter}

Далее рассмотрим только количество рейсов с задержкой 30 минут и более для аэропортов `DEN`, `ATL` и `DFW`:

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
    'До ' || arrayJoin(delay) || ' минут' AS delayTime,
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
    'До ' || del || ' минут' AS delayTime,
    countIf(DepDelayMinutes >= del) flightsDelayed
FROM ontime.ontime
ARRAY JOIN delay AS del
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY ALL
ORDER BY flightsDelayed DESC
```

## Дальнейшие шаги {#next-steps}

Поздравляем! Вы узнали, как работать с массивами в ClickHouse — от базового создания и индексирования массивов до использования мощных функций, таких как `groupArray`, `arrayFilter`, `arrayMap`, `arrayReduce` и `arrayJoin`.
Чтобы продолжить обучение, изучите полный справочник по функциям работы с массивами и откройте для себя дополнительные функции, такие как `arrayFlatten`, `arrayReverse` и `arrayDistinct`.
Вам также может быть интересно познакомиться с родственными структурами данных, такими как [`tuples`](/sql-reference/data-types/tuple#creating-tuples), [JSON](/sql-reference/data-types/newjson) и типы [Map](/sql-reference/data-types/map), которые хорошо сочетаются с массивами.
Попробуйте применить эти концепции к собственным наборам данных и поэкспериментируйте с различными запросами в SQL playground или на других примерных наборах данных.

Массивы — это базовая возможность ClickHouse, которая позволяет выполнять эффективные аналитические запросы. По мере того как вы будете лучше осваивать функции для работы с массивами, вы обнаружите, что они могут значительно упростить сложные агрегации и анализ временных рядов.
Для ещё более глубокого погружения в работу с массивами мы рекомендуем YouTube‑видео ниже от Марка, нашего эксперта по данным:

<iframe width="560" height="315" src="https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>