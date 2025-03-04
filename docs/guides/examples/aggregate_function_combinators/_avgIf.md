---
slug: '/examples/aggregate-function-combinators/avgIf'
description: 'Example of using the avgIf combinator'
keywords: ['avg', 'if', 'combinator', 'examples', 'avgIf']
sidebar_label: 'avgIf'
---

# avgIf

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`avg`](/sql-reference/aggregate-functions/reference/avg) function to calculate the average only for rows that match the given condition using the `avgIf` function.

This is useful when you want to calculate conditional averages without having to use a subquery or `CASE` statements.

## Example Usage

