---
slug: '/examples/aggregate-function-combinators/uniqArray'
title: 'uniqArray'
description: 'Пример использования комбинатора uniqArray'
keywords: ['uniq', 'array', 'combinator', 'examples', 'uniqArray']
sidebar_label: 'uniqArray'
---


# uniqArray {#uniqarray}

## Описание {#description}

Комбинатор [`Array`](/sql-reference/aggregate-functions/combinators#-array) 
может быть применен к функции [`uniq`](/sql-reference/aggregate-functions/reference/uniq) 
для расчета приблизительного количества уникальных элементов во всех массивах, 
используя агрегатную функцию `uniqArray`.

Функция `uniqArray` полезна, когда нужно посчитать уникальные элементы в нескольких 
массивах в наборе данных. Она эквивалентна использованию `uniq(arrayJoin())`, где 
`arrayJoin` сначала распрямляет массивы, а затем `uniq` считает уникальные элементы.

## Пример использования {#example-usage}

В этом примере мы используем образец набора данных о интересах пользователей в разных 
категориях, чтобы продемонстрировать, как работает `uniqArray`. Мы сравним его с 
`uniq(arrayJoin())`, чтобы показать разницу в подсчете уникальных элементов.

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
    uniqArray(interests) as unique_interests_total,
    uniq(arrayJoin(interests)) as unique_interests_arrayJoin
FROM user_interests;
```

Функция `uniqArray` считает уникальные элементы во всех массивах вместе, аналогично `uniq(arrayJoin())`. 
В этом примере:
- `uniqArray` возвращает 5, поскольку существует 5 уникальных интересов среди всех пользователей: 'reading', 'gaming', 'music', 'sports', 'cooking'
- `uniq(arrayJoin())` также возвращает 5, показывая, что обе функции считают уникальные элементы во всех массивах

```response title="Ответ"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```

## См. также {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
