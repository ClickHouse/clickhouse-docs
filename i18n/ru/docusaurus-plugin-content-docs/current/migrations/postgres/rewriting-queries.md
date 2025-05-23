---
slug: /migrations/postgresql/rewriting-queries
title: 'Переписывание запросов PostgreSQL'
keywords: ['postgres', 'postgresql', 'переписывание запросов', 'переписать запрос']
description: 'Часть 2 руководства по миграции с PostgreSQL на ClickHouse'
---

> Это **Часть 2** руководства по миграции с PostgreSQL на ClickHouse. Используя практический пример, оно демонстрирует, как эффективно провести миграцию с подходом репликации в реальном времени (CDC). Многие из рассматриваемых концепций также применимы к ручным пакетным передачам данных из PostgreSQL в ClickHouse.

Большинство SQL-запросов из вашей установки PostgreSQL должны выполняться в ClickHouse без изменения и, вероятно, будут исполняться быстрее.

## Дедупликация с использованием CDC {#deduplication-cdc}

При использовании репликации в реальном времени с CDC имейте в виду, что обновления и удаления могут привести к дублированию строк. Для управления этим вы можете использовать методы, связанные с представлениями и обновляемыми материализованными представлениями.

Обратитесь к этому [руководству](/integrations/clickpipes/postgres/deduplication#query-like-with-postgres), чтобы узнать, как мигрировать ваше приложение с PostgreSQL на ClickHouse с минимальными затруднениями, используя репликацию в реальном времени с CDC.

## Оптимизация запросов в ClickHouse {#optimize-queries-in-clickhouse}

Хотя миграция с минимальным переписыванием запросов возможна, рекомендуется использовать функции ClickHouse, чтобы значительно упростить запросы и улучшить производительность запросов.

Примеры, приведенные здесь, охватывают общие шаблоны запросов и показывают, как оптимизировать их с помощью ClickHouse. Они используют полный [набор данных Stack Overflow](/getting-started/example-datasets/stackoverflow) (до апреля 2024 года) на эквивалентных ресурсах в PostgreSQL и ClickHouse (8 ядер, 32 ГБ ОЗУ).

> Для простоты нижеизложенные запросы не учитывают использование методов для дедупликации данных.

> Итоги могут немного отличаться, так как данные Postgres содержат только строки, которые удовлетворяют ссылочной целостности внешних ключей. ClickHouse не накладывает таких ограничений и, следовательно, содержит полный набор данных, включая анонимных пользователей.

Пользователи (с более чем 10 вопросами), которые получили больше всего просмотров:

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

5 rows in set. Elapsed: 0.360 sec. Processed 24.37 million rows, 140.45 MB (67.73 million rows/s., 390.38 MB/s.)
Peak memory usage: 510.71 MiB.
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

Time: 107620.508 ms (01:47.621)
```

Какие `tags` получают больше всего `views`:

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

5 rows in set. Elapsed: 0.908 sec. Processed 59.82 million rows, 1.45 GB (65.87 million rows/s., 1.59 GB/s.)
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

Time: 112508.083 ms (01:52.508)
```

**Агрегатные функции**

По возможности пользователи должны использовать агрегатные функции ClickHouse. Ниже мы показываем использование функции [argMax](/sql-reference/aggregate-functions/reference/argmax) для вычисления самого просматриваемого вопроса каждого года.

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
MostViewedQuestionTitle: Как найти индекс для данного элемента в списке?
MaxViewCount:           6316987

Row 2:
──────
Year:                   2009
MostViewedQuestionTitle: Как отменить самые последние локальные коммиты в Git?
MaxViewCount:           13962748

...

Row 16:
───────
Year:                   2023
MostViewedQuestionTitle: Как мне решить "error: externally-managed-environment" каждый раз, когда я использую pip 3?
MaxViewCount:           506822

Row 17:
───────
Year:                   2024
MostViewedQuestionTitle: Предупреждение "Third-party cookie will be blocked. Узнайте больше на вкладке Проблемы"
MaxViewCount:           66975

17 rows in set. Elapsed: 0.677 sec. Processed 24.37 million rows, 1.86 GB (36.01 million rows/s., 2.75 GB/s.)
Peak memory usage: 554.31 MiB.
```

Это значительно проще (и быстрее), чем эквивалентный запрос Postgres:

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
 year |                                                 mostviewedquestiontitle                                                 | maxviewcount
------+-----------------------------------------------------------------------------------------------------------------------+--------------
 2008 | Как найти индекс для данного элемента в списке?                                                                       |       6316987
 2009 | Как отменить самые последние локальные коммиты в Git?                                                                     |       13962748

...

 2023 | Как мне решить "error: externally-managed-environment" каждый раз, когда я использую pip 3?                                          |       506822
 2024 | Предупреждение "Third-party cookie will be blocked. Узнайте больше на вкладке Проблемы"                                              |       66975
(17 rows)

Time: 125822.015 ms (02:05.822)
```

**Условия и массивы**

Функции условий и массивов значительно упрощают запросы. Следующий запрос вычисляет теги (с более чем 10000 вхождениями) с наибольшим процентным увеличением с 2022 по 2023 год. Обратите внимание, как следующий запрос ClickHouse краток благодаря условиям, массивным функциям и возможности повторного использования псевдонимов в группах HAVING и SELECT.

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

5 rows in set. Elapsed: 0.247 sec. Processed 5.08 million rows, 155.73 MB (20.58 million rows/s., 630.61 MB/s.)
Peak memory usage: 403.04 MiB.
```

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
```

[Нажмите здесь для Части 3](./data-modeling-techniques.md)
