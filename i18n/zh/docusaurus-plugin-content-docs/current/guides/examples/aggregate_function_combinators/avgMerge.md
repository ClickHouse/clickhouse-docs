---
'slug': '/examples/aggregate-function-combinators/avgMerge'
'title': 'avgMerge'
'description': '使用 avgMerge 组合器的示例'
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

## 描述 {#description}

[`Merge`](/sql-reference/aggregate-functions/combinators#-state) 组合器可以应用于 [`avg`](/sql-reference/aggregate-functions/reference/avg) 函数，通过组合部分聚合状态来生成最终结果。

## 示例用法 {#example-usage}

`Merge` 组合器与 `State` 组合器密切相关。有关 `avgMerge` 和 `avgState` 的示例，请参阅 ["avgState 示例用法"](/examples/aggregate-function-combinators/avgState/#example-usage)。

## 另请参阅 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
