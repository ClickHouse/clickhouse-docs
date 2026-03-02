---
title: '기본 시계열 작업'
sidebar_label: '기본 작업'
description: 'ClickHouse에서 수행하는 기본 시계열 작업.'
slug: /use-cases/time-series/basic-operations
keywords: ['시계열', '기본 작업', '데이터 수집', '쿼리', '필터링', '그룹화', '집계']
show_related_blogs: true
doc_type: 'guide'
---

# 기본 시계열 연산 \{#basic-time-series-operations\}

ClickHouse는 시계열 데이터 작업을 위한 여러 가지 방법을 제공하여, 서로 다른 기간에 걸쳐 데이터 포인트를 집계하고, 그룹화하고, 분석할 수 있도록 합니다.
이 섹션에서는 시간 기반 데이터를 다룰 때 일반적으로 사용되는 기본 연산을 설명합니다.

일반적인 연산에는 시간 간격별 데이터 그룹화, 시계열 데이터의 누락 구간 처리, 기간 간 변화량 계산 등이 포함됩니다.
이러한 연산은 표준 SQL 구문과 ClickHouse의 내장 시간 함수들을 함께 사용하여 수행할 수 있습니다.

이제 Wikistat (Wikipedia 페이지 조회수 데이터) 데이터셋을 사용하여 ClickHouse의 시계열 쿼리 기능을 살펴보겠습니다:

```sql
CREATE TABLE wikistat
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (time);
```

이 테이블을 10억 개의 행으로 채워 보겠습니다:

```sql
INSERT INTO wikistat 
SELECT *
FROM s3('https://ClickHouse-public-datasets.s3.amazonaws.com/wikistat/partitioned/wikistat*.native.zst') 
LIMIT 1e9;
```

## 시간 버킷별 집계 \{#time-series-aggregating-time-bucket\}

가장 일반적인 요구 사항 중 하나는 일정한 시간 구간을 기준으로 데이터를 집계하는 것입니다. 예를 들어, 각 날짜별 전체 히트 수를 구하는 경우입니다.

```sql
SELECT
    toDate(time) AS date,
    sum(hits) AS hits
FROM wikistat
GROUP BY ALL
ORDER BY date ASC
LIMIT 5;
```

```text
┌───────date─┬─────hits─┐
│ 2015-05-01 │ 25524369 │
│ 2015-05-02 │ 25608105 │
│ 2015-05-03 │ 28567101 │
│ 2015-05-04 │ 29229944 │
│ 2015-05-05 │ 29383573 │
└────────────┴──────────┘
```

여기서는 지정된 시간을 Date 타입으로 변환하는 [`toDate()`](/sql-reference/functions/type-conversion-functions#toDate) 함수를 사용했습니다. 또는 1시간 단위로 그룹화한 뒤 특정 날짜로 필터링할 수도 있습니다:

```sql
SELECT
    toStartOfHour(time) AS hour,
    sum(hits) AS hits    
FROM wikistat
WHERE date(time) = '2015-07-01'
GROUP BY ALL
ORDER BY hour ASC
LIMIT 5;
```

```text
┌────────────────hour─┬───hits─┐
│ 2015-07-01 00:00:00 │ 656676 │
│ 2015-07-01 01:00:00 │ 768837 │
│ 2015-07-01 02:00:00 │ 862311 │
│ 2015-07-01 03:00:00 │ 829261 │
│ 2015-07-01 04:00:00 │ 749365 │
└─────────────────────┴────────┘
```

여기에서 사용하는 [`toStartOfHour()`](/docs/sql-reference/functions/date-time-functions#toStartOfHour) 함수는 지정된 시간을 그 시간이 속한 시(hour)의 시작 시각으로 변환합니다.
연, 분기, 월 또는 일 기준으로도 그룹화할 수 있습니다.

## 사용자 정의 그룹화 간격 \{#time-series-custom-grouping-intervals\}

[`toStartOfInterval()`](/docs/sql-reference/functions/date-time-functions#toStartOfInterval) 함수를 사용하면 예를 들어 5분처럼 임의의 간격으로도 그룹화할 수 있습니다.

이제 4시간 간격으로 그룹화한다고 가정해 보겠습니다.
[`INTERVAL`](/docs/sql-reference/data-types/special-data-types/interval) 절을 사용하여 그룹화 간격을 지정할 수 있습니다.

```sql
SELECT
    toStartOfInterval(time, INTERVAL 4 HOUR) AS interval,
    sum(hits) AS hits
FROM wikistat
WHERE date(time) = '2015-07-01'
GROUP BY ALL
ORDER BY interval ASC
LIMIT 6;
```

또는 [`toIntervalHour()`](/docs/sql-reference/functions/type-conversion-functions#toIntervalHour) 함수를 사용할 수 있습니다

```sql
SELECT
    toStartOfInterval(time, toIntervalHour(4)) AS interval,
    sum(hits) AS hits
FROM wikistat
WHERE date(time) = '2015-07-01'
GROUP BY ALL
ORDER BY interval ASC
LIMIT 6;
```

어느 쪽이든 다음과 같은 결과가 나옵니다:

```text
┌────────────interval─┬────hits─┐
│ 2015-07-01 00:00:00 │ 3117085 │
│ 2015-07-01 04:00:00 │ 2928396 │
│ 2015-07-01 08:00:00 │ 2679775 │
│ 2015-07-01 12:00:00 │ 2461324 │
│ 2015-07-01 16:00:00 │ 2823199 │
│ 2015-07-01 20:00:00 │ 2984758 │
└─────────────────────┴─────────┘
```

## 빈 그룹 채우기 \{#time-series-filling-empty-groups\}

많은 경우에 일부 구간이 비어 있는 희소 데이터를 다루게 됩니다. 이로 인해 비어 있는 버킷이 생깁니다. 예를 들어, 데이터를 1시간 간격으로 그룹화하는 다음 예제를 살펴보겠습니다. 이 경우 일부 시간 구간에 값이 없는 상태로 다음과 같은 통계가 출력됩니다:

```sql
SELECT
    toStartOfHour(time) AS hour,
    sum(hits)
FROM wikistat
WHERE (project = 'ast') AND (subproject = 'm') AND (date(time) = '2015-07-01')
GROUP BY ALL
ORDER BY hour ASC;
```

```text
┌────────────────hour─┬─sum(hits)─┐
│ 2015-07-01 00:00:00 │         3 │ <- missing values
│ 2015-07-01 02:00:00 │         1 │ <- missing values
│ 2015-07-01 04:00:00 │         1 │
│ 2015-07-01 05:00:00 │         2 │
│ 2015-07-01 06:00:00 │         1 │
│ 2015-07-01 07:00:00 │         1 │
│ 2015-07-01 08:00:00 │         3 │
│ 2015-07-01 09:00:00 │         2 │ <- missing values
│ 2015-07-01 12:00:00 │         2 │
│ 2015-07-01 13:00:00 │         4 │
│ 2015-07-01 14:00:00 │         2 │
│ 2015-07-01 15:00:00 │         2 │
│ 2015-07-01 16:00:00 │         2 │
│ 2015-07-01 17:00:00 │         1 │
│ 2015-07-01 18:00:00 │         5 │
│ 2015-07-01 19:00:00 │         5 │
│ 2015-07-01 20:00:00 │         4 │
│ 2015-07-01 21:00:00 │         4 │
│ 2015-07-01 22:00:00 │         2 │
│ 2015-07-01 23:00:00 │         2 │
└─────────────────────┴───────────┘
```

ClickHouse는 이를 처리하기 위해 [`WITH FILL`](/docs/guides/developer/time-series-filling-gaps#with-fill) 수정자를 제공합니다. 이 수정자는 비어 있는 모든 시간 구간을 0으로 채워, 시간에 따른 분포를 더 잘 이해할 수 있게 합니다:

```sql
SELECT
    toStartOfHour(time) AS hour,
    sum(hits)
FROM wikistat
WHERE (project = 'ast') AND (subproject = 'm') AND (date(time) = '2015-07-01')
GROUP BY ALL
ORDER BY hour ASC WITH FILL STEP toIntervalHour(1);
```

```text
┌────────────────hour─┬─sum(hits)─┐
│ 2015-07-01 00:00:00 │         3 │
│ 2015-07-01 01:00:00 │         0 │ <- new value
│ 2015-07-01 02:00:00 │         1 │
│ 2015-07-01 03:00:00 │         0 │ <- new value
│ 2015-07-01 04:00:00 │         1 │
│ 2015-07-01 05:00:00 │         2 │
│ 2015-07-01 06:00:00 │         1 │
│ 2015-07-01 07:00:00 │         1 │
│ 2015-07-01 08:00:00 │         3 │
│ 2015-07-01 09:00:00 │         2 │
│ 2015-07-01 10:00:00 │         0 │ <- new value
│ 2015-07-01 11:00:00 │         0 │ <- new value
│ 2015-07-01 12:00:00 │         2 │
│ 2015-07-01 13:00:00 │         4 │
│ 2015-07-01 14:00:00 │         2 │
│ 2015-07-01 15:00:00 │         2 │
│ 2015-07-01 16:00:00 │         2 │
│ 2015-07-01 17:00:00 │         1 │
│ 2015-07-01 18:00:00 │         5 │
│ 2015-07-01 19:00:00 │         5 │
│ 2015-07-01 20:00:00 │         4 │
│ 2015-07-01 21:00:00 │         4 │
│ 2015-07-01 22:00:00 │         2 │
│ 2015-07-01 23:00:00 │         2 │
└─────────────────────┴───────────┘
```

## 롤링 타임 윈도우 \{#time-series-rolling-time-windows\}

때로는 일(day)이나 시간(hour)의 시작 시점이 아니라, 윈도우 구간 자체를 기준으로 데이터를 보고 싶을 때가 있습니다.
예를 들어, 일 단위가 아니라 오후 6시를 기준으로 시작하는 24시간 구간의 총 히트 수를 파악하고자 할 수 있습니다.

[`date_diff()`](/docs/sql-reference/functions/date-time-functions#timeDiff) 함수를 사용하여 기준 시각과 각 레코드의 시각 차이를 계산할 수 있습니다.
이 경우 `day` 컬럼은 일 단위 차이(예: 1일 전, 2일 전 등)를 나타내게 됩니다:

```sql
SELECT    
    dateDiff('day', toDateTime('2015-05-01 18:00:00'), time) AS day,
    sum(hits),
FROM wikistat
GROUP BY ALL
ORDER BY day ASC
LIMIT 5;
```

```text
┌─day─┬─sum(hits)─┐
│   0 │  25524369 │
│   1 │  25608105 │
│   2 │  28567101 │
│   3 │  29229944 │
│   4 │  29383573 │
└─────┴───────────┘
```
