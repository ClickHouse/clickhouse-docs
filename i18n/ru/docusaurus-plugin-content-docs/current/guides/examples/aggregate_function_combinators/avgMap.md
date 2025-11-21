---
slug: '/examples/aggregate-function-combinators/avgMap'
title: 'avgMap'
description: 'Пример использования комбинатора avgMap'
keywords: ['avg', 'map', 'combinator', 'examples', 'avgMap']
sidebar_label: 'avgMap'
doc_type: 'reference'
---



# avgMap {#avgmap}


## Описание {#description}

Комбинатор [`Map`](/sql-reference/aggregate-functions/combinators#-map) может применяться к функции [`avg`](/sql-reference/aggregate-functions/reference/avg)
для вычисления среднего арифметического значений в Map по каждому ключу с помощью агрегатной функции-комбинатора `avgMap`.


## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит коды статусов и их количество для различных временных интервалов,
где каждая строка содержит Map кодов статусов с соответствующими значениями количества. Мы используем
`avgMap` для вычисления среднего количества для каждого кода статуса в каждом временном интервале.

```sql title="Запрос"
CREATE TABLE metrics(
    date Date,
    timeslot DateTime,
    status Map(String, UInt64)
) ENGINE = Log;

INSERT INTO metrics VALUES
    ('2000-01-01', '2000-01-01 00:00:00', (['a', 'b', 'c'], [15, 25, 35])),
    ('2000-01-01', '2000-01-01 00:00:00', (['c', 'd', 'e'], [45, 55, 65])),
    ('2000-01-01', '2000-01-01 00:01:00', (['d', 'e', 'f'], [75, 85, 95])),
    ('2000-01-01', '2000-01-01 00:01:00', (['f', 'g', 'g'], [105, 115, 125]));

SELECT
    timeslot,
    avgMap(status),
FROM metrics
GROUP BY timeslot;
```

Функция `avgMap` вычислит среднее количество для каждого кода статуса в каждом временном интервале. Например:

- Во временном интервале '2000-01-01 00:00:00':
  - Статус 'a': 15
  - Статус 'b': 25
  - Статус 'c': (35 + 45) / 2 = 40
  - Статус 'd': 55
  - Статус 'e': 65
- Во временном интервале '2000-01-01 00:01:00':
  - Статус 'd': 75
  - Статус 'e': 85
  - Статус 'f': (95 + 105) / 2 = 100
  - Статус 'g': (115 + 125) / 2 = 120

```response title="Результат"
   ┌────────────timeslot─┬─avgMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':100,'g':120}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':40,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## См. также {#see-also}

- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [Комбинатор `Map`](/sql-reference/aggregate-functions/combinators#-map)
