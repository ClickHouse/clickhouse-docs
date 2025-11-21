---
slug: '/examples/aggregate-function-combinators/maxSimpleState'
title: 'maxSimpleState'
description: 'maxSimpleState 集約関数コンビネータを使用する例'
keywords: ['max', 'state', 'simple', 'combinator', 'examples', 'maxSimpleState']
sidebar_label: 'maxSimpleState'
doc_type: 'reference'
---



# maxSimpleState {#maxsimplestate}


## 説明 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate)コンビネータを[`max`](/sql-reference/aggregate-functions/reference/max)関数に適用することで、すべての入力値における最大値を返すことができます。結果は`SimpleAggregateState`型で返されます。


## 使用例 {#example-usage}

[`minSimpleState`](/examples/aggregate-function-combinators/minSimpleState/#example-usage)に記載されている例では、`maxSimpleState`と`minSimpleState`の両方の使用方法を示しています。


## 関連項目 {#see-also}

- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
