---
'slug': '/migrations/postgresql/rewriting-queries'
'title': 'PostgreSQL 쿼리 재작성'
'keywords':
- 'postgres'
- 'postgresql'
- 'rewriting queries'
'description': 'ClickHouse로 마이그레이션하는 가이드의 2부'
'sidebar_label': '2부'
'doc_type': 'guide'
---

> 이것은 PostgreSQL에서 ClickHouse로 마이그레이션하는 가이드의 **2부**입니다. 실제 예제를 사용하여 실시간 복제(CDC) 접근 방식을 통해 효율적으로 마이그레이션 수행하는 방법을 보여줍니다. 다루는 많은 개념은 PostgreSQL에서 ClickHouse로의 수동 대량 데이터 전송에도 적용될 수 있습니다.

PostgreSQL 설정의 대다수 SQL 쿼리는 ClickHouse에서 수정 없이 실행되며, 더 빠르게 실행될 가능성이 높습니다.

## CDC를 이용한 중복 제거 {#deduplication-cdc}

CDC를 사용하여 실시간 복제를 수행할 때, 업데이트 및 삭제로 인해 중복 행이 발생할 수 있음을 염두에 두십시오. 이를 관리하기 위해 Views 및 Refreshable Materialized Views를 포함한 기술을 사용할 수 있습니다.

최소한의 마찰로 PostgreSQL에서 ClickHouse로 애플리케이션을 마이그레이션하는 방법에 대한 자세한 내용은 이 [가이드](/integrations/clickpipes/postgres/deduplication#query-like-with-postgres)를 참조하십시오.

## ClickHouse에서 쿼리 최적화 {#optimize-queries-in-clickhouse}

최소한의 쿼리 재작성으로 마이그레이션이 가능하지만, ClickHouse의 기능을 활용하여 쿼리를 상당히 단순화하고 쿼리 성능을 더욱 향상시킬 것을 권장합니다.

여기에서 제공하는 예제는 일반적인 쿼리 패턴을 다루며 ClickHouse를 사용하여 이를 최적화하는 방법을 보여줍니다. 이들은 PostgreSQL 및 ClickHouse에서의 동등한 리소스(8코어, 32GiB RAM)에 대한 전체 [Stack Overflow 데이터 집합](/getting-started/example-datasets/stackoverflow) (2024년 4월까지)를 사용합니다.

> 간단함을 위해 아래 쿼리는 데이터 중복 제거 기술 사용을 생략합니다.

> 여기서 Count는 Postgres 데이터가 외래 키의 참조 무결성을 만족하는 행만 포함하고 있기 때문에 약간 다를 것입니다. ClickHouse는 이러한 제약을 부과하지 않으므로 전체 데이터 세트를 가지고 있습니다. 예를 들어, 익명의 사용자도 포함됩니다.

가장 많은 조회수를 기록한 사용자(질문이 10개 이상인 경우):

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

가장 많은 조회수를 기록한 `tags`:

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

**집계 함수**

가능한 경우, 사용자는 ClickHouse의 집계 함수를 활용해야 합니다. 아래에서는 [argMax](/sql-reference/aggregate-functions/reference/argmax) 함수를 사용하여 매년 가장 많이 조회된 질문을 계산하는 방법을 보여줍니다.

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
MostViewedQuestionTitle: How to find the index for a given item in a list?
MaxViewCount:           6316987

Row 2:
──────
Year:                   2009
MostViewedQuestionTitle: How do I undo the most recent local commits in Git?
MaxViewCount:           13962748

...

Row 16:
───────
Year:                   2023
MostViewedQuestionTitle: How do I solve "error: externally-managed-environment" every time I use pip 3?
MaxViewCount:           506822

Row 17:
───────
Year:                   2024
MostViewedQuestionTitle: Warning "Third-party cookie will be blocked. Learn more in the Issues tab"
MaxViewCount:           66975

17 rows in set. Elapsed: 0.677 sec. Processed 24.37 million rows, 1.86 GB (36.01 million rows/s., 2.75 GB/s.)
Peak memory usage: 554.31 MiB.
```

이것은 동등한 Postgres 쿼리보다 훨씬 더 간단하고 (더 빠름)입니다:

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
 2008 | How to find the index for a given item in a list?                                                                       |       6316987
 2009 | How do I undo the most recent local commits in Git?                                                                     |       13962748

...

 2023 | How do I solve "error: externally-managed-environment" every time I use pip 3?                                          |       506822
 2024 | Warning "Third-party cookie will be blocked. Learn more in the Issues tab"                                              |       66975
(17 rows)

Time: 125822.015 ms (02:05.822)
```

**조건문 및 배열**

조건문과 배열 함수는 쿼리를 상당히 단순화합니다. 다음 쿼리는 2022년부터 2023년까지 가장 큰 비율 증가를 보인 태그(10000회 이상 발생)를 계산합니다. 다음 ClickHouse 쿼리가 조건문, 배열 함수, HAVING 및 SELECT 절에서 별칭을 재사용할 수 있는 덕분에 짧다는 것을 주목하세요.

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

[파트 3로 이동하려면 클릭하세요](/migrations/postgresql/data-modeling-techniques)
