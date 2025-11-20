---
'slug': '/guides/developer/cascading-materialized-views'
'title': '계단식 물리화된 뷰'
'description': '소스 테이블에서 여러 개의 물리화된 뷰를 사용하는 방법.'
'keywords':
- 'materialized view'
- 'aggregation'
'doc_type': 'guide'
---


# 계단식 물리화된 뷰

이 예제는 물리화된 뷰를 생성하는 방법과 두 번째 물리화된 뷰를 첫 번째 뷰에 연결하는 방법을 보여줍니다. 이 페이지에서는 그 방법, 여러 가지 가능성 및 한계를 확인할 수 있습니다. 다양한 사용 사례는 두 번째 물리화된 뷰를 소스로 사용하여 물리화된 뷰를 생성함으로써 해결할 수 있습니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube 비디오 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

예시:

우리는 도메인 이름 집합의 시간당 조회 수를 포함하는 가상의 데이터 세트를 사용할 것입니다.

우리의 목표

1. 각 도메인 이름에 대해 월별로 집계된 데이터를 필요로 합니다.
2. 각 도메인 이름에 대해 연도별로 집계된 데이터도 필요로 합니다.

다음 중 하나의 옵션을 선택할 수 있습니다:

- SELECT 요청 중에 데이터를 읽고 집계하는 쿼리를 작성합니다.
- 데이터를 새로운 형식으로 수집 시간에 준비합니다.
- 특정 집계로 수집 시간에 데이터를 준비합니다.

물리화된 뷰를 사용하여 데이터를 준비하면 ClickHouse가 수행해야 하는 데이터와 계산의 양을 제한할 수 있으며, SELECT 요청을 더 빠르게 수행할 수 있습니다.

## 물리화된 뷰의 소스 테이블 {#source-table-for-the-materialized-views}

소스 테이블을 생성합니다. 우리의 목표는 집계된 데이터에 대한 보고와 개별 행이 아니라는 점을 고려하여 데이터를 파싱하고 정보를 물리화된 뷰로 전달하며 실제 들어오는 데이터는 삭제할 수 있습니다. 이는 우리의 목표를 충족시키며 저장 공간을 절약할 수 있으므로 `Null` 테이블 엔진을 사용합니다.

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
Null 테이블에서 물리화된 뷰를 생성할 수 있습니다. 따라서 테이블에 작성된 데이터는 뷰에 영향을 미치지만, 원래의 원시 데이터는 여전히 삭제됩니다.
:::

## 월별 집계 테이블 및 물리화된 뷰 {#monthly-aggregated-table-and-materialized-view}

첫 번째 물리화된 뷰를 위해 `Target` 테이블을 생성해야 하며, 이 예시에서는 `analytics.monthly_aggregated_data`가 될 것입니다. 우리는 월별 및 도메인 이름별 조회 수의 합계를 저장할 것입니다.

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

데이터를 `Target` 테이블로 전달할 물리화된 뷰는 다음과 같습니다:

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

## 연간 집계 테이블 및 물리화된 뷰 {#yearly-aggregated-table-and-materialized-view}

이제 앞서 만든 대상 테이블 `monthly_aggregated_data`에 연결된 두 번째 물리화된 뷰를 생성할 것입니다.

먼저 각 도메인 이름에 대한 연간 집계 조회 수의 합계를 저장할 새 대상 테이블을 만듭니다.

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

이 단계에서 계단식 연결이 정의됩니다. `FROM` 문은 `monthly_aggregated_data` 테이블을 사용하며, 이는 데이터 흐름이 다음과 같음을 의미합니다:

1. 데이터가 `hourly_data` 테이블로 들어옵니다.
2. ClickHouse는 수신된 데이터를 첫 번째 물리화된 뷰인 `monthly_aggregated_data` 테이블로 전달합니다.
3. 마지막으로 단계 2에서 수신된 데이터가 `year_aggregated_data`로 전달됩니다.

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
물리화된 뷰와 작업할 때 일반적인 오해 중 하나는 테이블에서 데이터가 읽힌다는 것입니다. 이것이 `물리화된 뷰`의 작동 방식은 아닙니다; 전달되는 데이터는 삽입된 블록이며, 테이블의 최종 결과가 아닙니다.

이 예제에서 `monthly_aggregated_data`에 사용된 엔진이 CollapsingMergeTree라고 가정해 봅시다. 두 번째 물리화된 뷰 `year_aggregated_data_mv`로 전달된 데이터는 압축된 테이블의 최종 결과가 아닙니다. 데이터 블록을 `SELECT ... GROUP BY`에서 정의된 필드를 포함하여 전달합니다.

CollapsingMergeTree, ReplacingMergeTree 또는 SummingMergeTree를 사용하고 장기 물리화된 뷰를 생성할 계획이라면 여기 설명된 한계를 이해해야 합니다.
:::

## 샘플 데이터 {#sample-data}

이제 데이터를 삽입하여 계단식 물리화된 뷰를 테스트할 시간입니다:

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

`analytics.hourly_data`의 내용을 SELECT하면 다음과 같은 결과를 보게 될 것입니다. 테이블 엔진이 `Null`이기 때문에 데이터는 처리되었지만 삭제됩니다.

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

우리는 작은 데이터 세트를 사용하여 결과를 추적하고 기대하는 것과 비교할 수 있도록 하였습니다. 작은 데이터 세트에서 흐름이 올바른지 확인한 후에는 대량 데이터로 이동할 수 있습니다.

## 결과 {#results}

대상 테이블에서 `sumCountViews` 필드를 선택하여 쿼리하면 이진 표현이 출력됩니다(일부 터미널에서는), 값이 숫자로 저장되지 않고 AggregateFunction 유형으로 저장되기 때문입니다. 집계의 최종 결과를 얻으려면 `-Merge` 접미사를 사용해야 합니다.

이 쿼리로 AggregateFunction에 저장된 특수 문자를 확인할 수 있습니다:

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

대신 `Merge` 접미사를 사용하여 `sumCountViews` 값을 가져와 보겠습니다:

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

`AggregatingMergeTree`에서는 `AggregateFunction`을 `sum`으로 정의하므로 `sumMerge`를 사용할 수 있습니다. `AggregateFunction`에서 `avg` 함수를 사용할 경우 `avgMerge`를 사용하며, 이와 같은 방식입니다.

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

이제 물리화된 뷰가 우리가 정의한 목표에 부합하는지 검토할 수 있습니다.

대상 테이블 `monthly_aggregated_data`에 데이터가 저장되었으므로 각 도메인 이름에 대해 월별로 집계된 데이터를 얻을 수 있습니다:

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

각 도메인 이름에 대해 연도별 집계 데이터:

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

## 여러 소스 테이블을 단일 대상 테이블로 결합하기 {#combining-multiple-source-tables-to-single-target-table}

물리화된 뷰는 여러 소스 테이블을 동일한 대상 테이블로 결합하는 데에도 사용될 수 있습니다. 이는 `UNION ALL` 논리와 유사한 물리화된 뷰를 만드는 데 유용합니다.

먼저 서로 다른 메트릭 집합을 나타내는 두 개의 소스 테ーブル을 생성합니다:

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

그런 다음 결합된 메트릭 집합으로 `Target` 테이블을 생성합니다:

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

같은 `Target` 테이블을 가리키는 두 개의 물리화된 뷰를 생성합니다. 누락된 열을 명시적으로 포함할 필요는 없습니다:

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

이제 값을 삽입하면 해당 값이 `Target` 테이블의 각 열에 집계됩니다:

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

`Target` 테이블에 결합된 노출 수와 클릭 수:

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

이 쿼리는 다음과 같은 결과를 출력해야 합니다:

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
