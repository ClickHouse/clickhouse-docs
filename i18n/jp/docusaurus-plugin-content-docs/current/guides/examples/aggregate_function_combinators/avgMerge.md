---
slug: '/examples/aggregate-function-combinators/avgMerge'
title: 'avgMerge'
description: 'avgMerge コンビネーターの使用例'
keywords: ['avg', 'merge', 'combinator', 'examples', 'avgMerge']
sidebar_label: 'avgMerge'
doc_type: 'reference'
---



# avgMerge {#avgMerge}


## 説明 {#description}

[`Merge`](/sql-reference/aggregate-functions/combinators#-state)コンビネータを[`avg`](/sql-reference/aggregate-functions/reference/avg)関数に適用することで、部分的な集約状態を結合し、最終結果を生成することができます。


## 使用例 {#example-usage}

`Merge`コンビネータは`State`コンビネータと密接に関連しています。`avgMerge`と`avgState`の両方の使用例については、
["avgStateの使用例"](/examples/aggregate-function-combinators/avgState/#example-usage)
を参照してください。


## 関連項目 {#see-also}

- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
