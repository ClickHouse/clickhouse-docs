---
slug: '/examples/aggregate-function-combinators/quantilesTimingArrayIf'
sidebar_label: quantilesTimingArrayIf
description: 'Пример использования комбиниатора quantilesTimingArrayIf'
title: quantilesTimingArrayIf
keywords: ['quantilesTiming', 'array', 'if', 'combinator', 'examples', 'quantilesTimingArrayIf']
doc_type: reference
---
# quantilesTimingArrayIf {#quantilestimingarrayif}

## Описание {#description}

Комбинировщик [`Array`](/sql-reference/aggregate-functions/combinators#-array) и [`If`](/sql-reference/aggregate-functions/combinators#-if) 
можно применять к функции [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
для расчета квантилей временных значений в массивах для строк, где условие истинно,
используя агрегатную комбинированную функцию `quantilesTimingArrayIf`.

## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит времена ответа API для разных конечных точек,
и мы будем использовать `quantilesTimingArrayIf` для расчета квантилей времени ответа для успешных запросов.

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

Функция `quantilesTimingArrayIf` будет рассчитывать квантиль только для конечных точек с уровнем успеха выше 95%.
Возвращаемый массив содержит следующие квантили в порядке:
- 0 (минимум)
- 0.25 (первый квартиль)
- 0.5 (медиана)
- 0.75 (третий квартиль)
- 0.95 (95-й процентиль)
- 0.99 (99-й процентиль)
- 1.0 (максимум)

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```

## Смотрите также {#see-also}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)