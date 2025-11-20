---
'title': 'Grafana 사용하기'
'description': 'Grafana와 ClickHouse를 사용하여 가시성 확보하기'
'slug': '/observability/grafana'
'keywords':
- 'Observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'show_related_blogs': true
'doc_type': 'guide'
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



# Grafana와 ClickHouse를 이용한 가시성

Grafana는 ClickHouse의 가시성 데이터에 대한 선호하는 시각화 도구입니다. 이는 Grafana를 위한 공식 ClickHouse 플러그인을 사용하여 달성됩니다. 사용자는 [여기](/integrations/grafana)에서 설치 지침을 따라 할 수 있습니다.

플러그인 V4는 로그와 추적을 새로운 쿼리 빌더 경험에서 일급 시민으로 만듭니다. 이는 SRE가 SQL 쿼리를 작성할 필요성을 최소화하고 SQL 기반 가시성을 단순화하여 이 새로운 패러다임의 발전을 촉진합니다. 이 부분에는 OpenTelemetry (OTel)를 플러그인의 핵심에 배치하는 것이 포함되어 있습니다. 우리는 이것이 향후 몇 년간 SQL 기반 가시성의 기본이 될 것이며 데이터 수집 방식이 될 것이라고 믿습니다.

## OpenTelemetry 통합 {#open-telemetry-integration}

Grafana에서 ClickHouse 데이터 소스를 구성하면 플러그인이 사용자에게 로그와 추적을 위한 기본 데이터베이스와 테이블을 지정할 수 있도록 하며, 이러한 테이블이 OTel 스키마를 준수하는지 여부를 결정할 수 있습니다. 이를 통해 플러그인은 Grafana에서 로그와 추적을 올바르게 렌더링하는 데 필요한 컬럼을 반환할 수 있습니다. 기본 OTel 스키마에 대해 변경 사항이 있는 경우, 사용자가 원하는 컬럼 이름을 지정할 수 있습니다. time (`Timestamp`), log level (`SeverityText`), message body (`Body`)와 같은 컬럼에 대해 기본 OTel 컬럼 이름을 사용하는 경우 변경 사항을 만들 필요가 없습니다.

:::note HTTP 또는 Native
사용자는 HTTP 또는 Native 프로토콜을 통해 Grafana를 ClickHouse에 연결할 수 있습니다. 후자는 Grafana 사용자가 발행하는 집계 쿼리에서 느끼기 어려운 미미한 성능 이점을 제공합니다. 반대로, HTTP 프로토콜은 일반적으로 사용자에게 프록시 및 내부 검토가 더 간단합니다.
:::

로그가 올바르게 렌더링되기 위해서는 로그 레벨, 시간 및 메시지 컬럼이 필요합니다.

추적 구성은 약간 더 복잡합니다 (전체 목록은 [여기](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 참고). 여기서 필요한 컬럼은 전체 추적 프로필을 구축하는 후속 쿼리를 추상화할 수 있도록 필요합니다. 이러한 쿼리는 데이터가 OTel과 유사한 구조로 되어 있다고 가정하므로, 표준 스키마에서 크게 벗어나는 사용자는 이 기능을 활용하기 위해 뷰를 사용해야 합니다.

<Image img={observability_15} alt="Connector config" size="sm"/>

구성이 완료되면 사용자는 [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/)로 이동하여 로그와 추적을 검색 시작할 수 있습니다.

## 로그 {#logs}

Grafana의 로그 요구 사항을 준수하는 경우, 사용자는 쿼리 빌더에서 `Query Type: Log`를 선택하고 `Run Query`를 클릭할 수 있습니다. 쿼리 빌더는 로그를 나열하는 쿼리를 작성하고 이를 렌더링하는 것을 보장합니다. 예를 들어:

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="Connector logs config" size="lg" border/>

쿼리 빌더는 쿼리를 수정하는 간단한 방법을 제공하여 사용자가 SQL을 작성할 필요가 없습니다. 쿼리 빌더에서 키워드를 포함하여 로그를 필터링할 수 있습니다. 더 복잡한 쿼리를 작성하고자 하는 사용자는 SQL 편집기로 전환할 수 있습니다. 적절한 컬럼이 반환되고 `logs`가 Query Type으로 선택되면 결과는 로그로 렌더링됩니다. 로그 렌더링에 필요한 컬럼은 [여기](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)에서 확인할 수 있습니다.

### 로그에서 추적으로 {#logs-to-traces}

로그에 추적 Id가 포함되어 있는 경우, 사용자는 특정 로그 라인에 대한 추적으로 이동할 수 있는 혜택을 누릴 수 있습니다.

<Image img={observability_17} alt="Logs to traces" size="lg" border/>

## 추적 {#traces}

위의 로그 경험과 유사하게, Grafana가 추적을 렌더링하는 데 필요한 컬럼이 충족되는 경우 (예: OTel 스키마를 사용하는 경우), 쿼리 빌더는 자동으로 필요한 쿼리를 작성할 수 있습니다. `Query Type: Traces`를 선택하고 `Run Query`를 클릭하면 다음과 유사한 쿼리가 생성되어 실행됩니다 (구성된 컬럼에 따라 다름 - 다음은 OTel 사용을 가정):

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

이 쿼리는 Grafana에서 예상하는 컬럼 이름을 반환하여 아래와 같이 추적의 테이블을 렌더링합니다. 지속 시간 또는 기타 컬럼에 대한 필터링은 SQL을 작성하지 않고도 수행할 수 있습니다.

<Image img={observability_18} alt="Traces" size="lg" border/>

더 복잡한 쿼리를 작성하고자 하는 사용자는 `SQL Editor`로 전환할 수 있습니다.

### 추적 세부정보 보기 {#view-trace-details}

위에서 설명한 것처럼, 추적 Id는 클릭 가능한 링크로 렌더링됩니다. 추적 Id를 클릭하면 사용자는 `View Trace` 링크를 통해 관련된 스팬을 볼 수 있습니다. 이는 필요한 구조로 스팬을 검색하는 다음과 같은 쿼리를 발행합니다 (OTel 컬럼을 가정).

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
위 쿼리가 `otel_traces_trace_id_ts`라는 물리화된 뷰를 사용하여 추적 Id 조회를 수행하는 방법에 유의하십시오. 더 자세한 내용은 [쿼리 가속화 - 물리화된 뷰를 이용한 조회](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)를 참고하세요.
:::

<Image img={observability_19} alt="Trace Details" size="lg" border/>

### 추적에서 로그로 {#traces-to-logs}

로그에 추적 Id가 포함되어 있는 경우, 사용자는 추적에서 관련 로그로 이동할 수 있습니다. 로그를 보려면 추적 Id를 클릭하고 `View Logs`를 선택합니다. 이는 기본 OTel 컬럼을 가정하고 다음 쿼리를 발행합니다.

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="Traces to logs" size="lg" border/>

## 대시보드 {#dashboards}

사용자는 ClickHouse 데이터 소스를 사용하여 Grafana에서 대시보드를 구축할 수 있습니다. 우리는 Grafana 및 ClickHouse에 대한 [데이터 소스 문서](https://github.com/grafana/clickhouse-datasource)를 참조하는 것이 좋으며, 특히 [매크로 개념](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros)과 [변수](https://grafana.com/docs/grafana/latest/dashboards/variables/)에 주목하십시오.

이 플러그인은 OTel 사양에 맞는 로그 및 추적 데이터에 대한 "간단한 ClickHouse OTel 대시보드"라는 예제 대시보드를 포함하여 여러 기본 제공 대시보드를 제공합니다. 이는 사용자가 OTel의 기본 컬럼 이름을 준수해야 하며, 데이터 소스 구성에서 설치할 수 있습니다.

<Image img={observability_21} alt="Dashboards" size="lg" border/>

아래에 시각화 구축을 위한 간단한 팁을 제공합니다.

### 시계열 데이터 {#time-series}

통계와 함께 선 차트는 가시성 사용 사례에서 가장 일반적인 시각화 형태입니다. Clickhouse 플러그인은 쿼리가 `datetime`인 `time`과 숫자 컬럼을 반환하는 경우 자동으로 선 차트를 렌더링합니다. 예를 들면:

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

<Image img={observability_22} alt="Time series" size="lg" border/>

### 다중 선 차트 {#multi-line-charts}

다중 선 차트는 다음 조건이 충족되는 경우 자동으로 렌더링됩니다:

- 필드 1: time의 별칭을 가진 datetime 필드
- 필드 2: 그룹화할 값. 이는 문자열이어야 합니다.
- 필드 3+: 메트릭 값

예를 들면:

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

<Image img={observability_23} alt="Multi-line charts" size="lg" border/>

### 지리적 데이터 시각화 {#visualizing-geo-data}

우리는 이전 섹션에서 IP 딕셔너리를 사용하여 가시성 데이터를 지리적 좌표로 확장하는 것에 대해 논의했습니다. `latitude` 및 `longitude` 컬럼이 있는 경우, `geohashEncode` 함수를 사용하여 가시성을 시각화할 수 있습니다. 이는 Grafana Geo Map 차트와 호환되는 지오 해시를 생성합니다. 아래에 예제 쿼리 및 시각화를 보여드립니다:

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

<Image img={observability_24} alt="Visualizing geo data" size="lg" border/>
