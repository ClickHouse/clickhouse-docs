---
title: 'Working with arrays in ClickHouse'
description: 'Starter guide on how to use arrays in ClickHouse'
keywords: ['Arrays']
sidebar_label: 'Working with arrays in ClickHouse'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> In this guide, you'll learn how to use arrays in ClickHouse along with some of the most common array functions

## Array basics {#array-basics}

An array is a data structure which groups together values. We call these elements, and each element can be referred to by what is known as an index which indicates the position of the element in this grouping.

Arrays in ClickHouse can be formed using the `array` function:

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

Or as an array of nested types such as tuples:

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

However, array elements should always have a common super type, which is the smallest data type that can represent values from two or more different types without loss, allowing them to be used together.
If there is no common super type an exception will be raised:

```
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

when creating arrays on the fly, ClickHouse picks the narrowest type that fits all elements.
For example, if you create an array of ints and floats, a super type of float is chosen:

```
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

Use of the index with square brackets provides a convenient way to access array elements.
In ClickHouse it's important to know that the array index always starts from **1**.
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
In this way you can select elements relative to the last element:

```
WITH array('hello', 'world', 'arrays are great aren\'t they?') AS string_array
SELECT string_array[-1];

┌─arrayElement(string_array, -1)─┐
│ arrays are great aren't they?  │
└────────────────────────────────┘
```

Despite arrays being 1 based-indexed, you can still access elements at position 0.
The returned value will be the default value of the array type. In the example
below an empty string is returned as this is the default value for the string data type:

```sql
WITH ['hello', 'world', 'arrays are great aren\'t they?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```
## Array functions

ClickHouse offers a host of useful functions which operate on arrays.
In this section, we'll look at some of the most useful ones, starting from the simplest and working up in complexity.

### length, arrayEnumerate, indexOf functions

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

### Exploring stock market data with array functions

So far, the examples have been pretty simple.
Let's take a real-world dataset and write some queries to learn how some of the more common array functions work.

We will be using the [ontime dataset](/getting-started/example-datasets/ontime), which contains flight data from Bureau of Transportation Statistics.
You can find this dataset on the [SQL playground](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K).

We've selected this dataset as arrays are often well suited to working with time-series data and can assist in simplifying
otherwise complex queries.

:::tip
Click the "play" button below to run the queries directly in the docs
:::

### groupArray

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

Let's take a look at the top 10 busiest airports in the US on a particular day chosen at random, say 2024-01-01.
We're interested in understanding how many flights depart from each airport.
Our data contains one row per flight, but it would be convenient if we could group the data by the origin airport and roll the destinations into an array.

To acheive this we can use the [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) aggregate function, which takes values of the specified column from each row and groups them in an array.

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

The `toStringCutToZero` in the query above is used to remove null characters which appear after some of the airport's 3 letter designation.

Wth the data in this form we can easily find the order of the busiest airports by finding the length of the rolled up "Destinations" arrays:

```sql
WITH
    '2024-01-01' AS date,
    busy_airports AS (
    SELECT
    FlightDate,
    Origin,
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

### arrayFilter

Many of the array functions in ClickHouse are so-called ["higher-order functions"](/sql-reference/functions/overview#higher-order-functions) and accept a lambda function as the first parameter.
Let's take a look at how this works by finding days when stocks gained significantly, say +5%.

Run the query below:

```sql runnable

```
In the query below we pass a lambda function as the first argument to the [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) function:
itself taking the opening and closing price:

```sql
(p, o) -> p > 0 * 1.05
```