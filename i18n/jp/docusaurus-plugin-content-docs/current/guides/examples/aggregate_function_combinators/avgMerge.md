---
slug: '/examples/aggregate-function-combinators/avgMerge'
title: 'avgMerge'
description: 'avgMergeコンビネータの使用例'
keywords: ['avg', 'merge', 'combinator', 'examples', 'avgMerge']
sidebar_label: 'avgMerge'
---


# avgMerge {#avgMerge}

## 説明 {#description}

[`Merge`](/sql-reference/aggregate-functions/combinators#-state) コンビネータは
[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用することができ、
部分的な集約状態を組み合わせて最終結果を生成します。

## 使用例 {#example-usage}

`Merge` コンビネータは `State` コンビネータと密接に関連しています。
`avgMerge` と `avgState` の両方の使用例については、
["avgStateの使用例"](/examples/aggregate-function-combinators/avgState/#example-usage) を参照してください。

## 参照 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
