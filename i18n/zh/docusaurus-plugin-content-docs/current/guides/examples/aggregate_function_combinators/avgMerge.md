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
---


# avgMerge {#avgMerge}

## 描述 {#description}

[`Merge`](/sql-reference/aggregate-functions/combinators#-state) 组合器
可以应用于 [`avg`](/sql-reference/aggregate-functions/reference/avg) 
函数，以通过组合部分聚合状态生成最终结果。

## 示例用法 {#example-usage}

`Merge` 组合器与 `State` 组合器密切相关。请参阅 
["avgState 示例用法"](/examples/aggregate-function-combinators/avgState/#example-usage)
获取 `avgMerge` 和 `avgState` 的示例。

## 另请参阅 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
