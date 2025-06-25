---
slug: '/examples/aggregate-function-combinators/avgMerge'
title: 'avgMerge'
description: 'Пример использования комбиниратора avgMerge'
keywords: ['avg', 'merge', 'combinator', 'examples', 'avgMerge']
sidebar_label: 'avgMerge'
---


# avgMerge {#avgMerge}

## Описание {#description}

Комбиниратор [`Merge`](/sql-reference/aggregate-functions/combinators#-state) может быть применён к функции [`avg`](/sql-reference/aggregate-functions/reference/avg) для получения окончательного результата путём объединения частичных состояний агрегатов.

## Пример использования {#example-usage}

Комбиниратор `Merge` тесно связан с комбиниратором `State`. Смотрите 
["пример использования avgState"](/examples/aggregate-function-combinators/avgState/#example-usage) для примера как `avgMerge`, так и `avgState`.

## См. также {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
