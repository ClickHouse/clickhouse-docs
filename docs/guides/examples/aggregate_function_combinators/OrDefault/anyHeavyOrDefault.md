---
slug: '/examples/aggregate-function-combinators/OrDefault/anyHeavyOrDefault'
description: 'Example of using the anyHeavyOrDefault combinator'
keywords: ['anyheavy', 'ordefault', 'combinator', 'examples', 'anyHeavyOrDefault']
sidebar_label: 'anyHeavyOrDefault'
---

# anyHeavyOrDefault example

The [`OrDefault`](/sql-reference/aggregate-functions/combinators#-ordefault) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return a default value if no rows are processed using the `anyHeavyOrDefault` function.

## Example Usage

```sql
SELECT anyHeavyOrDefault(value) FROM table;
``` 