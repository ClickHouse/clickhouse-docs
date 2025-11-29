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

Комбинатор [`Map`](/sql-reference/aggregate-functions/combinators#-map) может быть применён к функции [`min`](/sql-reference/aggregate-functions/reference/min)
для вычисления минимального значения в Map отдельно для каждого ключа с использованием агрегатной функции-комбинатора `minMap`.



## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит коды статуса и их количество для различных временных слотов,
где каждая строка содержит `Map` с отображением кодов статуса в соответствующие им количества. Мы будем использовать
`minMap`, чтобы найти минимальное количество для каждого кода статуса в каждом временном слоте.

```sql title="Query"
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

Функция `minMap` находит минимальное значение счётчика для каждого статус-кода в каждом временном интервале. Например:

* Во временном интервале &#39;2000-01-01 00:00:00&#39;:
  * Статус &#39;a&#39;: 15
  * Статус &#39;b&#39;: 25
  * Статус &#39;c&#39;: min(35, 45) = 35
  * Статус &#39;d&#39;: 55
  * Статус &#39;e&#39;: 65
* Во временном интервале &#39;2000-01-01 00:01:00&#39;:
  * Статус &#39;d&#39;: 75
  * Статус &#39;e&#39;: 85
  * Статус &#39;f&#39;: min(95, 105) = 95
  * Статус &#39;g&#39;: min(115, 125) = 115

```response title="Response"
   ┌────────────timeslot─┬─minMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':95,'g':115}       │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':35,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## См. также {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
