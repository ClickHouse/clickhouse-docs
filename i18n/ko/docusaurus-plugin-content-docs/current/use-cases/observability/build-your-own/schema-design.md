---
'title': '스키마 설계'
'description': '관측 가능성을 위한 스키마 설계를 설계하는 중'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'slug': '/use-cases/observability/schema-design'
'show_related_blogs': true
'doc_type': 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# Observability 스키마 설계

사용자에게 다음과 같은 이유로 항상 로그 및 추적을 위한 자체 스키마를 생성할 것을 추천합니다:

- **기본 키 선택** - 기본 스키마는 특정 접근 패턴에 최적화된 `ORDER BY`를 사용합니다. 사용자의 접근 패턴이 이에 맞을 가능성은 낮습니다.
- **구조 추출** - 사용자는 기존 컬럼에서 새로운 컬럼을 추출하고 싶을 수 있습니다. 예를 들어 `Body` 컬럼에서 새로운 컬럼을 추출할 수 있습니다. 이는 물리화된 컬럼(더 복잡한 경우 물리화된 뷰)을 사용하여 수행할 수 있으며, 스키마 변경이 필요합니다.
- **맵 최적화** - 기본 스키마는 속성 저장을 위해 맵 타입을 사용합니다. 이러한 컬럼은 임의의 메타데이터를 저장할 수 있습니다. 필수 기능이지만, 이벤트의 메타데이터는 종종 사전에 정의되지 않기 때문에 ClickHouse와 같은 강타입 데이터베이스에서는 다른 방법으로 저장할 수 없습니다. 맵 키와 값에 대한 접근은 일반 컬럼에 대한 접근보다 효율적이지 않습니다. 우리는 스키마를 수정하여 가장 자주 접근되는 맵 키를 최상위 컬럼으로 만들어 이 문제를 해결합니다 - ["SQL로 구조 추출하기"](#extracting-structure-with-sql)를 참조하십시오. 이는 스키마 변경이 필요합니다.
- **맵 키 접근 단순화** - 맵의 키에 접근하는 것은 더 장황한 구문을 요구합니다. 사용자는 별칭을 통해 이를 완화할 수 있습니다. 쿼리 단순화를 위해 ["별칭 사용하기"](#using-aliases)를 참조하십시오.
- **보조 인덱스** - 기본 스키마는 맵에 대한 접근을 가속화하고 텍스트 쿼리를 가속화하기 위해 보조 인덱스를 사용합니다. 이는 일반적으로 필요하지 않으며 추가 디스크 공간이 발생합니다. 사용 가능하지만 테스트하여 필요한지 확인해야 합니다. ["보조 / 데이터 스킵 인덱스"](#secondarydata-skipping-indices)를 참조하십시오.
- **코덱 사용** - 사용자는 예상되는 데이터를 이해하고 이로 인해 압축이 개선된다는 증거가 있을 경우 컬럼에 대한 코덱을 사용자화하고 싶어할 수 있습니다.

_위에서 언급한 각 사용 사례를 아래에 자세히 설명합니다._

**중요:** 사용자가 최적의 압축 및 쿼리 성능을 달성하기 위해 스키마를 확장하고 수정하도록 권장하지만, 가능한 경우 핵심 컬럼에 대해 OTel 스키마 명칭을 준수해야 합니다. ClickHouse Grafana 플러그인은 쿼리 빌딩을 지원하기 위해 기본 OTel 컬럼의 존재를 가정합니다. 예를 들어 Timestamp 및 SeverityText와 같은 컬럼이 필요합니다. 로그 및 추적에 필요한 컬럼은 여기 [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) 및 [여기](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)에 문서화되어 있습니다. 이러한 컬럼 이름을 변경할 수 있으며, 플러그인 구성에서 기본값을 무시할 수 있습니다.
## SQL로 구조 추출하기 {#extracting-structure-with-sql}

구조화된 로그인지 비구조화된 로그인지 간에, 사용자는 종종 다음과 같은 능력이 필요합니다:

- **문자열 블롭에서 컬럼 추출**. 이러한 쿼리는 쿼리 시간에 문자열 연산을 사용하는 것보다 빠릅니다.
- **맵에서 키 추출**. 기본 스키마는 임의의 속성을 맵 타입의 컬럼에 배치합니다. 이 유형은 스키마가 없는 기능을 제공하며, 사용자가 로그 및 추적을 정의할 때 속성을 위해 컬럼을 미리 정의할 필요가 없도록 하는 장점이 있습니다. 종종 Kubernetes에서 로그를 수집할 때, 포드 레이블이 후속 검색을 위해 유지될 수 있도록 하는 것이 불가능합니다. 맵 키와 값에 접근하는 것은 일반 ClickHouse 컬럼에 대한 쿼리보다 느립니다. 따라서 맵에서 키를 루트 테이블 컬럼으로 추출하는 것이 종종 바람직합니다.

다음 쿼리를 고려하십시오:

구조화된 로그를 사용하여 가장 많은 POST 요청을 수신하는 URL 경로를 세고 싶다고 가정해 보겠습니다. JSON 블롭은 `Body` 컬럼에 문자열로 저장됩니다. 또한, 사용자에게 json_parser가 수집기에서 활성화된 경우 `LogAttributes` 컬럼에 `Map(String, String)`으로 저장될 수 있습니다.

```sql
SELECT LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
LogAttributes: {'status':'200','log.file.name':'access-structured.log','request_protocol':'HTTP/1.1','run_time':'0','time_local':'2019-01-22 00:26:14.000','size':'30577','user_agent':'Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)','referer':'-','remote_user':'-','request_type':'GET','request_path':'/filter/27|13 ,27|  5 ,p53','remote_addr':'54.36.149.41'}
```

`LogAttributes`가 사용 가능하다고 가정할 때, 사이트에서 가장 많은 POST 요청을 수신하는 URL 경로를 세는 쿼리는 다음과 같습니다:

```sql
SELECT path(LogAttributes['request_path']) AS path, count() AS c
FROM otel_logs
WHERE ((LogAttributes['request_type']) = 'POST')
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.735 sec. Processed 10.36 million rows, 4.65 GB (14.10 million rows/s., 6.32 GB/s.)
Peak memory usage: 153.71 MiB.
```

여기서 맵 구문 예를 들면 `LogAttributes['request_path']`와 URL에서 쿼리 매개변수를 제거하기 위해 [`path` 함수](/sql-reference/functions/url-functions#path)를 사용하고 있습니다.

만약 사용자가 수집기에서 JSON 파싱을 활성화하지 않았다면 `LogAttributes`는 비어있어야 하며, 우리는 String `Body`에서 컬럼을 추출하기 위해 [JSON 함수](/sql-reference/functions/json-functions)를 사용해야 합니다.

:::note ClickHouse에서 파싱 선호
구조화된 로그의 JSON 파싱은 ClickHouse에서 수행할 것을 일반적으로 추천합니다. ClickHouse가 가장 빠른 JSON 파싱 구현이라고 확신합니다. 하지만 사용자가 다른 소스로 로그를 전송하고 이 로직이 SQL에 존재하지 않기를 원할 수도 있습니다.
:::

```sql
SELECT path(JSONExtractString(Body, 'request_path')) AS path, count() AS c
FROM otel_logs
WHERE JSONExtractString(Body, 'request_type') = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.668 sec. Processed 10.37 million rows, 5.13 GB (15.52 million rows/s., 7.68 GB/s.)
Peak memory usage: 172.30 MiB.
```

이제 비구조화된 로그에 대해서도 같은 것을 고려하십시오:

```sql
SELECT Body, LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           151.233.185.144 - - [22/Jan/2019:19:08:54 +0330] "GET /image/105/brand HTTP/1.1" 200 2653 "https://www.zanbil.ir/filter/b43,p56" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" "-"
LogAttributes: {'log.file.name':'access-unstructured.log'}
```

비구조화된 로그에 대한 유사한 쿼리는 `extractAllGroupsVertical` 함수를 통해 정규 표현식을 사용해야 합니다.

```sql
SELECT
        path((groups[1])[2]) AS path,
        count() AS c
FROM
(
        SELECT extractAllGroupsVertical(Body, '(\\w+)\\s([^\\s]+)\\sHTTP/\\d\\.\\d') AS groups
        FROM otel_logs
        WHERE ((groups[1])[1]) = 'POST'
)
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 1.953 sec. Processed 10.37 million rows, 3.59 GB (5.31 million rows/s., 1.84 GB/s.)
```

비구조화된 로그를 파싱하기 위한 쿼리의 복잡성과 비용 증가(성능 차이 주목)는 우리가 항상 가능한 경우 구조화된 로그를 사용할 것을 추천하는 이유입니다.

:::note 딕셔너리 고려하기
위 쿼리는 정규 표현식 딕셔너리를 활용하여 최적화될 수 있습니다. 자세한 내용은 [딕셔너리 사용하기](#using-dictionaries)를 참조하십시오.
:::

이 두 가지 사용 사례는 ClickHouse를 사용하여 위의 쿼리 논리를 삽입 시간으로 이동시켜 해결할 수 있습니다. 우리는 아래에서 몇 가지 접근 방식을 탐색하며 각 접근 방식이 적합한 경우를 강조합니다.

:::note OTel 또는 ClickHouse로 처리?
사용자는 또한 [여기](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)에서 설명한 대로 OTel Collector 프로세서 및 연산자를 사용하여 처리를 수행할 수 있습니다. 대부분의 경우, 사용자는 ClickHouse가 수집기 프로세서보다 리소스를 보다 효율적으로 사용하고 빠르다는 것을 발견할 것입니다. SQL에서 이벤트 처리를 모두 수행하는 주요 단점은 솔루션이 ClickHouse에 결합된다는 것입니다. 예를 들어, 사용자는 OTel 수집기로 프로세스된 로그를 S3와 같은 대안 목적지로 전송하기를 원할 수 있습니다.
:::
### 물리화된 컬럼 {#materialized-columns}

물리화된 컬럼은 다른 컬럼에서 구조를 추출하는 가장 간단한 솔루션을 제공합니다. 이러한 컬럼의 값은 항상 삽입 시간에 계산되며 INSERT 쿼리에서 지정될 수 없습니다.

:::note 오버헤드
물리화된 컬럼은 삽입 시간에 디스크의 새로운 컬럼으로 값이 추출되므로 추가 저장 오버헤드를 발생시킵니다.
:::

물리화된 컬럼은 ClickHouse 표현을 지원하며, [문자열 처리](/sql-reference/functions/string-functions) (여기에는 [정규 표현식 및 검색](/sql-reference/functions/string-search-functions) 포함) 및 [URL](/sql-reference/functions/url-functions)에 대한 모든 분석 함수를 활용할 수 있습니다. [타입 변환](/sql-reference/functions/type-conversion-functions), [JSON에서 값 추출](/sql-reference/functions/json-functions) 또는 [수학적 연산](/sql-reference/functions/math-functions)을 수행할 수도 있습니다.

기본 처리에 물리화된 컬럼을 추천합니다. 이들은 맵에서 값을 추출하고 루트 컬럼으로 승격시키고 타입 변환을 수행하는 데 특히 유용합니다. 이들은 종종 매우 기본적인 스키마에서 사용되거나 물리화된 뷰와 함께 사용할 때 가장 유용합니다. 수집기가 `LogAttributes` 컬럼으로 JSON을 추출한 다음의 로그용 스키마를 고려하십시오:

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `RequestPage` String MATERIALIZED path(LogAttributes['request_path']),
        `RequestType` LowCardinality(String) MATERIALIZED LogAttributes['request_type'],
        `RefererDomain` String MATERIALIZED domain(LogAttributes['referer'])
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

String `Body`에서 JSON 함수를 사용하여 추출하는 동등한 스키마는 [여기](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)에서 확인할 수 있습니다.

우리의 세 개의 물리화된 컬럼은 요청 페이지, 요청 유형 및 참조 도메인을 추출합니다. 이들은 맵 키에 접근하고 그 값에 함수를 적용합니다. 우리의 다음 쿼리는 상당히 더 빠릅니다:

```sql
SELECT RequestPage AS path, count() AS c
FROM otel_logs
WHERE RequestType = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.173 sec. Processed 10.37 million rows, 418.03 MB (60.07 million rows/s., 2.42 GB/s.)
Peak memory usage: 3.16 MiB.
```

:::note
물리화된 컬럼은 기본적으로 `SELECT *`에서 반환되지 않습니다. 이는 `SELECT *`의 결과가 항상 INSERT를 사용하여 테이블에 다시 삽입될 수 있다는 불변성을 보존하기 위함입니다. 이 동작은 `asterisk_include_materialized_columns=1`을 설정하여 비활성화할 수 있으며, Grafana에서 활성화할 수 있습니다 (데이터 소스 구성에서 `추가 설정 -> 사용자 지정 설정`을 참조하세요).
:::
## 물리화된 뷰 {#materialized-views}

[물리화된 뷰](/materialized-views)는 로그 및 추적에 SQL 필터링 및 변환을 적용하는 보다 강력한 수단을 제공합니다.

물리화된 뷰는 사용자가 쿼리 시간에서 삽입 시간으로 계산 비용을 이동하도록 허용합니다. ClickHouse 물리화된 뷰는 테이블에 삽입되는 데이터 블록에 대한 쿼리를 실행하는 트리거입니다. 이 쿼리의 결과는 두 번째 "대상" 테이블에 삽입됩니다.

<Image img={observability_10} alt="물리화된 뷰" size="md"/>

:::note 실시간 업데이트
ClickHouse의 물리화된 뷰는 기반이 되는 테이블로 데이터가 흐를 때 실시간으로 업데이트되며, 지속적으로 업데이트되는 인덱스와 더 유사하게 작동합니다. 반면, 다른 데이터베이스의 물리화된 뷰는 일반적으로 새롭게 갱신해야 하는 쿼리의 정적 스냅샷입니다(ClickHouse Refreshable Materialized Views와 유사).
:::

물리화된 뷰와 연결된 쿼리는 이론적으로는 모든 쿼리가 가능하며, 집계를 포함하되 [조인에서의 제약이 존재합니다](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins). 로그 및 추적에 필요한 변환 및 필터링 작업을 위해 사용자들은 모든 `SELECT` 문을 가능하다고 고려할 수 있습니다.

사용자는 쿼리가 단순히 삽입되는 테이블(소스 테이블)의 행에 대해 실행되는 트리거라는 점을 명심해야 하며, 결과는 새로운 테이블(대상 테이블)로 전송됩니다.

데이터를 두 번 지속해 저장하지 않도록(소스와 대상 테이블 모두) 하기 위해, 소스 테이블의 테이블 엔진을 [Null 테이블 엔진](/engines/table-engines/special/null)으로 변경하여 원본 스키마를 보존할 수 있습니다. 우리의 OTel 수집기는 여전히 이 테이블로 데이터를 전송합니다. 예를 들어, 로그의 경우 `otel_logs` 테이블이 다음과 같습니다:

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1))
) ENGINE = Null
```

Null 테이블 엔진은 강력한 최적화입니다 - `/dev/null`처럼 생각하십시오. 이 테이블은 어떤 데이터도 저장하지 않지만, 모든 연결된 물리화된 뷰는 삽입된 행에 대해 실행됩니다.

다음 쿼리를 고려하십시오. 이는 우리의 행을 우리가 보존하고자 하는 형식으로 변환하며, `LogAttributes`에서 모든 컬럼을 추출합니다(이것은 수집기가 `json_parser` 연산자를 사용하여 설정했다고 가정합니다). `SeverityText` 및 `SeverityNumber`를 설정합니다(일부 간단한 조건 및 [이 컬럼들](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)의 정의를 기준으로). 이 경우 우리가 알고 있는 모든 컬럼만 선택하며, `TraceId`, `SpanId` 및 `TraceFlags`와 같은 컬럼은 무시합니다.

```sql
SELECT
        Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status'] AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddr,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:      2019-01-22 00:26:14
ServiceName:
Status:         200
RequestProtocol: HTTP/1.1
RunTime:        0
Size:           30577
UserAgent:      Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:        -
RemoteUser:     -
RequestType:    GET
RequestPath:    /filter/27|13 ,27|  5 ,p53
RemoteAddr:     54.36.149.41
RefererDomain:
RequestPage:    /filter/27|13 ,27|  5 ,p53
SeverityText:   INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.027 sec.
```

위에서 `Body` 컬럼도 추출합니다 - 이후에 SQL에 의해 추출되지 않는 추가 속성이 나중에 추가될 수 있는 경우를 대비한 것입니다. 이 컬럼은 ClickHouse에서 잘 압축될 것이며, 거의 액세스되지 않기 때문에 쿼리 성능에 영향을 주지 않습니다. 마지막으로, Timestamp를 DateTime으로 변환하여 공간을 절약합니다(자세한 내용은 ["타입 최적화"](#optimizing-types)를 참조하세요).

:::note 조건문
위에서 `SeverityText`와 `SeverityNumber`를 추출하기 위해 [조건문](/sql-reference/functions/conditional-functions)을 사용한 점에 유의하십시오. 이는 복잡한 조건을 수립하고 맵에서 값이 설정되었는지 확인하는 데 매우 유용합니다. 우리는 모든 키가 `LogAttributes`에 존재한다고 단순화한 가정 하에 진행했습니다. 우리는 사용자가 이들에 익숙해지기를 권장합니다 - 로그 파싱에서 귀하의 친구가 될 것이며 [null 값](https://sql-reference/functions/functions-for-nulls)을 처리하는 함수와 함께 사용할 수 있습니다!
:::

이러한 결과를 수신하기 위한 테이블이 필요합니다. 아래의 대상 테이블은 위의 쿼리와 일치합니다:

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

여기 선택한 타입은 ["타입 최적화"](#optimizing-types)에서 논의된 최적화에 따릅니다.

:::note
스키마가 극적으로 변경된 점에 주목하십시오. 실제로 사용자는 추적 컬럼과 Kubernetes 메타데이터를 포함하는 `ResourceAttributes` 컬럼도 보존하고 싶어 할 가능성이 높습니다. Grafana는 추적 컬럼을 활용하여 로그와 추적 간의 링크 기능을 제공합니다 - ["Grafana 사용하기"](/observability/grafana)를 참조하십시오.
:::

아래에서, 우리는 위의 선택을 실행하기 위해 `otel_logs_mv`라는 물리화된 뷰를 생성하고, 결과를 `otel_logs_v2`로 보냅니다.

```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT
        Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

위 내용은 아래와 같이 시각화됩니다:

<Image img={observability_11} alt="Otel MV" size="md"/>

이제 ["ClickHouse에 내보내기"](/observability/integrating-opentelemetry#exporting-to-clickhouse)에서 사용된 수집기 구성을 다시 시작하면 원하는 형식의 `otel_logs_v2`에 데이터가 나타납니다. 여기서 사용된 타입이 지정된 JSON 추출 함수의 사용에 주목하십시오.

```sql
SELECT *
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:      2019-01-22 00:26:14
ServiceName:
Status:         200
RequestProtocol: HTTP/1.1
RunTime:        0
Size:           30577
UserAgent:      Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:        -
RemoteUser:     -
RequestType:    GET
RequestPath:    /filter/27|13 ,27|  5 ,p53
RemoteAddress:  54.36.149.41
RefererDomain:
RequestPage:    /filter/27|13 ,27|  5 ,p53
SeverityText:   INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.010 sec.
```

`Body` 컬럼에서 JSON 함수를 사용하여 컬럼을 추출하는 동일한 물리화된 뷰는 아래에 보여져 있습니다:

```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT  Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        JSONExtractUInt(Body, 'status') AS Status,
        JSONExtractString(Body, 'request_protocol') AS RequestProtocol,
        JSONExtractUInt(Body, 'run_time') AS RunTime,
        JSONExtractUInt(Body, 'size') AS Size,
        JSONExtractString(Body, 'user_agent') AS UserAgent,
        JSONExtractString(Body, 'referer') AS Referer,
        JSONExtractString(Body, 'remote_user') AS RemoteUser,
        JSONExtractString(Body, 'request_type') AS RequestType,
        JSONExtractString(Body, 'request_path') AS RequestPath,
        JSONExtractString(Body, 'remote_addr') AS remote_addr,
        domain(JSONExtractString(Body, 'referer')) AS RefererDomain,
        path(JSONExtractString(Body, 'request_path')) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```
### 타입 주의 {#beware-types}

위의 물리화된 뷰는 암시적 캐스팅에 의존합니다 - 특히 `LogAttributes` 맵을 사용할 경우 그렇습니다. ClickHouse는 종종 투명하게 추출된 값을 대상 테이블 유형으로 캐스팅하며, 이로 인해 필요한 구문이 줄어듭니다. 그러나 사용자는 항상 같은 스키마를 사용하는 대상 테이블에 대한 [`SELECT`](https://sql-reference/statements/select) 문을 사용하여 뷰를 테스트할 것을 권장합니다. 이는 타입이 올바르게 처리되는지 확인해야 합니다. 다음의 경우에 특별한 주의가 필요합니다:

- 만약 맵에 키가 존재하지 않는 경우, 빈 문자열이 반환됩니다. 숫자의 경우, 사용자는 이를 적절한 값에 매핑해야 합니다. 이는 [조건문](/sql-reference/functions/conditional-functions) 예를 들어 `if(LogAttributes['status'] = ", 200, LogAttributes['status'])` 또는 기본 값이 허용되는 경우 [캐스트 함수](/sql-reference/functions/type-conversion-functions) `toUInt8OrDefault(LogAttributes['status'] )`로 달성할 수 있습니다.
- 일부 타입은 항상 캐스팅되지 않습니다. 예를 들어 숫자의 문자열 표현은 열거형 값으로 캐스팅되지 않습니다.
- JSON 추출 함수는 값이 발견되지 않으면 해당 타입의 기본 값을 반환합니다. 이러한 값이 의미 있는지 확인하십시오!

:::note Nullable 피하기
Clickhouse에서 Observability 데이터에 대해 [Nullable](/sql-reference/data-types/nullable)를 사용하는 것을 피하십시오. 로그 및 추적에서 빈 값과 null을 구별할 필요성이 드물기 때문입니다. 이 기능은 추가적인 저장 오버헤드를 발생시켜 쿼리 성능에 부정적인 영향을 미칩니다. 더 자세한 내용은 [여기](https://data-modeling/schema-design#optimizing-types)에서 확인하십시오.
:::
## 기본(정렬) 키 선택 {#choosing-a-primary-ordering-key}

원하는 컬럼을 추출한 후, 정렬/기본 키를 최적화하는 작업을 시작할 수 있습니다.

정렬 키 선택을 돕기 위해 몇 가지 간단한 규칙을 적용할 수 있습니다. 다음 항목들은 때때로 상충할 수 있으므로, 이러한 순서에 따라 고려하십시오. 사용자는 이 과정에서 여러 개의 키를 식별할 수 있으며, 일반적으로 4-5개면 충분합니다:

1. 일반 필터 및 접근 패턴에 맞는 컬럼을 선택하십시오. 사용자가 일반적으로 특정 컬럼(예: 포드 이름)으로 필터링하여 Observability 조사를 시작하는 경우, 이 컬럼은 `WHERE` 절에서 자주 사용됩니다. 덜 자주 사용되는 키보다는 이를 포함하는 것을 우선시하십시오.
2. 필터링할 때 전체 행의 큰 비율을 제외하는 데 도움이 되는 컬럼을 선호하십시오. 따라서 읽어야 할 데이터 양을 줄일 수 있습니다. 서비스 이름 및 상태 코드는 종종 좋은 후보입니다 - 후자의 경우 대부분의 행을 제외하는 값으로 필터링할 경우에만 해당합니다. 예를 들어 200 기준으로 필터링하면 대부분의 시스템에서 대다수의 행과 일치하게 됩니다. 반면, 500 오류는 소규모 부분에 해당합니다.
3. 테이블의 다른 컬럼과 높은 상관관계를 가질 가능성이 있는 컬럼을 선호하십시오. 이는 이러한 값이 연속적으로 저장되도록 도울 것이며, 압축을 개선합니다.
4. 정렬 키에 있는 컬럼에 대해 `GROUP BY` 및 `ORDER BY` 작업이 메모리 효율적으로 수행될 수 있습니다.

<br />

정렬 키에 대한 컬럼의 부분 집합을 식별한 후, 특정 순서로 선언해야 합니다. 이 순서는 쿼리에서 보조 키 컬럼 필터링의 효율성과 테이블 데이터 파일의 압축 비율에 중대한 영향을 미칠 수 있습니다. 일반적으로, **카디널리티의 오름차순으로 키를 정렬하는 것이 가장 좋습니다**. 이는 정렬 키에서 후반에 나타나는 컬럼에서 필터링하는 것이 초기 튜플에 나타나는 컬럼에서 필터링하는 것보다 덜 효율적일 것이므로 이를 균형 조절해야 합니다. 이러한 동작을 균형 있게 고려하고 접근 패턴을 살펴보십시오. 무엇보다도 변형을 테스트하십시오. 정렬 키와 이를 최적화하는 방법에 대한 추가 이해를 위해, [이 기사](https://guides/best-practices/sparse-primary-indexes)를 추천합니다.

:::note 구조 우선
로그를 구조화한 후 정렬 키를 결정하는 것을 추천합니다. 정렬 키나 JSON 추출 표현식에 속성 맵의 키를 사용하지 마십시오. 테이블의 루트 컬럼으로 정렬 키가 있어야 합니다.
:::
## 맵 사용하기 {#using-maps}

이전 예제에서는 `Map(String, String)` 컬럼에서 값을 접근하기 위해 맵 구문 `map['key']`의 사용을 보여줍니다. 중첩된 키에 접근하기 위해 맵 표기를 사용하는 것 외에도, 필터링하거나 이러한 컬럼을 선택하기 위해 ClickHouse [맵 함수](/sql-reference/functions/tuple-map-functions#mapkeys)도 사용 가능합니다.

예를 들어, 다음 쿼리는 [`mapKeys` 함수](/sql-reference/functions/tuple-map-functions#mapkeys)를 사용하여 `LogAttributes` 컬럼에서 사용 가능한 모든 고유 키를 식별하고, [`groupArrayDistinctArray` 함수](/sql-reference/aggregate-functions/combinators) (결합기)를 사용할 수 있습니다.

```sql
SELECT groupArrayDistinctArray(mapKeys(LogAttributes))
FROM otel_logs
FORMAT Vertical

Row 1:
──────
groupArrayDistinctArray(mapKeys(LogAttributes)): ['remote_user','run_time','request_type','log.file.name','referer','request_path','status','user_agent','remote_addr','time_local','size','request_protocol']

1 row in set. Elapsed: 1.139 sec. Processed 5.63 million rows, 2.53 GB (4.94 million rows/s., 2.22 GB/s.)
Peak memory usage: 71.90 MiB.
```

:::note 점(.) 피하기
맵 컬럼 이름에 점(.)을 사용하는 것을 권장하지 않으며, 그 사용을 deprecated할 수 있습니다. 대신 `_`를 사용하십시오.
:::
## 별칭 사용하기 {#using-aliases}

맵 타입 쿼리는 일반 컬럼 쿼리보다 느립니다 - 보십시오 ["쿼리 가속화"](#accelerating-queries). 또한 구문이 더 복잡해져 사용자에게 부담이 될 수 있습니다. 이러한 문제를 해결하기 위해 별칭 컬럼 사용을 권장합니다.

ALIAS 컬럼은 쿼리 시간에 계산되며 테이블에 저장되지 않습니다. 따라서 이 유형의 컬럼에 값을 INSERT할 수 없습니다. 별칭을 사용하여 우리는 맵 키를 참조하고 구문을 단순화하여 맵 항목을 일반 컬럼처럼 투명하게 노출할 수 있습니다. 다음 예제를 고려하십시오:

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `RequestPath` String MATERIALIZED path(LogAttributes['request_path']),
        `RequestType` LowCardinality(String) MATERIALIZED LogAttributes['request_type'],
        `RefererDomain` String MATERIALIZED domain(LogAttributes['referer']),
        `RemoteAddr` IPv4 ALIAS LogAttributes['remote_addr']
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, Timestamp)
```

여러 물리화된 컬럼과 맵 `LogAttributes`에 접근하는 `ALIAS` 컬럼 `RemoteAddr`가 있습니다. 이제 우리는 이 컬럼을 통해 `LogAttributes['remote_addr']` 값을 쿼리할 수 있어 우리의 쿼리가 단순해 집니다.

```sql
SELECT RemoteAddr
FROM default.otel_logs
LIMIT 5

┌─RemoteAddr────┐
│ 54.36.149.41  │
│ 31.56.96.51   │
│ 31.56.96.51   │
│ 40.77.167.129 │
│ 91.99.72.15   │
└───────────────┘

5 rows in set. Elapsed: 0.011 sec.
```

또한, `ALTER TABLE` 명령을 사용하여 `ALIAS`를 추가하는 것은 간단합니다. 이러한 컬럼은 즉시 사용 가능해집니다. 예:

```sql
ALTER TABLE default.otel_logs
        (ADD COLUMN `Size` String ALIAS LogAttributes['size'])

SELECT Size
FROM default.otel_logs_v3
LIMIT 5

┌─Size──┐
│ 30577 │
│ 5667  │
│ 5379  │
│ 1696  │
│ 41483 │
└───────┘

5 rows in set. Elapsed: 0.014 sec.
```

:::note 기본적으로 제외된 별칭
기본적으로 `SELECT *`는 ALIAS 컬럼을 제외합니다. 이 동작은 `asterisk_include_alias_columns=1`을 설정하여 비활성화할 수 있습니다.
:::
## 타입 최적화 {#optimizing-types}

Clickhouse 최적 타입 최적화에 대한 [일반 모범 사례](/data-modeling/schema-design#optimizing-types)는 ClickHouse 사용 사례에도 적용됩니다.
## 코덱 사용하기 {#using-codecs}

타입 최적화 외에도, 사용자는 ClickHouse Observability 스키마에 대한 압축 최적화를 시도할 때 [코덱에 대한 일반 모범 사례](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)를 따를 수 있습니다.

일반적으로 사용자는 `ZSTD` 코덱이 로그 및 추적 데이터 세트에 매우 적합하다는 것을 발견합니다. 압축 값을 기본값인 1에서 높이면 압축이 개선될 수 있습니다. 그러나 이는 테스트해야 하며, 더 높은 값은 삽입 시간에 더 많은 CPU 오버헤드를 발생시킵니다. 일반적으로 이 값을 증가시키는 것에서 큰 이득을 보지 않습니다.

또한, 타임스탬프는 압축에 대한 델타 인코딩으로 인한 이점을 누리지만, 이 컬럼이 기본/정렬 키에 사용되면 쿼리 성능 저하를 초래할 수 있습니다. 사용자는 각각의 압축 대 쿼리 성능 간의 트레이드오프를 평가해야 합니다.
## 딕셔너리 사용하기 {#using-dictionaries}

[딕셔너리](/sql-reference/dictionaries)은 다양한 내부 및 외부 [소스](/sql-reference/dictionaries#dictionary-sources)에서 데이터를 메모리 내 [키-값](https://en.wikipedia.org/wiki/Key%E2%80%93value_database)로 표현하여 제공하는 ClickHouse의 [주요 기능](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)입니다. 초저지연 탐색 쿼리에 최적화되어 있습니다.

<Image img={observability_12} alt="Observability와 딕셔너리" size="md"/>

이는 다양한 시나리오에서 유용하며, 수집된 데이터를 실시간으로 풍부하게 하여 수집 프로세스를 지연시키지 않고 쿼리 성능을 개선하는 데 도움이 됩니다. JOIN에서는 특히 이점이 있습니다. 관찰 가능성의 사용 사례에서 조인이 드물게 필요한 반면, 딕셔너리는 여전히 수집 및 쿼리 시간 모두에서 보강 목적으로 유용합니다. 아래 두 가지 예를 제공합니다.

:::note 조인 가속화
딕셔너리로 조인을 가속화하려는 사용자는 [여기](/dictionary)에서 자세한 내용을 찾을 수 있습니다.
:::
### 삽입 시간 대 쿼리 시간 {#insert-time-vs-query-time}

딕셔너리는 데이터 세트를 쿼리 시간 또는 삽입 시간에 보강하는 데 사용될 수 있습니다. 이러한 접근 방식 각각은 장단점이 있으므로 다음과 같이 요약할 수 있습니다:

- **삽입 시간** - 보강 값이 변경되지 않고 외부 소스에 존재할 경우 일반적으로 적합합니다. 이 경우 삽입 시간에 행을 보강하면 딕셔너리에 대한 쿼리 시간 조회를 피할 수 있습니다. 이 방법은 삽입 성능과 추가 저장 오버헤드가 발생하는 단점을 가집니다. 보강된 값은 컬럼으로 저장되기 때문입니다.
- **쿼리 시간** - 딕셔너리의 값이 자주 변경되는 경우 쿼리 시간 조회가 더 적합한 경우가 많습니다. 이는 매핑된 값이 변경될 경우 컬럼을 업데이트하고 데이터를 다시 작성할 필요를 피하게 됩니다. 이 유연성은 쿼리 시간 조회 비용을 초래합니다. 이 쿼리 시간 비용은 많은 행에 대한 조회가 필요한 경우 보통 인식 가능합니다. 예를 들어 필터 절에서 딕셔너리 조회를 사용할 때 그렇습니다. 결과 보강, 즉 `SELECT`에서는 이 오버헤드가 보통 인식되지 않습니다.

사용자가 딕셔너리의 기본에 익숙해지는 것을 권장합니다. 딕셔너리는 전용 [전문 함수](/sql-reference/functions/ext-dict-functions#dictgetall)를 사용하여 값을 검색할 수 있는 메모리 내 조회 테이블을 제공합니다.

간단한 보강 예제를 보려면 [여기](/dictionary)에서 딕셔너리에 대한 가이드를 참조하십시오. 아래에서는 일반적인 관찰 가능성 보강 작업에 집중합니다.
### IP 딕셔너리 사용하기 {#using-ip-dictionaries}

위도 및 경도 값을 사용하여 IP 주소로 로그와 추적을 지리적으로 보강하는 것은 일반적인 관찰 가능성 요구 사항입니다. 우리는 `ip_trie` 구조화된 딕셔너리를 사용하여 이를 달성할 수 있습니다.

우리는 [DB-IP.com](https://db-ip.com/)에서 제공하는 공개적으로 사용 가능한 [DB-IP 시티 레벨 데이터 세트](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)를 사용합니다. 이 데이터 세트는 [CC BY 4.0 라이센스](https://creativecommons.org/licenses/by/4.0/)에 따라 제공됩니다.

[README](https://github.com/sapics/ip-location-db#csv-format)에서 데이터의 구조는 다음과 같습니다:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

이 구조를 고려하여, [url()](/sql-reference/table-functions/url) 테이블 함수를 사용하여 데이터의 미리보기를 살펴보겠습니다:

```sql
SELECT *
FROM url('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV', '\n           \tip_range_start IPv4, \n       \tip_range_end IPv4, \n         \tcountry_code Nullable(String), \n     \tstate1 Nullable(String), \n           \tstate2 Nullable(String), \n           \tcity Nullable(String), \n     \tpostcode Nullable(String), \n         \tlatitude Float64, \n          \tlongitude Float64, \n         \ttimezone Nullable(String)\n   \t')
LIMIT 1
FORMAT Vertical
Row 1:
──────
ip_range_start: 1.0.0.0
ip_range_end:   1.0.0.255
country_code:   AU
state1:         Queensland
state2:         ᴺᵁᴸᴸ
city:           South Brisbane
postcode:       ᴺᵁᴸᴸ
latitude:       -27.4767
longitude:      153.017
timezone:       ᴺᵁᴸᴸ
```

우리의 작업을 쉽게 만들기 위해, [`URL()`](/engines/table-engines/special/url) 테이블 엔진을 사용하여 ClickHouse 테이블 객체를 생성하고 필드 이름을 확인하여 총 행 수를 확인해 보겠습니다:

```sql
CREATE TABLE geoip_url(
        ip_range_start IPv4,
        ip_range_end IPv4,
        country_code Nullable(String),
        state1 Nullable(String),
        state2 Nullable(String),
        city Nullable(String),
        postcode Nullable(String),
        latitude Float64,
        longitude Float64,
        timezone Nullable(String)
) ENGINE=URL('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV')

select count() from geoip_url;

┌─count()─┐
│ 3261621 │ -- 3.26 million
└─────────┘
```

우리의 `ip_trie` 딕셔너리는 IP 주소 범위를 CIDR 표기법으로 표현해야 하므로 `ip_range_start` 및 `ip_range_end`를 변환해야 합니다.

각 범위의 CIDR은 다음 쿼리로 간단히 계산할 수 있습니다:

```sql
WITH
        bitXor(ip_range_start, ip_range_end) AS xor,
        if(xor != 0, ceil(log2(xor)), 0) AS unmatched,
        32 - unmatched AS cidr_suffix,
        toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) AS cidr_address
SELECT
        ip_range_start,
        ip_range_end,
        concat(toString(cidr_address),'/',toString(cidr_suffix)) AS cidr    
FROM
        geoip_url
LIMIT 4;

┌─ip_range_start─┬─ip_range_end─┬─cidr───────┐
│ 1.0.0.0        │ 1.0.0.255    │ 1.0.0.0/24 │
│ 1.0.1.0        │ 1.0.3.255    │ 1.0.0.0/22 │
│ 1.0.4.0        │ 1.0.7.255    │ 1.0.4.0/22 │
│ 1.0.8.0        │ 1.0.15.255   │ 1.0.8.0/21 │
└────────────────┴──────────────┴────────────┘

4 rows in set. Elapsed: 0.259 sec.
```

:::note
위 쿼리에는 많은 내용이 포함되어 있습니다. 관심이 있는 분들은 이 훌륭한 [설명](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)을 읽어보십시오. 그렇지 않으면 위 내용이 IP 범위에 대한 CIDR을 계산하는 것으로 받아들이십시오.
:::

우리의 목적에 맞춰, 우리는 IP 범위, 국가 코드 및 좌표만 필요하므로 새로운 테이블을 만들고 우리의 Geo IP 데이터를 삽입하겠습니다:

```sql
CREATE TABLE geoip
(
        `cidr` String,
        `latitude` Float64,
        `longitude` Float64,
        `country_code` String
)
ENGINE = MergeTree
ORDER BY cidr

INSERT INTO geoip
WITH
        bitXor(ip_range_start, ip_range_end) as xor,
        if(xor != 0, ceil(log2(xor)), 0) as unmatched,
        32 - unmatched as cidr_suffix,
        toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) as cidr_address
SELECT
        concat(toString(cidr_address),'/',toString(cidr_suffix)) as cidr,
        latitude,
        longitude,
        country_code    
FROM geoip_url
```

ClickHouse에서 저지연 IP 조회를 수행하기 위해, 메모리 내 속성 매핑을 위해 딕셔너리를 사용하여 우리의 Geo IP 데이터를 저장할 것입니다. ClickHouse는 우리는 네트워크 접두사(CIDR 블록)를 좌표 및 국가 코드에 매핑하기 위해 `ip_trie` [딕셔너리 구조](/sql-reference/dictionaries#ip_trie)를 제공합니다. 다음 쿼리는 이 레이아웃과 위의 테이블을 소스로 사용하는 딕셔너리를 지정합니다.

```sql
CREATE DICTIONARY ip_trie (
   cidr String,
   latitude Float64,
   longitude Float64,
   country_code String
)
primary key cidr
source(clickhouse(table 'geoip'))
layout(ip_trie)
lifetime(3600);
```

딕셔너리에서 행을 선택하고 이 데이터 세트가 조회에 사용 가능함을 확인할 수 있습니다:

```sql
SELECT * FROM ip_trie LIMIT 3

┌─cidr───────┬─latitude─┬─longitude─┬─country_code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

3 rows in set. Elapsed: 4.662 sec.
```

:::note 정기적 갱신
ClickHouse의 딕셔너리는 기본 테이블 데이터 및 위에서 사용된 수명 절에 따라 주기적으로 갱신됩니다. DB-IP 데이터 세트의 최신 변경 사항을 반영하기 위해 우리의 Geo IP 딕셔너리를 업데이트하려면, geoip_url 원격 테이블에서 우리의 `geoip` 테이블로 데이터를 변환하여 다시 삽입해야 합니다.
:::

이제 우리 `ip_trie` 딕셔너리(편리하게도 `ip_trie`라고도 불림)에 Geo IP 데이터가 로드되었으므로, 이를 사용하여 IP 지리 위치를 수행할 수 있습니다. 이는 다음과 같이 [`dictGet()` 함수](/sql-reference/functions/ext-dict-functions)를 사용하여 수행할 수 있습니다:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

여기에서 조회 속도를 주목하십시오. 이는 로그를 보강할 수 있도록 합니다. 이 경우 쿼리 시간 보강을 **수행하기로 선택합니다.**

원래 로그 데이터 세트로 돌아가면, 우리는 이를 사용하여 국가별로 로그를 집계할 수 있습니다. 다음 쿼리는 이전에 물리화된 뷰에서 생성된 스키마를 사용한다고 가정합니다. 여기에는 추출된 `RemoteAddress` 컬럼이 포함되어 있습니다.

```sql
SELECT dictGet('ip_trie', 'country_code', tuple(RemoteAddress)) AS country,
        formatReadableQuantity(count()) AS num_requests
FROM default.otel_logs_v2
WHERE country != ''
GROUP BY country
ORDER BY count() DESC
LIMIT 5

┌─country─┬─num_requests────┐
│ IR      │ 7.36 million    │
│ US      │ 1.67 million    │
│ AE      │ 526.74 thousand │
│ DE      │ 159.35 thousand │
│ FR      │ 109.82 thousand │
└─────────┴─────────────────┘

5 rows in set. Elapsed: 0.140 sec. Processed 20.73 million rows, 82.92 MB (147.79 million rows/s., 591.16 MB/s.)
Peak memory usage: 1.16 MiB.
```

IP와 지리적 위치 매핑은 변경될 수 있으므로, 사용자는 요청이 이루어진 당시 요청이 어디에서 발생했는지를 알고 싶어할 가능성이 높습니다 - 동일한 주소의 현재 지리적 위치가 아니라. 이러한 이유로 인덱스 시간 보강이 선호될 수 있습니다. 이는 아래와 같이 물리화된 컬럼 또는 물리화된 뷰의 선택 내에서 수행될 수 있습니다:

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        `Country` String MATERIALIZED dictGet('ip_trie', 'country_code', tuple(RemoteAddress)),
        `Latitude` Float32 MATERIALIZED dictGet('ip_trie', 'latitude', tuple(RemoteAddress)),
        `Longitude` Float32 MATERIALIZED dictGet('ip_trie', 'longitude', tuple(RemoteAddress))
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

:::note 주기적으로 업데이트
사용자는 새로운 데이터를 기반으로 IP 보강 딕셔너리가 주기적으로 업데이트되기를 원할 가능성이 높습니다. 이는 딕셔너리의 `LIFETIME` 절을 사용하여 달성할 수 있으며, 이를 통해 딕셔너리는 기본 테이블에서 주기적으로 다시 로드됩니다. 기본 테이블 업데이트에 대한 내용은 ["Refreshable Materialized Views"](/materialized-view/refreshable-materialized-view)를 참조하십시오.
:::

위의 국가 및 좌표는 국가별로 그룹화하고 필터링 하는 것 이상의 시각화 기능을 제공합니다. 영감을 얻으려면 ["지리 데이터 시각화"](/observability/grafana#visualizing-geo-data)를 참조하십시오.
### 정규 표현식 딕셔너리 사용하기 (사용자 에이전트 파싱) {#using-regex-dictionaries-user-agent-parsing}

[사용자 에이전트 문자열](https://en.wikipedia.org/wiki/User_agent)을 파싱하는 것은 정규 표현식 문제에 대한 고전적인 예이며, 로그 및 추적 기반 데이터 세트에서 일반적인 요구 사항입니다. ClickHouse는 정규 표현식 트리 딕셔너리를 사용하여 사용자 에이전트를 효율적으로 파싱합니다.

정규 표현식 트리 딕셔너리는 ClickHouse 오픈 소스에서 YAMLRegExpTree 딕셔너리 소스 유형을 사용하여 정의되어 있으며, 정규 표현식 트리를 포함하는 YAML 파일의 경로를 제공합니다. 자신의 정규 표현식 딕셔너리를 제공하려는 경우, 필요한 구조에 대한 세부 정보는 [여기](https://sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)에서 찾을 수 있습니다. 아래에서는 사용자 에이전트 파싱을 위해 [uap-core](https://github.com/ua-parser/uap-core)를 사용하고 지원되는 CSV 형식으로 우리의 딕셔너리를 로드합니다. 이 접근 방식은 OSS 및 ClickHouse Cloud에 호환됩니다.

:::note
아래 예제에서는 2024년 6월 사용자 에이전트 파싱을 위해 uap-core 정규 표현식을 최근의 스냅샷을 사용합니다. 최신 파일은 가끔씩 업데이트되며 [여기](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)에서 확인할 수 있습니다. 사용자는 [여기](https://sql-reference/dictionaries#collecting-attribute-values)에서 아래에서 사용한 CSV 파일을 로드하는 방법을 따라갈 수 있습니다.
:::

다음의 메모리 테이블을 생성합니다. 이들은 장치, 브라우저 및 운영 체제를 파싱하는 정규 표현식을 보유합니다.

```sql
CREATE TABLE regexp_os
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;

CREATE TABLE regexp_browser
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;

CREATE TABLE regexp_device
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;
```

이러한 테이블은 다음의 공개적으로 호스팅된 CSV 파일에서 로드할 수 있으며, URL 테이블 함수를 사용하여 채울 수 있습니다:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

메모리 테이블이 채워지면 정규 표현식 딕셔너리를 로드할 수 있습니다. 주의할 점은, 우리는 키 값을 컬럼으로 지정해야 하며, 이들은 사용자 에이전트에서 추출할 수 있는 속성이 됩니다.

```sql
CREATE DICTIONARY regexp_os_dict
(
        regexp String,
        os_replacement String default 'Other',
        os_v1_replacement String default '0',
        os_v2_replacement String default '0',
        os_v3_replacement String default '0',
        os_v4_replacement String default '0'
)
PRIMARY KEY regexp
SOURCE(CLICKHOUSE(TABLE 'regexp_os'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(REGEXP_TREE);

CREATE DICTIONARY regexp_device_dict
(
        regexp String,
        device_replacement String default 'Other',
        brand_replacement String,
        model_replacement String
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_device'))
LIFETIME(0)
LAYOUT(regexp_tree);

CREATE DICTIONARY regexp_browser_dict
(
        regexp String,
        family_replacement String default 'Other',
        v1_replacement String default '0',
        v2_replacement String default '0'
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_browser'))
LIFETIME(0)
LAYOUT(regexp_tree);
```

이 딕셔너리가 로드되면 샘플 사용자 에이전트를 제공하고 우리의 새로운 딕셔너리 추출 기능을 테스트할 수 있습니다:

```sql
WITH 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0' AS user_agent
SELECT
        dictGet('regexp_device_dict', ('device_replacement', 'brand_replacement', 'model_replacement'), user_agent) AS device,
        dictGet('regexp_browser_dict', ('family_replacement', 'v1_replacement', 'v2_replacement'), user_agent) AS browser,
        dictGet('regexp_os_dict', ('os_replacement', 'os_v1_replacement', 'os_v2_replacement', 'os_v3_replacement'), user_agent) AS os

┌─device────────────────┬─browser───────────────┬─os─────────────────────────┐
│ ('Mac','Apple','Mac') │ ('Firefox','127','0') │ ('Mac OS X','10','15','0') │
└───────────────────────┴───────────────────────┴────────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

사용자 에이전트 규칙은 거의 변하지 않기 때문에, 딕셔너리는 새로운 브라우저, 운영 체제 및 장치에 대해 업데이트할 수 있습니다. 이런 이유로 우리가 이 추출을 삽입 시간에 수행하는 것이 합리적입니다.

우리는 물리화된 컬럼 또는 물리화된 뷰를 사용하여 이 작업을 수행할 수 있습니다. 아래에서는 이전에 사용된 물리화된 뷰를 수정합니다:

```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2
AS SELECT
        Body,
        CAST(Timestamp, 'DateTime') AS Timestamp,
        ServiceName,
        LogAttributes['status'] AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(CAST(Status, 'UInt64') > 500, 'CRITICAL', CAST(Status, 'UInt64') > 400, 'ERROR', CAST(Status, 'UInt64') > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(CAST(Status, 'UInt64') > 500, 20, CAST(Status, 'UInt64') > 400, 17, CAST(Status, 'UInt64') > 300, 13, 9) AS SeverityNumber,
        dictGet('regexp_device_dict', ('device_replacement', 'brand_replacement', 'model_replacement'), UserAgent) AS Device,
        dictGet('regexp_browser_dict', ('family_replacement', 'v1_replacement', 'v2_replacement'), UserAgent) AS Browser,
        dictGet('regexp_os_dict', ('os_replacement', 'os_v1_replacement', 'os_v2_replacement', 'os_v3_replacement'), UserAgent) AS Os
FROM otel_logs
```

각 및 매개변수에서 `otel_logs_v2`에 대한 대상 테이블의 스키마를 수정해야 합니다:

```sql
CREATE TABLE default.otel_logs_v2
(
 `Body` String,
 `Timestamp` DateTime,
 `ServiceName` LowCardinality(String),
 `Status` UInt8,
 `RequestProtocol` LowCardinality(String),
 `RunTime` UInt32,
 `Size` UInt32,
 `UserAgent` String,
 `Referer` String,
 `RemoteUser` String,
 `RequestType` LowCardinality(String),
 `RequestPath` String,
 `remote_addr` IPv4,
 `RefererDomain` String,
 `RequestPage` String,
 `SeverityText` LowCardinality(String),
 `SeverityNumber` UInt8,
 `Device` Tuple(device_replacement LowCardinality(String), brand_replacement LowCardinality(String), model_replacement LowCardinality(String)),
 `Browser` Tuple(family_replacement LowCardinality(String), v1_replacement LowCardinality(String), v2_replacement LowCardinality(String)),
 `Os` Tuple(os_replacement LowCardinality(String), os_v1_replacement LowCardinality(String), os_v2_replacement LowCardinality(String), os_v3_replacement LowCardinality(String))
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp, Status)
```

수집기를 다시 시작하고 구조화된 로그를 삽입한 후 이전에 문서화된 단계를 바탕으로, 우리는 새로 추출된 Device, Browser 및 Os 컬럼을 쿼리할 수 있습니다.

```sql
SELECT Device, Browser, Os
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Device:  ('Spider','Spider','Desktop')
Browser: ('AhrefsBot','6','1')
Os:     ('Other','0','0','0')
```

:::note 복잡한 구조의 튜플
이 사용자 에이전트 컬럼에 튜플을 사용하는 것에 주목하십시오. 튜플은 계층 구조가 사전에 알려져 있을 때 복잡한 구조에 대해 권장됩니다. 서브 컬럼은 일반 컬럼(맵 키와 달리)과 동일한 성능을 제공하면서 이종 타입을 허용합니다.
:::
### 추가 읽기 {#further-reading}

딕셔너리에 대한 더 많은 예제와 세부정보를 원하시면 다음 기사를 추천합니다:

- [고급 딕셔너리 주제](/dictionary#advanced-dictionary-topics)
- ["딕셔너리를 사용하여 쿼리 가속화하기"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [딕셔너리](/sql-reference/dictionaries)
## 쿼리 가속화 {#accelerating-queries}

ClickHouse는 쿼리 성능을 가속화하기 위한 여러 가지 기술을 지원합니다. 다음 사항은 가장 인기 있는 접근 패턴에 맞게 기본/정렬 키를 선택하고 압축을 극대화 한 후에만 고려해야 합니다. 이는 일반적으로 최소한의 노력으로 성능에 가장 큰 영향을 미칩니다.
### 집계를 위한 물리화된 뷰(증분) 사용 {#using-materialized-views-incremental-for-aggregations}

앞선 섹션에서는 데이터 변환 및 필터링을 위한 물리화된 뷰의 사용을 살펴보았습니다. 그러나 물리화된 뷰는 삽입 시점에 집계를 미리 계산하고 결과를 저장하는 데에도 사용할 수 있습니다. 이 결과는 이후 삽입의 결과로 업데이트될 수 있어, 사실상 집계를 삽입 시점에 미리 계산할 수 있게 합니다.

여기서의 주요 아이디어는 결과가 원래 데이터의 작은 표현(집계의 경우 부분 스케치)일 경우가 많다는 것입니다. 이 결과를 목표 테이블에서 읽기 위한 더 간단한 쿼리와 결합할 경우, 동일한 계산을 원래 데이터에서 수행한 것보다 쿼리 시간이 더 빠르게 됩니다.

다음 쿼리를 고려해 보십시오. 여기서 우리는 구조화된 로그를 사용하여 시간당 총 트래픽을 계산합니다:

```sql
SELECT toStartOfHour(Timestamp) AS Hour,
        sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.666 sec. Processed 10.37 million rows, 4.73 GB (15.56 million rows/s., 7.10 GB/s.)
Peak memory usage: 1.40 MiB.
```

이것은 사용자가 Grafana로 그릴 수 있는 일반적인 선 차트일 것이라고 상상할 수 있습니다. 이 쿼리는 확실히 매우 빠릅니다 - 데이터셋은 단지 1000만 행이며, ClickHouse는 빠릅니다! 그러나 이것을 수십억 또는 수조 개의 행으로 확장하면, 우리는 이상적으로 이러한 쿼리 성능을 유지하고 싶습니다.

:::note
이 쿼리는 `otel_logs_v2` 테이블을 사용하면 10배 더 빨라집니다. 이 테이블은 이전 물리화된 뷰에서 만들어진 것으로 `LogAttributes` 맵에서 크기 키를 추출한 결과입니다. 여기서는 설명을 위해 원시 데이터를 사용하며, 이 쿼리가 일반적인 경우에는 이전 뷰를 사용하는 것이 좋습니다.
:::

물리화된 뷰를 사용하여 삽입 시점에 이 데이터를 계산하려면 결과를 받을 테이블이 필요합니다. 이 테이블은 시간당 1행만 유지해야 합니다. 기존 시간에 대한 업데이트가 수신되면, 다른 컬럼이 기존 시간의 행에 병합되어야 합니다. 이러한 증분 상태의 병합이 발생하려면 다른 컬럼의 부분 상태를 저장해야 합니다.

이는 ClickHouse에서 특수한 엔진 유형인 SummingMergeTree가 필요합니다. 이는 동일한 정렬 키를 가진 모든 행을 하나의 행으로 교체하며, 이 행은 숫자형 컬럼의 합산 값을 포함합니다. 다음 테이블은 동일한 날짜의 모든 행을 병합하고 숫자형 컬럼을 합산합니다.

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

물리화된 뷰를 시연하기 위해, 우리의 `bytes_per_hour` 테이블이 비어 있으며 아직 데이터를 수신하지 않은 상태라고 가정합니다. 우리의 물리화된 뷰는 데이터가 `otel_logs`에 삽입될 때 위의 `SELECT`를 수행하며(이 작업은 구성된 크기의 블록에 대해 수행됩니다), 결과는 `bytes_per_hour`로 전송됩니다. 구문은 다음과 같습니다:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

여기서 `TO` 절은 결과가 전송될 위치를 나타냅니다 즉, `bytes_per_hour`.

우리 OTel 수집기를 재시작하고 로그를 다시 전송하면, `bytes_per_hour` 테이블은 위 쿼리 결과로 점진적으로 채워집니다. 완료 후에는 `bytes_per_hour`의 크기를 확인할 수 있습니다 - 시간당 1행을 가져야 합니다:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

우리는 쿼리 결과를 저장함으로써 여기에 있는 행의 수를 1000만( `otel_logs`)에서 113으로 효과적으로 줄였습니다. 여기서의 핵심은 새 로그가 `otel_logs` 테이블에 삽입될 경우, 해당 시간의 `bytes_per_hour`로 새 값이 전송되고, 여기서 자동으로 백그라운드에서 비동기적으로 병합됩니다 - 시간당 1행만 유지됨으로써 `bytes_per_hour`는 항상 작고 최신 상태를 유지합니다.

행의 병합이 비동기적이기 때문에 사용자가 쿼리할 때 시간당 1개 이상의 행이 존재할 수 있습니다. 쿼리 시 미처리된 모든 행이 병합되도록 하려면 두 가지 옵션이 있습니다:

- 테이블 이름에 [`FINAL` 수정자](/sql-reference/statements/select/from#final-modifier)를 사용합니다(위 카운트 쿼리에서 한 것처럼).
- 최종 테이블에서 사용된 정렬 키인 타임스탬프별로 집계하고 메트릭을 합산합니다.

일반적으로 두 번째 옵션이 더 효율적이고 유연합니다(테이블은 다른 용도로도 사용될 수 있음), 첫 번째는 일부 쿼리에 대해 더 간단할 수 있습니다. 우리는 둘 다 아래에 보여줍니다:

```sql
SELECT
        Hour,
        sum(TotalBytes) AS TotalBytes
FROM bytes_per_hour
GROUP BY Hour
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.008 sec.

SELECT
        Hour,
        TotalBytes
FROM bytes_per_hour
FINAL
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.005 sec.
```

이로 인해 우리의 쿼리는 0.6초에서 0.008초로 빨라졌습니다 - 75배 이상 빨라졌습니다!

:::note
이러한 절감 효과는 더 큰 데이터 세트에서 더 복잡한 쿼리에서 훨씬 더 클 수 있습니다. [여기에서](https://github.com/ClickHouse/clickpy) 예제를 참고하세요.
:::
#### 더 복잡한 예제 {#a-more-complex-example}

위의 예제는 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)를 사용하여 시간당 간단한 집계를 합니다. 단순합을 넘어서는 통계를 위해서는 다른 대상 테이블 엔진인 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)가 필요합니다.

예를 들어, 우리는 하루에 고유한 IP 주소(또는 고유 사용자) 수를 계산하고 싶습니다. 이 쿼리는 다음과 같습니다:

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │     4763    │
│ 2019-01-22 00:00:00 │     536     │
└─────────────────────┴─────────────┘

113 rows in set. Elapsed: 0.667 sec. Processed 10.37 million rows, 4.73 GB (15.53 million rows/s., 7.09 GB/s.)
```

증분 업데이트를 위한 기수 카운트를 지속하기 위해 AggregatingMergeTree가 필요합니다.

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

ClickHouse가 집계 상태가 저장될 것임을 알도록 하기 위해, `UniqueUsers` 컬럼을 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 유형으로 정의하며, 부분 상태의 함수 소스(uniq)와 소스 컬럼의 타입(IPv4)을 명시합니다. SummingMergeTree와 마찬가지로, 동일한 `ORDER BY` 키 값이 있는 행은 병합됩니다(위 예에서는 Hour).

연관된 물리화된 뷰는 이전 쿼리를 사용합니다:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

우리의 집계 함수 끝에 접미사 `State`를 추가하는 것에 유의하십시오. 이는 함수의 집계 상태가 최종 결과 대신 반환되도록 보장합니다. 이 상태는 다른 상태와 병합할 수 있도록 추가 정보를 포함합니다.

데이터가 Collector 재시작을 통해 재로딩된 후, 우리는 `unique_visitors_per_hour` 테이블에 113개의 행이 있는지 확인할 수 있습니다.

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

우리의 최종 쿼리는 함수에 대한 Merge 접미사를 사용해야 합니다(컬럼이 부분 집계 상태를 저장하므로):

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │      4763   │
│ 2019-01-22 00:00:00 │      536    │
└─────────────────────┴─────────────┘

113 rows in set. Elapsed: 0.027 sec.
```

여기서는 `FINAL` 대신 `GROUP BY`를 사용합니다.
### 빠른 조회를 위한 물리화된 뷰(증분) 사용 {#using-materialized-views-incremental--for-fast-lookups}

사용자는 ClickHouse 정렬 키 선택 시 필터 및 집계 절에서 자주 사용되는 컬럼을 고려해야 합니다. 이는 사용자가 더 다양한 접근 패턴을 가지고 있는 가시성 경우에서는 제한적일 수 있습니다. 이는 기본 OTel 스키마로 구축된 예제로 가장 잘 설명됩니다. 추적에 대한 기본 스키마를 고려해 보십시오:

```sql
CREATE TABLE otel_traces
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `ParentSpanId` String CODEC(ZSTD(1)),
        `TraceState` String CODEC(ZSTD(1)),
        `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
        `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `Duration` Int64 CODEC(ZSTD(1)),
        `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
        `StatusMessage` String CODEC(ZSTD(1)),
        `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
        `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
        `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        `Links.TraceId` Array(String) CODEC(ZSTD(1)),
        `Links.SpanId` Array(String) CODEC(ZSTD(1)),
        `Links.TraceState` Array(String) CODEC(ZSTD(1)),
        `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
        INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
```

이 스키마는 `ServiceName`, `SpanName` 및 `Timestamp`로 필터링하는 데 최적화되어 있습니다. 추적에서는 사용자가 특정 `TraceId`로 조회하고 관련된 추적의 스팬을 검색할 수 있는 능력이 필요합니다. 이 정보는 정렬 키에 포함되지만, 마지막에 위치하면 [필터링이 효율적이지 않을 수 있습니다](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently) 따라서 단일 추적을 검색할 때 많은 양의 데이터가 스캔되어야 할 가능성이 높습니다.

OTel 수집기는 이러한 문제를 해결하기 위해 물리화된 뷰와 관련 테이블도 설치합니다. 테이블과 뷰는 다음과 같습니다:

```sql
CREATE TABLE otel_traces_trace_id_ts
(
        `TraceId` String CODEC(ZSTD(1)),
        `Start` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `End` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.01) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY (TraceId, toUnixTimestamp(Start))

CREATE MATERIALIZED VIEW otel_traces_trace_id_ts_mv TO otel_traces_trace_id_ts
(
        `TraceId` String,
        `Start` DateTime64(9),
        `End` DateTime64(9)
)
AS SELECT
        TraceId,
        min(Timestamp) AS Start,
        max(Timestamp) AS End
FROM otel_traces
WHERE TraceId != ''
GROUP BY TraceId
```

이 뷰는 `otel_traces_trace_id_ts` 테이블이 추적에 대한 최소 및 최대 타임스탬프를 가지도록 보장합니다. 이 테이블은 `TraceId`로 정렬되어 있어 이러한 타임스탬프를 효율적으로 검색할 수 있습니다. 이러한 타임스탬프 범위는 대략적으로 메인 `otel_traces` 테이블을 쿼리할 때 사용할 수 있습니다. 더 구체적으로는, Grafana가 해당 ID로 추적을 검색할 때 다음 쿼리를 사용합니다:

```sql
WITH 'ae9226c78d1d360601e6383928e4d22d' AS trace_id,
        (
        SELECT min(Start)
          FROM default.otel_traces_trace_id_ts
          WHERE TraceId = trace_id
        ) AS trace_start,
        (
        SELECT max(End) + 1
          FROM default.otel_traces_trace_id_ts
          WHERE TraceId = trace_id
        ) AS trace_end
SELECT
        TraceId AS traceID,
        SpanId AS spanID,
        ParentSpanId AS parentSpanID,
        ServiceName AS serviceName,
        SpanName AS operationName,
        Timestamp AS startTime,
        Duration * 0.000001 AS duration,
        arrayMap(key -> map('key', key, 'value', SpanAttributes[key]), mapKeys(SpanAttributes)) AS tags,
        arrayMap(key -> map('key', key, 'value', ResourceAttributes[key]), mapKeys(ResourceAttributes)) AS serviceTags
FROM otel_traces
WHERE (traceID = trace_id) AND (startTime >= trace_start) AND (startTime <= trace_end)
LIMIT 1000
```

여기서 CTE는 추적 ID `ae9226c78d1d360601e6383928e4d22d`에 대한 최소 및 최대 타임스탬프를 식별한 다음, 이를 사용하여 메인 `otel_traces`에서 관련 스팬을 필터링합니다.

유사한 접근 패턴에 대해서도 동일한 접근 방식을 적용할 수 있습니다. 우리는 [여기](/materialized-view/incremental-materialized-view#lookup-table) 데이터 모델링에서 유사한 예를 탐구합니다.
### 프로젝션 사용 {#using-projections}

ClickHouse 프로젝션을 사용하면 사용자가 테이블에 대해 여러 개의 `ORDER BY` 절을 지정할 수 있습니다.

이전 섹션에서는 물리화된 뷰를 사용하여 ClickHouse에서 집계를 미리 계산하고, 행을 변환하며, 다양한 접근 패턴에 대한 가시성 쿼리를 최적화하는 방법을 살펴보았습니다.

우리는 물리화된 뷰가 원래 테이블과 서로 다른 정렬 키를 가진 목표 테이블로 행을 전송하여 추적 ID에 의해 조회를 최적화하는 예제를 제시했습니다.

프로젝션은 사용자에게 기본 키의 일부가 아닌 컬럼에 대한 쿼리를 최적화할 수 있는 기회를 제공합니다.

이론적으로 이 기능은 테이블에 대해 여러 개의 정렬 키를 제공하는 데 사용될 수 있지만, 하나의 별내 단점이 있습니다: 데이터 중복입니다. 구체적으로, 데이터는 각 프로젝션에 대한 순서 외에도 기본 기본 키의 순서로 기록되어야 합니다. 이는 삽입 속도를 늦추고 더 많은 디스크 공간을 소비하게 됩니다.

:::note 프로젝션 vs 물리화된 뷰
프로젝션은 물리화된 뷰와 유사한 많은 기능을 제공하지만, 물리화된 뷰가 더 선호되며 제한적으로 사용해야 합니다. 사용자는 단점과 언제 적절한지 이해해야 합니다. 예를 들어, 프로젝션은 집계를 미리 계산하는 데 사용할 수 있지만, 이러한 목적을 위해 물리화된 뷰를 사용할 것을 권장합니다.
:::

<Image img={observability_13} alt="Observability and projections" size="md"/>

다음 쿼리를 고려해 보십시오. 이 쿼리는 `otel_logs_v2` 테이블에서 500 오류 코드를 필터링합니다. 이는 오류 코드로 필터링하려는 사용자의 일반적인 접근 패턴일 것입니다:

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 rows in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 685.32 MB (58.66 million rows/s., 3.88 GB/s.)
Peak memory usage: 56.54 MiB.
```

:::note 성능을 측정하기 위해 Null 사용
여기서 결과를 `FORMAT Null`을 사용하여 출력하지 않습니다. 이는 모든 결과를 읽되 반환하지 않도록 강제하여, LIMIT로 인해 쿼리가 조기 종료되는 것을 방지합니다. 이는 1000만 행을 모두 스캔하는 데 걸리는 시간을 보여주기 위한 것입니다.
:::

위의 쿼리는 우리가 선택한 정렬 키 `(ServiceName, Timestamp)`에 대해 선형 스캔을 요구합니다. 우리는 위 쿼리의 성능을 향상시키기 위해 정렬 키의 끝에 `Status`를 추가할 수 있지만, 프로젝션을 추가할 수 있습니다.

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

여기서는 먼저 프로젝션을 생성한 다음 물리화해야 합니다. 후자는 데이터를 두 개의 서로 다른 순서로 디스크에 두 번 저장하게 만듭니다. 데이터가 생성될 때 아래에 보여준 것처럼 프로젝션을 정의할 수도 있으며, 데이터가 삽입되면서 자동으로 유지됩니다.

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        PROJECTION status
        (
           SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
           ORDER BY Status
        )
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

중요한 점은 프로젝션이 `ALTER`를 통해 생성되면 `MATERIALIZE PROJECTION` 명령이 발행될 때 그 생성이 비동기라는 것입니다. 사용자는 다음 쿼리로 이 작업의 진행 상황을 확인할 수 있으며, `is_done=1`을 기다립니다.

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

위 쿼리를 반복하면 성능이 추가 저장 공간 비용을 치르고도 상당히 향상되었음을 확인할 수 있습니다(이를 측정하는 방법은 ["테이블 크기 및 압축 측정"](#measuring-table-size--compression)에서 확인하세요).

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

위의 예제에서는 프로젝션에서 이전 쿼리에서 사용된 컬럼을 지정합니다. 이는 지정된 컬럼만 프로젝션의 일환으로 디스크에 저장되고 `Status`에 따라 정렬됨을 의미합니다. 만약 대신 here에 `SELECT *`를 사용한다면, 모든 컬럼이 저장됩니다. 이 경우 더 많은 쿼리(컬럼의 어떤 부분 집합을 사용하더라도)에서 프로젝션의 이점을 누릴 수 있지만, 추가 저장 공간이 발생합니다. 디스크 공간 및 압축을 측정하는 방법은 ["테이블 크기 및 압축 측정"](#measuring-table-size--compression)에서 확인하세요.
### 두 번째/데이터 스킵 인덱스 {#secondarydata-skipping-indices}

ClickHouse에서 기본 키가 얼마나 잘 조정되었는지에 관계없이, 일부 쿼리는 불가피하게 전체 테이블 스캔이 필요합니다. 물리화된 뷰를 사용하거나(일부 쿼리를 위한 프로젝션) 이를 완화할 수 있지만, 이러한 뷰들은 추가적인 유지 관리와 사용자가 이를 활용할 수 있도록 인식해야 할 필요가 있습니다. 전통적인 관계형 데이터베이스에서는 이를 보조 인덱스로 해결하지만, 이는 ClickHouse와 같은 열 지향 데이터베이스에서는 효과적이지 않습니다. 대신, ClickHouse는 "스킵" 인덱스를 사용하여 데이터베이스가 매칭되는 값이 없는 대량 데이터 청크를 건너뛰도록 하여 쿼리 성능을 크게 향상시킬 수 있습니다.

기본 OTel 스키마는 맵 접근을 가속화하기 위해 보조 인덱스를 사용합니다. 그러나 우리는 일반적으로 이러한 인덱스가 효과적이지 않음을 발견했으며, 사용자 정의 스키마에 복사하는 것을 권장하지 않습니다. 그러나 스킵 인덱스는 여전히 유용할 수 있습니다.

사용자는 보조 인덱스에 대한 [가이드를 읽고 이해해야](/optimize/skipping-indexes) 적용하기 전에 시도해야 합니다.

**일반적으로, 이는 기본 키와 타겟 비기본 컬럼/표현 간에 강한 상관관계가 있을 때 효과적이며, 사용자는 희귀 값(즉, 많은 그란울에서 발생하지 않는 값)을 조회할 수 있습니다.**
### 텍스트 검색을 위한 블룸 필터 {#bloom-filters-for-text-search}

가시성 쿼리의 경우, 보조 인덱스는 사용자가 텍스트 검색을 수행해야 할 때 유용할 수 있습니다. 특히, n그램 및 토큰 기반 블룸 필터 인덱스 [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) 및 [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types)은 `LIKE`, `IN` 및 hasToken 연산자로 문자열 컬럼을 검색하는 속도를 높이는 데 사용할 수 있습니다. 중요한 점은 토큰 기반 인덱스가 비알파벳 문자를 구분자로 사용하여 토큰을 생성한다는 것입니다. 이는 쿼리 시점에 토큰(또는 전체 단어)만 매칭될 수 있다는 것을 의미합니다. 더 세밀한 매칭을 위해서는 [N-그램 블룸 필터](/optimize/skipping-indexes#bloom-filter-types)를 사용할 수 있습니다. 이는 문자열을 특정 크기의 n그램으로 나누어 단어의 일부도 매칭할 수 있습니다.

생산될 토큰을 평가하고 따라서 매칭할 수 있도록 하기 위해서는 `tokens` 함수를 사용할 수 있습니다:

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 함수는 유사한 기능을 제공하며, 두 번째 매개변수로 ngram 크기를 지정할 수 있습니다:

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 역방향 인덱스
ClickHouse는 또한 보조 인덱스로서 역방향 인덱스에 대한 실험적 지원을 제공합니다. 우리는 현재 이를 로깅 데이터 세트에 대해 권장하지 않지만, 이들이 생산 준비가 완료되면 토큰 기반 블룸 필터를 대체할 것이라고 예상합니다.
:::

이 예제의 목적을 위해 우리는 구조화된 로그 데이터 세트를 사용합니다. `Referer` 컬럼에 `ultra`가 포함된 로그를 세고자 합니다.

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

여기서 우리는 n그램 크기 3으로 매칭해야 합니다. 따라서 `ngrambf_v1` 인덱스를 생성합니다.

```sql
CREATE TABLE otel_logs_bloom
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        INDEX idx_span_attr_value Referer TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY (Timestamp)
```

인덱스 `ngrambf_v1(3, 10000, 3, 7)`은 여기서 네 개의 매개변수를 사용합니다. 마지막 매개변수(값 7)는 시드를 나타냅니다. 나머지는 n그램 크기(3), 값 `m`(필터 크기), 및 해시 함수 수 `k`(7)를 나타냅니다. `k`와 `m`은 조정이 필요하며, 이는 고유한 n그램/토큰의 수와 필터가 참 음성을 나타낼 확률에 기반합니다 - 따라서 값이 그란울에 존재하지 않음을 확인합니다. 이러한 값을 설정하는 데 유용한 [이 함수들](/engines/table-engines/mergetree-family/mergetree#bloom-filter)을 추천합니다.

올바르게 조정되면 여기에 상당한 속도 향상이 있을 수 있습니다:

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│   182   │
└─────────┘

1 row in set. Elapsed: 0.077 sec. Processed 4.22 million rows, 375.29 MB (54.81 million rows/s., 4.87 GB/s.)
Peak memory usage: 129.60 KiB.
```

:::note 예제일 뿐
위 내용은 설명을 위한 것입니다. 우리는 사용자가 텍스트 검색을 최적화하기 위해 토큰 기반 블룸 필터를 사용하기보다 삽입 시점에 로그에서 구조를 추출하는 것을 권장합니다. 그러나 사용자가 스택 트레이스나 덜 결정적인 구조 때문에 유용한 경우가 있는 큰 문자열을 다룰 때 텍스트 검색이 유용할 수 있습니다.
:::

블룸 필터 사용에 관한 몇 가지 일반 지침:

블룸의 목표는 [그란울](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)을 필터링하여 컬럼의 모든 값을 로드하고 선형 스캔을 수행할 필요를 피하는 것입니다. `EXPLAIN` 절을 사용하여 `indexes=1` 매개변수와 함께 건너뛴 그란울 수를 식별할 수 있습니다. 다음은 원본 테이블 `otel_logs_v2`와 n그램 블룸 필터가 있는 테이블 `otel_logs_bloom`에 대한 응답입니다.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│       Expression (Before GROUP BY)                                 │
│       Filter ((WHERE + Change column names to column identifiers)) │
│       ReadFromMergeTree (default.otel_logs_v2)                     │
│       Indexes:                                                     │
│               PrimaryKey                                           │
│               Condition: true                                      │
│               Parts: 9/9                                           │
│               Granules: 1278/1278                                  │
└────────────────────────────────────────────────────────────────────┘

10 rows in set. Elapsed: 0.016 sec.

EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│       Expression (Before GROUP BY)                                 │
│       Filter ((WHERE + Change column names to column identifiers)) │
│       ReadFromMergeTree (default.otel_logs_bloom)                  │
│       Indexes:                                                     │
│               PrimaryKey                                           │ 
│               Condition: true                                      │
│               Parts: 8/8                                           │
│               Granules: 1276/1276                                  │
│               Skip                                                 │
│               Name: idx_span_attr_value                            │
│               Description: ngrambf_v1 GRANULARITY 1                │
│               Parts: 8/8                                           │
│               Granules: 517/1276                                   │
└────────────────────────────────────────────────────────────────────┘
```

블룸 필터는 일반적으로 해당 컬럼보다 작을 경우에만 더 빠릅니다. 더 크면 성능 이점이 미미할 가능성이 큽니다. 다음 쿼리를 사용하여 필터와 컬럼의 크기를 비교하십시오:

```sql
SELECT
        name,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
        formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
        round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE (`table` = 'otel_logs_bloom') AND (name = 'Referer')
GROUP BY name
ORDER BY sum(data_compressed_bytes) DESC

┌─name────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ Referer │ 56.16 MiB       │ 789.21 MiB        │ 14.05 │
└─────────┴─────────────────┴───────────────────┴───────┘

1 row in set. Elapsed: 0.018 sec.

SELECT
        `table`,
        formatReadableSize(data_compressed_bytes) AS compressed_size,
        formatReadableSize(data_uncompressed_bytes) AS uncompressed_size
FROM system.data_skipping_indices
WHERE `table` = 'otel_logs_bloom'

┌─table───────────┬─compressed_size─┬─uncompressed_size─┐
│ otel_logs_bloom │ 12.03 MiB       │ 12.17 MiB         │
└─────────────────┴─────────────────┴───────────────────┘

1 row in set. Elapsed: 0.004 sec.
```

위의 예에서 보듯이 보조 블룸 필터 인덱스는 12MB로, 컬럼의 압축 크기인 56MB보다 거의 5배 작습니다.

블룸 필터는 상당한 조정이 필요할 수 있습니다. 우리는 [여기](/engines/table-engines/mergetree-family/mergetree#bloom-filter)에서 최적 설정을 확인하는 데 유용한 메모를 따르기를 권장합니다. 블룸 필터는 또한 삽입 및 병합 시 비용이 많이 들 수 있습니다. 사용자는 블룸 필터를 프로덕션에 추가하기 전에 삽입 성능에 미치는 영향을 평가해야 합니다.

두 번째 스킵 인덱스에 대한 추가 세부정보는 [여기](/optimize/skipping-indexes#skip-index-functions)에서 확인할 수 있습니다.
### 맵에서 추출하기 {#extracting-from-maps}

맵 유형은 OTel 스키마에서 널리 사용됩니다. 이 유형은 값과 키가 같은 유형이어야 하며, 이는 Kubernetes 레이블과 같은 메타데이터에 충분합니다. 맵 유형의 하위 키를 쿼리할 때 전체 부모 컬럼이 로드된다는 점에 유의하십시오. 맵에 많은 키가 있을 경우, 이는 키가 컬럼으로 존재할 때보다 디스크에서 읽어야 할 데이터가 더 많아 significativo한 쿼리 페널티를 초래할 수 있습니다.

특정 키를 자주 쿼리한다면, 이를 루트에 전용 컬럼으로 이동하는 것을 고려하십시오. 이는 일반적으로 배포 후 일반 접근 패턴에 대한 응답으로 발생하는 작업이며, 생산 이전에는 예측하기 어려울 수 있습니다. 배포 후 스키마를 수정하는 방법에 대해서는 ["스키마 변경 관리"](/observability/managing-data#managing-schema-changes)를 참조하세요.
## 테이블 크기 및 압축 측정 {#measuring-table-size--compression}

ClickHouse가 가시성에 사용되는 주요 이유 중 하나는 압축입니다.

저장 비용을 대폭 줄이며, 디스크上的 데이터가 적으면 IO도 적고 쿼리 및 삽입 속도가 빨라집니다. IO의 감소는 CPU와 관련하여 모든 압축 알고리즘의 오버헤드를 초과할 것입니다. 따라서 ClickHouse 쿼리가 빠르도록 보장하기 위해 데이터의 압축을 향상시키는 것이 첫 번째 초점이어야 합니다.

압축 측정에 대한 세부정보는 [여기](/data-compression/compression-in-clickhouse)에서 확인할 수 있습니다.
