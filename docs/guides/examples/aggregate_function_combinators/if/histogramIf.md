---
slug: '/examples/aggregate-function-combinators/If/histogramIf'
description: 'Example of using the histogramIf combinator'
keywords: ['histogram', 'if', 'combinator', 'examples', 'histogramIf']
sidebar_label: 'histogramIf'
---

# histogramIf example

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the `histogram` function to generate histogram data only for rows that match the given condition using the `histogramIf` function.

## Example Usage

```sql
SELECT histogramIf(value, condition) FROM table;
``` 