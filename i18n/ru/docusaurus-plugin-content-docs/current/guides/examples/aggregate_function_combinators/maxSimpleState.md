---
'slug': '/examples/aggregate-function-combinators/maxSimpleState'
'title': 'maxSimpleState'
'description': 'Пример использования комбинатора minSimpleState'
'keywords':
- 'min'
- 'state'
- 'simple'
- 'combinator'
- 'examples'
- 'minSimpleState'
'sidebar_label': 'minSimpleState'
'doc_type': 'reference'
---


# minSimpleState {#minsimplestate}

## Описание {#description}

Комбинатор [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) может быть применен к функции [`max`](/sql-reference/aggregate-functions/reference/max) для возврата максимального значения среди всех входных значений. Он возвращает результат с типом `SimpleAggregateState`.

## Пример использования {#example-usage}

Пример, приведенный в [`minSimpleState`](/examples/aggregate-function-combinators/minSimpleState/#example-usage), демонстрирует использование как `maxSimpleState`, так и `minSimpleState`.

## См. также {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
