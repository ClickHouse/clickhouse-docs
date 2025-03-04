---
slug: '/examples/aggregate-function-combinators/countIf'
description: 'Example of using the countIf combinator'
keywords: ['count', 'if', 'combinator', 'examples', 'countIf']
sidebar_label: 'countIf'
---

# countIf

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`count`](/sql-reference/aggregate-functions/reference/count) function to count only the rows that match the given condition using the `countIf` function.

This is useful when you want to count rows based on specific conditions without having to use a subquery or `CASE` statements.

## Example Usage

