---
description: 'Документация для функции arrayJoin'
sidebar_label: 'arrayJoin'
sidebar_position: 15
slug: /sql-reference/functions/array-join
title: 'Функция arrayJoin'
---


# Функция arrayJoin

Это очень необычная функция.

Обычные функции не изменяют набор строк, а просто изменяют значения в каждой строке (отображение).
Агрегатные функции сжимают набор строк (сворачивание или редукция).
Функция `arrayJoin` берет каждую строку и генерирует набор строк (разворачивание).

Эта функция принимает массив в качестве аргумента и распространяет исходную строку на несколько строк в зависимости от количества элементов в массиве.
Все значения в столбцах просто копируются, кроме значений в столбце, где применяется эта функция; оно заменяется соответствующим значением массива.

Пример:

```sql
SELECT arrayJoin([1, 2, 3] AS src) AS dst, 'Hello', src
```

```text
┌─dst─┬─\'Hello\'─┬─src─────┐
│   1 │ Hello     │ [1,2,3] │
│   2 │ Hello     │ [1,2,3] │
│   3 │ Hello     │ [1,2,3] │
└─────┴───────────┴─────────┘
```

Функция `arrayJoin` влияет на все части запроса, включая раздел `WHERE`. Обратите внимание на результат 2, хотя подзапрос вернул 1 строку.

Пример:

```sql
SELECT sum(1) AS impressions
FROM
(
    SELECT ['Istanbul', 'Berlin', 'Bobruisk'] AS cities
)
WHERE arrayJoin(cities) IN ['Istanbul', 'Berlin'];
```

```text
┌─impressions─┐
│           2 │
└─────────────┘
```

Запрос может использовать несколько функций `arrayJoin`. В этом случае преобразование выполняется несколько раз, и строки умножаются.

Пример:

```sql
SELECT
    sum(1) AS impressions,
    arrayJoin(cities) AS city,
    arrayJoin(browsers) AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Bobruisk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text
┌─impressions─┬─city─────┬─browser─┐
│           2 │ Istanbul │ Chrome  │
│           1 │ Istanbul │ Firefox │
│           2 │ Berlin   │ Chrome  │
│           1 │ Berlin   │ Firefox │
│           2 │ Bobruisk │ Chrome  │
│           1 │ Bobruisk │ Firefox │
└─────────────┴──────────┴─────────┘
```
### Важно! {#important-note}
Использование нескольких `arrayJoin` с одним и тем же выражением может не привести к ожидаемым результатам из-за оптимизаций.
В таких случаях рассмотрите возможность изменения повторяющегося выражения массива с помощью дополнительных операций, которые не влияют на результат соединения - например, `arrayJoin(arraySort(arr))`, `arrayJoin(arrayConcat(arr, []))`

Пример:
```sql
SELECT
    arrayJoin(dice) as first_throw,
    /* arrayJoin(dice) as second_throw */ -- технически корректно, но приведет к аннулированию набора результатов
    arrayJoin(arrayConcat(dice, [])) as second_throw -- намеренно изменено выражение для принудительного переоценивания
FROM (
    SELECT [1, 2, 3, 4, 5, 6] as dice
);
```

Обратите внимание на синтаксис [ARRAY JOIN](../statements/select/array-join.md) в запросе SELECT, который предоставляет более широкие возможности.
`ARRAY JOIN` позволяет вам преобразовать несколько массивов с одинаковым количеством элементов сразу.

Пример:

```sql
SELECT
    sum(1) AS impressions,
    city,
    browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Bobruisk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
ARRAY JOIN
    cities AS city,
    browsers AS browser
GROUP BY
    2,
    3
```

```text
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Bobruisk │ Chrome  │
└─────────────┴──────────┴─────────┘
```

Или вы можете использовать [Tuple](../data-types/tuple.md)

Пример:

```sql
SELECT
    sum(1) AS impressions,
    (arrayJoin(arrayZip(cities, browsers)) AS t).1 AS city,
    t.2 AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Bobruisk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Bobruisk │ Chrome  │
└─────────────┴──────────┴─────────┘
```
