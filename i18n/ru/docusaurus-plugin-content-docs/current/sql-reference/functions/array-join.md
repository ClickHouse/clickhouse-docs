---
slug: '/sql-reference/functions/array-join'
sidebar_label: arrayJoin
description: 'Документация для arrayJoin функции'
title: 'Функция arrayJoin'
doc_type: reference
---
# функция arrayJoin

Это очень необычная функция.

Обычные функции не изменяют набор строк, а лишь изменяют значения в каждой строке (map). Агрегатные функции сжимают набор строк (fold или reduce). Функция `arrayJoin` берет каждую строку и генерирует набор строк (unfold).

Эта функция принимает массив в качестве аргумента и размножает исходную строку на несколько строк в зависимости от количества элементов в массиве. Все значения в колонках просто копируются, кроме значений в колонке, где эта функция применяется; она заменяется соответствующим значением из массива.

:::note
Если массив пустой, `arrayJoin` не производит строк. Чтобы вернуть одну строку, содержащую значение по умолчанию для типа массива, вы можете обернуть его в [emptyArrayToSingle](./array-functions.md#emptyArrayToSingle), например: `arrayJoin(emptyArrayToSingle(...))`.
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

Функция `arrayJoin` влияет на все секции запроса, включая секцию `WHERE`. Обратите внимание, что результат запроса ниже равен `2`, хотя подзапрос вернул 1 строку.

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

Запрос может использовать несколько функций `arrayJoin`. В этом случае преобразование выполняется несколько раз, и строки умножаются. Например:

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

### Лучшие практики {#important-note}

Использование нескольких `arrayJoin` с одним и тем же выражением может не давать ожидаемых результатов из-за устранения общих подпроцессов. В таких случаях рассмотрите возможность модификации повторяющихся массивных выражений с помощью дополнительных операций, которые не влияют на результат объединения. Например,  `arrayJoin(arraySort(arr))`, `arrayJoin(arrayConcat(arr, []))`.

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

Обратите внимание на синтаксис [`ARRAY JOIN`](../statements/select/array-join.md) в запросе SELECT, который предоставляет более широкие возможности. `ARRAY JOIN` позволяет одновременно преобразовывать несколько массивов с одинаковым количеством элементов.

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

Или вы можете использовать [`Tuple`](../data-types/tuple.md).

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

Название `arrayJoin` в ClickHouse происходит от его концептуального сходства с операцией JOIN, но применяется к массивам внутри одной строки. В то время как традиционные JOIN объединяют строки из разных таблиц, `arrayJoin` "соединяет" каждый элемент массива в строке, производя несколько строк - по одной для каждого элемента массива - при этом дублируя значения других колонок. ClickHouse также предоставляет синтаксис [`ARRAY JOIN`](/sql-reference/statements/select/array-join), который делает эту связь с традиционными операциями JOIN еще более явной, используя привычную терминологию SQL JOIN. Этот процесс также называется "разворачиванием" массива, но термин "join" используется как в названии функции, так и в предложении, потому что он напоминает объединение таблицы с элементами массива, эффективно расширяя набор данных аналогично операциям JOIN.