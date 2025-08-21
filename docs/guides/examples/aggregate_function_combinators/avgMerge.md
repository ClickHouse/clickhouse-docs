---
slug: '/examples/aggregate-function-combinators/avgMerge'
title: 'avgMerge'
description: 'Example of using the avgMerge combinator'
keywords: ['avg', 'merge', 'combinator', 'examples', 'avgMerge']
sidebar_label: 'avgMerge'
doc_type: how-to
---

# avgMerge {#avgMerge}

## Description {#description}

The [`Merge`](/sql-reference/aggregate-functions/combinators#-state) combinator
can be applied to the [`avg`](/sql-reference/aggregate-functions/reference/avg)
function to produce a final result by combining partial aggregate states.

## Example usage {#example-usage}

The `Merge` combinator is closely related to the `State` combinator. Refer to 
["avgState example usage"](/examples/aggregate-function-combinators/avgState/#example-usage)
for an example of both `avgMerge` and `avgState`.

## See also {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
