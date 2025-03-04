---
slug: /examples/aggregate-function-combinators/argmax/aggThrowArgMax
description: "Example of using the aggThrowArgMax combinator"
keywords: ["aggThrow", "argmax", "combinator", "examples", "aggThrowArgMax"]
---

# aggThrowArgMax Combinator Example

The [ArgMax](/sql-reference/aggregate-functions/combinators#-argmax) combinator can be applied to the `aggThrow` function to throw an exception with the specified probability only for rows that have the maximum value for the specified expression using the `aggThrowArgMax` function.

## Example Usage

```sql
SELECT aggThrowArgMax(probability, value, expr) FROM table;
``` 