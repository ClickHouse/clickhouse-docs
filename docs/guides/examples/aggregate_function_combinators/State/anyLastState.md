---
slug: '/examples/aggregate-function-combinators/State/anyLastState'
description: 'Example of using the anyLastState combinator'
keywords: ['anylast', 'state', 'combinator', 'examples', 'anyLastState']
sidebar_label: 'anyLastState'
---

# anyLastState example

The [`State`](/sql-reference/aggregate-functions/combinators#-state) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return the intermediate state of last value calculation using the `anyLastState` function.

## Example Usage

```sql
SELECT anyLastState(value) FROM table;
``` 