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
можно применить к функции [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
для вычисления приблизительного количества уникальных элементов во всех массивах 
с использованием агрегатной агрегатной функции-комбинатора `uniqArray`.

Функция `uniqArray` полезна, когда необходимо посчитать уникальные элементы во 
множестве массивов в наборе данных. Она эквивалентна использованию `uniq(arrayJoin())`, где 
`arrayJoin` сначала разворачивает массивы, а затем `uniq` считает уникальные элементы.



## Пример использования

В этом примере мы используем демонстрационный набор данных с пользовательскими интересами по разным категориям, чтобы показать, как работает `uniqArray`. Мы сравним его с
`uniq(arrayJoin())`, чтобы продемонстрировать разницу в подсчёте уникальных элементов.

```sql title="Query"
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

Функция `uniqArray` подсчитывает количество уникальных элементов по всем массивам вместе, аналогично `uniq(arrayJoin())`.
В этом примере:

* `uniqArray` возвращает 5, потому что есть 5 уникальных интересов среди всех пользователей: &#39;reading&#39;, &#39;gaming&#39;, &#39;music&#39;, &#39;sports&#39;, &#39;cooking&#39;
* `uniq(arrayJoin())` также возвращает 5, что показывает, что обе функции подсчитывают количество уникальных элементов по всем массивам

```response title="Response"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```


## См. также {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Комбинатор Array`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
