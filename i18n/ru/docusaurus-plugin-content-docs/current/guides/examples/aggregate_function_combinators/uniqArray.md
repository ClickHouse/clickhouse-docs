---
'slug': '/examples/aggregate-function-combinators/uniqArray'
'title': 'uniqArray'
'description': 'Пример использования комбинатора uniqArray'
'keywords':
- 'uniq'
- 'array'
- 'combinator'
- 'examples'
- 'uniqArray'
'sidebar_label': 'uniqArray'
'doc_type': 'reference'
---


# uniqArray {#uniqarray}

## Описание {#description}

Комбинатор [`Array`](/sql-reference/aggregate-functions/combinators#-array) 
может быть применен к функции [`uniq`](/sql-reference/aggregate-functions/reference/uniq) 
для вычисления приблизительного количества уникальных элементов во всех массивах 
с использованием агрегатной функции-комбинатора `uniqArray`.

Функция `uniqArray` полезна, когда вам нужно подсчитать уникальные элементы 
в нескольких массивах в наборе данных. Она эквивалентна использованию `uniq(arrayJoin())`, 
где `arrayJoin` сначала распрямляет массивы, а затем `uniq` подсчитывает уникальные элементы.

## Пример использования {#example-usage}

В этом примере мы будем использовать пример набора данных о интересах пользователей по различным 
категориям, чтобы продемонстрировать, как работает `uniqArray`. Мы сравним его с 
`uniq(arrayJoin())`, чтобы показать разницу в подсчете уникальных элементов.

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

Функция `uniqArray` подсчитывает уникальные элементы во всех объединенных массивах, аналогично `uniq(arrayJoin())`. 
В этом примере:
- `uniqArray` возвращает 5, потому что существует 5 уникальных интересов у всех пользователей: 'чтение', 'игры', 'музыка', 'спорт', 'кулинария'
- `uniq(arrayJoin())` также возвращает 5, показывая, что обе функции подсчитывают уникальные элементы во всех массивах

```response title="Response"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```

## См. также {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
