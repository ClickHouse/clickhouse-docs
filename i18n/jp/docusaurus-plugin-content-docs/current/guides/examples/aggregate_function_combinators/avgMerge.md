---
'slug': '/examples/aggregate-function-combinators/avgMerge'
'title': 'avgMerge'
'description': 'avgMerge combinatorの使用例'
'keywords':
- 'avg'
- 'merge'
- 'combinator'
- 'examples'
- 'avgMerge'
'sidebar_label': 'avgMerge'
---




# avgMerge {#avgMerge}

## 説明 {#description}

[`Merge`](/sql-reference/aggregate-functions/combinators#-state) コンビネータは、部分的な集約状態を結合して最終結果を生成するために、[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用することができます。

## 使用例 {#example-usage}

`Merge` コンビネータは `State` コンビネータに密接に関連しています。両方の `avgMerge` と `avgState` の使用例については、["avgState 使用例"](/examples/aggregate-function-combinators/avgState/#example-usage) を参照してください。

## 参照 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
