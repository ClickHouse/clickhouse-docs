---
slug: /examples/aggregate-function-combinators/ornull/histogramOrNull
description: "Example of using the histogramOrNull combinator"
keywords: ["histogram", "ornull", "combinator", "examples", "histogramOrNull"]
---

# histogramOrNull Combinator Example

The [OrNull](/sql-reference/aggregate-functions/combinators#-ornull) combinator can be applied to the `histogram` function to return NULL if there are no rows using the `histogramOrNull` function.

## Example Usage

```sql
SELECT histogramOrNull(value) FROM table;
```
