---
slug: /examples/aggregate-function-combinators/foreach/aggThrowForEach
description: "Example of using the aggThrowForEach combinator"
keywords: ["aggThrow", "foreach", "combinator", "examples", "aggThrowForEach"]
---

# aggThrowForEach Combinator Example

The [ForEach](/sql-reference/aggregate-functions/combinators#-foreach) combinator can be applied to the `aggThrow` function to throw an exception with the specified probability for corresponding elements in multiple arrays using the `aggThrowForEach` function.

## Example Usage

```sql
SELECT aggThrowForEach(probability, array1, array2) FROM table;
```
