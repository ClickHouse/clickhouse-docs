---
slug: '/examples/aggregate-function-combinators/OrDefault/anyLastOrDefault'
description: 'Example of using the anyLastOrDefault combinator'
keywords: ['anylast', 'ordefault', 'combinator', 'examples', 'anyLastOrDefault']
sidebar_label: 'anyLastOrDefault'
---

# anyLastOrDefault example

The [`OrDefault`](/sql-reference/aggregate-functions/combinators#-ordefault) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return a default value if no rows are processed using the `anyLastOrDefault` function.

## Example Usage

```sql
SELECT anyLastOrDefault(value) FROM table;
``` 