---
description: 'Документация по функции arrayJoin'
sidebar_label: 'arrayJoin'
slug: /sql-reference/functions/array-join
title: 'Функция arrayJoin'
doc_type: 'reference'
---

# Функция arrayJoin {#arrayjoin-function}

Это очень необычная функция.

Обычные функции не изменяют набор строк, а лишь изменяют значения в каждой строке (map).
Агрегатные функции сжимают набор строк (fold или reduce).
Функция `arrayJoin` берёт каждую строку и порождает из неё набор строк (unfold).

Эта функция принимает массив в качестве аргумента и разворачивает исходную строку в несколько строк в количестве, равном числу элементов в массиве.
Все значения в столбцах просто копируются, за исключением значения в столбце, к которому применяется эта функция; оно заменяется соответствующим значением из массива.

:::note
Если массив пустой, `arrayJoin` не возвращает ни одной строки.
Чтобы вернуть одну строку, содержащую значение по умолчанию для типа массива, можно обернуть его в [emptyArrayToSingle](./array-functions.md#emptyArrayToSingle), например: `arrayJoin(emptyArrayToSingle(...))`.
:::

Например:

```sql title="Query"
SELECT arrayJoin([1, 2, 3] AS src) AS dst, 'Hello', src
```

```text title="Response"
┌─dst─┬─\'Hello\'─┬─src─────┐
│   1 │ Hello     │ [1,2,3] │
│   2 │ Hello     │ [1,2,3] │
│   3 │ Hello     │ [1,2,3] │
└─────┴───────────┴─────────┘
```

Функция `arrayJoin` влияет на все части запроса, включая раздел `WHERE`. Обратите внимание, что результат запроса ниже равен `2`, несмотря на то что подзапрос вернул одну строку.

```sql title="Query"
SELECT sum(1) AS impressions
FROM
(
    SELECT ['Istanbul', 'Berlin', 'Babruysk'] AS cities
)
WHERE arrayJoin(cities) IN ['Istanbul', 'Berlin'];
```

```text title="Response"
┌─impressions─┐
│           2 │
└─────────────┘
```

Запрос может использовать несколько функций `arrayJoin`. В этом случае преобразование выполняется несколько раз, в результате чего умножается число строк.
Например:

```sql title="Query"
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

```text title="Response"
┌─impressions─┬─city─────┬─browser─┐
│           2 │ Стамбул  │ Chrome  │
│           1 │ Стамбул  │ Firefox │
│           2 │ Берлин   │ Chrome  │
│           1 │ Берлин   │ Firefox │
│           2 │ Бобруйск │ Chrome  │
│           1 │ Бобруйск │ Firefox │
└─────────────┴──────────┴─────────┘
```

### Рекомендации по использованию {#important-note}

Использование нескольких `arrayJoin` с одним и тем же выражением может привести к неожиданным результатам из-за устранения общих подвыражений.
В таких случаях имеет смысл модифицировать повторяющиеся выражения с массивами с помощью дополнительных операций, которые не влияют на результат операции `join`. Например, `arrayJoin(arraySort(arr))`, `arrayJoin(arrayConcat(arr, []))`

Пример:

```sql
SELECT
    arrayJoin(dice) AS first_throw,
    /* arrayJoin(dice) as second_throw */ -- технически корректно, но приведет к пустому результату
    arrayJoin(arrayConcat(dice, [])) AS second_throw -- выражение намеренно изменено для принудительного пересчета
FROM (
    SELECT [1, 2, 3, 4, 5, 6] AS dice
);
```

Обратите внимание на синтаксис [`ARRAY JOIN`](../statements/select/array-join.md) в запросе SELECT, который даёт более широкие возможности.
`ARRAY JOIN` позволяет преобразовывать несколько массивов с одинаковым количеством элементов за один раз.

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

Также можно использовать [`Tuple`](../data-types/tuple.md)

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

Название функции `arrayJoin` в ClickHouse связано с её концептуальным сходством с операцией JOIN, но применяемой к массивам в пределах одной строки. В то время как традиционные JOIN объединяют строки из разных таблиц, `arrayJoin` как бы «соединяет» каждый элемент массива в строке, порождая несколько строк — по одной для каждого элемента массива — при этом дублируя значения остальных столбцов. В ClickHouse также доступен синтаксис предложения [`ARRAY JOIN`](/sql-reference/statements/select/array-join), который делает эту связь с традиционными операциями JOIN ещё более очевидной за счёт использования привычной терминологии SQL JOIN. Этот процесс также называют «разворачиванием» массива, но термин «join» используется и в названии функции, и в предложении, потому что операция напоминает присоединение таблицы к элементам массива, фактически расширяя набор данных способом, аналогичным операции JOIN.
