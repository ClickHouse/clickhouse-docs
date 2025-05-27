---
'slug': '/examples/aggregate-function-combinators/maxSimpleState'
'title': 'maxSimpleState'
'description': '使用 minSimpleState 组合器的示例'
'keywords':
- 'min'
- 'state'
- 'simple'
- 'combinator'
- 'examples'
- 'minSimpleState'
'sidebar_label': 'minSimpleState'
---


# minSimpleState {#minsimplestate}

## Description {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器可以应用于 [`max`](/sql-reference/aggregate-functions/reference/max) 函数，以返回所有输入值中的最大值。它返回的结果类型为 `SimpleAggregateState`。

## Example Usage {#example-usage}

在 [`minSimpleState`](/examples/aggregate-function-combinators/minSimpleState/#example-usage) 中给出的示例演示了 `maxSimpleState` 和 `minSimpleState` 的用法。

## See also {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
