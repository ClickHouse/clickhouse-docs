---
'slug': '/examples/aggregate-function-combinators/maxSimpleState'
'title': 'maxSimpleState'
'description': '使用minSimpleState组合器的示例'
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

## 描述 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器可以应用于 [`max`](/sql-reference/aggregate-functions/reference/max) 函数，以返回所有输入值中的最大值。它返回类型为 `SimpleAggregateState` 的结果。

## 示例用法 {#example-usage}

在 [`minSimpleState`](/examples/aggregate-function-combinators/minSimpleState/#example-usage) 中给出的示例展示了 `maxSimpleState` 和 `minSimpleState` 的用法。

## 另见 {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
