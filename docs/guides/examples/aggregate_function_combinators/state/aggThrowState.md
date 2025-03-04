---
slug: /examples/aggregate-function-combinators/state/aggThrowState
description: "Example of using the aggThrowState combinator"
keywords: ["aggThrow", "state", "combinator", "examples", "aggThrowState"]
---

# aggThrowState Combinator Example

The [State](/sql-reference/aggregate-functions/combinators#-state) combinator can be applied to the `aggThrow` function to return the intermediate state of throw probability calculation using the `aggThrowState` function.

## Example Usage

```sql
SELECT aggThrowState(probability) FROM table;
```
