---
slug: '/examples/aggregate-function-combinators/maxSimpleState'
title: 'maxSimpleState'
description: 'minSimpleStateコンビネータの使用例'
keywords: ['min', 'state', 'simple', 'combinator', 'examples', 'minSimpleState']
sidebar_label: 'minSimpleState'
---
```


# minSimpleState {#minsimplestate}

## 説明 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) コンビネータは、[`max`](/sql-reference/aggregate-functions/reference/max) 
関数に適用することで、すべての入力値の中で最大コストを返します。結果の型は `SimpleAggregateState` です。

## 使用例 {#example-usage}

[`minSimpleState`](/examples/aggregate-function-combinators/minSimpleState/#example-usage) に示されている例は、`maxSimpleState` と `minSimpleState` の両方の使用法を示しています。

## 参照 {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
