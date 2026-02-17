---
slug: /guides/developer/cascading-materialized-views
title: '연쇄 materialized view'
description: '소스 테이블에서 여러 개의 materialized view를 사용하는 방법.'
keywords: ['materialized view', '집계']
doc_type: 'guide'
---

# 계단식 materialized view \{#cascading-materialized-views\}

이 예제에서는 먼저 materialized view를 생성하는 방법과, 그 위에 첫 번째 materialized view를 소스로 사용하는 두 번째 materialized view를 계단식으로 연결하는 방법을 보여줍니다. 이 페이지에서는 구현 방법, 다양한 가능성, 그리고 한계를 살펴봅니다. 서로 다른 사용 사례는 첫 번째 materialized view를 소스로 사용하는 두 번째 materialized view를 생성하여 해결할 수 있습니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

<br />

예제:

도메인 이름 그룹별 시간당 조회 수를 담고 있는 가상의 데이터 세트를 사용합니다.

목표

1. 각 도메인 이름에 대해 월별로 집계된 데이터가 필요합니다.
2. 각 도메인 이름에 대해 연도별로 집계된 데이터도 필요합니다.

다음 옵션 중 하나를 선택할 수 있습니다.

* SELECT 요청 동안 데이터를 읽고 집계하는 쿼리를 작성합니다.
* 수집 시점에 데이터를 새로운 형식으로 준비합니다.
* 수집 시점에 데이터를 특정 집계 결과에 맞춰 준비합니다.

materialized view를 사용해 데이터를 준비하면 ClickHouse가 처리해야 하는 데이터 양과 계산량을 줄여 SELECT 요청을 더 빠르게 만들 수 있습니다.

## materialized view를 위한 소스 테이블 \{#source-table-for-the-materialized-views\}

materialized view의 소스 테이블을 생성합니다. 목표는 개별 행이 아니라 집계된 데이터에 대해 보고하는 것이므로, 들어오는 데이터를 파싱한 뒤 필요한 정보를 Materialized Views로 전달하고 실제 원본 데이터는 버려도 됩니다. 이는 목표를 충족하면서 저장 공간도 절약하므로 `Null` 테이블 엔진을 사용합니다.

```sql
CREATE DATABASE IF NOT EXISTS analytics;
```

```sql
CREATE TABLE analytics.hourly_data
(
    `domain_name` String,
    `event_time` DateTime,
    `count_views` UInt64
)
ENGINE = Null
```

:::note
Null 테이블에도 materialized view를 생성할 수 있습니다. 이 경우 테이블에 기록된 데이터는 뷰에만 영향을 주지만, 원본 원시 데이터는 여전히 폐기됩니다.
:::

## 월별 집계 테이블과 materialized view \{#monthly-aggregated-table-and-materialized-view\}

첫 번째 materialized view를 위해 `Target` 테이블을 생성해야 합니다. 이 예시에서는 `analytics.monthly_aggregated_data` 테이블을 `Target` 테이블로 사용하며, 월별 및 도메인 이름별 조회수 합계를 저장합니다.

```sql
CREATE TABLE analytics.monthly_aggregated_data
(
    `domain_name` String,
    `month` Date,
    `sumCountViews` AggregateFunction(sum, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (domain_name, month)
```

대상 테이블로 데이터를 전달하는 materialized view는 다음과 같은 형태입니다:

```sql
CREATE MATERIALIZED VIEW analytics.monthly_aggregated_data_mv
TO analytics.monthly_aggregated_data
AS
SELECT
    toDate(toStartOfMonth(event_time)) AS month,
    domain_name,
    sumState(count_views) AS sumCountViews
FROM analytics.hourly_data
GROUP BY
    domain_name,
    month
```

## 연도별 집계 테이블과 materialized view \{#yearly-aggregated-table-and-materialized-view\}

이제 앞에서 사용한 대상 테이블 `monthly_aggregated_data`와 연결되는 두 번째 materialized view를 생성하겠습니다.

먼저, 각 도메인 이름에 대해 연도별로 집계된 조회수 합계를 저장하는 새 대상 테이블을 생성하겠습니다.

```sql
CREATE TABLE analytics.year_aggregated_data
(
    `domain_name` String,
    `year` UInt16,
    `sumCountViews` UInt64
)
ENGINE = SummingMergeTree()
ORDER BY (domain_name, year)
```

이 단계에서 캐스케이드를 정의합니다. `FROM` 구문은 `monthly_aggregated_data` 테이블을 사용하며, 이는 데이터 흐름이 다음과 같이 된다는 의미입니다:

1. 데이터가 `hourly_data` 테이블로 들어옵니다.
2. ClickHouse가 수신한 데이터를 첫 번째 materialized view인 `monthly_aggregated_data` 테이블로 전달합니다.
3. 마지막으로, 2단계에서 수신한 데이터가 `year_aggregated_data` 테이블로 전달됩니다.

```sql
CREATE MATERIALIZED VIEW analytics.year_aggregated_data_mv
TO analytics.year_aggregated_data
AS
SELECT
    toYear(toStartOfYear(month)) AS year,
    domain_name,
    sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    year
```

:::note
materialized view로 작업할 때 흔히 발생하는 오해는 데이터가 테이블에서 읽혀 온다고 생각하는 것입니다. 그러나 `Materialized views`는 이렇게 동작하지 않습니다. 전달되는 데이터는 테이블의 최종 결과가 아니라 삽입된 블록입니다.

이 예제에서 `monthly_aggregated_data`에 사용되는 엔진이 CollapsingMergeTree라고 가정해 보겠습니다. 이 경우 두 번째 materialized view인 `year_aggregated_data_mv`로 전달되는 데이터는 collapse가 완료된 테이블의 최종 결과가 아니라, `SELECT ... GROUP BY`에서 정의된 필드들로 구성된 데이터 블록이 그대로 전달됩니다.

CollapsingMergeTree, ReplacingMergeTree, SummingMergeTree를 사용하면서 캐스케이딩(cascading) materialized view를 생성할 계획이라면, 여기에서 설명하는 제한 사항을 반드시 이해해야 합니다.
:::

## 샘플 데이터 \{#sample-data\}

이제 데이터를 삽입하여 캐스케이딩 materialized view를 테스트할 차례입니다.

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

`analytics.hourly_data`의 내용을 SELECT로 조회하면 테이블 엔진이 `Null`이기 때문에 다음과 같은 결과가 표시되지만, 데이터는 실제로 처리되었습니다.

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

기대한 결과와 실제 결과를 쉽게 따라가며 비교할 수 있도록 작은 데이터 세트를 사용했습니다. 작은 데이터 세트에서 처리 흐름이 올바르게 동작하는 것이 확인되면, 이후에는 더 큰 규모의 데이터로 확장할 수 있습니다.

## 결과 \{#results\}

`sumCountViews` 필드를 선택하여 대상 테이블을 쿼리하려고 하면, (일부 터미널에서는) 이 값이 숫자가 아니라 AggregateFunction 타입으로 저장되어 있기 때문에 이진 표현으로 표시됩니다.
집계 결과의 최종 값을 얻으려면 `-Merge` 접미사를 사용해야 합니다.

다음 쿼리를 실행하면 AggregateFunction에 저장된 특수 문자를 확인할 수 있습니다:

```sql
SELECT sumCountViews FROM analytics.monthly_aggregated_data
```

```response
┌─sumCountViews─┐
│               │
│               │
│               │
└───────────────┘

3 rows in set. Elapsed: 0.003 sec.
```

대신 `Merge` 접미사를 사용해 `sumCountViews` 값을 얻어 보겠습니다:

```sql
SELECT
   sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data;
```

```response
┌─sumCountViews─┐
│            12 │
└───────────────┘

1 row in set. Elapsed: 0.003 sec.
```

`AggregatingMergeTree`에서 `AggregateFunction`을 `sum`으로 정의했으므로 `sumMerge`를 사용할 수 있습니다. `AggregateFunction`에 `avg`를 사용하면 `avgMerge`를 사용하며, 다른 함수들도 이와 같은 방식으로 대응되는 함수를 사용합니다.

```sql
SELECT
    month,
    domain_name,
    sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    month
```

이제 materialized view가 앞에서 정의한 목표를 충족하는지 검토할 수 있습니다.

이제 대상 테이블 `monthly_aggregated_data`에 데이터가 저장되었으므로 각 도메인 이름별 월별 집계 데이터를 조회할 수 있습니다:

```sql
SELECT
   month,
   domain_name,
   sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
   domain_name,
   month
```

```response
┌──────month─┬─domain_name────┬─sumCountViews─┐
│ 2020-01-01 │ clickhouse.com │             6 │
│ 2019-01-01 │ clickhouse.com │             1 │
│ 2019-02-01 │ clickhouse.com │             5 │
└────────────┴────────────────┴───────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

도메인 이름별 연도 집계 데이터:

```sql
SELECT
   year,
   domain_name,
   sum(sumCountViews)
FROM analytics.year_aggregated_data
GROUP BY
   domain_name,
   year
```

```response
┌─year─┬─domain_name────┬─sum(sumCountViews)─┐
│ 2019 │ clickhouse.com │                  6 │
│ 2020 │ clickhouse.com │                  6 │
└──────┴────────────────┴────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```

## 여러 개의 소스 테이블을 단일 대상 테이블로 결합하기 \{#combining-multiple-source-tables-to-single-target-table\}

materialized view는 여러 개의 소스 테이블을 단일 대상 테이블로 결합하는 데 사용할 수 있습니다. 이는 `UNION ALL` 로직과 유사한 방식으로 동작하는 materialized view를 생성할 때 유용합니다.

먼저, 서로 다른 메트릭 집합을 나타내는 두 개의 소스 테이블을 생성합니다:

```sql
CREATE TABLE analytics.impressions
(
    `event_time` DateTime,
    `domain_name` String
) ENGINE = MergeTree ORDER BY (domain_name, event_time)
;

CREATE TABLE analytics.clicks
(
    `event_time` DateTime,
    `domain_name` String
) ENGINE = MergeTree ORDER BY (domain_name, event_time)
;
```

그런 다음 결합된 메트릭 집합을 담을 `Target` 테이블을 생성합니다:

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

동일한 `Target` 테이블을 대상으로 하는 materialized view 2개를 생성합니다. 누락된 컬럼은 명시적으로 포함할 필요가 없습니다:

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- if you omit this, it will be the same 0
FROM
    analytics.impressions
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;

CREATE MATERIALIZED VIEW analytics.daily_clicks_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS clicks,
    0 impressions    ---<<<--- if you omit this, it will be the same 0
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

이제 값을 삽입하면 해당 값은 `Target` 테이블의 각 컬럼에 대해 집계됩니다:

```sql
INSERT INTO analytics.impressions (domain_name, event_time)
VALUES ('clickhouse.com', '2019-01-01 00:00:00'),
       ('clickhouse.com', '2019-01-01 12:00:00'),
       ('clickhouse.com', '2019-02-01 00:00:00'),
       ('clickhouse.com', '2019-03-01 00:00:00')
;

INSERT INTO analytics.clicks (domain_name, event_time)
VALUES ('clickhouse.com', '2019-01-01 00:00:00'),
       ('clickhouse.com', '2019-01-01 12:00:00'),
       ('clickhouse.com', '2019-03-01 00:00:00')
;
```

`Target` 테이블에서 결합된 노출 수와 클릭 수는 다음과 같습니다:`

```sql
SELECT
    on_date,
    domain_name,
    sum(impressions) AS impressions,
    sum(clicks) AS clicks
FROM
    analytics.daily_overview
GROUP BY
    on_date,
    domain_name
;
```

이 쿼리는 다음과 비슷한 결과를 출력합니다:

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
