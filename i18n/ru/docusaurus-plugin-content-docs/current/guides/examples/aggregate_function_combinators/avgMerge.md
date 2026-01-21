---
slug: '/examples/aggregate-function-combinators/avgMerge'
title: 'avgMerge'
description: 'Пример использования комбинатора avgMerge'
keywords: ['avg', 'merge', 'combinator', 'examples', 'avgMerge']
sidebar_label: 'avgMerge'
doc_type: 'reference'
---



# avgMerge \{#avgMerge\}



## Описание \{#description\}

Комбинатор [`Merge`](/sql-reference/aggregate-functions/combinators#-state)
можно применить к функции [`avg`](/sql-reference/aggregate-functions/reference/avg)
для получения окончательного результата путём объединения частичных состояний агрегации.



## Пример использования \{#example-usage\}

Комбинатор `Merge` тесно связан с комбинатором `State`. См. 
["пример использования avgState"](/examples/aggregate-function-combinators/avgState/#example-usage)
для примера одновременного использования `avgMerge` и `avgState`.



## См. также \{#see-also\}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
