---
slug: '/examples/aggregate-function-combinators/OrDefault/aggThrowOrDefault'
description: 'Example of using the aggThrowOrDefault combinator'
keywords: ['aggthrow', 'ordefault', 'combinator', 'examples', 'aggThrowOrDefault']
sidebar_label: aggThrowOrDefault
---

# aggThrowOrDefault example

The [OrDefault](/sql-reference/aggregate-functions/combinators#-ordefault) combinator can be applied to the [`aggThrow`](/sql-reference/aggregate-functions/reference/aggthrow) function to return a default value instead of throwing an exception when no rows are processed using the `aggThrowOrDefault` function.

## Example Usage

```sql
SELECT aggThrowOrDefault(probability, value) FROM table;
``` 