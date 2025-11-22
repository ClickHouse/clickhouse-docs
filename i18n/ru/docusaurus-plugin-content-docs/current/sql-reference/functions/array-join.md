---
description: 'Документация по функции arrayJoin'
sidebar_label: 'arrayJoin'
slug: /sql-reference/functions/array-join
title: 'Функция arrayJoin'
doc_type: 'reference'
---



# Функция arrayJoin

Это очень необычная функция.

Обычные функции не изменяют набор строк, а только изменяют значения в каждой строке (отображение).
Агрегатные функции сжимают набор строк (свёртка или редукция).
Функция `arrayJoin` берёт каждую строку и генерирует из неё набор строк (развёртка).

Эта функция принимает массив в качестве аргумента и размножает исходную строку в несколько строк по количеству элементов в массиве.
Все значения в столбцах просто копируются, за исключением значений в столбце, к которому применяется эта функция; они заменяются соответствующими значениями массива.

:::note
Если массив пуст, `arrayJoin` не создаёт строк.
Чтобы вернуть одну строку, содержащую значение по умолчанию для типа массива, можно обернуть его в [emptyArrayToSingle](./array-functions.md#emptyArrayToSingle), например: `arrayJoin(emptyArrayToSingle(...))`.
:::

Например:

```sql title="Запрос"
SELECT arrayJoin([1, 2, 3] AS src) AS dst, 'Hello', src
```

```text title="Ответ"
┌─dst─┬─\'Hello\'─┬─src─────┐
│   1 │ Hello     │ [1,2,3] │
│   2 │ Hello     │ [1,2,3] │
│   3 │ Hello     │ [1,2,3] │
└─────┴───────────┴─────────┘
```

Функция `arrayJoin` влияет на все секции запроса, включая секцию `WHERE`. Обратите внимание, что результат запроса ниже равен `2`, хотя подзапрос вернул 1 строку.

```sql title="Запрос"
SELECT sum(1) AS impressions
FROM
(
    SELECT ['Istanbul', 'Berlin', 'Babruysk'] AS cities
)
WHERE arrayJoin(cities) IN ['Istanbul', 'Berlin'];
```

```text title="Ответ"
┌─impressions─┐
│           2 │
└─────────────┘
```

Запрос может использовать несколько функций `arrayJoin`. В этом случае преобразование выполняется несколько раз, и строки умножаются.
Например:

```sql title="Запрос"
SELECT
    sum(1) AS impressions,
    arrayJoin(cities) AS city,
    arrayJoin(browsers) AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text title="Ответ"
┌─impressions─┬─city─────┬─browser─┐
│           2 │ Istanbul │ Chrome  │
│           1 │ Istanbul │ Firefox │
│           2 │ Berlin   │ Chrome  │
│           1 │ Berlin   │ Firefox │
│           2 │ Babruysk │ Chrome  │
│           1 │ Babruysk │ Firefox │
└─────────────┴──────────┴─────────┘
```

### Рекомендации {#important-note}

Использование нескольких `arrayJoin` с одним и тем же выражением может не дать ожидаемых результатов из-за устранения общих подвыражений.
В таких случаях рекомендуется изменить повторяющиеся выражения массивов с помощью дополнительных операций, которые не влияют на результат объединения. Например, `arrayJoin(arraySort(arr))`, `arrayJoin(arrayConcat(arr, []))`

Пример:

```sql
SELECT
    arrayJoin(dice) AS first_throw,
    /* arrayJoin(dice) as second_throw */ -- технически корректно, но уничтожит набор результатов
    arrayJoin(arrayConcat(dice, [])) AS second_throw -- выражение намеренно изменено для принудительного пересчёта
FROM (
    SELECT [1, 2, 3, 4, 5, 6] AS dice
);
```

Обратите внимание на синтаксис [`ARRAY JOIN`](../statements/select/array-join.md) в запросе SELECT, который предоставляет более широкие возможности.
`ARRAY JOIN` позволяет преобразовывать несколько массивов с одинаковым количеством элементов одновременно.

Пример:

```sql
SELECT
    sum(1) AS impressions,
    city,
    browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
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
│           1 │ Babruysk │ Chrome  │
└─────────────┴──────────┴─────────┘
```

Или вы можете использовать [`Tuple`](../data-types/tuple.md)

Пример:

```sql title="Query"
SELECT
    sum(1) AS impressions,
    (arrayJoin(arrayZip(cities, browsers)) AS t).1 AS city,
    t.2 AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text title="Row"
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Babruysk │ Chrome  │
└─────────────┴──────────┴─────────┘
```

Название `arrayJoin` в ClickHouse связано с его концептуальным сходством с операцией JOIN, но она применяется к массивам внутри одной строки. В то время как традиционные JOIN объединяют строки из разных таблиц, `arrayJoin` «соединяет» каждый элемент массива в строке, создавая несколько строк — по одной для каждого элемента массива — при этом дублируя значения остальных столбцов. ClickHouse также предоставляет синтаксис клаузы [`ARRAY JOIN`](/sql-reference/statements/select/array-join), который делает эту связь с традиционными операциями JOIN ещё более явной за счёт использования знакомой терминологии SQL JOIN. Этот процесс также называют «разворачиванием» массива, но термин «join» используется и в названии функции, и в самой клаузе, поскольку он напоминает соединение таблицы с элементами массива, фактически расширяя набор данных аналогично операции JOIN.
