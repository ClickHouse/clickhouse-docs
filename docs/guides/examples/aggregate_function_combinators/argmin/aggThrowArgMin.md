---
slug: /examples/aggregate-function-combinators/argmin/aggThrowArgMin
description: "Example of using the aggThrowArgMin combinator"
keywords: ["aggThrow", "argmin", "combinator", "examples", "aggThrowArgMin"]
---

# aggThrowArgMin Combinator Example

The [ArgMin](/sql-reference/aggregate-functions/combinators#-argmin) combinator can be applied to the `aggThrow` function to throw an exception with the specified probability only for rows that have the minimum value for the specified expression using the `aggThrowArgMin` function.

## Example Usage

```sql
SELECT aggThrowArgMin(probability, value, expr) FROM table;
```
