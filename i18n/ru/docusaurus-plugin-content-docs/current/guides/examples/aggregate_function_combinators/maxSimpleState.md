---
slug: '/examples/aggregate-function-combinators/maxSimpleState'
title: 'maxSimpleState'
description: 'Пример использования агрегатного комбинатора maxSimpleState'
keywords: ['max', 'state', 'simple', 'combinator', 'examples', 'maxSimpleState']
sidebar_label: 'maxSimpleState'
doc_type: 'reference'
---



# maxSimpleState {#maxsimplestate}



## Описание {#description}

Комбинатор [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) может быть применён к функции [`max`](/sql-reference/aggregate-functions/reference/max)
для получения максимального значения среди всех входных значений. Он возвращает
результат типа `SimpleAggregateState`.



## Пример использования {#example-usage}

Пример, приведённый в [`minSimpleState`](/examples/aggregate-function-combinators/minSimpleState/#example-usage),
демонстрирует использование агрегатов `maxSimpleState` и `minSimpleState`.



## См. также {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`комбинатор SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`тип SimpleAggregateFunction`](/sql-reference/data-types/simpleaggregatefunction)
