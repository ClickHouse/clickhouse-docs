---
slug: /examples/aggregate-function-combinators/resample/aggThrowResample
description: "Example of using the aggThrowResample combinator"
keywords: ["aggThrow", "resample", "combinator", "examples", "aggThrowResample"]
---

# aggThrowResample Combinator Example

The [Resample](/sql-reference/aggregate-functions/combinators#-resample) combinator can be applied to the `aggThrow` function to throw an exception with the specified probability for each group of rows using the `aggThrowResample` function.

## Example Usage

```sql
SELECT aggThrowResample(probability, value, group) FROM table;
``` 