---
slug: '/examples/aggregate-function-combinators/avgMerge'
sidebar_label: avgMerge
description: 'Пример использования комбинирующего элемента avgMerge'
title: avgMerge
keywords: ['avg', 'merge', 'combinator', 'examples', 'avgMerge']
doc_type: reference
---
# avgMerge {#avgMerge}

## Описание {#description}

Комбинатор [`Merge`](/sql-reference/aggregate-functions/combinators#-state) может быть применён к функции [`avg`](/sql-reference/aggregate-functions/reference/avg) для получения окончательного результата путём объединения частичных агрегатных состояний.

## Пример использования {#example-usage}

Комбинатор `Merge` тесно связан с комбинатором `State`. Обратитесь к 
["примеру использования avgState"](/examples/aggregate-function-combinators/avgState/#example-usage)
для примера как `avgMerge`, так и `avgState`.

## Смотрите также {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)