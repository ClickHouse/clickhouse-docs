---
description: 'Справочная документация по функции arrayJoin'
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
Все значения в столбцах лишь копируются, за исключением значений в столбце, к которому применяется эта функция; они заменяются соответствующими значениями массива.

:::note
Если массив пуст, `arrayJoin` не возвращает ни одной строки.
Чтобы вернуть одну строку, содержащую значение по умолчанию для типа массива, можно обернуть массив функцией [emptyArrayToSingle](./array-functions.md#emptyArrayToSingle), например: `arrayJoin(emptyArrayToSingle(...))`.
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

Функция `arrayJoin` влияет на все разделы запроса, включая раздел `WHERE`. Обратите внимание, что результат запроса ниже равен `2`, хотя подзапрос вернул 1 строку.

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

В запросе можно использовать несколько функций `arrayJoin`. В этом случае преобразование выполняется несколько раз, и умножается число строк.
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
│           2 │ Istanbul │ Chrome  │
│           1 │ Istanbul │ Firefox │
│           2 │ Berlin   │ Chrome  │
│           1 │ Berlin   │ Firefox │
│           2 │ Babruysk │ Chrome  │
│           1 │ Babruysk │ Firefox │
└─────────────┴──────────┴─────────┘
```

### Рекомендации по использованию {#important-note}

Использование нескольких вызовов `arrayJoin` с одним и тем же выражением может не дать ожидаемых результатов из‑за устранения общих подвыражений.
В таких случаях рассмотрите возможность модифицировать повторяющиеся выражения массивов, добавив дополнительные операции, которые не влияют на результат соединения. Например, `arrayJoin(arraySort(arr))`, `arrayJoin(arrayConcat(arr, []))`

Пример:

```sql
SELECT
    arrayJoin(dice) AS first_throw,
    /* arrayJoin(dice) as second_throw */ -- is technically correct, but will annihilate result set
    arrayJoin(arrayConcat(dice, [])) AS second_throw -- intentionally changed expression to force re-evaluation
FROM (
    SELECT [1, 2, 3, 4, 5, 6] AS dice
);
```

Обратите внимание на синтаксис [`ARRAY JOIN`](../statements/select/array-join.md) в запросе SELECT, который даёт более широкие возможности.
`ARRAY JOIN` позволяет за один раз преобразовывать несколько массивов с одинаковым числом элементов.

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

Или можно использовать [`Tuple`](../data-types/tuple.md)

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

Название функции `arrayJoin` в ClickHouse обусловлено её концептуальным сходством с операцией JOIN, но применённой к массивам внутри одной строки. В то время как традиционные операции JOIN объединяют строки из разных таблиц, `arrayJoin` «соединяет» каждый элемент массива в строке, порождая несколько строк — по одной на каждый элемент массива — при этом дублируя значения остальных столбцов. ClickHouse также предоставляет синтаксис предложения [`ARRAY JOIN`](/sql-reference/statements/select/array-join), который делает эту связь с традиционными операциями JOIN ещё более явной за счёт использования привычной терминологии SQL JOIN. Этот процесс также называют «разворачиванием» массива, но термин «join» используется и в названии функции, и в предложении, потому что он напоминает соединение таблицы с элементами массива, фактически расширяя набор данных способом, похожим на операцию JOIN.
