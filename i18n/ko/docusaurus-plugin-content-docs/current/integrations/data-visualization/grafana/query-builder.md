---
'sidebar_label': '쿼리 작성기'
'sidebar_position': 2
'slug': '/integrations/grafana/query-builder'
'description': 'ClickHouse Grafana 플러그인에서 쿼리 작성기 사용하기'
'title': '쿼리 작성기'
'doc_type': 'guide'
'keywords':
- 'grafana'
- 'query builder'
- 'visualization'
- 'dashboards'
- 'plugin'
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


# Query Builder

<ClickHouseSupportedBadge/>

어떤 쿼리든 ClickHouse 플러그인을 이용해 실행할 수 있습니다. 쿼리 빌더는 간단한 쿼리에 적합한 편리한 옵션이지만, 복잡한 쿼리의 경우 [SQL Editor](#sql-editor)를 사용해야 합니다.

쿼리 빌더의 모든 쿼리에는 [쿼리 유형](#query-types)이 있으며, 최소한 하나의 컬럼이 선택되어야 합니다.

사용 가능한 쿼리 유형은 다음과 같습니다:
- [Table](#table): 데이터를 테이블 형식으로 표시하는 가장 간단한 쿼리 유형. 집계 함수를 포함하는 간단한 쿼리와 복잡한 쿼리에 모두 적합합니다.
- [Logs](#logs): 로그 쿼리를 생성하는 데 최적화되어 있습니다. [기본값이 설정된](./config.md#logs) 탐색 뷰에서 가장 잘 작동합니다.
- [Time Series](#time-series): 시계열 쿼리를 구축할 때 가장 적합합니다. 전용 시간 컬럼을 선택하고 집계 함수를 추가할 수 있습니다.
- [Traces](#traces): 추적을 검색/보기 위해 최적화되어 있습니다. [기본값이 설정된](./config.md#traces) 탐색 뷰에서 가장 잘 작동합니다.
- [SQL Editor](#sql-editor): 쿼리에 대한 완전한 제어를 원할 때 SQL Editor를 사용할 수 있습니다. 이 모드에서는 어떤 SQL 쿼리도 실행할 수 있습니다.

## Query types {#query-types}

*Query Type* 설정은 쿼리 빌더의 레이아웃을 구축 중인 쿼리 유형에 맞게 변경합니다. 쿼리 유형은 데이터를 시각화할 때 사용하는 패널도 결정합니다.

### Table {#table}

가장 유연한 쿼리 유형은 테이블 쿼리입니다. 이는 간단하고 집계 쿼리를 처리하도록 설계된 다른 쿼리 빌더를 위한 catch-all입니다.

| 필드 | 설명 |
|----|----|
| Builder Mode  | 간단한 쿼리는 집계 및 Group By를 제외하며, 집계 쿼리는 이러한 옵션을 포함합니다.  |
| Columns | 선택된 컬럼들. 이 필드에 원시 SQL을 입력하여 함수 및 컬럼 별칭을 사용할 수 있습니다. |
| Aggregates | [집계 함수](/sql-reference/aggregate-functions/index.md)의 목록입니다. 함수 및 컬럼에 대한 사용자 정의 값을 허용합니다. 집계 모드에서만 표시됩니다. |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 표현식의 목록입니다. 집계 모드에서만 표시됩니다. |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 표현식의 목록입니다. |
| Limit | 쿼리의 끝에 [LIMIT](/sql-reference/statements/select/limit.md) 문을 추가합니다. `0`으로 설정하면 제외됩니다. 일부 시각화는 모든 데이터를 표시하기 위해 `0`으로 설정되어야 할 수도 있습니다. |
| Filters | `WHERE` 절에 적용될 필터 목록입니다. |

<Image size="md" img={demo_table_query} alt="예제 집계 테이블 쿼리" border />

이 쿼리 유형은 데이터를 테이블로 렌더링합니다.

### Logs {#logs}

로그 쿼리 유형은 로그 데이터를 쿼리하는 데 집중한 쿼리 빌더를 제공합니다. 데이터 소스의 [로그 구성](./config.md#logs)에서 기본값을 설정하여 쿼리 빌더가 기본 데이터베이스/테이블과 컬럼으로 미리 로드되도록 할 수 있습니다. OpenTelemetry를 활성화하면 스키마 버전에 따라 자동으로 컬럼을 선택할 수 있습니다.

기본적으로 **Time** 및 **Level** 필터가 추가되어 있으며, 시간 컬럼에 대한 Order By가 포함되어 있습니다. 이 필터들은 각각의 필드에 연결되어 있으며, 컬럼이 변경될 때 업데이트됩니다. **Level** 필터는 기본적으로 SQL에서 제외되며, `IS ANYTHING` 옵션에서 변경하면 활성화됩니다.

로그 쿼리 유형은 [데이터 링크](#data-links)를 지원합니다.

| 필드 | 설명 |
|----|----|
| Use OTel | OpenTelemetry 컬럼을 사용합니다. 선택한 OTel 스키마 버전에서 정의된 컬럼을 사용하도록 선택된 컬럼을 덮어씁니다(컬럼 선택 비활성화). |
| Columns | 로그 행에 추가될 추가 컬럼들입니다. 이 필드에 원시 SQL을 입력하여 함수 및 컬럼 별칭을 사용할 수 있습니다. |
| Time | 로그의 주요 타임스탬프 컬럼입니다. 시간과 유사한 데이터 유형을 표시하지만 사용자 정의 값/함수를 허용합니다. |
| Log Level | 선택 사항입니다. 로그의 *레벨* 또는 *심각도*입니다. 값은 일반적으로 `INFO`, `error`, `Debug` 등으로 나타납니다. |
| Message | 로그 메시지 내용입니다. |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 표현식의 목록입니다. |
| Limit | 쿼리의 끝에 [LIMIT](/sql-reference/statements/select/limit.md) 문을 추가합니다. `0`으로 설정하면 제외됩니다. 하지만 이는 대규모 로그 데이터 세트에서는 권장되지 않습니다. |
| Filters | `WHERE` 절에 적용될 필터 목록입니다. |
| Message Filter | 텍스트 입력란으로 `LIKE %value%`를 사용하여 로그를 편리하게 필터링할 수 있습니다. 입력이 비어 있을 때는 제외됩니다. |

<Image size="md" img={demo_logs_query} alt="예제 OTel 로그 쿼리" border />

<br/>
이 쿼리 유형은 로그 패널에 데이터를 렌더링하며, 상단에 로그 히스토그램 패널이 추가됩니다.

쿼리에서 선택된 추가 컬럼은 확장된 로그 행에서 볼 수 있습니다:
<Image size="md" img={demo_logs_query_fields} alt="로그 쿼리에서 추가 필드의 예" border />

### Time series {#time-series}

시계열 쿼리 유형은 [table](#table)와 유사하지만, 시계열 데이터에 초점을 맞추고 있습니다.

두 뷰는 대체로 동일하지만 다음과 같은 주목할 만한 차이점이 있습니다:
- 전용 *Time* 필드.
- 집계 모드에서, 시간 간격 매크로가 자동으로 적용되며 Time 필드에 대한 Group By가 추가됩니다.
- 집계 모드에서 "Columns" 필드는 숨겨져 있습니다.
- **Time** 필드에 대한 시간 범위 필터와 Order By가 자동으로 추가됩니다.

:::important 시각화에 데이터가 부족합니까?
경우에 따라 시계열 패널이 잘린 것처럼 보일 수 있으며, 기본값이 `1000`으로 설정되어 있기 때문입니다.

데이터 세트가 허용하는 경우 `LIMIT` 절을 `0`으로 설정하여 제거해 보세요.
:::

| 필드 | 설명 |
|----|----|
| Builder Mode  | 간단한 쿼리는 집계 및 Group By를 제외하며, 집계 쿼리는 이러한 옵션을 포함합니다.  |
| Time | 쿼리의 주요 시간 컬럼입니다. 시간과 유사한 데이터 유형을 표시하지만 사용자 정의 값/함수를 허용합니다. |
| Columns | 선택된 컬럼들입니다. 이 필드에 원시 SQL을 입력하여 함수 및 컬럼 별칭을 사용할 수 있습니다. 간단 모드에서만 표시됩니다. |
| Aggregates | [집계 함수](/sql-reference/aggregate-functions/index.md)의 목록입니다. 함수 및 컬럼에 대한 사용자 정의 값을 허용합니다. 집계 모드에서만 표시됩니다. |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 표현식의 목록입니다. 집계 모드에서만 표시됩니다. |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 표현식의 목록입니다. |
| Limit | 쿼리의 끝에 [LIMIT](/sql-reference/statements/select/limit.md) 문을 추가합니다. `0`으로 설정하면 제외됩니다. 이는 시계열 데이터 세트에서 전체 시각화를 표시하기 위해 추천됩니다. |
| Filters | `WHERE` 절에 적용될 필터 목록입니다. |

<Image size="md" img={demo_time_series_query} alt="예제 시계열 쿼리" border />

이 쿼리 유형은 시계열 패널로 데이터를 렌더링합니다.

### Traces {#traces}

추적 쿼리 유형은 쉽게 추적을 검색하고 보는 쿼리 빌더를 제공합니다. OpenTelemetry 데이터를 위해 설계되었지만, 다른 스키마의 추적을 렌더링하기 위해 컬럼을 선택할 수 있습니다. 데이터 소스의 [추적 구축](./config.md#traces)에서 기본값을 설정하여 쿼리 빌더가 기본 데이터베이스/테이블 및 컬럼으로 미리 로드되도록 할 수 있습니다. 기본값이 설정된 경우 컬럼 선택은 기본적으로 축소됩니다. OpenTelemetry를 활성화하면 스키마 버전에 따라 자동으로 컬럼을 선택할 수 있습니다.

기본 필터는 최상위 스팬만 표시하기 위해 추가됩니다. 시간 및 지속 시간 열에 대한 Order By도 포함됩니다. 이 필터들은 각각의 필드에 연결되어 있으며, 컬럼이 변경될 때 업데이트됩니다. **Service Name** 필터는 기본적으로 SQL에서 제외되며, `IS ANYTHING` 옵션에서 변경하면 활성화됩니다.

추적 쿼리 유형은 [데이터 링크](#data-links)를 지원합니다.

| 필드 | 설명 |
|----|----|
| Trace Mode | 쿼리를 Trace Search에서 Trace ID 조회로 변경합니다. |
| Use OTel | OpenTelemetry 컬럼을 사용합니다. 선택한 OTel 스키마 버전에서 정의된 컬럼을 사용하도록 선택된 컬럼을 덮어씁니다(컬럼 선택 비활성화). |
| Trace ID Column | 추적의 ID입니다. |
| Span ID Column | 스팬 ID입니다. |
| Parent Span ID Column | 상위 스팬 ID입니다. 이는 일반적으로 최상위 추적에 대해 비어 있습니다. |
| Service Name Column | 서비스 이름입니다. |
| Operation Name Column | 작업 이름입니다. |
| Start Time Column | 추적 스팬의 주요 시간 컬럼입니다. 스팬이 시작된 시간입니다. |
| Duration Time Column | 스팬의 지속 시간입니다. 기본적으로 Grafana는 이를 밀리초 내의 부동 소수점으로 기대합니다. 자동으로 `Duration Unit` 드롭다운을 통해 변환이 적용됩니다. |
| Duration Unit | 지속 시간에 사용되는 시간 단위입니다. 기본값은 나노초입니다. 선택한 단위는 Grafana에서 요구하는 밀리초의 부동 소수점으로 변환됩니다. |
| Tags Column | 스팬 태그입니다. OTel 기반 스키마를 사용하지 않는 경우 이를 제외합니다. 특정 Map 컬럼 유형을 기대합니다. |
| Service Tags Column | 서비스 태그입니다. OTel 기반 스키마를 사용하지 않는 경우 이를 제외합니다. 특정 Map 컬럼 유형을 기대합니다. |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 표현식의 목록입니다. |
| Limit | 쿼리의 끝에 [LIMIT](/sql-reference/statements/select/limit.md) 문을 추가합니다. `0`으로 설정하면 제외됩니다. 하지만 이는 대규모 추적 데이터 세트에서는 권장되지 않습니다. |
| Filters | `WHERE` 절에 적용될 필터 목록입니다. |
| Trace ID | 필터링할 Trace ID입니다. Trace ID 모드와 추적 ID [데이터 링크](#data-links)를 여는 경우에만 사용됩니다. |

<Image size="md" img={demo_trace_query} alt="예제 OTel 추적 쿼리" border />

이 쿼리 유형은 추적 검색 모드에 대한 테이블 뷰와 추적 ID 모드에 대한 추적 패널로 데이터를 렌더링합니다.

## SQL editor {#sql-editor}

쿼리 빌더로는 너무 복잡한 쿼리의 경우 SQL Editor를 사용하면 됩니다. 이 기능은 일반 ClickHouse SQL을 작성하고 실행할 수 있도록 하여 쿼리에 대한 완전한 제어를 제공합니다.

SQL Editor는 쿼리 에디터 상단에서 "SQL Editor"를 선택하여 열 수 있습니다.

[매크로 함수](#macros)는 이 모드에서도 사용할 수 있습니다.

쿼리 유형 간에 전환하여 쿼리에 가장 적합한 시각화를 얻을 수 있습니다. 이 전환은 대시보드 보기에서도 효과가 있으며, 특히 시계열 데이터와 관련이 있습니다.

<Image size="md" img={demo_raw_sql_query} alt="예제 원시 SQL 쿼리" border />

## Data links {#data-links}

Grafana [데이터 링크](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)를 사용하여 새로운 쿼리에 링크할 수 있습니다. 이 기능은 ClickHouse 플러그인 내에서 추적을 로그와 연결하는 데 사용하도록 활성화되었습니다. 이는 [데이터 소스의 구성](./config.md#opentelemetry)에서 로그와 추적 모두에 대해 OpenTelemetry가 구성된 경우 가장 잘 작동합니다.

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  테이블에서의 추적 링크 예
  <Image size="sm" img={trace_id_in_table} alt="테이블에서의 추적 링크" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  로그에서의 추적 링크 예
  <Image size="md" img={trace_id_in_logs} alt="로그에서의 추적 링크" border />
</div>

### How to make a data link {#how-to-make-a-data-link}

쿼리에서 `traceID`라는 이름의 컬럼을 선택하여 데이터 링크를 만들 수 있습니다. 이 이름은 대소문자를 구분하지 않으며, "ID" 앞에 언더스코어를 추가하는 것도 지원합니다. 예를 들어, `traceId`, `TraceId`, `TRACE_ID`, `tracE_iD`는 모두 유효합니다.

[로그](#logs) 또는 [추적](#traces) 쿼리에서 OpenTelemetry가 활성화된 경우 추적 ID 컬럼이 자동으로 포함됩니다.

추적 ID 컬럼이 포함되면 "**View Trace**" 및 "**View Logs**" 링크가 데이터에 첨부됩니다.

### Linking abilities {#linking-abilities}

데이터 링크가 있으면 제공된 추적 ID를 사용하여 추적과 로그를 열 수 있습니다.

"**View Trace**"는 추적이 있는 분할 패널을 열고, "**View Logs**"는 추적 ID로 필터링된 로그 쿼리를 엽니다. 링크가 대시보드에서 클릭되지 않고 탐색 뷰에서 클릭되면, 탐색 뷰의 새 탭에서 링크가 열립니다.

[로그](./config.md#logs)와 [추적](./config.md#traces) 모두에 대해 기본값이 구성되어 있어야 쿼리 유형 간 교차가 가능하므로, 로그에서 추적으로, 추적에서 로그로 연결할 수 있습니다. 동일한 쿼리 유형의 링크를 여는 경우 기본값은 필요하지 않으며, 쿼리를 단순히 복사하면 됩니다.

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  로그 쿼리(왼쪽 패널)에서 추적을 보기(오른쪽 패널) 예
  <Image size="md" img={demo_data_links} alt="데이터 링크 연결의 예" border />
</div>

## Macros {#macros}

매크로는 쿼리에 동적인 SQL을 추가하는 간단한 방법입니다. 쿼리가 ClickHouse 서버에 전송되기 전에 플러그인이 매크로를 확장하고 전체 표현식으로 교체합니다.

SQL Editor와 Query Builder 모두 매크로를 사용할 수 있습니다.

### Using macros {#using-macros}

매크로는 쿼리의 어느 곳에든, 필요에 따라 여러 번 포함될 수 있습니다.

여기 `$__timeFilter` 매크로를 사용하는 예시가 있습니다:

Input:
```sql
SELECT log_time, log_message
FROM logs
WHERE $__timeFilter(log_time)
```

Final query output:
```sql
SELECT log_time, log_message
FROM logs
WHERE log_time >= toDateTime(1415792726) AND log_time <= toDateTime(1447328726)
```

이 예제에서는 Grafana 대시보드의 시간 범위가 `log_time` 컬럼에 적용됩니다.

플러그인은 `{}`를 사용하는 표기를 지원합니다. [파라미터](/sql-reference/syntax.md#defining-and-using-query-parameters) 내에서 쿼리가 필요한 경우 이 표기를 사용하십시오.

### List of macros {#list-of-macros}

다음은 플러그인에서 사용할 수 있는 모든 매크로 목록입니다:

| 매크로                                        | 설명                                                                                                                                                                           | 출력 예                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `$__dateFilter(columnName)`                  | 제공된 컬럼에 대해 Grafana 패널의 시간 범위를 [Date](/sql-reference/data-types/date.md)로 사용하여 시간 범위 필터로 교체됩니다.                               | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                     |
| `$__timeFilter(columnName)`                  | 제공된 컬럼에 대해 Grafana 패널의 시간 범위를 [DateTime](/sql-reference/data-types/datetime.md)로 사용하여 시간 범위 필터로 교체됩니다.                      | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                    |
| `$__timeFilter_ms(columnName)`               | 제공된 컬럼에 대해 Grafana 패널의 시간 범위를 [DateTime64](/sql-reference/data-types/datetime64.md)로 사용하여 시간 범위 필터로 교체됩니다.               | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | `$__dateFilter()`와 `$__timeFilter()`를 결합하는 지름길로, 별도의 Date 및 DateTime 컬럼을 사용합니다. 별칭은 `$__dt()`입니다.                                        | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                                    |
| `$__fromTime`                                | Grafana 패널 범위의 시작 시간을 [DateTime](/sql-reference/data-types/datetime.md)로 변환하여 교체합니다.                                                  | `toDateTime(1415792726)`                                                                                      |
| `$__fromTime_ms`                             | 패널 범위의 시작 시간을 [DateTime64](/sql-reference/data-types/datetime64.md)로 변환하여 교체합니다.                                                    | `fromUnixTimestamp64Milli(1415792726123)`                                                                     |
| `$__toTime`                                  | Grafana 패널 범위의 종료 시간을 [DateTime](/sql-reference/data-types/datetime.md)로 변환하여 교체합니다.                                                   | `toDateTime(1447328726)`                                                                                      |
| `$__toTime_ms`                               | 패널 범위의 종료 시간을 [DateTime64](/sql-reference/data-types/datetime64.md)로 변환하여 교체합니다.                                                      | `fromUnixTimestamp64Milli(1447328726456)`                                                                     |
| `$__timeInterval(columnName)`                | 창 크기(초) 기반으로 간격을 계산하는 함수를 교체합니다.                                                                                                           | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                              |
| `$__timeInterval_ms(columnName)`             | 창 크기(밀리초) 기반으로 간격을 계산하는 함수를 교체합니다.                                                                                                        | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                    |
| `$__interval_s`                              | 대시보드 간격(초)을 교체합니다.                                                                                                                                          | `20`                                                                                                          |
| `$__conditionalAll(condition, $templateVar)` | 두 번째 매개변수의 템플릿 변수가 모든 값을 선택하지 않을 경우 첫 번째 매개변수로 교체됩니다. 템플릿 변수가 모든 값을 선택하는 경우 1=1로 교체됩니다.            | `condition` 또는 `1=1`                                                                                      |
