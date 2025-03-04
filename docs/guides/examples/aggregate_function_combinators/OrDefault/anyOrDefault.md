---
slug: '/examples/aggregate-function-combinators/OrDefault/anyOrDefault'
description: 'Example of using the anyOrDefault combinator'
keywords: ['any', 'ordefault', 'combinator', 'examples', 'anyOrDefault']
sidebar_label: 'anyOrDefault'
---

# anyOrDefault example

The [`OrDefault`](/sql-reference/aggregate-functions/combinators#-ordefault) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return a default value if no rows are processed using the `anyOrDefault` function.

## Example Usage

```sql
SELECT anyOrDefault(value) FROM table;
``` 