---
slug: '/examples/aggregate-function-combinators/uniqArray'
title: 'uniqArray'
description: 'Example of using the uniqArray combinator'
keywords: ['uniq', 'array', 'combinator', 'examples', 'uniqArray']
sidebar_label: 'uniqArray'
doc_type: 'reference'
---

# uniqArray {#uniqarray}

## Description {#description}

The [`Array`](/sql-reference/aggregate-functions/combinators#-array) combinator 
can be applied to the [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
function to calculate the approximate number of unique elements across all arrays, 
using the `uniqArray` aggregate combinator function.

The `uniqArray` function is useful when you need to count unique elements across 
multiple arrays in a dataset. It's equivalent to using `uniq(arrayJoin())`, where 
`arrayJoin` first flattens the arrays and then `uniq` counts the unique elements.

## Example usage {#example-usage}

In this example, we'll use a sample dataset of user interests across different 
categories to demonstrate how `uniqArray` works. We'll compare it with 
`uniq(arrayJoin())` to show the difference in counting unique elements.

```sql title="Query"
CREATE TABLE user_interests
(
    user_id UInt32,
    interests Array(String)
) ENGINE = Memory;

INSERT INTO user_interests VALUES
    (1, ['reading', 'gaming', 'music']),
    (2, ['gaming', 'sports', 'music']),
    (3, ['reading', 'cooking']);

SELECT 
    uniqArray(interests) AS unique_interests_total,
    uniq(arrayJoin(interests)) AS unique_interests_arrayJoin
FROM user_interests;
```

The `uniqArray` function counts unique elements across all arrays combined, similar to `uniq(arrayJoin())`. 
In this example:
- `uniqArray` returns 5 because there are 5 unique interests across all users: 'reading', 'gaming', 'music', 'sports', 'cooking'
- `uniq(arrayJoin())` also returns 5, showing that both functions count unique elements across all arrays

```response title="Response"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```

## See also {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
