---
sidebar_label: '쿼리 빌더'
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: 'ClickHouse Grafana 플러그인에서 쿼리 빌더를 사용하는 방법'
title: '쿼리 빌더'
doc_type: 'guide'
keywords: ['grafana', '쿼리 빌더', '시각화', '대시보드', '플러그인']
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import demo_table_query from '@site/static/images/integrations/data-visualization/grafana/demo_table_query.png';
import demo_logs_query from '@site/static/images/integrations/data-visualization/grafana/demo_logs_query.png';
import demo_logs_query_fields from '@site/static/images/integrations/data-visualization/grafana/demo_logs_query_fields.png';
import demo_time_series_query from '@site/static/images/integrations/data-visualization/grafana/demo_time_series_query.png';
import demo_trace_query from '@site/static/images/integrations/data-visualization/grafana/demo_trace_query.png';
import demo_raw_sql_query from '@site/static/images/integrations/data-visualization/grafana/demo_raw_sql_query.png';
import trace_id_in_table from '@site/static/images/integrations/data-visualization/grafana/trace_id_in_table.png';
import trace_id_in_logs from '@site/static/images/integrations/data-visualization/grafana/trace_id_in_logs.png';
import demo_data_links from '@site/static/images/integrations/data-visualization/grafana/demo_data_links.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 쿼리 빌더 \{#query-builder\}

<ClickHouseSupportedBadge/>

모든 쿼리는 ClickHouse 플러그인을 통해 실행할 수 있습니다.
쿼리 빌더는 간단한 쿼리에는 편리하지만, 복잡한 쿼리에는 [SQL Editor](#sql-editor)를 사용해야 합니다.

쿼리 빌더의 모든 쿼리에는 [쿼리 유형](#query-types)이 있으며, 최소 한 개의 컬럼을 선택해야 합니다.

사용 가능한 쿼리 유형은 다음과 같습니다.

- [Table](#table): 데이터를 테이블 형식으로 표시하는 가장 단순한 쿼리 유형입니다. 집계 함수가 포함된 단순 및 복잡 쿼리 모두에 사용할 수 있는 범용 쿼리 유형으로 적합합니다.
- [Logs](#logs): 로그용 쿼리를 구성하도록 최적화되어 있습니다. [기본값이 구성된](./config.md#logs) Explore 뷰에서 가장 잘 동작합니다.
- [Time Series](#time-series): 시계열 쿼리를 구성할 때 가장 적합합니다. 전용 시간 컬럼을 선택하고 집계 함수를 추가할 수 있습니다.
- [Traces](#traces): 트레이스를 검색/조회하도록 최적화되어 있습니다. [기본값이 구성된](./config.md#traces) Explore 뷰에서 가장 잘 동작합니다.
- [SQL Editor](#sql-editor): 쿼리를 완전히 제어해야 할 때 SQL Editor를 사용할 수 있습니다. 이 모드에서는 임의의 SQL 쿼리를 실행할 수 있습니다.

## 쿼리 유형 \{#query-types\}

*Query Type* 설정은 만들려는 쿼리 유형에 맞게 쿼리 빌더의 레이아웃을 변경합니다.
쿼리 유형은 또한 데이터를 시각화할 때 어떤 패널을 사용할지 결정합니다.

### Table \{#table\}

가장 유연한 쿼리 유형은 테이블 쿼리입니다. 단순 쿼리와 집계 쿼리를 처리하도록 설계된 다른 쿼리 빌더를 모두 포괄하는 범용 쿼리 유형입니다.

| Field | Description |
|----|----|
| Builder Mode  | 단순 쿼리 모드에서는 Aggregates와 Group By가 제외되고, 집계 쿼리 모드에서는 이 옵션들이 포함됩니다. |
| Columns | 선택된 컬럼입니다. 이 필드에 함수와 컬럼 별칭을 사용하기 위해 원시 SQL을 직접 입력할 수 있습니다. |
| Aggregates | [집계 함수(aggregate functions)](/sql-reference/aggregate-functions/index.md) 목록입니다. 함수와 컬럼에 대해 사용자 정의 값을 지정할 수 있습니다. 집계 모드에서만 표시됩니다. |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 표현식 목록입니다. 집계 모드에서만 표시됩니다. |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 표현식 목록입니다. |
| Limit | 쿼리 끝에 [LIMIT](/sql-reference/statements/select/limit.md) SQL 문을 추가합니다. `0`으로 설정하면 추가되지 않습니다. 일부 시각화에서는 모든 데이터를 표시하기 위해 이 값을 `0`으로 설정해야 할 수 있습니다. |
| Filters | `WHERE` 절에 적용할 필터 목록입니다. |

<Image size="md" img={demo_table_query} alt="집계 테이블 쿼리 예시" border />

이 쿼리 유형은 데이터를 테이블 형태로 표시합니다.

### 로그 \{#logs\}

로그 쿼리 유형은 로그 데이터 쿼리에 초점을 맞춘 쿼리 빌더를 제공합니다.
데이터 소스의 [로그 설정](./config.md#logs)에서 기본값을 구성하여 쿼리 빌더가 기본 데이터베이스/테이블 및 컬럼으로 미리 로드되도록 할 수 있습니다.
또한 OpenTelemetry를 활성화하여 스키마 버전에 따라 컬럼을 자동으로 선택하도록 할 수도 있습니다.

**Time** 및 **Level** 필터는 기본적으로 추가되며, Time 컬럼에 대한 Order By도 함께 추가됩니다.
이 필터들은 각각의 필드에 연결되어 있어 컬럼이 변경되면 함께 업데이트됩니다.
**Level** 필터는 기본적으로 SQL에서 제외되며, `IS ANYTHING` 옵션에서 다른 값으로 변경하면 활성화됩니다.

로그 쿼리 유형은 [데이터 링크](#data-links)를 지원합니다.

| Field | Description |
|----|----|
| Use OTel | OpenTelemetry 컬럼을 활성화합니다. 선택된 OTel 스키마 버전에 의해 정의된 컬럼을 사용하도록 현재 선택된 컬럼을 덮어씁니다(컬럼 선택 비활성화). |
| Columns | 로그 행에 추가할 추가 컬럼입니다. 이 필드에는 함수와 컬럼 별칭(alias)을 사용하기 위해 Raw SQL을 입력할 수 있습니다. |
| Time | 로그의 기본 타임스탬프 컬럼입니다. 시간 형식의 타입을 표시하지만, 사용자 정의 값/함수도 허용합니다. |
| Log Level | 선택 사항입니다. 로그의 *레벨(level)* 또는 *심각도(severity)* 입니다. 일반적으로 `INFO`, `error`, `Debug` 등의 값을 가집니다. |
| Message | 로그 메시지 내용입니다. |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 표현식 목록입니다. |
| Limit | 쿼리 끝에 [LIMIT](/sql-reference/statements/select/limit.md) SQL 문을 추가합니다. `0`으로 설정하면 제외되지만, 대용량 로그 데이터셋에는 권장되지 않습니다. |
| Filters | `WHERE` 절에 적용할 필터 목록입니다. |
| Message Filter | `LIKE %value%`를 사용하여 로그를 편리하게 필터링하기 위한 텍스트 입력입니다. 입력이 비어 있으면 제외됩니다. |

<Image size="md" img={demo_logs_query} alt="예시 OTel 로그 쿼리" border />

<br/>

이 쿼리 유형은 로그 패널에 데이터를 렌더링하고, 상단에 로그 히스토그램 패널을 함께 표시합니다.

쿼리에서 선택한 추가 컬럼은 확장된 로그 행에서 확인할 수 있습니다:

<Image size="md" img={demo_logs_query_fields} alt="로그 쿼리에서 추가 필드를 보여주는 예시" border />

### Time series \{#time-series\}

시계열 쿼리 유형은 [table](#table)과 비슷하지만, 시계열 데이터에 중점을 둡니다.

두 뷰는 대부분 동일하지만, 다음과 같은 중요한 차이점이 있습니다.

- 전용 *Time* 필드
- Aggregate 모드에서는 시간 간격 매크로가 Time 필드에 대한 Group By와 함께 자동으로 적용됩니다.
- Aggregate 모드에서는 "Columns" 필드가 숨겨집니다.
- **Time** 필드에 대해 시간 범위 필터와 Order By가 자동으로 추가됩니다.

:::important 시각화에 데이터가 누락되어 보입니까?
일부 경우에는 기본 제한 값이 `1000`으로 설정되어 있기 때문에 시계열 패널이 잘려 보일 수 있습니다.

데이터셋에서 허용된다면, 값을 `0`으로 설정하여 `LIMIT` 절을 제거해 보십시오.
:::

| Field | Description |
|----|----|
| Builder Mode  | Simple 쿼리에서는 Aggregates와 Group By가 제외되고, Aggregate 쿼리에서는 이러한 옵션이 포함됩니다.  |
| Time | 쿼리의 기본 시간 컬럼입니다. 시간형과 유사한 타입을 표시하지만, 사용자 정의 값/함수를 사용할 수 있습니다. |
| Columns | 선택된 컬럼입니다. 이 필드에 Raw SQL을 입력하여 함수와 컬럼 별칭을 사용할 수 있습니다. Simple 모드에서만 표시됩니다. |
| Aggregates | [집계 함수(aggregate functions)](/sql-reference/aggregate-functions/index.md) 목록입니다. 함수와 컬럼에 대해 사용자 정의 값을 허용합니다. Aggregate 모드에서만 표시됩니다. |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 표현식 목록입니다. Aggregate 모드에서만 표시됩니다. |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 표현식 목록입니다. |
| Limit | 쿼리 끝에 [LIMIT](/sql-reference/statements/select/limit.md) SQL 문을 추가합니다. `0`으로 설정하면 제외되며, 전체 시각화를 표시해야 하는 일부 시계열 데이터셋에는 이렇게 설정하는 것이 권장됩니다. |
| Filters | `WHERE` 절에 적용할 필터 목록입니다. |

<Image size="md" img={demo_time_series_query} alt="시계열 쿼리 예시" border />

이 쿼리 유형은 시계열 패널을 사용하여 데이터를 시각화합니다.

### Traces \{#traces\}

트레이스 쿼리 유형은 트레이스를 쉽게 검색하고 조회할 수 있는 쿼리 빌더를 제공합니다.
OpenTelemetry 데이터용으로 설계되었지만, 다른 스키마의 트레이스를 렌더링하도록 컬럼을 선택할 수 있습니다.
데이터 소스의 [trace configuration](./config.md#traces)에서 기본값을 설정하여 쿼리 빌더가 기본 데이터베이스/테이블과 컬럼으로 미리 로드되도록 구성할 수 있습니다. 기본값이 구성되어 있으면 컬럼 선택 섹션은 기본적으로 접힙니다.
OpenTelemetry를 활성화하여 스키마 버전에 따라 컬럼이 자동으로 선택되도록 할 수도 있습니다.

기본 필터는 최상위 span만 표시하도록 설정되어 있습니다.
Time 및 Duration Time 컬럼에 대한 ORDER BY도 포함되어 있습니다.
이 필터들은 각각의 필드에 연결되어 있으며, 컬럼이 변경될 때 함께 업데이트됩니다.
**Service Name** 필터는 기본적으로 SQL에서 제외되며, `IS ANYTHING` 옵션에서 다른 값으로 변경하면 활성화됩니다.

트레이스 쿼리 유형은 [data links](#data-links)를 지원합니다.

| Field | Description |
|----|----|
| Trace Mode | 쿼리를 Trace Search 모드에서 Trace ID 조회 모드로 변경합니다. |
| Use OTel | OpenTelemetry 컬럼을 활성화합니다. 선택한 OTel 스키마 버전에 의해 정의된 컬럼을 사용하도록 현재 선택된 컬럼을 덮어씁니다(컬럼 선택이 비활성화됩니다). |
| Trace ID Column | 트레이스의 ID입니다. |
| Span ID Column | Span ID입니다. |
| Parent Span ID Column | 상위 span ID입니다. 일반적으로 최상위 트레이스에서는 비어 있습니다. |
| Service Name Column | 서비스 이름입니다. |
| Operation Name Column | 오퍼레이션 이름입니다. |
| Start Time Column | trace span의 기본 시간 컬럼입니다. span이 시작된 시점입니다. |
| Duration Time Column | span의 지속 시간입니다. 기본적으로 Grafana는 이를 밀리초 단위의 float로 예상합니다. 변환은 `Duration Unit` 드롭다운을 통해 자동으로 적용됩니다. |
| Duration Unit | 지속 시간에 사용되는 시간 단위입니다. 기본값은 나노초입니다. 선택된 단위는 Grafana에서 요구하는 대로 밀리초 단위의 float로 변환됩니다. |
| Tags Column | Span 태그입니다. 특정 맵(Map) 컬럼 타입을 예상하므로 OTel 기반 스키마를 사용하지 않는 경우에는 제외하십시오. |
| Service Tags Column | 서비스 태그입니다. 특정 맵(Map) 컬럼 타입을 예상하므로 OTel 기반 스키마를 사용하지 않는 경우에는 제외하십시오. |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 표현식 목록입니다. |
| Limit | 쿼리 끝에 [LIMIT](/sql-reference/statements/select/limit.md) SQL 문을 추가합니다. `0`으로 설정하면 포함되지 않지만, 대규모 trace 데이터셋에서는 권장되지 않습니다. |
| Filters | `WHERE` 절에 적용할 필터 목록입니다. |
| Trace ID | 필터링에 사용할 Trace ID입니다. Trace ID 모드에서만 사용되며, trace ID [data link](#data-links)를 열 때 사용됩니다. |

<Image size="md" img={demo_trace_query} alt="Example OTel trace query" border />

이 쿼리 유형은 Trace Search 모드에서는 테이블 뷰로 데이터를 렌더링하고, Trace ID 모드에서는 트레이스 패널로 렌더링합니다.

## SQL editor \{#sql-editor\}

쿼리 빌더로는 다루기 어려울 만큼 복잡한 쿼리는 SQL Editor에서 작성할 수 있습니다.
이를 통해 일반 ClickHouse SQL을 직접 작성하고 실행하여 쿼리를 완전히 제어할 수 있습니다.

SQL editor는 쿼리 편집기 상단에서 「SQL Editor」를 선택하여 열 수 있습니다.

이 모드에서도 [매크로 함수](#macros)를 계속 사용할 수 있습니다.

쿼리 유형을 전환하여 쿼리에 가장 잘 맞는 시각화를 사용할 수 있습니다.
이 전환은 대시보드 보기에서도 효과가 있으며, 특히 시계열 데이터에서 유용합니다.

<Image size="md" img={demo_raw_sql_query} alt="원시 SQL 쿼리 예시" border />

## 데이터 링크 \{#data-links\}

Grafana [data links](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)는
새 쿼리로 이동하는 링크로 사용할 수 있습니다.
이 기능은 ClickHouse 플러그인에 트레이스를 로그에 연결하거나 그 반대로 연결할 수 있도록 활성화되어 있습니다. [데이터 소스 구성](./config.md#opentelemetry)에서 로그와 트레이스 모두에 대해 OpenTelemetry가 구성되어 있을 때 가장 효과적으로 동작합니다.

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  테이블에서 트레이스 링크 예시
  <Image size="sm" img={trace_id_in_table} alt="테이블에서 트레이스 링크" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  로그에서 트레이스 링크 예시
  <Image size="md" img={trace_id_in_logs} alt="로그에서 트레이스 링크" border />
</div>

### 데이터 링크를 만드는 방법 \{#how-to-make-a-data-link\}

쿼리에서 `traceID`라는 이름의 컬럼을 선택하여 데이터 링크를 만들 수 있습니다. 이 이름은 대소문자를 구분하지 않으며, "ID" 앞에 밑줄을 추가하는 것도 지원합니다. 예를 들어 `traceId`, `TraceId`, `TRACE_ID`, `tracE_iD`는 모두 유효합니다.

[log](#logs) 또는 [trace](#traces) 쿼리에서 OpenTelemetry가 활성화되어 있으면 trace ID 컬럼이 자동으로 포함됩니다.

trace ID 컬럼을 포함하면 "**View Trace**" 및 "**View Logs**" 링크가 데이터에 함께 표시됩니다.

### 링크 기능 \{#linking-abilities\}

데이터 링크가 설정되어 있으면 제공된 트레이스 ID를 사용하여 트레이스와 로그를 열 수 있습니다.

"**View Trace**"는 트레이스를 표시하는 분할 패널을 열고, "**View Logs**"는 해당 트레이스 ID로 필터링된 로그 쿼리를 엽니다.
Explore 뷰가 아니라 대시보드에서 링크를 클릭하는 경우, 링크는 Explore 뷰의 새 탭에서 열립니다.

서로 다른 쿼리 유형 간에 이동할 때(로그에서 트레이스로, 트레이스에서 로그로 이동)에는 [logs](./config.md#logs)와 [traces](./config.md#traces)의 기본 설정을 모두 구성해야 합니다. 동일한 쿼리 유형의 링크를 열 때는 쿼리를 그대로 복사할 수 있으므로 기본 설정이 필요하지 않습니다.

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  로그 쿼리(왼쪽 패널)에서 트레이스(오른쪽 패널)를 조회하는 예시
  <Image size="md" img={demo_data_links} alt="Example of data links linking" border />
</div>

## 매크로 \{#macros\}

매크로는 쿼리에 동적 SQL을 추가할 수 있게 해 주는 간단한 기능입니다.
쿼리가 ClickHouse 서버로 전송되기 전에 플러그인이 매크로를 확장하여 전체 표현식으로 대체합니다.

SQL Editor와 Query Builder에서 실행하는 모든 쿼리에서 매크로를 사용할 수 있습니다.

### 매크로 사용 \{#using-macros\}

매크로는 쿼리 어디에서나 필요하다면 여러 번 포함할 수 있습니다.

`$__timeFilter` 매크로 사용 예시는 다음과 같습니다:

입력:

```sql
SELECT log_time, log_message
FROM logs
WHERE $__timeFilter(log_time)
```

최종 쿼리 결과:

```sql
SELECT log_time, log_message
FROM logs
WHERE log_time >= toDateTime(1415792726) AND log_time <= toDateTime(1447328726)
```

이 예에서는 Grafana 대시보드의 시간 범위가 `log_time` 컬럼에 적용됩니다.

이 플러그인은 중괄호 `{}`를 사용하는 표기법도 지원합니다. [매개변수](/sql-reference/syntax.md#defining-and-using-query-parameters) 안에서 쿼리를 사용해야 할 때 이 표기법을 사용하십시오.


### 매크로 목록 \{#list-of-macros\}

다음은 플러그인에서 사용할 수 있는 모든 매크로 목록입니다:

| Macro                                        | Description                                                                                                                                                                         | Output example                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | Grafana 패널의 시간 범위를 [Date](/sql-reference/data-types/date.md)로 변환하여 지정한 컬럼에 대한 시간 범위 필터로 치환합니다.                                 | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | Grafana 패널의 시간 범위를 [DateTime](/sql-reference/data-types/datetime.md)으로 변환하여 지정한 컬럼에 대한 시간 범위 필터로 치환합니다.                         | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | Grafana 패널의 시간 범위를 [DateTime64](/sql-reference/data-types/datetime64.md)로 변환하여 지정한 컬럼에 대한 시간 범위 필터로 치환합니다.                     | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 별도의 Date 컬럼과 DateTime 컬럼을 사용하여 `$__dateFilter()`와 `$__timeFilter()`를 결합한 단축 표현입니다. 별칭은 `$__dt()`입니다.                                                                               | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                             |
| `$__fromTime`                                | Grafana 패널 범위의 시작 시간을 [DateTime](/sql-reference/data-types/datetime.md)으로 캐스팅한 값으로 치환합니다.                                                     | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | 패널 범위의 시작 시간을 [DateTime64](/sql-reference/data-types/datetime64.md)로 캐스팅한 값으로 치환합니다.                                                         | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | Grafana 패널 범위의 종료 시간을 [DateTime](/sql-reference/data-types/datetime.md)으로 캐스팅한 값으로 치환합니다.                                                       | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | Grafana 패널 범위의 종료 시간을 [DateTime64](/sql-reference/data-types/datetime64.md)로 캐스팅한 값으로 치환합니다.                                                           | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | 윈도우 크기(초 단위)를 기준으로 간격을 계산하는 함수로 치환합니다.                                                                                                    | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | 윈도우 크기(밀리초 단위)를 기준으로 간격을 계산하는 함수로 치환합니다.                                                                                               | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | 대시보드 간격(초 단위)으로 치환합니다.                                                                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | 두 번째 인자의 템플릿 변수가 모든 값을 선택하지 않을 때는 첫 번째 인자로 치환하고, 템플릿 변수가 모든 값을 선택할 때는 `1=1`로 치환합니다. | `condition` 또는 `1=1`                                                                                              |