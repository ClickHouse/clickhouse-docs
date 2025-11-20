---
slug: '/examples/aggregate-function-combinators/maxSimpleState'
title: 'maxSimpleState'
description: 'Пример использования комбинатора агрегатной функции maxSimpleState'
keywords: ['max', 'state', 'simple', 'combinator', 'examples', 'maxSimpleState']
sidebar_label: 'maxSimpleState'
doc_type: 'reference'
---



# maxSimpleState {#maxsimplestate}


## Описание {#description}

Комбинатор [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) может применяться к функции [`max`](/sql-reference/aggregate-functions/reference/max)
для получения максимального значения среди всех входных значений. Возвращает
результат типа `SimpleAggregateState`.


## Пример использования {#example-usage}

Пример, приведённый в [`minSimpleState`](/examples/aggregate-function-combinators/minSimpleState/#example-usage),
демонстрирует использование `maxSimpleState` и `minSimpleState`.


## См. также {#see-also}

- [`max`](/sql-reference/aggregate-functions/reference/max)
- [Комбинатор `SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [Тип `SimpleAggregateFunction`](/sql-reference/data-types/simpleaggregatefunction)
