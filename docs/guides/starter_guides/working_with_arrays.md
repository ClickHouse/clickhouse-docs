---
title: 'Working with arrays in ClickHouse'
description: 'Starter guide on how to use arrays in ClickHouse'
keywords: ['Arrays']
sidebar_label: 'Working with arrays in ClickHouse'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> In this guide, you'll learn how to use arrays in ClickHouse along with some of the most commonly used [array functions](/sql-reference/functions/array-functions).

## Introduction to arrays {#array-basics}

An array is an in-memory data structure which groups together values.
We call these _elements_ of the array, and each element can be referred to by an index, which indicates the position of the element in this grouping.

Arrays in ClickHouse can be formed using the [`array`](/sql-reference/data-types/array) function:

```
array(T)
```

Or alternatively, using square brackets:

```
[]
```

For example, you can create an array of numbers:

```
SELECT array(1, 2, 3) AS numeric_array

┌─numeric_array─┐
│ [1,2,3]       │
└───────────────┘
```

Or an array of strings:

```
SELECT array('hello', 'world') AS string_array

┌─string_array──────┐
│ ['hello','world'] │
└───────────────────┘
```

Or an array of nested types such as [tuples](/sql-reference/data-types/tuple):

```
SELECT array(tuple(1, 2), tuple(3, 4))

┌─[(1, 2), (3, 4)]─┐
│ [(1,2),(3,4)]    │
└──────────────────┘
```

You might be tempted to make an array of different types like this:

```
SELECT array('Hello', 'world', 1, 2, 3)
```

However, array elements should always have a common super-type, which is the smallest data type that can represent values from two or more different types without loss, allowing them to be used together.
If there is no common super-type, you'll get an exception when you try to form the array:

```
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

when creating arrays on the fly, ClickHouse picks the narrowest type that fits all elements.
For example, if you create an array of integers and floats, a super-type of float is chosen:

```
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

Use of the index with square brackets provides a convenient way to access array elements.
In ClickHouse, it's important to know that the array index always starts from **1**.
This may be different from other programming languages you're used to where arrays are zero-indexed.

For example, given an array, you can select the first element of an array by writing:

```
WITH array('hello', 'world') AS string_array
SELECT string_array[1];

┌─arrayElement⋯g_array, 1)─┐
│ hello                    │
└──────────────────────────┘
```

It is also possible to use negative indexes.
In this way, you can select elements relative to the last element:

```
WITH array('hello', 'world') AS string_array
SELECT string_array[-1];

┌─arrayElement⋯g_array, -1)─┐
│ world                     │
└───────────────────────────┘
```

Despite arrays being 1 based-indexed, you can still access elements at position 0.
The returned value will be the _default value_ of the array type.
In the example below, an empty string is returned as this is the default value for the string data type:

```sql
WITH ['hello', 'world', 'arrays are great aren\'t they?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```

## Array functions {#array-functions}

ClickHouse offers a host of useful functions which operate on arrays.
In this section, we'll look at some of the most useful ones, starting from the simplest and working up in complexity.

### length, arrayEnumerate, indexOf, has* functions {#length-arrayEnumerate-indexOf-has-functions}

The `length` function is used to return the number of elements in the array:

```
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT length(string_array);

┌─length(string_array)─┐
│                    3 │
└──────────────────────┘
```

You can also use the [`arrayEnumerate`](/sql-reference/functions/array-functions#arrayEnumerate) function to return an array of indexes of the elements:

```
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT arrayEnumerate(string_array);

┌─arrayEnumerate(string_array)─┐
│ [1,2,3]                      │
└──────────────────────────────┘
```

If you want to find the index of a particular value, you can use the `indexOf` function:

```sql
SELECT indexOf([4, 2, 8, 8, 9], 8);

┌─indexOf([4, 2, 8, 8, 9], 8)─┐
│                           3 │
└─────────────────────────────┘
```

Notice that this function will return the first index it encounters if there are multiple identical values in the array.
If your array elements are sorted in ascending order then you can use the [`indexOfAssumeSorted`](/sql-reference/functions/array-functions#indexOfAssumeSorted) function.

The functions `has`, `hasAll` and `hasAny` are useful for determining whether an array contains a given value.
Consider the following example:

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

## Exploring flight data with array functions {#exploring-flight-data-with-array-functions}

So far, the examples have been pretty simple.
The utility of arrays really shows itself when used on a real-world dataset.

We will be using the [ontime dataset](/getting-started/example-datasets/ontime), which contains flight data from the Bureau of Transportation Statistics.
You can find this dataset on the [SQL playground](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K).

We've selected this dataset as arrays are often well suited to working with time-series data and can assist in simplifying
otherwise complex queries.

:::tip
Click the "play" button below to run the queries directly in the docs and see the result live.
:::

### groupArray {#grouparray}

There are many columns in this dataset, but we will focus on a subset of the columns.
Run the query below to see what our data looks like:

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

### arrayMap {#arraymap}

We saw in the previous query that Denver International Airport was the airport with the most outward flights for our particular chosen day.
Let's take a look at how many of those flights were on-time, delayed by 15-30 minutes or delayed by more than 30 minutes.

Many of the array functions in ClickHouse are so-called ["higher-order functions"](/sql-reference/functions/overview#higher-order-functions) and accept a lambda function as the first parameter.
The [`arrayMap`](/sql-reference/functions/array-functions#arrayMap) function is an example of one such higher-order function and returns a new array from the provided array by applying a lambda function to each element of the original array.

Run the query below which uses the `arrayMap` function to see which flights were delayed or on-time:

```sql
SELECT
    Origin,
    toStringCutToZero(Dest) AS Destination,
    Tail_Number,
    DepDelayMinutes AS delay_minutes,
--highlight-start
    arrayMap(d -> if(d >= 30, 'DELAYED', 
                  if(d >= 15, 'WARNING', 'ON-TIME')),
             [DepDelayMinutes])[1] AS status
--highlight-end
FROM ontime.ontime
WHERE Origin = 'DEN'
    AND FlightDate = '2024-01-01'
    AND DepTime IS NOT NULL
    AND DepDelayMinutes IS NOT NULL
ORDER BY DepDelayMinutes DESC
```

In the above query, the `arrayMap` function takes a single-element array `[DepDelayMinutes]` and applies the lambda function `d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'` to categorize it.
Then the first element of the resulting array is extracted with `[DepDelayMinutes][1]`.

### arrayFilter {#arrayfilter}

Next we'll look only at the number of flights that were delayed by 30 minutes or more, for airports `DEN`, `ATL` and `DFW`:

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
ORDER BY num_on_time DESC
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
There is however, one interesting and unique function that breaks this rule worth learning about - the `arrayJoin` function.

`arrayJoin` "explodes" an array - it takes an array and creates a separate row for each element.
This is similar to the `UNNEST` or `EXPLODE` SQL functions in other databases.

Unlike most array functions that return arrays or scalar values, `arrayJoin` fundamentally changes the result set by multiplying the number of rows.

Consider the query below which returns a single array of destinations for a given origin:

```sql runnable
SELECT
    Origin,
    groupArray(toStringCutToZero(Dest)) AS Destinations
FROM ontime.ontime
WHERE Origin = 'DEN' 
    AND FlightDate = '2024-01-01'
GROUP BY Origin
LIMIT 1
```

With `arrayJoin`, each destination becomes it's own row:

```sql runnable
SELECT
    Origin,
--highlight-next-line
    arrayJoin(groupArray(toStringCutToZero(Dest))) AS Destination
FROM ontime.ontime
WHERE Origin = 'DEN' 
    AND FlightDate = '2024-01-01'
GROUP BY Origin
LIMIT 10
```

Let's use this function to figure out how many flights depart from `DEN` at different times of the day:

```sql runnable
-- Create time-of-day categories for each flight, then explode to count flights per category
WITH flight_categories AS (
    SELECT
        FlightDate,
        Origin,
        Dest,
        -- Categorize the flight into multiple relevant buckets
        arrayFilter(x -> x != '', [
            if(DepTime < 600, 'early-morning', ''),
            if(DepTime >= 600 AND DepTime < 1200, 'morning', ''),
            if(DepTime >= 1200 AND DepTime < 1800, 'afternoon', ''),
            if(DepTime >= 1800, 'evening', '')
        ]) AS categories
    FROM ontime.ontime
    WHERE FlightDate = '2024-01-01'
)
SELECT
--highlight-next-line
    arrayJoin(categories) AS category,
    count() AS flight_count
FROM flight_categories
GROUP BY category
ORDER BY flight_count DESC
```

The query above categorizes each flight by its departure time into various buckets of the time of day: early-morning, morning, afternoon, evening with the help of the now familiar `arrayFilter` function.
It then uses the `arrayJoin` function to explode the array so each category becomes a separate row, allowing us to count how many total flights departed during each time period on January 1st, 2024.

## Next steps {#next-steps}

Congratulations! You've learned how to work with arrays in ClickHouse, from basic array creation and indexing to powerful functions like `groupArray`, `arrayFilter`, `arrayMap`, `arrayReduce`, and `arrayJoin`.
To continue your learning journey, explore the complete array functions reference to discover additional functions like `arrayFlatten`, `arrayReverse`, and `arrayDistinct`.
You might also want to learn about related data structures such as [`tuples`](/sql-reference/data-types/tuple#creating-tuples), [JSON](/sql-reference/data-types/newjson), and [Map](/sql-reference/data-types/map) types which work well alongside arrays.
Practice applying these concepts to your own datasets, and experiment with different queries on the SQL playground or other example datasets.

Arrays are a fundamental feature in ClickHouse that enable, efficient analytical queries - as you become more comfortable with array functions, you'll find they can dramatically simplify complex aggregations and time-series analysis.
For more array fun we recommend the Youtube video below:

<iframe width="560" height="315" src="https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>