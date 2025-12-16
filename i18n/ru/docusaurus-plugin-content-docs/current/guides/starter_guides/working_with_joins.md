---
title: 'Работа с операциями JOIN в ClickHouse'
description: 'Базовое руководство по использованию операций JOIN в ClickHouse'
keywords: ['JOINs', 'SQL', 'INNER JOIN', 'OUTER JOIN', 'CROSS JOIN', 'SEMI JOIN', 'ANTI JOIN', 'ANY JOIN', 'ASOF JOIN']
sidebar_label: 'Работа с операциями JOIN в ClickHouse'
slug: /guides/working-with-joins
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import imdb_schema from '@site/static/images/starter_guides/joins/imdb_schema.png';
import inner_join from '@site/static/images/starter_guides/joins/inner_join.png';
import outer_join from '@site/static/images/starter_guides/joins/outer_join.png';
import cross_join from '@site/static/images/starter_guides/joins/cross_join.png';
import semi_join from '@site/static/images/starter_guides/joins/semi_join.png';
import anti_join from '@site/static/images/starter_guides/joins/anti_join.png';
import any_join from '@site/static/images/starter_guides/joins/any_join.png';
import asof_join from '@site/static/images/starter_guides/joins/asof_join.png';
import asof_example from '@site/static/images/starter_guides/joins/asof_example.png';

ClickHouse полностью поддерживает стандартные операции JOIN в SQL, что позволяет эффективно анализировать данные.
В этом руководстве вы ознакомитесь с некоторыми из наиболее распространённых типов JOIN и узнаете, как использовать их с помощью диаграмм Венна и примеров запросов к нормализованному набору данных [IMDb](https://en.wikipedia.org/wiki/IMDb) из [репозитория реляционных наборов данных](https://relational.fit.cvut.cz/dataset/IMDb).

## Тестовые данные и ресурсы {#test-data-and-resources}

Инструкции по созданию и загрузке таблиц можно найти [здесь](/integrations/dbt/guides).
Набор данных также доступен в [playground](https://sql.clickhouse.com?query_id=AACTS8ZBT3G7SSGN8ZJBJY) для пользователей, которые не хотят создавать и загружать таблицы локально.

Вы будете использовать следующие четыре таблицы из примерного набора данных:

<Image img={imdb_schema} alt="Схема IMDB" />

Данные в этих четырёх таблицах описывают фильмы, которые могут относиться к одному или нескольким жанрам.
Роли в фильме исполняются актёрами.

Стрелки на диаграмме выше обозначают [связи внешнего ключа с первичным ключом](https://en.wikipedia.org/wiki/Foreign_key), например, столбец `movie_id` строки в таблице `genres` содержит значение `id` из строки таблицы `movies`.

Между фильмами и актёрами существует [отношение многие-ко-многим](https://en.wikipedia.org/wiki/Many-to-many_(data_model)).
Это отношение многие-ко-многим нормализовано в два [отношения один-ко-многим](https://en.wikipedia.org/wiki/One-to-many_(data_model)) с помощью таблицы `roles`.
Каждая строка в таблице `roles` содержит значения столбцов `id` из таблиц `movies` и `actors`.

## Типы соединений, поддерживаемые в ClickHouse {#join-types-supported-in-clickhouse}

ClickHouse поддерживает следующие типы соединений (JOIN):

- [INNER JOIN](#inner-join)
- [OUTER JOIN](#left--right--full-outer-join)
- [CROSS JOIN](#cross-join)
- [SEMI JOIN](#left--right-semi-join)
- [ANTI JOIN](#left--right-anti-join)
- [ANY JOIN](#left--right--inner-any-join)
- [ASOF JOIN](#asof-join)

В следующих разделах будут приведены примерные запросы для каждого из перечисленных выше типов JOIN.

## INNER JOIN {#inner-join}

Оператор `INNER JOIN` для каждой пары строк, совпадающих по ключам соединения, возвращает значения столбцов строки из левой таблицы, объединённые со значениями столбцов строки из правой таблицы.
Если у строки более одного совпадения, то возвращаются все совпадения (то есть для строк с совпадающими ключами соединения получается [декартово произведение](https://en.wikipedia.org/wiki/Cartesian_product)).

<Image img={inner_join} alt="Inner Join" />

Этот запрос находит жанр или жанры для каждого фильма, выполняя соединение таблицы `movies` с таблицей `genres`:

```sql
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
INNER JOIN genres AS g ON m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

```response
┌─name───────────────────────────────────┬─genre─────┐
│ Harry Potter and the Half-Blood Prince │ Action    │
│ Harry Potter and the Half-Blood Prince │ Adventure │
│ Harry Potter and the Half-Blood Prince │ Family    │
│ Harry Potter and the Half-Blood Prince │ Fantasy   │
│ Harry Potter and the Half-Blood Prince │ Thriller  │
│ DragonBall Z                           │ Action    │
│ DragonBall Z                           │ Adventure │
│ DragonBall Z                           │ Comedy    │
│ DragonBall Z                           │ Fantasy   │
│ DragonBall Z                           │ Sci-Fi    │
└────────────────────────────────────────┴───────────┘
```

:::note
Ключевое слово `INNER` можно опустить.
:::

Поведение `INNER JOIN` может быть расширено или изменено с помощью одного из следующих типов соединения.

## (LEFT / RIGHT / FULL) OUTER JOIN {#left--right--full-outer-join}

`LEFT OUTER JOIN` ведёт себя как `INNER JOIN`, а для несовпадающих строк левой таблицы ClickHouse возвращает [значения по умолчанию](/sql-reference/statements/create/table#default_values) для столбцов правой таблицы.

Запрос `RIGHT OUTER JOIN` аналогичен и также возвращает значения из несовпадающих строк правой таблицы вместе со значениями по умолчанию для столбцов левой таблицы.

Запрос `FULL OUTER JOIN` сочетает в себе `LEFT` и `RIGHT OUTER JOIN` и возвращает значения из несовпадающих строк как левой, так и правой таблиц вместе со значениями по умолчанию для столбцов правой и левой таблиц соответственно.

<Image img={outer_join} alt="Outer Join" />

:::note
ClickHouse можно [настроить](/operations/settings/settings#join_use_nulls) так, чтобы он возвращал [NULL](/sql-reference/syntax/#null) вместо значений по умолчанию (однако по [соображениям производительности](/sql-reference/data-types/nullable/#storage-features) это менее предпочтительно).
:::

Этот запрос находит все фильмы без жанра, выбирая все строки из таблицы `movies`, для которых нет соответствующих строк в таблице `genres`, и которые, следовательно, при выполнении запроса получают значение по умолчанию 0 для столбца `movie_id`:

```sql
SELECT m.name
FROM movies AS m
LEFT JOIN genres AS g ON m.id = g.movie_id
WHERE g.movie_id = 0
ORDER BY
    m.year DESC,
    m.name ASC
LIMIT 10;
```

```response
┌─name──────────────────────────────────────┐
│ """Pacific War, The"""                    │
│ """Turin 2006: XX Olympic Winter Games""" │
│ Arthur, the Movie                         │
│ Bridge to Terabithia                      │
│ Mars in Aries                             │
│ Master of Space and Time                  │
│ Ninth Life of Louis Drax, The             │
│ Paradox                                   │
│ Ratatouille                               │
│ """American Dad"""                        │
└───────────────────────────────────────────┘
```

:::note
Ключевое слово `OUTER` можно не указывать.
:::

## CROSS JOIN {#cross-join}

`CROSS JOIN` создаёт полное декартово произведение двух таблиц, не учитывая ключи соединения.
Каждая строка из левой таблицы объединяется с каждой строкой из правой таблицы.

<Image img={cross_join} alt="Cross Join" />

Следующий запрос, таким образом, объединяет каждую строку из таблицы `movies` с каждой строкой из таблицы `genres`:

```sql
SELECT
    m.name,
    m.id,
    g.movie_id,
    g.genre
FROM movies AS m
CROSS JOIN genres AS g
LIMIT 10;
```

```response
┌─name─┬─id─┬─movie_id─┬─genre───────┐
│ #28  │  0 │        1 │ Documentary │
│ #28  │  0 │        1 │ Short       │
│ #28  │  0 │        2 │ Comedy      │
│ #28  │  0 │        2 │ Crime       │
│ #28  │  0 │        5 │ Western     │
│ #28  │  0 │        6 │ Comedy      │
│ #28  │  0 │        6 │ Family      │
│ #28  │  0 │        8 │ Animation   │
│ #28  │  0 │        8 │ Comedy      │
│ #28  │  0 │        8 │ Short       │
└──────┴────┴──────────┴─────────────┘
```

Хотя предыдущий пример запроса сам по себе был не особо полезен, его можно дополнить оператором `WHERE`, чтобы сопоставить соответствующие строки и воспроизвести поведение `INNER JOIN` для поиска жанров для каждого фильма:

```sql
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
CROSS JOIN genres AS g
WHERE m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

Альтернативный синтаксис для `CROSS JOIN` задаёт несколько таблиц в предложении `FROM`, перечисляя их через запятую.

ClickHouse [переписывает](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/Core/Settings.h#L896) `CROSS JOIN` в `INNER JOIN`, если в предложении `WHERE` запроса есть выражения соединения.

Вы можете проверить это для примерного запроса с помощью [EXPLAIN SYNTAX](/sql-reference/statements/explain/#explain-syntax) (он возвращает синтаксически оптимизированную версию, в которую запрос переписывается перед [выполнением](https://youtu.be/hP6G2Nlz_cA)):

```sql
EXPLAIN SYNTAX
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
CROSS JOIN genres AS g
WHERE m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

```response
┌─explain─────────────────────────────────────┐
│ SELECT                                      │
│     name AS name,                           │
│     genre AS genre                          │
│ FROM movies AS m                            │
│ ALL INNER JOIN genres AS g ON id = movie_id │
│ WHERE id = movie_id                         │
│ ORDER BY                                    │
│     year DESC,                              │
│     name ASC,                               │
│     genre ASC                               │
│ LIMIT 10                                    │
└─────────────────────────────────────────────┘
```

Оператор `INNER JOIN` в синтаксически оптимизированной версии запроса с `CROSS JOIN` содержит ключевое слово `ALL`, которое было явно добавлено, чтобы сохранить семантику декартова произведения для `CROSS JOIN` даже при его преобразовании в `INNER JOIN`, для которого декартово произведение может быть [отключено](/operations/settings/settings#join_default_strictness).

```sql
ALL
```

И поскольку, как упоминалось выше, ключевое слово `OUTER` можно опустить для `RIGHT OUTER JOIN`, а ключевое слово `ALL` при необходимости добавить, вы можете написать `ALL RIGHT JOIN`, и это будет работать корректно.

## (LEFT / RIGHT) SEMI JOIN {#left--right-semi-join}

Запрос `LEFT SEMI JOIN` возвращает значения столбцов для каждой строки из левой таблицы, у которой есть хотя бы одно совпадение по ключу соединения в правой таблице.
Возвращается только первое найденное совпадение (декартово произведение не формируется).

Запрос `RIGHT SEMI JOIN` аналогичен и возвращает значения столбцов для всех строк из правой таблицы с хотя бы одним совпадением в левой таблице, при этом также возвращается только первое найденное совпадение.

<Image img={semi_join} alt="Semi Join" />

Этот запрос находит всех актёров и актрис, которые снимались в фильме в 2023 году.
Обратите внимание, что при обычном соединении (`INNER`) один и тот же актёр/актриса появлялся бы несколько раз, если у него/неё было более одной роли в 2023 году:

```sql
SELECT
    a.first_name,
    a.last_name
FROM actors AS a
LEFT SEMI JOIN roles AS r ON a.id = r.actor_id
WHERE toYear(created_at) = '2023'
ORDER BY id ASC
LIMIT 10;
```

```response
┌─first_name─┬─last_name──────────────┐
│ Michael    │ 'babeepower' Viera     │
│ Eloy       │ 'Chincheta'            │
│ Dieguito   │ 'El Cigala'            │
│ Antonio    │ 'El de Chipiona'       │
│ José       │ 'El Francés'           │
│ Félix      │ 'El Gato'              │
│ Marcial    │ 'El Jalisco'           │
│ José       │ 'El Morito'            │
│ Francisco  │ 'El Niño de la Manola' │
│ Víctor     │ 'El Payaso'            │
└────────────┴────────────────────────┘
```

## (LEFT / RIGHT) ANTI JOIN {#left--right-anti-join}

`LEFT ANTI JOIN` возвращает значения столбцов для всех несовпадающих строк из левой таблицы.

Аналогично, `RIGHT ANTI JOIN` возвращает значения столбцов для всех несовпадающих строк из правой таблицы.

<Image img={anti_join} alt="Anti Join" />

Альтернативная формулировка предыдущего примера запроса с внешним соединением — использование ANTI JOIN для поиска фильмов, у которых нет жанра в наборе данных:

```sql
SELECT m.name
FROM movies AS m
LEFT ANTI JOIN genres AS g ON m.id = g.movie_id
ORDER BY
    year DESC,
    name ASC
LIMIT 10;
```

```response
┌─name──────────────────────────────────────┐
│ """Pacific War, The"""                    │
│ """Turin 2006: XX Olympic Winter Games""" │
│ Arthur, the Movie                         │
│ Bridge to Terabithia                      │
│ Mars in Aries                             │
│ Master of Space and Time                  │
│ Ninth Life of Louis Drax, The             │
│ Paradox                                   │
│ Ratatouille                               │
│ """American Dad"""                        │
└───────────────────────────────────────────┘
```

## (LEFT / RIGHT / INNER) ANY JOIN {#left--right--inner-any-join}

`LEFT ANY JOIN` — это комбинация `LEFT OUTER JOIN` и `LEFT SEMI JOIN`. Это означает, что ClickHouse возвращает значения столбцов для каждой строки из левой таблицы, либо объединяя их со значениями столбцов совпадающей строки из правой таблицы, либо объединяя их со значениями столбцов по умолчанию для правой таблицы, если совпадающей строки не существует.
Если строка из левой таблицы имеет более одного совпадения в правой таблице, ClickHouse возвращает только объединённые значения столбцов из первого найденного совпадения (декартово произведение отключено).

Аналогично, `RIGHT ANY JOIN` — это комбинация `RIGHT OUTER JOIN` и `RIGHT SEMI JOIN`.

А `INNER ANY JOIN` — это `INNER JOIN` с отключённым декартовым произведением.

<Image img={any_join} alt="Any Join" />

Следующий пример демонстрирует `LEFT ANY JOIN` на абстрактном примере с использованием двух временных таблиц (`left_table` и `right_table`), созданных с помощью [values](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/TableFunctions/TableFunctionValues.h) — [табличной функции](/sql-reference/table-functions/):

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
LEFT ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   1 │   0 │
│   2 │   2 │
│   3 │   3 │
└─────┴─────┘
```

Это тот же запрос с использованием `RIGHT ANY JOIN`:

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
RIGHT ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   2 │   2 │
│   2 │   2 │
│   3 │   3 │
│   3 │   3 │
│   0 │   4 │
└─────┴─────┘
```

Вот запрос с `INNER ANY JOIN`:

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
INNER ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   2 │   2 │
│   3 │   3 │
└─────┴─────┘
```

## ASOF JOIN {#asof-join}

`ASOF JOIN` предоставляет возможности неточного сопоставления.
Если строка из левой таблицы не имеет точного совпадения в правой таблице, то вместо этого в качестве совпадения используется ближайшая по значению строка из правой таблицы.

Это особенно полезно для аналитики временных рядов и может значительно снизить сложность запросов.

<Image img={asof_join} alt="Asof Join" />

Следующий пример показывает аналитику временных рядов биржевых данных по акциям.
Таблица `quotes` содержит котировки биржевых тикеров в определённые моменты времени в течение дня.
В примере данные о цене обновляются каждые 10 секунд.
Таблица `trades` перечисляет сделки с тикерами — указаны сделки по определённому объёму тикера, купленному в конкретный момент времени:

<Image img={asof_example} alt="Asof Example" />

Чтобы вычислить точную стоимость каждой сделки, нужно сопоставить сделки с ближайшим по времени значением котировки.

Это просто и компактно делается с помощью `ASOF JOIN`, где вы используете предложение `ON` для указания условия точного совпадения и предложение `AND` для указания условия ближайшего совпадения: для конкретного тикера (точное совпадение) вы ищете строку с «ближайшим» временем из таблицы `quotes` ровно в момент сделки или до него (неточное совпадение) для сделки с этим тикером:

```sql
SELECT
    t.symbol,
    t.volume,
    t.time AS trade_time,
    q.time AS closest_quote_time,
    q.price AS quote_price,
    t.volume * q.price AS final_price
FROM trades t
ASOF LEFT JOIN quotes q ON t.symbol = q.symbol AND t.time >= q.time
FORMAT Vertical;
```

```response
Row 1:
──────
symbol:             ABC
volume:             200
trade_time:         2023-02-22 14:09:05
closest_quote_time: 2023-02-22 14:09:00
quote_price:        32.11
final_price:        6422

Row 2:
──────
symbol:             ABC
volume:             300
trade_time:         2023-02-22 14:09:28
closest_quote_time: 2023-02-22 14:09:20
quote_price:        32.15
final_price:        9645
```

:::note
Клауза `ON` в `ASOF JOIN` является обязательной и задаёт условие точного соответствия в дополнение к неточному условию соответствия в клаузе `AND`.
:::

## Краткое описание {#summary}

В этом руководстве описано, как ClickHouse поддерживает все стандартные типы операций SQL JOIN, а также специализированные варианты для выполнения аналитических запросов.
Подробнее об операциях JOIN см. в документации по команде [JOIN](/sql-reference/statements/select/join).