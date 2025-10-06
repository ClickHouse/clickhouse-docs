---
'slug': '/examples/aggregate-function-combinators/avgMerge'
'title': 'avgMerge'
'description': 'avgMerge コンビネータを使用する例'
'keywords':
- 'avg'
- 'merge'
- 'combinator'
- 'examples'
- 'avgMerge'
'sidebar_label': 'avgMerge'
'doc_type': 'reference'
---


# avgMerge {#avgMerge}

## 説明 {#description}

The [`Merge`](/sql-reference/aggregate-functions/combinators#-state) 組み合わせ子は、部分的な集約状態を組み合わせて最終結果を生成するために、[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用できます。

## 使用例 {#example-usage}

`Merge` 組み合わせ子は `State` 組み合わせ子に密接に関連しています。両方の `avgMerge` と `avgState` の例については、["avgState 使用例"](/examples/aggregate-function-combinators/avgState/#example-usage) を参照してください。

## 関連項目 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
