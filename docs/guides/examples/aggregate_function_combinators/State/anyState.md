---
slug: '/examples/aggregate-function-combinators/State/anyState'
description: 'Example of using the anyState combinator'
keywords: ['any', 'state', 'combinator', 'examples', 'anyState']
sidebar_label: 'anyState'
---

# anyState example

The [`State`](/sql-reference/aggregate-functions/combinators#-state) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return the intermediate state of any value calculation using the `anyState` function.

## Example Usage

```sql
SELECT anyState(value) FROM table;
``` 