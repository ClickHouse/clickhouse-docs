---
slug: /examples/aggregate-function-combinators/distinct/aggThrowDistinct
description: "Example of using the aggThrowDistinct combinator"
keywords: ["aggThrow", "distinct", "combinator", "examples", "aggThrowDistinct"]
---

# aggThrowDistinct Combinator Example

The [Distinct](/sql-reference/aggregate-functions/combinators#-distinct) combinator can be applied to the `aggThrow` function to throw an exception with the specified probability only for distinct values using the `aggThrowDistinct` function.

## Example Usage

```sql
SELECT aggThrowDistinct(probability, value) FROM table;
```
