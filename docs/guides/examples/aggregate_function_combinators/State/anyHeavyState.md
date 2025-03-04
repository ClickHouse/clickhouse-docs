---
slug: '/examples/aggregate-function-combinators/State/anyHeavyState'
description: 'Example of using the anyHeavyState combinator'
keywords: ['anyheavy', 'state', 'combinator', 'examples', 'anyHeavyState']
sidebar_label: 'anyHeavyState'
---

# anyHeavyState example

The [`State`](/sql-reference/aggregate-functions/combinators#-state) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return the intermediate state of most frequent value calculation using the `anyHeavyState` function.

## Example Usage

```sql
SELECT anyHeavyState(value) FROM table;
``` 