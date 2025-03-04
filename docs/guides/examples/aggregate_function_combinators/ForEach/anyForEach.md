---
slug: '/examples/aggregate-function-combinators/ForEach/anyForEach'
description: 'Example of using the anyForEach combinator'
keywords: ['any', 'foreach', 'combinator', 'examples', 'anyForEach']
sidebar_label: 'anyForEach'
---

# anyForEach example

The [`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return any value for corresponding elements in multiple arrays using the `anyForEach` function.

## Example Usage

```sql
SELECT anyForEach(array1, array2) FROM table;
``` 