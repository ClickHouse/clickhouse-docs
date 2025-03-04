---
slug: /examples/aggregate-function-combinators/simplestate/histogramSimpleState
description: "Example of using the histogramSimpleState combinator"
keywords: ["histogram", "simplestate", "combinator", "examples", "histogramSimpleState"]
---

# histogramSimpleState Combinator Example

The [SimpleState](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the `histogram` function to return the histogram state with SimpleAggregateFunction type using the `histogramSimpleState` function.

## Example Usage

```sql
SELECT histogramSimpleState(value) FROM table;
```
