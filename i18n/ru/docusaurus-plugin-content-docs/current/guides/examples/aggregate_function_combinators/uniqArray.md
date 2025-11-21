---
slug: '/examples/aggregate-function-combinators/uniqArray'
title: 'uniqArray'
description: 'Пример использования комбинатора uniqArray'
keywords: ['uniq', 'array', 'combinator', 'examples', 'uniqArray']
sidebar_label: 'uniqArray'
doc_type: 'reference'
---



# uniqArray {#uniqarray}


## Описание {#description}

Комбинатор [`Array`](/sql-reference/aggregate-functions/combinators#-array)
может применяться к функции [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
для вычисления приблизительного количества уникальных элементов во всех массивах
с помощью агрегатной функции-комбинатора `uniqArray`.

Функция `uniqArray` полезна, когда требуется подсчитать уникальные элементы
в нескольких массивах набора данных. Она эквивалентна использованию `uniq(arrayJoin())`, где
`arrayJoin` сначала разворачивает массивы, после чего `uniq` подсчитывает уникальные элементы.


## Пример использования {#example-usage}

В этом примере мы используем набор данных с интересами пользователей по различным
категориям для демонстрации работы функции `uniqArray`. Мы сравним её с
`uniq(arrayJoin())`, чтобы показать разницу в подсчёте уникальных элементов.

```sql title="Запрос"
CREATE TABLE user_interests
(
    user_id UInt32,
    interests Array(String)
) ENGINE = Memory;

INSERT INTO user_interests VALUES
    (1, ['reading', 'gaming', 'music']),
    (2, ['gaming', 'sports', 'music']),
    (3, ['reading', 'cooking']);

SELECT
    uniqArray(interests) AS unique_interests_total,
    uniq(arrayJoin(interests)) AS unique_interests_arrayJoin
FROM user_interests;
```

Функция `uniqArray` подсчитывает уникальные элементы во всех массивах вместе, аналогично `uniq(arrayJoin())`.
В этом примере:

- `uniqArray` возвращает 5, так как среди всех пользователей имеется 5 уникальных интересов: 'reading', 'gaming', 'music', 'sports', 'cooking'
- `uniq(arrayJoin())` также возвращает 5, что показывает, что обе функции подсчитывают уникальные элементы во всех массивах

```response title="Результат"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```


## См. также {#see-also}

- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
