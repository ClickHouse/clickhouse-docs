---
slug: /migrations/postgresql/rewriting-queries
title: 'Переписывание запросов PostgreSQL'
keywords: ['postgres', 'postgresql', 'переписывание запросов']
description: 'Часть 2 руководства по миграции с PostgreSQL на ClickHouse'
sidebar_label: 'Часть 2'
doc_type: 'guide'
---

> Это **Часть 2** руководства по миграции с PostgreSQL на ClickHouse. На практическом примере демонстрируется, как эффективно выполнить миграцию с использованием подхода репликации изменений в реальном времени (CDC). Многие рассмотренные концепции также применимы к ручным массовым переносам данных из PostgreSQL в ClickHouse.

Большинство SQL-запросов в вашем окружении PostgreSQL будет выполняться в ClickHouse без изменений и, вероятнее всего, работать быстрее.



## Дедупликация с использованием CDC {#deduplication-cdc}

При использовании репликации в реальном времени с CDC следует учитывать, что операции обновления и удаления могут приводить к появлению дублирующихся строк. Для решения этой проблемы можно использовать методы, основанные на представлениях (Views) и обновляемых материализованных представлениях (Refreshable Materialized Views).

Обратитесь к этому [руководству](/integrations/clickpipes/postgres/deduplication#query-like-with-postgres), чтобы узнать, как перенести ваше приложение из PostgreSQL в ClickHouse с минимальными сложностями при миграции с использованием репликации в реальном времени с CDC.


## Оптимизация запросов в ClickHouse {#optimize-queries-in-clickhouse}

Хотя миграция с минимальным переписыванием запросов возможна, рекомендуется использовать возможности ClickHouse для значительного упрощения запросов и дальнейшего повышения их производительности.

Приведенные здесь примеры охватывают распространенные шаблоны запросов и показывают, как оптимизировать их с помощью ClickHouse. В них используется полный [набор данных Stack Overflow](/getting-started/example-datasets/stackoverflow) (по апрель 2024 года) на эквивалентных ресурсах в PostgreSQL и ClickHouse (8 ядер, 32 ГБ ОЗУ).

> Для простоты в приведенных ниже запросах не используются методы дедупликации данных.

> Подсчеты здесь будут немного отличаться, поскольку данные Postgres содержат только строки, удовлетворяющие ссылочной целостности внешних ключей. ClickHouse не накладывает таких ограничений и поэтому содержит полный набор данных, включая, например, анонимных пользователей.

Пользователи (с более чем 10 вопросами), которые получают наибольшее количество просмотров:

```sql
-- ClickHouse
SELECT OwnerDisplayName, sum(ViewCount) AS total_views
FROM stackoverflow.posts
WHERE (PostTypeId = 'Question') AND (OwnerDisplayName != '')
GROUP BY OwnerDisplayName
HAVING count() > 10
ORDER BY total_views DESC
LIMIT 5

┌─OwnerDisplayName────────┬─total_views─┐
│ Joan Venge            │       25520387 │
│ Ray Vega              │       21576470 │
│ anon                  │       19814224 │
│ Tim                   │       19028260 │
│ John                  │       17638812 │
└─────────────────────────┴─────────────┘

5 строк в наборе. Затрачено: 0.360 сек. Обработано 24.37 млн строк, 140.45 МБ (67.73 млн строк/с., 390.38 МБ/с.)
Пиковое использование памяти: 510.71 МиБ.
```

```sql
--Postgres
SELECT OwnerDisplayName, SUM(ViewCount) AS total_views
FROM public.posts
WHERE (PostTypeId = 1) AND (OwnerDisplayName != '')
GROUP BY OwnerDisplayName
HAVING COUNT(*) > 10
ORDER BY total_views DESC
LIMIT 5;

        ownerdisplayname        | total_views
-------------------------+-------------
 Joan Venge             |       25520387
 Ray Vega               |       21576470
 Tim                    |       18283579
 J. Pablo Fern&#225;ndez |      12446818
 Matt                   |       12298764

Время: 107620.508 мс (01:47.621)
```

Какие теги (`tags`) получают наибольшее количество просмотров (`views`):

```sql
--ClickHouse
SELECT arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tags,
        sum(ViewCount) AS views
FROM posts
GROUP BY tags
ORDER BY views DESC
LIMIT 5

┌─tags───────┬──────views─┐
│ javascript │ 8190916894 │
│ python        │ 8175132834 │
│ java          │ 7258379211 │
│ c#            │ 5476932513 │
│ android       │ 4258320338 │
└────────────┴────────────┘

5 строк в наборе. Затрачено: 0.908 сек. Обработано 59.82 млн строк, 1.45 ГБ (65.87 млн строк/с., 1.59 ГБ/с.)
```

```sql
--Postgres
WITH tags_exploded AS (
        SELECT
        unnest(string_to_array(Tags, '|')) AS tag,
        ViewCount
        FROM public.posts
),
filtered_tags AS (
        SELECT
        tag,
        ViewCount
        FROM tags_exploded
        WHERE tag <> ''
)
SELECT tag AS tags,
        SUM(ViewCount) AS views
FROM filtered_tags
GROUP BY tag
ORDER BY views DESC
LIMIT 5;

        tags    |   views
------------+------------
 javascript | 7974880378
 python         | 7972340763
 java           | 7064073461
 c#             | 5308656277
 android        | 4186216900
(5 rows)

Время: 112508.083 мс (01:52.508)
```

**Агрегатные функции**

По возможности следует использовать агрегатные функции ClickHouse. Ниже показано использование функции [argMax](/sql-reference/aggregate-functions/reference/argmax) для вычисления наиболее просматриваемого вопроса каждого года.


```sql
--ClickHouse
SELECT  toYear(CreationDate) AS Year,
        argMax(Title, ViewCount) AS MostViewedQuestionTitle,
        max(ViewCount) AS MaxViewCount
FROM stackoverflow.posts
WHERE PostTypeId = 'Question'
GROUP BY Year
ORDER BY Year ASC
FORMAT Vertical
Row 1:
──────
Year:                   2008
MostViewedQuestionTitle: Как найти индекс элемента в списке?
MaxViewCount:           6316987

Row 2:
──────
Year:                   2009
MostViewedQuestionTitle: Как отменить последние локальные коммиты в Git?
MaxViewCount:           13962748

...

Row 16:
───────
Year:                   2023
MostViewedQuestionTitle: Как исправить ошибку "error: externally-managed-environment" при использовании pip 3?
MaxViewCount:           506822

Row 17:
───────
Year:                   2024
MostViewedQuestionTitle: Предупреждение "Third-party cookie will be blocked. Learn more in the Issues tab"
MaxViewCount:           66975

Получено 17 строк. Затрачено: 0.677 сек. Обработано 24.37 млн строк, 1.86 ГБ (36.01 млн строк/с., 2.75 ГБ/с.)
Пиковое использование памяти: 554.31 МиБ.
```

Это значительно проще (и быстрее), чем эквивалентный запрос в PostgreSQL:

```sql
--Postgres
WITH yearly_views AS (
        SELECT
        EXTRACT(YEAR FROM CreationDate) AS Year,
        Title,
        ViewCount,
        ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM CreationDate) ORDER BY ViewCount DESC) AS rn
        FROM public.posts
        WHERE PostTypeId = 1
)
SELECT
        Year,
        Title AS MostViewedQuestionTitle,
        ViewCount AS MaxViewCount
FROM yearly_views
WHERE rn = 1
ORDER BY Year;
 год  |                                                 mostviewedquestiontitle                                                 | maxviewcount
------+-----------------------------------------------------------------------------------------------------------------------+--------------
 2008 | Как найти индекс заданного элемента в списке?                                                                           |       6316987
 2009 | Как отменить последние локальные коммиты в Git?                                                                         |       13962748

...

 2023 | Как исправить ошибку "error: externally-managed-environment" при каждом использовании pip 3?                            |       506822
 2024 | Предупреждение "Third-party cookie will be blocked. Learn more in the Issues tab"                                       |       66975
(17 строк)

Время: 125822.015 мс (02:05.822)
```

**Условные выражения и массивы**

Условные выражения и функции для работы с массивами значительно упрощают запросы. Следующий запрос вычисляет теги (с числом вхождений более 10000) с наибольшим процентным ростом с 2022 по 2023 год. Обратите внимание, насколько лаконичным получается следующий запрос ClickHouse благодаря условным выражениям, функциям для работы с массивами и возможности повторно использовать алиасы в предложениях HAVING и SELECT.

```sql
--ClickHouse
SELECT  arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tag,
        countIf(toYear(CreationDate) = 2023) AS count_2023,
        countIf(toYear(CreationDate) = 2022) AS count_2022,
        ((count_2023 - count_2022) / count_2022) * 100 AS percent_change
FROM stackoverflow.posts
WHERE toYear(CreationDate) IN (2022, 2023)
GROUP BY tag
HAVING (count_2022 > 10000) AND (count_2023 > 10000)
ORDER BY percent_change DESC
LIMIT 5

┌─tag─────────┬─count_2023─┬─count_2022─┬──────percent_change─┐
│ next.js       │       13788 │         10520 │   31.06463878326996 │
│ spring-boot │         16573 │         17721 │  -6.478189718413183 │
│ .net          │       11458 │         12968 │ -11.644046884639112 │
│ azure         │       11996 │         14049 │ -14.613139725247349 │
│ docker        │       13885 │         16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘
```


5 строк в наборе. Прошло: 0.247 сек. Обработано 5.08 миллионов строк, 155.73 MB (20.58 миллионов строк/с., 630.61 MB/с.)
Пиковое использование памяти: 403.04 MiB.

````

```sql
--Postgres
SELECT
        tag,
        SUM(CASE WHEN year = 2023 THEN count ELSE 0 END) AS count_2023,
        SUM(CASE WHEN year = 2022 THEN count ELSE 0 END) AS count_2022,
        ((SUM(CASE WHEN year = 2023 THEN count ELSE 0 END) - SUM(CASE WHEN year = 2022 THEN count ELSE 0 END))
        / SUM(CASE WHEN year = 2022 THEN count ELSE 0 END)::float) * 100 AS percent_change
FROM (
        SELECT
        unnest(string_to_array(Tags, '|')) AS tag,
        EXTRACT(YEAR FROM CreationDate) AS year,
        COUNT(*) AS count
        FROM public.posts
        WHERE EXTRACT(YEAR FROM CreationDate) IN (2022, 2023)
        AND Tags <> ''
        GROUP BY tag, year
) AS yearly_counts
GROUP BY tag
HAVING SUM(CASE WHEN year = 2022 THEN count ELSE 0 END) > 10000
   AND SUM(CASE WHEN year = 2023 THEN count ELSE 0 END) > 10000
ORDER BY percent_change DESC
LIMIT 5;

        tag     | count_2023 | count_2022 |   percent_change
-------------+------------+------------+---------------------
 next.js        |       13712 |         10370 |   32.22757955641273
 spring-boot |          16482 |         17474 |  -5.677005837243905
 .net           |       11376 |         12750 | -10.776470588235295
 azure          |       11938 |         13966 | -14.520979521695546
 docker         |       13832 |         16701 | -17.178612059158134
(5 rows)

Time: 116750.131 ms (01:56.750)
````

[Перейти к части 3](/migrations/postgresql/data-modeling-techniques)
