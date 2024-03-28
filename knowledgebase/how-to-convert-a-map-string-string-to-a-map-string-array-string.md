---
title: "How to convert a Map(String, String) to a Map(String,Array(String))"
---

## Question

Within my table, there is a column defined as `Map(String, String)`. How can I go about converting this particular column into a `Map(String, Array(String))`? The objective is to maintain the original keys as keys in the transformed map, with the associated values now arranged as arrays within the new structure.

## Answer

```sql
CREATE TABLE test
(
    `col1` Map(String, String)
)
ENGINE = MergeTree
ORDER BY tuple()
```

```sql
INSERT INTO test
VALUES
  ({'A':'value-1'}),
  ({'A':'value-2'}),
  ({'A':'value-3'}),
  ({'B':'value-4'}),
  ({'B':'value-5'}),
  ({'B':'value-6'}),
  ({'C':'value-7'}),
  ({'C':'value-8'}),
  ({'C':'value-9'})
```

```sql
SELECT *
FROM test
```

```response
┌─col1────────────┐
│ {'A':'value-1'} │
│ {'A':'value-2'} │
│ {'A':'value-3'} │
│ {'B':'value-4'} │
│ {'B':'value-5'} │
│ {'B':'value-6'} │
│ {'C':'value-7'} │
│ {'C':'value-8'} │
│ {'C':'value-9'} │
└─────────────────┘
```

```sql
SELECT map(col1.keys[1] AS key, groupArray(col1.values[1]) AS value_array)
FROM test
GROUP BY key
ORDER BY key ASC
```

```response
┌─map(arrayElement(col1.keys, 1), groupArray(arrayElement(col1.values, 1)))─┐
│ {'A':['value-1','value-2','value-3']}                                     │
│ {'B':['value-4','value-5','value-6']}                                     │
│ {'C':['value-7','value-8','value-9']}                                     │
└───────────────────────────────────────────────────────────────────────────┘
```

## Reference

- [Tuple map functions](https://clickhouse.com/docs/en/sql-reference/functions/tuple-map-functions#map)
- [`GroupArray()` function](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/grouparray)
