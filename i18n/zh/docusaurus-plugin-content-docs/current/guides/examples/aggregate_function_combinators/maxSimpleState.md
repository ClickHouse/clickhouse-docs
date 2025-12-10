---
slug: '/examples/aggregate-function-combinators/maxSimpleState'
title: 'maxSimpleState'
description: '使用 maxSimpleState 组合器的示例'
keywords: ['max', 'state', 'simple', 'combinator', 'examples', 'maxSimpleState']
sidebar_label: 'maxSimpleState'
doc_type: 'reference'
---



# maxSimpleState {#maxsimplestate}



## 描述 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器可以应用于 [`max`](/sql-reference/aggregate-functions/reference/max) 函数，用于返回所有输入值中的最大值。它返回的结果类型为 `SimpleAggregateState`。



## 示例用法 {#example-usage}

[`minSimpleState`](/examples/aggregate-function-combinators/minSimpleState/#example-usage) 中给出的示例
演示了同时使用 `maxSimpleState` 和 `minSimpleState` 的方法。



## 另请参阅 {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
