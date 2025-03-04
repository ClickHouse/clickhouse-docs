---
slug: '/examples/aggregate-function-combinators/State/aggThrowState'
description: 'Example of using the aggThrowState combinator'
keywords: ['aggthrow', 'state', 'combinator', 'examples', 'aggThrowState']
sidebar_label: aggThrowState
---

# aggThrowState example

The [State](/sql-reference/aggregate-functions/combinators#-state) combinator can be applied to the [`aggThrow`](/sql-reference/aggregate-functions/reference/aggthrow) function to return the intermediate state of throw probability calculation using the `aggThrowState` function.

## Example Usage

```sql
SELECT aggThrowState(probability) FROM table;
```
