---
'slug': '/examples/aggregate-function-combinators/sumMap'
'title': 'sumMap'
'description': 'Пример использования комбинатора sumMap'
'keywords':
- 'sum'
- 'map'
- 'combinator'
- 'examples'
- 'sumMap'
'sidebar_label': 'sumMap'
'doc_type': 'reference'
---


# sumMap {#summap}

## Описание {#description}

Комбинатор [`Map`](/sql-reference/aggregate-functions/combinators#-map) может быть применён к функции [`sum`](/sql-reference/aggregate-functions/reference/sum) для вычисления суммы значений в Map в соответствии с каждым ключом, используя агрегатную функцию `sumMap`.

## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит коды статусов и их количество для разных временных интервалов, где каждая строка содержит Map кодов статусов с соответствующими значениями. Мы будем использовать `sumMap` для вычисления общего количества для каждого кода статуса в пределах каждого временного интервала.

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
    sumMap(status),
FROM metrics
GROUP BY timeslot;
```

Функция `sumMap` будет вычислять общее количество для каждого кода статуса в пределах каждого временного интервала. Например:
- В временном интервале '2000-01-01 00:00:00':
  - Статус 'a': 15
  - Статус 'b': 25
  - Статус 'c': 35 + 45 = 80
  - Статус 'd': 55
  - Статус 'e': 65
- В временном интервале '2000-01-01 00:01:00':
  - Статус 'd': 75
  - Статус 'e': 85
  - Статус 'f': 95 + 105 = 200
  - Статус 'g': 115 + 125 = 240

```response title="Response"
   ┌────────────timeslot─┬─sumMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':200,'g':240}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':80,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## См. также {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
