---
slug: '/examples/aggregate-function-combinators/quantilesTimingArrayIf'
title: 'quantilesTimingArrayIf'
description: 'Пример использования комбинатора quantilesTimingArrayIf'
keywords: ['quantilesTiming', 'array', 'if', 'combinator', 'examples', 'quantilesTimingArrayIf']
sidebar_label: 'quantilesTimingArrayIf'
doc_type: 'reference'
---

# quantilesTimingArrayIf \\{#quantilestimingarrayif\\}

## Описание \\{#description\\}

К комбинатору [`Array`](/sql-reference/aggregate-functions/combinators#-array) и [`If`](/sql-reference/aggregate-functions/combinators#-if) 
можно применить функцию [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
для вычисления квантилей временных значений в массивах для строк, где условие истинно,
используя агрегатную функцию-комбинатор `quantilesTimingArrayIf`.

## Пример использования \\{#example-usage\\}

В этом примере мы создадим таблицу, в которой будет храниться время отклика API для разных эндпоинтов
и используем `quantilesTimingArrayIf` для вычисления квантилей времени отклика для успешных запросов.

```sql title="Query"
CREATE TABLE api_responses(
    endpoint String,
    response_times_ms Array(UInt32),
    success_rate Float32
) ENGINE = Log;

INSERT INTO api_responses VALUES
    ('orders', [82, 94, 98, 87, 103, 92, 89, 105], 0.98),
    ('products', [45, 52, 48, 51, 49, 53, 47, 50], 0.95),
    ('users', [120, 125, 118, 122, 121, 119, 123, 124], 0.92);

SELECT
    endpoint,
    quantilesTimingArrayIf(0, 0.25, 0.5, 0.75, 0.95, 0.99, 1.0)(response_times_ms, success_rate >= 0.95) as response_time_quantiles
FROM api_responses
GROUP BY endpoint;
```

Функция `quantilesTimingArrayIf` вычисляет квантили только для эндпоинтов с долей успешных запросов более 95%.
Возвращаемый массив содержит следующие квантили в следующем порядке:

* 0 (минимум)
* 0.25 (первый квартиль)
* 0.5 (медиана)
* 0.75 (третий квартиль)
* 0.95 (95-й перцентиль)
* 0.99 (99-й перцентиль)
* 1.0 (максимум)

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```

## См. также \\{#see-also\\}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [Комбинатор `If`](/sql-reference/aggregate-functions/combinators#-if)
