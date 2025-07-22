---
slug: '/examples/aggregate-function-combinators/maxSimpleState'
title: 'maxSimpleState'
description: 'Example of using the minSimpleState combinator'
keywords: ['min', 'state', 'simple', 'combinator', 'examples', 'minSimpleState']
sidebar_label: 'minSimpleState'
---

# minSimpleState {#minsimplestate}

## Description {#description}

The [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the [`max`](/sql-reference/aggregate-functions/reference/max)
function to return the maximum value across all input values. It returns the
result with type `SimpleAggregateState`.

## Example Usage {#example-usage}

The example given in [`minSimpleState`](/examples/aggregate-function-combinators/minSimpleState/#example-usage)
demonstrates a usage of both `maxSimpleState` and `minSimpleState`.

## See also {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
