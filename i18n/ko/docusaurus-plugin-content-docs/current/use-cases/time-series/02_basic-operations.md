---
'title': '기본 작업 - 시계열'
'sidebar_label': '기본 작업'
'description': 'ClickHouse에서의 기본 시계열 작업.'
'slug': '/use-cases/time-series/basic-operations'
'keywords':
- 'time-series'
- 'basic operations'
- 'data ingestion'
- 'querying'
- 'filtering'
- 'grouping'
- 'aggregation'
'show_related_blogs': true
'doc_type': 'guide'
---


# 기본 시계열 작업

ClickHouse는 시계열 데이터 작업을 위한 여러 가지 방법을 제공하여, 서로 다른 시간 간격에 걸쳐 데이터를 집계하고 그룹화하며 분석할 수 있습니다.
이 섹션에서는 시간 기반 데이터 작업 시 일반적으로 사용되는 기본 작업을 다룹니다.

일반적인 작업에는 시간 간격별로 데이터 그룹화, 시계열 데이터의 간극 처리, 시간 기간 간의 변화 계산이 포함됩니다.
이러한 작업은 표준 SQL 구문과 ClickHouse의 내장 시간 함수가 결합되어 수행될 수 있습니다.

우리는 Wikistat(위키백과 페이지뷰 데이터) 데이터셋을 사용하여 ClickHouse의 시계열 쿼리 기능을 탐색할 것입니다:

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

이 테이블에 10억 개의 레코드를 채워보겠습니다:

```sql
INSERT INTO wikistat 
SELECT *
FROM s3('https://ClickHouse-public-datasets.s3.amazonaws.com/wikistat/partitioned/wikistat*.native.zst') 
LIMIT 1e9;
```

## 시간 버킷으로 집계하기 {#time-series-aggregating-time-bucket}

가장 일반적인 요구 사항은 기간을 기준으로 데이터를 집계하는 것입니다. 예를 들어, 매일의 총 히트 수를 가져오는 것입니다:

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

여기서 우리는 [`toDate()`](/sql-reference/functions/type-conversion-functions#todate) 함수를 사용했습니다. 이 함수는 지정된 시간을 날짜 유형으로 변환합니다. 또는 한 시간별로 배치하고 특정 날짜로 필터링할 수 있습니다:

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

여기에서 사용된 [`toStartOfHour()`](/docs/sql-reference/functions/date-time-functions#toStartOfHour) 함수는 주어진 시간을 시간의 시작으로 변환합니다.
연도, 분기, 월 또는 일 기준으로 그룹화할 수도 있습니다.

## 사용자 정의 그룹화 간격 {#time-series-custom-grouping-intervals}

우리는 심지어 임의의 간격으로 그룹화할 수 있습니다. 예를 들어, [`toStartOfInterval()`](/docs/sql-reference/functions/date-time-functions#toStartOfInterval) 함수를 사용하여 5분 단위로 그룹화하는 것입니다.

4시간 간격으로 그룹화하고 싶다고 가정해 보겠습니다.
우리는 [`INTERVAL`](/docs/sql-reference/data-types/special-data-types/interval) 절을 사용하여 그룹화 간격을 지정할 수 있습니다:

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

또는 [`toIntervalHour()`](/docs/sql-reference/functions/type-conversion-functions#tointervalhour) 함수를 사용할 수 있습니다:

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

어쨌든 우리는 다음과 같은 결과를 얻게 됩니다:

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

## 빈 그룹 채우기 {#time-series-filling-empty-groups}

많은 경우, 우리는 일부 간격이 없는 스파스 데이터를 다룹니다. 이로 인해 빈 버킷이 생성됩니다. 다음과 같이 1시간 간격으로 데이터를 그룹화하는 예를 들어 보겠습니다. 이 경우 몇몇 시간이 빠진 값으로 다음과 같은 통계가 출력됩니다:

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

ClickHouse는 이를 해결하기 위해 [`WITH FILL`](/docs/guides/developer/time-series-filling-gaps#with-fill) 수식어를 제공합니다. 이 수식어는 모든 빈 시간에 0을 채워서 시간이 지남에 따라 분포를 더 잘 이해할 수 있게 합니다:

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

## 롤링 타임 윈도우 {#time-series-rolling-time-windows}

때때로 우리는 간격의 시작(예: 하루 또는 한 시간의 시작) 대신에 윈도우 간격을 다루고 싶습니다.
예를 들어, 우리는 하루가 아니라 오후 6시에서 오프셋된 24시간 기간 동안의 총 히트를 이해하고 싶다고 가정해 보겠습니다.

우리는 [`date_diff()`](/docs/sql-reference/functions/date-time-functions#timeDiff) 함수를 사용하여 기준 시간과 각 레코드의 시간 간의 차이를 계산할 수 있습니다.
이 경우 `day` 열은 일 단위의 차이를 나타냅니다(예: 1일 전, 2일 전 등):

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
