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

## Description {#description}

[`Merge`](/sql-reference/aggregate-functions/combinators#-state) 合成器可以应用于 [`avg`](/sql-reference/aggregate-functions/reference/avg) 函数，通过组合部分聚合状态来产生最终结果。

## Example Usage {#example-usage}

`Merge` 合成器与 `State` 合成器密切相关。请参阅 ["avgState example usage"](/examples/aggregate-function-combinators/avgState/#example-usage) 以获取 `avgMerge` 和 `avgState` 的示例。

## See also {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
