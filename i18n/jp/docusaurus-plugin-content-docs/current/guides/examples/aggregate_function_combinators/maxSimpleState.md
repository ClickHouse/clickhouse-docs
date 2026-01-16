---
slug: '/examples/aggregate-function-combinators/maxSimpleState'
title: 'maxSimpleState'
description: 'maxSimpleState コンビネータの使用例'
keywords: ['max', 'state', 'simple', 'combinator', 'examples', 'maxSimpleState']
sidebar_label: 'maxSimpleState'
doc_type: 'reference'
---



# maxSimpleState \\{#maxsimplestate\\}



## 説明 \\{#description\\}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) コンビネータは [`max`](/sql-reference/aggregate-functions/reference/max)
関数に適用することで、すべての入力値の最大値を返すことができます。戻り値の型は
`SimpleAggregateState` です。



## 使用例 \\{#example-usage\\}

[`minSimpleState`](/examples/aggregate-function-combinators/minSimpleState/#example-usage) で示した例は、
`maxSimpleState` と `minSimpleState` の両方の使い方を示しています。



## 関連項目 \\{#see-also\\}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`SimpleState コンビネータ`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction 型`](/sql-reference/data-types/simpleaggregatefunction)
