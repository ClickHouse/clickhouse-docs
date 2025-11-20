---
slug: '/examples/aggregate-function-combinators/minMap'
title: 'minMap'
description: 'Пример использования комбинатора minMap'
keywords: ['min', 'map', 'combinator', 'examples', 'minMap']
sidebar_label: 'minMap'
doc_type: 'reference'
---



# minMap {#minmap}


## Описание {#description}

Комбинатор [`Map`](/sql-reference/aggregate-functions/combinators#-map) может применяться к функции [`min`](/sql-reference/aggregate-functions/reference/min) для вычисления минимального значения в Map для каждого ключа с помощью агрегатной функции-комбинатора `minMap`.


## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит коды статусов и их значения для разных временных интервалов,
где каждая строка содержит Map с кодами статусов и соответствующими им значениями. Мы используем
`minMap`, чтобы найти минимальное значение для каждого кода статуса в каждом временном интервале.

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
    minMap(status),
FROM metrics
GROUP BY timeslot;
```

Функция `minMap` найдёт минимальное значение для каждого кода статуса в каждом временном интервале. Например:

- Во временном интервале '2000-01-01 00:00:00':
  - Статус 'a': 15
  - Статус 'b': 25
  - Статус 'c': min(35, 45) = 35
  - Статус 'd': 55
  - Статус 'e': 65
- Во временном интервале '2000-01-01 00:01:00':
  - Статус 'd': 75
  - Статус 'e': 85
  - Статус 'f': min(95, 105) = 95
  - Статус 'g': min(115, 125) = 115

```response title="Результат"
   ┌────────────timeslot─┬─minMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':95,'g':115}       │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':35,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## См. также {#see-also}

- [`min`](/sql-reference/aggregate-functions/reference/min)
- [Комбинатор `Map`](/sql-reference/aggregate-functions/combinators#-map)
