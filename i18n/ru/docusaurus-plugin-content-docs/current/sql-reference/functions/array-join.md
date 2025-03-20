---
slug: /sql-reference/functions/array-join
sidebar_position: 15
sidebar_label: arrayJoin
---


# Функция arrayJoin

Это очень необычная функция.

Обычные функции не изменяют набор строк, а просто изменяют значения в каждой строке (отображение).
Агрегирующие функции сжимают набор строк (сведение или редукция).
Функция `arrayJoin` берет каждую строку и генерирует набор строк (разворачивание).

Эта функция принимает массив в качестве аргумента и размножает исходную строку на несколько строк в зависимости от количества элементов в массиве.
Все значения в колонках просто копируются, за исключением значений в колонке, где применяется эта функция; они заменяются соответствующими значениями из массива.

Пример:

``` sql
SELECT arrayJoin([1, 2, 3] AS src) AS dst, 'Hello', src
```

``` text
┌─dst─┬─\'Hello\'─┬─src─────┐
│   1 │ Hello     │ [1,2,3] │
│   2 │ Hello     │ [1,2,3] │
│   3 │ Hello     │ [1,2,3] │
└─────┴───────────┴─────────┘
```

Функция `arrayJoin` влияет на все секции запроса, включая секцию `WHERE`. Обратите внимание на результат 2, даже несмотря на то, что подзапрос вернул 1 строку.

Пример:

```sql
SELECT sum(1) AS impressions
FROM
(
    SELECT ['Istanbul', 'Berlin', 'Bobruisk'] AS cities
)
WHERE arrayJoin(cities) IN ['Istanbul', 'Berlin'];
```

``` text
┌─impressions─┐
│           2 │
└─────────────┘
```

Запрос может использовать несколько функций `arrayJoin`. В этом случае трансформация выполняется несколько раз, и строки умножаются.

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

``` text
┌─impressions─┬─city─────┬─browser─┐
│           2 │ Istanbul │ Chrome  │
│           1 │ Istanbul │ Firefox │
│           2 │ Berlin   │ Chrome  │
│           1 │ Berlin   │ Firefox │
│           2 │ Bobruisk │ Chrome  │
│           1 │ Bobruisk │ Firefox │
└─────────────┴──────────┴─────────┘
```
### Важное замечание! {#important-note}
Использование нескольких `arrayJoin` с одинаковым выражением может не привести к ожидаемым результатам из-за оптимизаций.
В таких случаях рассмотрите возможность изменения повторяющегося выражения массива с помощью дополнительных операций, которые не влияют на результат объединения - например, `arrayJoin(arraySort(arr))`, `arrayJoin(arrayConcat(arr, []))`

Пример:
```sql
SELECT
    arrayJoin(dice) as first_throw,
    /* arrayJoin(dice) as second_throw */ -- технически корректно, но уничтожит результат
    arrayJoin(arrayConcat(dice, [])) as second_throw -- намеренно изменено выражение для принудительной повторной оценки
FROM (
    SELECT [1, 2, 3, 4, 5, 6] as dice
);
```

Обратите внимание на синтаксис [ARRAY JOIN](../statements/select/array-join.md) в запросе SELECT, который предоставляет более широкие возможности.
`ARRAY JOIN` позволяет вам преобразовывать несколько массивов с одинаковым количеством элементов за один раз.

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

``` text
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

``` text
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Bobruisk │ Chrome  │
└─────────────┴──────────┴─────────┘
```
