---
title: 'Grafana 사용하기'
description: '관측성을 위해 Grafana와 ClickHouse를 사용하기'
slug: /observability/grafana
keywords: ['관측성', '로그', '트레이스', '메트릭', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
---

import observability_15 from '@site/static/images/use-cases/observability/observability-15.png';
import observability_16 from '@site/static/images/use-cases/observability/observability-16.png';
import observability_17 from '@site/static/images/use-cases/observability/observability-17.png';
import observability_18 from '@site/static/images/use-cases/observability/observability-18.png';
import observability_19 from '@site/static/images/use-cases/observability/observability-19.png';
import observability_20 from '@site/static/images/use-cases/observability/observability-20.png';
import observability_21 from '@site/static/images/use-cases/observability/observability-21.png';
import observability_22 from '@site/static/images/use-cases/observability/observability-22.png';
import observability_23 from '@site/static/images/use-cases/observability/observability-23.png';
import observability_24 from '@site/static/images/use-cases/observability/observability-24.png';
import Image from '@theme/IdealImage';


# Grafana와 ClickHouse를 사용한 관측성(Observability) \{#using-grafana-and-clickhouse-for-observability\}

Grafana는 ClickHouse에서 관측성 데이터를 시각화하기 위해 가장 선호되는 도구입니다. 이는 Grafana용 공식 ClickHouse 플러그인을 사용하여 구현됩니다. 설치 방법은 [여기](/integrations/grafana)에 있는 안내를 따르면 됩니다.

플러그인 v4 버전에서는 새로운 쿼리 빌더 환경에서 로그와 트레이스를 일급 시민으로 다룹니다. 이를 통해 SRE가 SQL 쿼리를 직접 작성해야 할 필요성이 줄어들며, SQL 기반 관측성을 단순화하여 새롭게 부상하는 이러한 패러다임을 한 단계 진전시킵니다.
이 과정의 일부로 OpenTelemetry(OTel)를 플러그인의 핵심에 두었습니다. 향후 수년간 OpenTelemetry가 SQL 기반 관측성과 데이터 수집 방식의 기반이 될 것이라고 믿기 때문입니다.

## OpenTelemetry 통합 \{#open-telemetry-integration\}

Grafana에서 ClickHouse 데이터 소스를 구성할 때, 플러그인에서 로그와 트레이스를 위한 기본 데이터베이스와 테이블, 그리고 이 테이블들이 OTel 스키마를 따르는지 여부를 지정할 수 있습니다. 이를 통해 플러그인은 Grafana에서 로그와 트레이스를 올바르게 렌더링하는 데 필요한 컬럼을 반환할 수 있습니다. 기본 OTel 스키마를 변경하고 자체 컬럼 이름을 사용하려는 경우, 이를 별도로 지정할 수 있습니다. 시간(`Timestamp`), 로그 레벨(`SeverityText`), 메시지 본문(`Body`) 등의 컬럼에 대해 기본 OTel 컬럼 이름을 사용하는 경우에는 별도의 변경이 필요하지 않습니다.

:::note HTTP 또는 Native
Grafana를 ClickHouse에 HTTP 또는 Native 프로토콜을 통해 연결할 수 있습니다. Native 프로토콜은 약간의 성능 이점을 제공하지만, 이는 Grafana에서 발행되는 집계 쿼리 수준에서는 체감하기 어려운 정도입니다. 반면 HTTP 프로토콜은 일반적으로 프록시 구성 및 트래픽 모니터링/분석이 더 간단합니다.
:::

Logs 구성에서는 로그를 올바르게 렌더링하기 위해 시간, 로그 레벨, 메시지 컬럼이 필요합니다.

Traces 구성은 약간 더 복잡합니다(전체 목록은 [여기](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 참고). 여기에서 필요한 컬럼들은 전체 트레이스 프로파일을 빌드하는 후속 쿼리를 추상화할 수 있도록 하기 위한 것입니다. 이러한 쿼리는 데이터가 OTel과 유사한 방식으로 구조화되어 있다고 가정하므로, 표준 스키마에서 크게 벗어나는 사용자는 이 기능을 활용하기 위해 VIEW를 사용해야 합니다.

<Image img={observability_15} alt="Connector config" size="sm"/>

구성이 완료되면 [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/)로 이동하여 로그와 트레이스를 검색하기 시작할 수 있습니다.

## Logs \{#logs\}

로그에 대한 Grafana 요구사항을 충족하는 경우 쿼리 빌더에서 `Query Type: Log`를 선택한 다음 `Run Query`를 클릭하면 됩니다. 쿼리 빌더는 로그를 나열하고 올바르게 렌더링되도록 하는 쿼리를 자동으로 작성합니다. 예를 들어,

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="커넥터 로그 설정" size="lg" border />

쿼리 빌더는 SQL을 직접 작성할 필요 없이 쿼리를 수정할 수 있는 간단한 방법을 제공합니다. 키워드를 포함하는 로그 검색을 비롯한 필터링 작업은 쿼리 빌더에서 수행할 수 있습니다. 더 복잡한 쿼리를 작성하려는 사용자는 SQL 편집기로 전환할 수 있습니다. 적절한 컬럼이 반환되고 Query Type에서 `logs`를 선택하면 결과가 로그 형태로 렌더링됩니다. 로그 렌더링에 필요한 컬럼 목록은 [여기](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)에 나와 있습니다.


### 로그에서 트레이스로 \{#logs-to-traces\}

로그에 trace ID가 포함되어 있으면 특정 로그 라인에서 해당 트레이스로 이동하여 탐색할 수 있습니다.

<Image img={observability_17} alt="로그에서 트레이스로" size="lg" border/>

## Traces \{#traces\}

앞서 살펴본 로그 사용 경험과 마찬가지로, Grafana가 트레이스를 표시하는 데 필요한 컬럼이 충족되면(예: OTel 스키마 사용), 쿼리 빌더가 필요한 쿼리를 자동으로 구성할 수 있습니다. `Query Type: Traces`를 선택하고 `Run Query`를 클릭하면, 구성한 컬럼에 따라 다음과 유사한 쿼리가 생성 및 실행됩니다(아래 예시는 OTel 사용을 가정합니다):

```sql
SELECT "TraceId" as traceID,
  "ServiceName" as serviceName,
  "SpanName" as operationName,
  "Timestamp" as startTime,
  multiply("Duration", 0.000001) as duration
FROM "default"."otel_traces"
WHERE ( Timestamp >= $__fromTime AND Timestamp <= $__toTime )
  AND ( ParentSpanId = '' )
  AND ( Duration > 0 )
  ORDER BY Timestamp DESC, Duration DESC LIMIT 1000
```

이 쿼리는 Grafana에서 요구하는 컬럼 이름을 반환하며, 아래와 같이 트레이스 테이블을 표시합니다. 지속 시간(duration) 또는 다른 컬럼에 대한 필터링은 SQL을 작성하지 않고도 수행할 수 있습니다.

<Image img={observability_18} alt="트레이스" size="lg" border />

보다 복잡한 쿼리를 작성하려는 사용자는 `SQL Editor`로 전환할 수 있습니다.


### 트레이스 세부 정보 보기 \{#view-trace-details\}

위에서 본 것처럼 트레이스 ID는 클릭 가능한 링크로 표시됩니다. 트레이스 ID를 클릭하면 `View Trace` 링크를 통해 관련 스팬을 확인할 수 있습니다. 이때 (OTel 컬럼을 사용한다고 가정하면) 필요한 구조로 스팬을 조회하기 위해 다음 쿼리가 실행되며, 결과는 워터폴 형태로 렌더링됩니다.

```sql
WITH '<trace_id>' AS trace_id,
  (SELECT min(Start) FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) AS trace_start,
  (SELECT max(End) + 1 FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) AS trace_end
SELECT "TraceId" AS traceID,
  "SpanId" AS spanID,
  "ParentSpanId" AS parentSpanID,
  "ServiceName" AS serviceName,
  "SpanName" AS operationName,
  "Timestamp" AS startTime,
  multiply("Duration", 0.000001) AS duration,
  arrayMap(key -> map('key', key, 'value',"SpanAttributes"[key]),
  mapKeys("SpanAttributes")) AS tags,
  arrayMap(key -> map('key', key, 'value',"ResourceAttributes"[key]),
  mapKeys("ResourceAttributes")) AS serviceTags
FROM "default"."otel_traces"
WHERE traceID = trace_id
  AND startTime >= trace_start
  AND startTime <= trace_end
LIMIT 1000
```

:::note
위 쿼리는 trace id 조회를 수행하기 위해 materialized view `otel_traces_trace_id_ts`를 사용하는 점에 주목하십시오. 자세한 내용은 [쿼리 가속화 - 조회를 위한 materialized view 사용](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)을 참조하십시오.
:::

<Image img={observability_19} alt="Trace 상세 정보" size="lg" border />


### 트레이스에서 로그로 \{#traces-to-logs\}

로그에 trace ID가 포함되어 있으면 트레이스에서 해당 로그로 이동할 수 있습니다. 로그를 보려면 trace ID를 클릭한 후 `View Logs`를 선택합니다. 그러면 기본 OTel 컬럼 구성을 가정하고 다음 쿼리를 실행합니다.

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="트레이스에서 로그로 전환" size="lg" border />


## 대시보드 \{#dashboards\}

Grafana에서 ClickHouse 데이터 소스를 사용하여 대시보드를 구성할 수 있습니다. 보다 자세한 내용, 특히 [매크로 개념](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) 및 [변수](https://grafana.com/docs/grafana/latest/dashboards/variables/)에 대해서는 Grafana 및 ClickHouse [데이터 소스 문서](https://github.com/grafana/clickhouse-datasource)를 참고하는 것이 좋습니다.

이 플러그인은 OTel 사양을 준수하는 로깅 및 트레이싱 데이터용 예제 대시보드인 「Simple ClickHouse OTel dashboarding」을 포함하여 여러 가지 기본 제공 대시보드를 제공합니다. 이를 사용하려면 OTel에 대한 기본 컬럼 이름을 그대로 사용해야 하며, 데이터 소스 설정에서 설치할 수 있습니다.

<Image img={observability_21} alt="Dashboards" size="lg" border/>

아래에서는 시각화를 구성할 때 유용한 몇 가지 간단한 팁을 제공합니다.

### 시계열 \{#time-series\}

통계와 더불어 선형 차트는 관측성 사용 사례에서 가장 일반적으로 사용되는 시각화 방식입니다. ClickHouse 플러그인은 쿼리가 `time`이라는 이름의 `datetime` 컬럼과 수치 컬럼을 반환하면 선형 차트를 자동으로 렌더링합니다. 예를 들면 다음과 같습니다.

```sql
SELECT
 $__timeInterval(Timestamp) as time,
 quantile(0.99)(Duration)/1000000 AS p99
FROM otel_traces
WHERE
 $__timeFilter(Timestamp)
 AND ( Timestamp  >= $__fromTime AND Timestamp <= $__toTime )
GROUP BY time
ORDER BY time ASC
LIMIT 100000
```

<Image img={observability_22} alt="시계열 차트" size="lg" border />


### 다중 선 차트 \{#multi-line-charts\}

다중 선 차트는 다음 조건을 충족하는 쿼리에 대해 자동으로 생성됩니다:

* 필드 1: 별칭이 time인 datetime 타입 필드
* 필드 2: 그룹화에 사용할 값. `String`이어야 합니다.
* 필드 3+: 지표(metric) 값

예를 들어:

```sql
SELECT
  $__timeInterval(Timestamp) as time,
  ServiceName,
  quantile(0.99)(Duration)/1000000 AS p99
FROM otel_traces
WHERE $__timeFilter(Timestamp)
AND ( Timestamp  >= $__fromTime AND Timestamp <= $__toTime )
GROUP BY ServiceName, time
ORDER BY time ASC
LIMIT 100000
```

<Image img={observability_23} alt="다중 선 차트" size="lg" border />


### 지리 데이터 시각화 \{#visualizing-geo-data\}

앞선 섹션에서 IP 딕셔너리를 사용해 관측성 데이터에 지리 좌표를 추가하는 방법을 살펴보았습니다. `latitude`와 `longitude` 컬럼이 있다고 가정하면, `geohashEncode` 함수를 사용해 관측성 데이터를 시각화할 수 있습니다. 이 함수는 Grafana Geo Map 차트와 호환되는 지오해시(geohash)를 생성합니다. 예시 쿼리와 시각화 결과는 아래와 같습니다:

```sql
WITH coords AS
        (
        SELECT
                Latitude,
                Longitude,
                geohashEncode(Longitude, Latitude, 4) AS hash
        FROM otel_logs_v2
        WHERE (Longitude != 0) AND (Latitude != 0)
        )
SELECT
        hash,
        count() AS heat,
        round(log10(heat), 2) AS adj_heat
FROM coords
GROUP BY hash
```

<Image img={observability_24} alt="지리 데이터 시각화" size="lg" border />
