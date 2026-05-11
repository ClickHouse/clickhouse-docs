---
slug: /use-cases/observability/clickstack/dashboards/sql-visualizations
title: 'SQL 기반 시각화'
sidebar_label: 'SQL 기반 시각화'
pagination_prev: null
pagination_next: null
description: 'ClickStack에서 SQL 쿼리를 사용해 시각화를 생성하기'
doc_type: 'guide'
keywords: ['clickstack', 'dashboards', 'visualization', 'sql', 'observability']
---

import Image from '@theme/IdealImage';
import sql_editor_button from '@site/static/images/use-cases/observability/sql-editor-button.png';

ClickStack는 원시 SQL 쿼리를 기반으로 하는 시각화를 지원합니다. 이를 통해 대시보드 수준의 시간 범위, 필터, 차트 렌더링과 통합된 상태를 유지하면서도 쿼리 로직을 완전히 제어할 수 있습니다.

SQL 기반 시각화는 기본 제공되는 Chart Explorer를 넘어서는 작업이 필요할 때 유용합니다. 예를 들어, 테이블을 조인하거나 차트 빌더에서 지원되지 않는 복잡한 집계를 구축할 때 사용할 수 있습니다.


## SQL 기반 시각화 만들기 \{#creating-a-raw-sql-chart\}

SQL 기반 시각화를 만들려면 대시보드 타일 편집기를 열고 **SQL** 탭을 선택하십시오.

<Image img={sql_editor_button} alt="SQL 편집기 버튼" size="lg" />

그런 다음 다음 단계를 수행하십시오:

1. 쿼리를 실행할 **ClickHouse 연결**을 선택합니다.
2. 선택 사항으로 **소스**를 선택합니다 — 이렇게 하면 `$__filters` 매크로를 통해 대시보드 수준의 필터를 차트에 적용할 수 있습니다.
3. 편집기에서 SQL 쿼리를 작성하고, 쿼리 매개변수와 매크로를 사용해 대시보드의 시간 범위 및 필터와 연동합니다.
4. **play** 버튼을 클릭하여 결과를 미리 확인한 다음 **Save**를 클릭합니다.

## 쿼리 매개변수 \{#query-parameters\}

[쿼리 매개변수](/sql-reference/syntax#defining-and-using-query-parameters)를 사용하면 SQL에서 대시보드의 현재 시간 범위와 세분성을 참조할 수 있습니다. ClickHouse의 매개변수화된 쿼리 구문인 `{paramName:Type}`를 사용합니다.

### 사용 가능한 매개변수 \{#available-parameters\}

사용 가능한 매개변수는 차트 유형에 따라 달라집니다.

**선 차트 및 누적 막대 차트:**

| Parameter                       | Type    | 설명                                                             |
|---------------------------------|---------|------------------------------------------------------------------|
| `{startDateMilliseconds:Int64}` | Int64   | 대시보드 날짜 범위의 시작(epoch 이후 경과한 밀리초)              |
| `{endDateMilliseconds:Int64}`   | Int64   | 대시보드 날짜 범위의 끝(epoch 이후 경과한 밀리초)                |
| `{intervalSeconds:Int64}`       | Int64   | 시간 버킷 크기(세분성을 기준으로 한 초 단위)                     |
| `{intervalMilliseconds:Int64}`  | Int64   | 시간 버킷 크기(세분성을 기준으로 한 밀리초 단위)                 |

**테이블, 파이 및 숫자 차트:**

| Parameter                       | Type    | 설명                                                             |
|---------------------------------|---------|------------------------------------------------------------------|
| `{startDateMilliseconds:Int64}` | Int64   | 대시보드 날짜 범위의 시작(epoch 이후 경과한 밀리초)              |
| `{endDateMilliseconds:Int64}`   | Int64   | 대시보드 날짜 범위의 끝(epoch 이후 경과한 밀리초)                |

## 매크로 \{#macros\}

매크로는 자주 사용하는 ClickHouse SQL 표현식으로 확장되는 단축 표기입니다. `$__` 접두사가 붙으며, 쿼리가 ClickHouse로 전송되기 전에 치환됩니다.

### 시간 경계 매크로 \{#time-boundary-macros\}

이 매크로들은 대시보드의 시작 또는 종료 시각을 나타내는 ClickHouse 표현식을 반환합니다. 인수는 받지 않습니다.

| Macro            | 확장 결과                                                                 | 컬럼 타입      |
| ---------------- | --------------------------------------------------------------------- | ---------- |
| `$__fromTime`    | `toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))` | DateTime   |
| `$__toTime`      | `toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))`   | DateTime   |
| `$__fromTime_ms` | `fromUnixTimestamp64Milli({startDateMilliseconds:Int64})`             | DateTime64 |
| `$__toTime_ms`   | `fromUnixTimestamp64Milli({endDateMilliseconds:Int64})`               | DateTime64 |
| `$__interval_s`  | `{intervalSeconds:Int64}`                                             | Int64      |

### 시간 필터 매크로 \{#time-filter-macros\}

이 매크로는 컬럼을 대시보드 시간 범위로 필터링하는 `WHERE` 절 조각을 생성합니다.

| Macro                                 | 설명                                                               |
|---------------------------------------|--------------------------------------------------------------------|
| `$__timeFilter(column)`               | `DateTime` 컬럼을 대시보드 범위로 필터링합니다                     |
| `$__timeFilter_ms(column)`            | `DateTime64`(밀리초) 컬럼을 대시보드 범위로 필터링합니다           |
| `$__dateFilter(column)`               | `Date` 컬럼을 대시보드 범위로 필터링합니다                         |
| `$__dateTimeFilter(dateCol, timeCol)` | 별도의 `Date` 및 `DateTime` 컬럼을 사용하여 필터링합니다          |
| `$__dt(dateCol, timeCol)`             | `$__dateTimeFilter`의 별칭입니다                                   |

`$__timeFilter(TimestampTime)`의 **확장 예시**:

```sql
TimestampTime >= toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))
AND TimestampTime <= toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))
```

### 시간 간격 매크로 \{#time-interval-macros\}

이 매크로는 타임스탬프 컬럼을 대시보드 세분화 수준에 맞는 시간 간격으로 묶습니다. 일반적으로 시계열 차트의 `SELECT` 및 `GROUP BY` 절에서 사용됩니다. 이 매크로는 Line 및 Stacked-bar 시각화에서만 사용할 수 있습니다.

| Macro                        | 설명                                                |
| ---------------------------- | ------------------------------------------------- |
| `$__timeInterval(column)`    | `DateTime` 컬럼을 `intervalSeconds` 간격으로 묶습니다        |
| `$__timeInterval_ms(column)` | `DateTime64` 컬럼을 `intervalMilliseconds` 간격으로 묶습니다 |

`$__timeInterval(TimestampTime)`의 **확장 예시**:

```sql
toStartOfInterval(toDateTime(TimestampTime), INTERVAL {intervalSeconds:Int64} second)
```


### 대시보드 필터 매크로 \{#dashboard-filter-macro\}

| Macro        | 설명                                     |
| ------------ | -------------------------------------- |
| `$__filters` | 대시보드 수준의 필터 조건으로 대체됩니다(소스가 선택되어 있어야 함) |

차트에서 **소스**가 선택되어 있고 대시보드 필터가 활성화되어 있으면, `$__filters`는 해당 SQL `WHERE` 조건으로 확장됩니다. 소스가 선택되지 않았거나 필터가 적용되지 않은 경우에는 `(1=1)`로 확장되므로 `WHERE` 절에 항상 안전하게 포함할 수 있습니다.

## 쿼리 결과가 시각화되는 방식 \{#how-results-are-plotted\}

ClickStack에서는 컬럼 타입을 기준으로 결과 컬럼을 차트 요소에 자동으로 매핑합니다. 매핑 규칙은 차트 유형에 따라 다릅니다.

### 선 차트 및 누적 막대 차트 \{#line-and-stacked-bar-charts\}

| 역할        | 컬럼 타입                        | 설명                                       |
| --------- | ---------------------------- | ---------------------------------------- |
| **타임스탬프** | 첫 번째 `Date` 또는 `DateTime` 컬럼 | x축으로 사용됩니다.                              |
| **시리즈 값** | 모든 숫자형 컬럼                    | 각 숫자형 컬럼은 개별 시리즈로 그려집니다. 일반적으로 집계 값입니다.  |
| **그룹 이름** | String, 맵 또는 Array 컬럼        | 선택 사항. 그룹 값이 서로 다른 행은 각각 별도의 시리즈로 그려집니다. |

### 파이 차트 \{#pie-chart\}

| 역할           | 컬럼 타입                 | 설명                               |
| ------------ | --------------------- | -------------------------------- |
| **슬라이스 값**   | 첫 번째 숫자 컬럼            | 각 슬라이스의 크기를 결정합니다.               |
| **슬라이스 레이블** | String, 맵 또는 Array 컬럼 | 선택 사항입니다. 각 고유 값이 슬라이스 레이블이 됩니다. |

### 숫자 차트 \{#number-chart\}

| 역할     | 컬럼 타입      | 설명                           |
| ------ | ---------- | ---------------------------- |
| **숫자** | 첫 번째 숫자 컬럼 | 첫 번째 숫자 컬럼의 첫 번째 행 값이 표시됩니다. |

### 테이블 차트 \{#table-chart\}

모든 결과 컬럼이 테이블의 컬럼으로 직접 표시됩니다.

## 예시 \{#examples\}

:::note 필수 system table 접근 권한
다음 예시를 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)에서 실행하는 경우 `otel_v2.otel_logs` 또는 `otel_v2.otel_traces`를 지정해야 합니다.
:::

### 선 차트 — 서비스별 시간대별 로그 수 \{#example-line-chart\}

이 쿼리는 서비스별 로그 이벤트 수를 집계하고, 대시보드의 세분성에 맞는 시간 간격으로 구간화합니다.

```sql
SELECT
  toStartOfInterval(TimestampTime, INTERVAL {intervalSeconds:Int64} second) AS ts,
  ServiceName,
  count() AS count
FROM otel_logs
WHERE TimestampTime >= fromUnixTimestamp64Milli({startDateMilliseconds:Int64})
  AND TimestampTime < fromUnixTimestamp64Milli({endDateMilliseconds:Int64})
  AND $__filters
GROUP BY ServiceName, ts
ORDER BY ts ASC
```

* `ts` (DateTime)는 x축 타임스탬프로 사용됩니다.
* `count` (숫자형)는 시리즈 값으로 표시됩니다.
* `ServiceName` (문자열)은 서비스별로 별도의 선을 만듭니다.


### 선 차트 — 매크로 사용 \{#example-line-chart-macros\}

간결하게 표현하기 위해 매크로를 사용해 작성한 동일한 쿼리:

```sql
SELECT
  $__timeInterval(TimestampTime) AS ts,
  ServiceName,
  count() AS count
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND $__filters
GROUP BY ServiceName, ts
ORDER BY ts ASC
```

### 누적 막대 차트 — 심각도별 오류 건수 \{#example-stacked-bar\}

```sql
SELECT
  $__timeInterval(TimestampTime) AS ts,
  lower(SeverityText),
  count() AS count
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND lower(SeverityText) IN ('error', 'warn')
  AND $__filters
GROUP BY SeverityText, ts
ORDER BY ts ASC
```


### 테이블 차트 — 가장 느린 엔드포인트 상위 10개 \{#example-table\}

```sql
SELECT
  SpanName AS endpoint,
  avg(Duration) / 1000 AS avg_duration_ms,
  count() AS request_count
FROM otel_traces
WHERE $__timeFilter(Timestamp)
  AND $__filters
GROUP BY SpanName
ORDER BY avg_duration_ms DESC
LIMIT 10
```


### 파이 차트 — 서비스별 요청 분포 \{#example-pie\}

```sql
SELECT
  ServiceName,
  count() AS request_count
FROM otel_traces
WHERE $__timeFilter(Timestamp)
  AND $__filters
GROUP BY ServiceName
```

- `request_count` (숫자형)은 각 슬라이스의 크기를 결정합니다.
- `ServiceName` (문자열)은 각 슬라이스의 레이블이 됩니다.

### 숫자 차트 — 총 오류 수 \{#example-number\}

```sql
SELECT
  count() AS total_errors
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND SeverityText = 'error'
  AND $__filters
```

첫 번째 행의 단일 숫자 값 `total_errors`가 표시됩니다.

## 참고 \{#notes\}

* SQL 기반 시각화는 `readonly` 모드가 활성화된 상태에서 실행되며, `SELECT` 쿼리만 허용됩니다.
* SQL 기반 시각화에는 SQL 쿼리를 정확히 하나만 사용할 수 있으며, 여러 쿼리는 지원되지 않습니다.
* SQL 편집기는 쿼리 매개변수와 매크로 모두에 대해 자동 완성 제안을 제공합니다.
* SQL 기반 시각화에 대시보드 필터를 적용하려면 소스를 선택해야 합니다. 정확하게 필터링되도록 소스는 쿼리 대상 테이블과 일치해야 합니다.