---
slug: /examples/aggregate-function-combinators/ordefault/histogramOrDefault
description: "Example of using the histogramOrDefault combinator"
keywords: ["histogram", "ordefault", "combinator", "examples", "histogramOrDefault"]
---

# histogramOrDefault Combinator Example

The [OrDefault](/sql-reference/aggregate-functions/combinators#-ordefault) combinator can be applied to the `histogram` function to return an empty histogram if there are no rows using the `histogramOrDefault` function.

## Example Usage

```sql
SELECT histogramOrDefault(value) FROM table;
```
