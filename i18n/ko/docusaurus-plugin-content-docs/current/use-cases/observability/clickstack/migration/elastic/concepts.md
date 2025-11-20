---
'slug': '/use-cases/observability/clickstack/migration/elastic/concepts'
'title': 'ClickStack과 Elastic의 동등한 개념'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '동등한 개념'
'sidebar_position': 1
'description': '동등한 개념 - ClickStack과 Elastic'
'show_related_blogs': true
'keywords':
- 'Elasticsearch'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import elasticsearch from '@site/static/images/use-cases/observability/elasticsearch.png';
import clickhouse from '@site/static/images/use-cases/observability/clickhouse.png';
import clickhouse_execution from '@site/static/images/use-cases/observability/clickhouse-execution.png';
import elasticsearch_execution from '@site/static/images/use-cases/observability/elasticsearch-execution.png';
import elasticsearch_transforms from '@site/static/images/use-cases/observability/es-transforms.png';
import clickhouse_mvs from '@site/static/images/use-cases/observability/ch-mvs.png';

## Elastic Stack vs ClickStack {#elastic-vs-clickstack}

Elastic Stack과 ClickStack은 모두 관측 가능성 플랫폼의 핵심 역할을 다루고 있지만, 이러한 역할에 접근하는 방식은 설계 철학에서 다릅니다. 이러한 역할은 다음과 같습니다:

- **UI 및 경고**: 데이터를 쿼리하고 대시보드를 구축하며 경고를 관리하는 도구.
- **저장소 및 쿼리 엔진**: 관측 가능성 데이터를 저장하고 분석 쿼리를 제공하는 백엔드 시스템.
- **데이터 수집 및 ETL**: 원격 측정 데이터를 수집하고 수집 전에 처리하는 에이전트 및 파이프라인.

아래의 표는 각 스택이 이러한 역할에 자신의 구성 요소를 어떻게 매핑하는지를 설명합니다:

| **역할** | **Elastic Stack** | **ClickStack** | **비고** |
|--------------------------|--------------------------------------------------|--------------------------------------------------|--------------|
| **UI & 경고** | **Kibana** — 대시보드, 검색 및 경고      | **HyperDX** — 실시간 UI, 검색 및 경고   | 두 플랫폼 모두 사용자에 대한 기본 인터페이스 역할을 하며, 시각화 및 경고 관리 기능을 포함합니다. HyperDX는 관측 가능성을 위하여 목적에 맞게 설계되었으며 OpenTelemetry 의미론과 밀접하게 결합되어 있습니다. |
| **저장소 & 쿼리 엔진** | **Elasticsearch** — 역 인덱스가 있는 JSON 문서 저장소 | **ClickHouse** — 벡터화된 엔진을 가진 컬럼형 데이터베이스 | Elasticsearch는 검색을 최적화하기 위해 역 인덱스를 사용하며, ClickHouse는 구조화된 데이터와 반구조화된 데이터에 대한 고속 분석을 위해 컬럼형 저장소와 SQL을 사용합니다. |
| **데이터 수집** | **Elastic Agent**, **Beats** (예: Filebeat, Metricbeat) | **OpenTelemetry Collector** (엣지 + 게이트웨이)     | Elastic은 Fleet에서 관리하는 사용자 정의 배송자와 통합된 에이전트를 지원합니다. ClickStack은 OpenTelemetry에 의존하여 공급업체 중립적인 데이터 수집 및 처리를 가능하게 합니다. |
| **계측 SDK** | **Elastic APM agents** (독점)             | **OpenTelemetry SDKs** (ClickStack에서 배포) | Elastic SDK는 Elastic 스택에 결합되어 있습니다. ClickStack은 주요 언어에서 로그, 메트릭 및 추적에 대한 OpenTelemetry SDK를 기반으로 합니다. |
| **ETL / 데이터 처리** | **Logstash**, 수집 파이프라인                   | **OpenTelemetry Collector** + ClickHouse 물리화된 뷰 | Elastic은 변환을 위해 수집 파이프라인과 Logstash를 사용합니다. ClickStack은 물리화된 뷰와 OTel 수집기 프로세서를 통해 시점을 삽입 할 때 컴퓨팅을 전환하여 데이터를 효율적이고 점진적으로 변환합니다. |
| **설계 철학** | 수직으로 통합된 독점 에이전트 및 형식 | 개방형 표준 기반, 느슨하게 결합된 구성 요소   | Elastic은 밀접하게 통합된 생태계를 구축합니다. ClickStack은 유연성과 비용 효율성을 위해 모듈성과 표준(OpenTelemetry, SQL, 객체 저장소)을 강조합니다. |

ClickStack은 데이터 수집에서 UI에 이르기까지 완전히 OpenTelemetry 네이티브인 개방형 표준과 상호 운용성을 강조합니다. 반면 Elastic은 독점 에이전트와 형식으로 긴밀하게 결합된 생태계를 제공합니다.

**Elasticsearch**와 **ClickHouse**가 각 스택에서 데이터 저장, 처리 및 쿼리를 담당하는 핵심 엔진이라는 점을 감안할 때, 이들이 어떻게 다른지는 이해하는 것이 중요합니다. 이러한 시스템은 전체 관측 가능성 아키텍처의 성능, 확장성 및 유연성을 뒷받침합니다. 다음 섹션에서는 Elasticsearch와 ClickHouse 간의 주요 차이점을 탐색하며, 데이터 모델링, 수집 처리, 쿼리 실행 및 저장 관리를 포함합니다.

## Elasticsearch vs ClickHouse {#elasticsearch-vs-clickhouse}

ClickHouse와 Elasticsearch는 서로 다른 기본 모델을 사용하여 데이터를 조직하고 쿼리하지만, 많은 핵심 개념이 유사한 목적을 가지고 있습니다. 이 섹션은 Elastic에 익숙한 사용자를 위해 주요 동등성을 설명하며 ClickHouse 대응 연구를 매핑합니다. 용어는 다르지만 대부분의 관측 가능성 워크플로우는 ClickStack에서 재현할 수 있으며, 종종 더 효율적으로 수행될 수 있습니다.

### 핵심 구조 개념 {#core-structural-concepts}

| **Elasticsearch** | **ClickHouse / SQL** | **설명** |
|-------------------|----------------------|------------------|
| **필드** | **컬럼** | 특정 유형의 하나 이상의 값을 보유하는 데이터의 기본 단위. Elasticsearch 필드는 원시형뿐 아니라 배열과 객체를 저장할 수 있습니다. 필드는 하나의 유형만 가질 수 있습니다. ClickHouse 또한 배열 및 객체(`Tuples`, `Maps`, `Nested`)를 지원하며, 여러 유형을 가질 수 있는 동적 유형인 [`Variant`](/sql-reference/data-types/variant)와 [`Dynamic`](/sql-reference/data-types/dynamic)를 지원합니다. |
| **문서** | **행** | 필드(컬럼)의 모음. Elasticsearch 문서는 기본적으로 더 유연하며, 데이터에 따라 동적으로 새로운 필드가 추가됩니다(유형은 유추됩니다). ClickHouse 행은 기본적으로 스키마에 묶여 있어 사용자가 행의 모든 컬럼을 삽입하거나 부분 집합만 삽입해야 합니다. ClickHouse의 [`JSON`](/integrations/data-formats/json/overview) 유형은 삽입된 데이터에 따라 준 구조화된 동적 컬럼 생성을 지원합니다. |
| **인덱스** | **테이블** | 쿼리 실행 및 저장의 단위. 두 시스템 모두 쿼리는 인덱스 또는 테이블에 대해 실행되며, 각 행/문서를 저장합니다. |
| *묵시적* | 스키마 (SQL)         | SQL 스키마는 테이블을 네임스페이스로 그룹화하며, 일반적으로 접근 제어에 사용됩니다. Elasticsearch와 ClickHouse는 스키마를 지원하지 않지만, 둘 다 역할과 RBAC를 통한 행 및 테이블 수준의 보안을 지원합니다. |
| **클러스터** | **클러스터 / 데이터베이스** | Elasticsearch 클러스터는 하나 이상의 인덱스를 관리하는 런타임 인스턴스입니다. ClickHouse에서 데이터베이스는 논리적 네임스페이스 내에서 테이블을 조직하여 Elasticsearch의 클러스터와 동일한 논리적 그룹화를 제공합니다. ClickHouse 클러스터는 데이터 자체와 분리되고 독립적인 분산 노드의 집합입니다. |

### 데이터 모델링 및 유연성 {#data-modeling-and-flexibility}

Elasticsearch는 [동적 매핑](https://www.elastic.co/docs/manage-data/data-store/mapping/dynamic-mapping)을 통해 스키마 유연성으로 잘 알려져 있습니다. 필드는 문서가 수집될 때 생성되며, 유형은 자동으로 유추됩니다 - 스키마가 지정되지 않는 한. ClickHouse는 기본적으로 더 엄격하며, 테이블은 명시적인 스키마로 정의됩니다 - 그러나 [`Dynamic`](/sql-reference/data-types/dynamic), [`Variant`](/sql-reference/data-types/variant), 및 [`JSON`](/integrations/data-formats/json/overview) 유형을 통해 유연성을 제공합니다. 이러한 유형은 반구조화된 데이터를 수집하고 Elasticsearch와 유사한 동적 컬럼 생성 및 유형 유추를 허용합니다. 유사하게, [`Map`](/sql-reference/data-types/map) 유형은 임의의 키-값 쌍을 저장할 수 있게 하지만, 키와 값 모두에 대해 단일 유형이 적용됩니다.

ClickHouse의 유형 유연성 접근 방식은 더 투명하고 제어됩니다. Elasticsearch에서 유형 충돌이 수집 오류를 초래할 수 있는 반면, ClickHouse는 [`Variant`](/sql-reference/data-types/variant) 컬럼에서 혼합형 데이터를 허용하고 [`JSON`](/integrations/data-formats/json/overview) 유형을 통해 스키마 진화를 지원합니다.

[`JSON`](/integrations/data-formats/json/overview)을 사용하지 않는 경우 스키마는 정적으로 정의됩니다. 행에 대해 값이 제공되지 않으면, 이들은 [`Nullable`](/sql-reference/data-types/nullable)로 정의되거나 ClickStack에서 사용되지 않거나 유형에 대한 기본값으로 되돌려집니다(예: `String`의 경우 빈 값).
### 수집 및 변환 {#ingestion-and-transformation}

Elasticsearch는 문서를 인덱싱하기 전에 변환하기 위해 프로세서(예: `enrich`, `rename`, `grok`)가 포함된 수집 파이프라인을 사용합니다. ClickHouse에서는 [**증분 물리화된 뷰**](/materialized-view/incremental-materialized-view)를 사용하여 비슷한 기능을 구현하며, 이는 [수집된 데이터 필터링, 변환](/materialized-view/incremental-materialized-view#filtering-and-transformation) 또는 [제공](/materialized-view/incremental-materialized-view#lookup-table)을 수행하고 결과를 대상 테이블에 삽입합니다. 물리화된 뷰의 결과를 저장하기 위해 `Null` 테이블 엔진으로 데이터를 삽입할 수도 있습니다. 이 경우에 물리화된 뷰의 결과만 보존되고 원본 데이터는 폐기되어 저장 공간을 절약합니다.

Elasticsearch는 문서에 컨텍스트를 추가하기 위한 전용 [수집 프로세서](https://www.elastic.co/docs/reference/enrich-processor/enrich-processor)를 지원합니다. ClickHouse에서는 [**딕셔너리**](/dictionary)를 사용하여 행을 보강할 수 있습니다 - 예를 들어 [IP를 위치에 매핑](/use-cases/observability/schema-design#using-ip-dictionaries)하거나 삽입시 [사용자 에이전트 조회](/use-cases/observability/schema-design#using-regex-dictionaries-user-agent-parsing)를 수행할 수 있습니다.
### 쿼리 언어 {#query-languages}

Elasticsearch는 여러 [쿼리 언어](https://www.elastic.co/docs/explore-analyze/query-filter/languages)를 지원하며, 여기에는 [DSL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/querydsl), [ES|QL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/esql), [EQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/eql) 및 [KQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/kql) (Lucene 스타일) 쿼리가 포함되지만, 조인 지원은 제한적입니다 — 오직 **왼쪽 외부 조인**만 [`ES|QL`](https://www.elastic.co/guide/en/elasticsearch/reference/8.x/esql-commands.html#esql-lookup-join)을 통해 가능합니다. ClickHouse는 **전체 SQL 구문**을 지원하며, 여기에는 [모든 조인 유형](/sql-reference/statements/select/join#supported-types-of-join), [윈도우 함수](/sql-reference/window-functions), 서브쿼리(및 연관 서브쿼리), CTE가 포함됩니다. 이는 관측 가능성 신호와 비즈니스 또는 인프라 데이터 간의 연관성을 필요로 하는 사용자에게 큰 장점입니다.

ClickStack에서는 [HyperDX가 전환 용이성을 위해 Lucene 호환 검색 인터페이스](/use-cases/observability/clickstack/search)를 제공하며 ClickHouse 백엔드를 통해 전체 SQL 지원을 제공합니다. 이 구문은 [Elastic 쿼리 문자열](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) 구문과 비교할 수 있습니다. 이 구문의 정확한 비교는 ["ClickStack 및 Elastic에서 검색"](/use-cases/observability/clickstack/migration/elastic/search)를 참조하세요.
### 파일 형식 및 인터페이스 {#file-formats-and-interfaces}

Elasticsearch는 JSON (및 [제한된 CSV](https://www.elastic.co/docs/reference/enrich-processor/csv-processor)) 수집을 지원합니다. ClickHouse는 **70개 이상의 파일 형식**을 지원하며, 여기에는 Parquet, Protobuf, Arrow, CSV 및 기타 형식이 포함되어 수집 및 내보내기 모두에 사용됩니다. 이를 통해 외부 파이프라인 및 도구와의 통합이 더 용이해집니다.

두 시스템 모두 REST API를 제공하지만, ClickHouse는 **네이티브 프로토콜**도 제공하여 저지연 및 고처리량 상호 작용을 지원합니다. 네이티브 인터페이스는 쿼리 진행 상황, 압축 및 스트리밍을 HTTP보다 더 효율적으로 지원하며, 대부분의 생산 수집에 대한 기본 옵션입니다.
### 인덱싱 및 저장 {#indexing-and-storage}

<Image img={elasticsearch} alt="Elasticsearch" size="lg"/>

샤딩 개념은 Elasticsearch의 확장성 모델에 필수적입니다. 각 ① [**인덱스**](https://www.elastic.co/blog/what-is-an-elasticsearch-index)는 **샤드**로 나뉘며, 각 샤드는 디스크에 세그먼트로 저장된 물리적 Lucene 인덱스입니다. 샤드는 복원력을 위해 하나 이상 의 물리적 복사본(복제본 샤드)을 가질 수 있습니다. 확장성을 위해 샤드 및 복제본은 여러 노드에 분산될 수 있습니다. 단일 샤드는 ② 하나 이상의 불변 세그먼트로 구성됩니다. 세그먼트는 Elasticsearch의 인덱싱 및 검색 기능을 제공하는 Java 라이브러리인 Lucene의 기본 인덱싱 구조입니다.

:::note Elasticsearch에서의 삽입 처리
Ⓐ 새로 삽입된 문서 Ⓑ는 기본적으로 초당 한 번 플러시되는 인메모리 인덱싱 버퍼로 들어갑니다. 라우팅 공식은 플러시된 문서의 목표 샤드를 결정하는 데 사용되며, 샤드의 디스크에 새로운 세그먼트가 작성됩니다. 쿼리 효율성을 개선하고 삭제되거나 업데이트된 문서의 물리적 삭제를 가능하게 하도록 세그먼트는 계속해서 더 큰 세그먼트로 병합됩니다. 그러나 병합을 강제하여 더 큰 세그먼트로 만들 수도 있습니다.
:::

Elasticsearch는 [50 GB 또는 2억 개 문서](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards) 정도로 샤드를 크기를 조정하는 것을 권장합니다 [JVM 힙 및 메타데이터 오버헤드](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#each-shard-has-overhead) 때문에. 또한 샤드 당 [20억 개 문서](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#troubleshooting-max-docs-limit)의 한계가 있습니다. Elasticsearch는 샤드에 걸쳐 쿼리를 병렬화하지만, 각 샤드는 **단일 스레드**를 사용하여 처리되므로, 과도한 샤딩은 비용을 초래하고 비효율적입니다. 이는 본질적으로 샤딩을 스케일링에 밀접하게 결합하며, 성능을 확장하기 위해 더 많은 샤드(및 노드)가 필요하게 됩니다.

Elasticsearch는 모든 필드를 [**역 인덱스**](https://www.elastic.co/docs/manage-data/data-store/index-basics)로 인덱싱하여 빠른 검색을 지원하며, 집계, 정렬 및 스크립트 필드 접근을 위해 [**문서 값**](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/doc-values)을 선택적으로 사용합니다. 수치 및 지리적 필드는 [Block K-D 트리](https://users.cs.duke.edu/~pankaj/publications/papers/bkd-sstd.pdf)를 사용하여 공간적 데이터와 수치 및 날짜 범위에 대한 검색을 지원합니다.

중요한 것은 Elasticsearch가 [`_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field)에 전체 원본 문서를 저장(및 `LZ4`, `Deflate` 또는 `ZSTD`로 압축 처리)하는 반면, ClickHouse는 별도의 문서 표현을 저장하지 않는다는 것입니다. 데이터는 쿼리 시 컬럼에서 재구성되며, 그것은 저장 공간을 절약합니다. 이와 유사한 기능은 [합성 `_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source)를 사용하여 Elasticsearch에서도 가능하지만, 몇 가지 [제한 사항](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source-restrictions)이 존재합니다. `_source`를 비활성화하면 ClickHouse에는 적용되지 않는 [영향](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#include-exclude)이 있습니다.

Elasticsearch에서 [인덱스 매핑](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)(ClickHouse의 테이블 스키마에 해당하는)은 필드 유형 및 이 지속성 및 쿼리 실행에 사용되는 데이터 구조를 제어합니다.

반대로 ClickHouse는 **컬럼형**입니다 - 모든 컬럼은 독립적으로 저장되지만 항상 테이블의 기본/정렬 키에 따라 정렬됩니다. 이 정렬은 [스파스 주요 인덱스](/primary-indexes)를 가능하게 하여 ClickHouse가 쿼리 실행 중에 데이터를 효율적으로 스킵할 수 있도록 합니다. 쿼리가 기본 키 필드로 필터링할 때 ClickHouse는 각 컬럼의 관련 부분만 읽어 디스크 I/O를 크게 줄이고 성능을 개선합니다 - 모든 컬럼에 전체 인덱스가 없어도 가능합니다.

<Image img={clickhouse} alt="ClickHouse" size="lg"/>

ClickHouse는 또한 선택된 컬럼에 대한 인덱스 데이터를 미리 계산하여 필터링을 가속화하는 [**스킵 인덱스**](/optimize/skipping-indexes)를 지원합니다. 이들은 명시적으로 정의해야 하지만 성능을 크게 향상시킬 수 있습니다. 추가로, ClickHouse는 각 컬럼마다 [압축 코덱](/use-cases/observability/schema-design#using-codecs) 및 압축 알고리즘을 지정할 수 있게 해줍니다 - Elasticsearch는 이를 지원하지 않습니다(압축은 오직 `_source` JSON 저장에만 적용됩니다).

ClickHouse는 또한 샤딩을 지원하지만, 그 모델은 **수직 확장**을 선호하도록 설계되었습니다. 단일 샤드는 **수조 밀리언 행**을 저장할 수 있으며, 메모리, CPU 및 디스크 용량이 허용하는 한 효율적으로 수행됩니다. Elasticsearch와 달리 ClickHouse에는 샤드 당 **하드 행 제한**이 없습니다. ClickHouse의 샤드는 논리적으로 구성되어 있으며, 데이터 집합이 단일 노드의 용량을 초과하지 않는 한 파티셔닝이 필요하지 않습니다. 이러한 경우, 기초적으로 축소된 복잡성과 오버헤드를 줄입니다. 이 경우에도 Elasticsearch와 유사하게, 하나의 샤드는 데이터의 부분 집합을 보유하고 있습니다. 단일 샤드 내의 데이터는 다음 ② 불변 데이터 파트 컬렉션으로 조직됩니다. 

ClickHouse 샤드 내에서의 처리 방식은 **완전히 병렬화**되며, 사용자는 노드 간 데이터 이동과 관련된 네트워크 비용을 피하기 위해 수직으로 확장할 것을 권장합니다.

:::note ClickHouse에서의 삽입 처리
ClickHouse에서 삽입은 **기본적으로 동기적**입니다 - 커밋 후에만 쓰기가 확인되지만, Elastic과 유사한 버퍼링 및 배치에 맞추기 위해 **비동기 삽입**으로 설정할 수 있습니다. [비동기 데이터 삽입](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)을 사용할 경우, Ⓐ 새로 삽입된 행은 Ⓑ 기본적으로 200 밀리초마다 플러시되는 인메모리 삽입 버퍼로 들어갑니다. 여러 샤드를 사용하는 경우, [분산 테이블](/engines/table-engines/special/distributed)을 사용하여 새로 삽입된 행을 해당 샤드로 라우팅합니다. 새로운 파트는 샤드의 디스크에 기록됩니다.
:::
### 배포 및 복제 {#distribution-and-replication}

Elasticsearch와 ClickHouse 모두 클러스터, 샤드 및 복제본을 사용하여 확장성과 내결함성을 보장하지만, 그 구현 및 성능 특성에서 상당한 차이가 있습니다.

Elasticsearch는 복제를 위해 **주-보조** 모델을 사용합니다. 데이터가 주 샤드에 쓰여지면, 이는 하나 이상의 복제본에 동기적으로 복사됩니다. 이 복제본들은 노드에 분산된 완전한 샤드입니다. Elasticsearch는 모든 필수 복제본이 작업을 확인해야만 쓰기를 인정합니다 - 이 모델은 근접 **순차적 일관성**을 제공하지만, 완전한 동기화 이전에 복제본에서 **더러운 읽기**가 발생할 수 있습니다. **마스터 노드**는 클러스터를 조정하고, 샤드 할당, 건강 상태 및 리더 선출을 관리합니다.

반대로 ClickHouse는 기본적으로 **최종 일관성**을 사용하며, 이는 **Keeper**에 의해 조정됩니다 - ZooKeeper의 경량 대안입니다. 쓰기는 모든 복제본으로 직접 또는 [**분산 테이블**](/engines/table-engines/special/distributed)을 통해 전송되며, 이 테이블은 자동으로 복제본을 선택합니다. 복제는 비동기이며 - 쓰기가 확인된 후 변경 사항이 다른 복제본으로 전파됩니다. 더 엄격한 보장을 위해 ClickHouse는 [`*순차적 일관성*`](/migrations/postgresql/appendix#sequential-consistency)을 지원하는데, 이 경우에 쓰기의 확인은 복제본 간에 커밋된 후 이루어집니다. 그러나 이 모드는 일반적으로 성능 영향으로 인해 잘 사용되지 않습니다. 분산 테이블은 여러 샤드에 대한 접근을 통합하고, 모든 샤드에 `SELECT` 쿼리를 전달하고 결과를 병합합니다. `INSERT` 작업은 데이터의 균형을 유지하기 위해 샤드 간에 고르게 라우팅합니다. ClickHouse의 복제는 매우 유연하며, 각 복제본(샤드의 복사본)은 쓰기를 수용할 수 있으며, 모든 변경 사항은 비동기적으로 부인됩니다. 이 아키텍처는 실패나 유지 보수 중에도 중단 없이 쿼리를 제공할 수 있게 하며, 재동기화는 자동으로 처리됩니다 - 데이터 계층에서 주-보조 강제를 하지 않게 됩니다.

:::note ClickHouse Cloud
**ClickHouse Cloud**에서는 아키텍처가 공유-무관 계산 모델을 도입하며, 여기서 단일 **샤드는 객체 저장소에 의해 백업됩니다**. 이를 통해 전통적인 복제본 기반의 고가용성을 대체하며, 샤드는 **여러 노드에 의해 동시에 읽고 쓸 수 있습니다**. 저장소와 계산의 분리는 명시적인 복제본 관리 없이 탄력적 확장을 가능하게 합니다.
:::

요약하자면:

- **Elastic**: 샤드는 JVM 메모리에 연결된 물리적인 Lucene 구조입니다. 과도한 샤딩은 성능 패널티를 초래합니다. 복제는 동기적이며 마스터 노드에 의해 조정됩니다.
- **ClickHouse**: 샤드는 논리적이며 수직적으로 확장 가능하고, 매우 효율적인 로컬 실행이 가능합니다. 복제는 비동기적(하지만 순차적일 수 있음)이며 조정은 경량입니다.

결국 ClickHouse는 샤드 조정의 필요성을 최소화함으로써 단순성과 성능을 강조하며 필요할 때 강력한 일관성 보장을 제공합니다.
### 중복 제거 및 라우팅 {#deduplication-and-routing}

Elasticsearch는 `_id`에 따라 문서를 중복 제거하고, 이를 통해 샤드로 라우팅합니다. ClickHouse는 기본 행 식별자를 저장하지 않지만, 사용자에게 실패한 삽입을 안전하게 재시도할 수 있도록 **삽입 시 중복 제거**를 지원합니다. 보다 구체적인 제어를 위해 `ReplacingMergeTree` 및 기타 테이블 엔진은 특정 컬럼에 따라 중복 제거를 가능하게 합니다.

Elasticsearch의 인덱스 라우팅은 특정 문서가 항상 특정 샤드로 라우팅되도록 보장합니다. ClickHouse에서는 사용자가 **샤드 키**를 정의하거나 `Distributed` 테이블을 사용하여 유사한 데이터 지역성을 달성할 수 있습니다.
### 집계 및 실행 모델 {#aggregations-execution-model}

두 시스템 모두 데이터 집계를 지원하지만, ClickHouse는 상당히 [더 많은 함수](/sql-reference/aggregate-functions/reference)를 제공하며, 여기에는 통계적, 근사 및 특수 분석 함수가 포함됩니다.

관측 가능성 사용 사례 중 집계의 가장 일반적인 용도 중 하나는 특정 로그 메시지 또는 이벤트가 얼마나 자주 발생하는지를 계산하는 것입니다(그리고 빈도가 비정상적인 경우 알림).

ClickHouse의 `SELECT count(*) FROM ... GROUP BY ...` SQL 쿼리에 해당하는 Elasticsearch에서의 쿼리는 [terms aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html)입니다. 이는 Elasticsearch의 [버킷 집계](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket.html)입니다.

ClickHouse의 `GROUP BY`와 `count(*)` 및 Elasticsearch의 terms aggregation은 일반적으로 기능적으로 동일하지만, 구현, 성능 및 결과 품질에서 크게 다릅니다.

Elasticsearch의 집계는 [“top-N” 쿼리에서 결과를 추정합니다](https://www.elastic.co/docs/reference/aggregations/search-aggregations-bucket-terms-aggregation#terms-agg-doc-count-error) (예: 개수별로 상위 10개 호스트) 쿼리된 데이터가 여러 샤드에 걸쳐 있을 때. 이러한 추정은 속도를 개선하지만 정확성을 손상시킬 수 있습니다. 사용자는 [`doc_count_error_upper_bound`](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#terms-agg-doc-count-error)를 검사하고 `shard_size` 매개변수를 늘려서 이러한 오류를 줄일 수 있습니다 - 이는 메모리 사용량 증가 및 느린 쿼리 성능의 대가를 요구합니다.

Elasticsearch는 또한 모든 버킷 집계에 대한 [`size` 설정](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#search-aggregations-bucket-terms-aggregation-size)을 요구합니다 - 명시적으로 한도를 설정하지 않고는 모든 고유 그룹을 반환할 방법이 없습니다. 고차원 집계는 [`max_buckets` 한계](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-settings.html#search-settings-max-buckets)에 걸리거나, [복합 집계](https://www.elastic.co/docs/reference/aggregations/bucket/composite-aggregation)로 페이지 매기기를 요구합니다 - 이는 종종 복잡하고 비효율적입니다.

반대로 ClickHouse는 기본적으로 정확한 집계를 수행합니다. `count(*)`와 같은 함수는 구성 조정 없이도 정확한 결과를 반환하여 쿼리 동작을 더욱 단순하고 예측 가능하게 만듭니다.

ClickHouse는 크기 제한이 없습니다. 큰 데이터 집합에 대해 무한대의 그룹 바이 쿼리를 수행할 수 있습니다. 메모리 임계값이 초과되면 ClickHouse는 [디스크에 흘려보낼](https://clickhouse.com/docs/en/sql-reference/statements/select/group-by#group-by-in-external-memory) 수 있습니다. 기본 키의 접두사로 그룹화하는 집계는 특히 효율적이며 일반적으로 최소한의 메모리 소비로 수행됩니다.
#### 실행 모델 {#execution-model}

위의 차이는 Elasticsearch와 ClickHouse의 실행 모델에서 기인하며, 이들은 쿼리 실행 및 병렬성에 대해 근본적으로 다른 접근 방식을 취합니다.

ClickHouse는 현대 하드웨어에서 효율성을 극대화하도록 설계되었습니다. 기본적으로 ClickHouse는 N CPU 코어가 있는 머신에서 N 동시 실행 레인을 통해 SQL 쿼리를 실행합니다:

<Image img={clickhouse_execution} alt="ClickHouse execution" size="lg"/>

단일 노드에서 실행 레인은 데이터를 독립적인 범위로 분할하여 CPU 스레드 간의 동시 처리를 가능하게 합니다. 이는 필터링, 집계 및 정렬을 포함합니다. 각 레인의 로컬 결과는 궁극적으로 병합되며, 쿼리에 한도 절이 있는 경우 한도 연산자가 적용됩니다.

쿼리 실행은 다음에 의해 추가로 병렬화됩니다:
1. **SIMD 벡터화**: 컬럼 데이터를 처리하는 작업은 [CPU SIMD 명령어](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data) (예: [AVX512](https://en.wikipedia.org/wiki/AVX-512))를 사용하여 값의 배치 처리를 가능하게 합니다.
2. **클러스터 수준 병렬성**: 분산 설정에서 각 노드는 쿼리 처리 로컬을 수행합니다. [부분 집계 상태](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states#working-with-aggregation-states)는 호출 노드로 스트리밍되고 병합됩니다. 쿼리의 `GROUP BY` 키가 샤딩 키와 일치하면 병합을 [최소화하거나 완전히 피할 수 있습니다](/operations/settings/settings#distributed_group_by_no_merge).
<br/>
이 모델은 코어와 노드 간의 효율적인 스케일링을 가능하게 하여 ClickHouse가 대규모 분석에 적합하도록 해줍니다. *부분 집계 상태* 사용은 서로 다른 스레드와 노드에서 발생한 중간 결과를 정확성을 손상시키지 않고 병합할 수 있게 합니다.

반대로 Elasticsearch는 대부분의 집계에 대해 각 샤드에 하나의 스레드를 할당하며, 이용 가능한 CPU 코어의 수에 관계없이 작동합니다. 이 스레드는 샤드 로컬 상위 N 결과를 반환하며, 이는 조정 노드에서 병합됩니다. 이러한 접근 방식은 시스템 리소스를 충분히 활용하지 못하게 하며, 특히 자주 발생하는 용어가 여러 샤드에 분산될 경우 전역 집계에서 잠재적인 부정확성을 초래할 수 있습니다. 정확도를 향상시키기 위해 `shard_size` 매개변수를 증가시킬 수 있지만, 이는 더 높은 메모리 사용과 쿼리 대기 시간을 초래합니다.

<Image img={elasticsearch_execution} alt="Elasticsearch execution" size="lg"/>

요약하자면, ClickHouse는 더 세분화된 병렬성과 하드웨어 자원에 대한 더 큰 제어를 통해 집계 및 쿼리를 실행하는 반면, Elasticsearch는 보다 경직된 제약이 있는 샤드 기반 실행에 의존합니다.

각 기술에서 집계의 메커니즘에 대한 자세한 내용은 블로그 게시물 ["ClickHouse vs. Elasticsearch: Count Aggregations의 메커니즘"](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#elasticsearch)를 권장합니다.
### 데이터 관리 {#data-management}

Elasticsearch와 ClickHouse는 시간에 따라 변하는 관측 가능성 데이터를 관리하는 접근 방식이 근본적으로 다릅니다 - 특히 데이터 보존, 롤오버 및 계층 저장소에 관한 것입니다.
#### 인덱스 라이프사이클 관리 vs 네이티브 TTL {#lifecycle-vs-ttl}

Elasticsearch에서는 장기 데이터 관리를 **인덱스 라이프사이클 관리 (ILM)** 및 **데이터 스트림**을 통해 처리합니다. 이러한 기능은 사용자가 인덱스가 롤오버되는 시점(예: 특정 크기나 나이에 도달한 후), 오래된 인덱스가 저비용 저장소(예: 따뜻한 또는 차가운 계층)로 이동하는 시점, 그리고 최종적으로 삭제되는 시점을 정의할 수 있도록 합니다. 이는 Elasticsearch가 **재샤드를 지원하지 않기 때문에 필요하며**, 샤드는 성능 저하 없이 무한히 커질 수 없습니다. 샤드 크기를 관리하고 효율적인 삭제를 지원하기 위해, 주기적으로 새로운 인덱스를 생성하고 오래된 인덱스를 제거해야 하며 - 사실상 인덱스 수준에서 데이터를 회전해야 합니다.

ClickHouse는 다른 접근 방식을 취합니다. 데이터는 일반적으로 **단일 테이블**에 저장되고 **TTL(시간 제한) 표현식**을 사용하여 컬럼 또는 파티션 수준에서 관리됩니다. 데이터는 **날짜별로 파티셔닝**될 수 있으며, 새로운 테이블을 생성하거나 인덱스 롤오버를 수행하지 않고도 효율적인 삭제가 가능합니다. 데이터가 노화하고 TTL 조건을 충족하면 ClickHouse는 이를 자동으로 제거합니다 - 회전을 관리하기 위한 추가 인프라가 필요 없습니다.
#### 저장소 계층 및 핫-웜 아키텍처 {#storage-tiers}

Elasticsearch는 서로 다른 성능 특성을 가진 저장소 계층 간에 데이터가 이동하는 **핫-웜-차가운-얼린** 저장소 아키텍처를 지원합니다. 이는 일반적으로 ILM을 통해 구성되며, 클러스터에서 노드 역할과 연결됩니다.

ClickHouse는 `MergeTree`와 같은 네이티브 테이블 엔진을 통해 **계층 저장소**를 지원하여, 사용자 정의 규칙에 따라 오래된 데이터를 서로 다른 **볼륨**(예: SSD에서 HDD 및 객체 저장소로) 간에 자동으로 이동할 수 있습니다. 이는 Elastic의 핫-웜-차가운 접근 방식을 모방할 수 있지만 - 여러 노드 역할이나 클러스터를 관리하는 복잡성 없이 진행됩니다.

:::note ClickHouse Cloud
**ClickHouse Cloud**에서는 이 과정이 더욱 매끄럽습니다: 모든 데이터는 **객체 저장소(예: S3)**에 저장되고 계산은 분리됩니다. 데이터는 쿼리될 때까지 객체 저장소에 남아 있으며, 이 시점에 로컬(또는 분산 캐시)에 캐시됩니다 - Elastic의 차가운 계층과 동일한 비용 프로필을 제공하며, 더 나은 성능 특성을 가집니다. 이 접근 방식은 저장소 계층 간에 데이터가 이동할 필요가 없게 되어 핫-웜 아키텍처는 중복됩니다.
:::
### Rollups vs incremental aggregates {#rollups-vs-incremental-aggregates}

Elasticsearch에서, **rollups** 또는 **aggregates**는 [**transforms**](https://www.elastic.co/guide/en/elasticsearch/reference/current/transforms.html)라는 메커니즘을 사용하여 이루어집니다. 이러한 메커니즘은 고정된 시간 간격(예: 매시간 또는 매일)에서 시계열 데이터를 요약하기 위해 **슬라이딩 윈도우** 모델을 사용합니다. 이들은 하나의 인덱스에서 데이터를 집계하고 결과를 별도의 **rollup index**에 기록하는 반복 백그라운드 작업으로 구성됩니다. 이는 고유 식별자가 많은 원시 데이터에 대한 반복 스캔을 피하여 장기 쿼리 비용을 줄이는 데 도움이 됩니다.

다음 다이어그램은 transforms의 작동 방식을 추상적으로 설명합니다(우리는 같은 버킷에 속해 있는 모든 문서에 대해 미리 계산된 집계 값을 원할 경우 파란색을 사용합니다):

<Image img={elasticsearch_transforms} alt="Elasticsearch transforms" size="lg"/>

연속적인 transforms는 구성 가능한 체크 간격 시간을 기준으로 transform [checkpoints](https://www.elastic.co/guide/en/elasticsearch/reference/current/transform-checkpoints.html)를 사용합니다 (transform [frequency](https://www.elastic.co/guide/en/elasticsearch/reference/current/put-transform.html)의 기본값은 1분). 위의 다이어그램에서는 ① 체크 간격 시간이 경과한 후 새로운 체크포인트가 생성된다고 가정합니다. 이제 Elasticsearch는 transforms의 원본 인덱스에서 변화를 확인하고 이전 체크포인트 이후에 존재하는 세 개의 새로운 `blue` 문서(11, 12, 13)를 감지합니다. 따라서 원본 인덱스는 모든 기존 `blue` 문서에 대해 필터링되고, [composite aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html) (결과 [pagination](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html)을 활용하기 위해) 가 적절하게 집계 값을 재계산합니다(그리고 대상 인덱스는 이전 집계 값을 포함한 문서를 대체하는 문서로 업데이트됩니다). 유사하게, ②와 ③에서 새로운 체크포인트가 변화를 확인하고 같은 'blue' 버킷에 속한 모든 기존 문서의 집계 값을 재계산하는 과정을 처리합니다.

ClickHouse는 근본적으로 다른 접근 방식을 취합니다. ClickHouse는 데이터를 정기적으로 재집계하기보다는 **증분 물리화된 뷰**를 지원하며, 이는 데이터가 **삽입될 때** 변형되고 집계됩니다. 새로운 데이터가 소스 테이블에 기록되면, 물리화된 뷰는 오직 새로운 **삽입된 블록**에 대해 미리 정의된 SQL 집계 쿼리를 실행하고 집계된 결과를 대상 테이블에 기록합니다.

이 모델은 ClickHouse의 [**부분 집계 상태**](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction) 지원 덕분에 가능하게 되었으며, 이는 나중에 병합될 수 있는 집계 함수의 중간 표현을 저장할 수 있습니다. 이를 통해 사용자는 쿼리하기 빠르고 업데이트하기 저렴한 부분적으로 집계된 결과를 유지할 수 있습니다. 데이터가 도착함에 따라 집계가 이루어지므로 비싼 주기 작업을 실행하거나 오래된 데이터를 다시 요약할 필요가 없습니다.

증분 물리화된 뷰의 동작을 추상적으로 설명합니다(우리는 같은 그룹에 속해 있는 모든 행에 대해 미리 계산된 집계 값을 원할 경우 파란색을 사용합니다):

<Image img={clickhouse_mvs} alt="ClickHouse Materialized Views" size="lg"/>

위의 다이어그램에서, 물리화된 뷰의 원본 테이블은 이미 동일한 그룹에 속하는 일부 `blue` 행(1에서 10까지)을 저장하고 있는 데이터 파트를 포함하고 있습니다. 이 그룹을 위해 뷰의 대상 테이블에도 `blue` 그룹에 대한 [부분 집계 상태](https://www.youtube.com/watch?v=QDAJTKZT8y4)가 저장된 데이터 파트가 이미 존재합니다. ① ② ③이 원본 테이블에 새로운 행을 삽입하면, 각 삽입에 대해 해당 원본 테이블 데이터 파트가 생성되며, 평행하여(오직) 새로 삽입된 행의 각 블록에 대해 부분 집계 상태가 계산되어 데이터 파트 형태로 물리화된 뷰의 대상 테이블에 삽입됩니다. ④ 백그라운드 파트 병합 중에 부분 집계 상태가 병합되어 증분 데이터 집계를 생성합니다.

모든 [aggregate functions](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference) (90개 이상의 함수 포함) 및 집계 함수 [combinators](https://www.youtube.com/watch?v=7ApwD0cfAFI)와의 조합은 [부분 집계 상태](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction)를 지원합니다.

Elasticsearch와 ClickHouse의 증분 집계에 대한 보다 구체적인 예시는 이 [예제](https://github.com/ClickHouse/examples/tree/main/blog-examples/clickhouse-vs-elasticsearch/continuous-data-transformation#continuous-data-transformation-example)를 참조하십시오.

ClickHouse 접근 방식의 장점은 다음과 같습니다:

- **항상 최신 집계**: 물리화된 뷰는 항상 소스 테이블과 동기화됩니다.
- **백그라운드 작업 없음**: 집계는 쿼리 시간보다 삽입 시간으로 푸시됩니다.
- **우수한 실시간 성능**: 신선한 집계가 즉시 필요할 때 이상적입니다.
- **조합 가능**: 물리화된 뷰는 더 복잡한 쿼리 가속 전략을 위해 다른 뷰 및 테이블과 층으로 쌓거나 조인할 수 있습니다.
- **다른 TTL**: 물리화된 뷰의 소스 테이블과 대상 테이블에 대해 다른 TTL 설정을 적용할 수 있습니다.

이 모델은 사용자가 매분 오류율, 대기 시간 또는 상위 N 분석을 계산해야 하는 관찰 가능성 사용 사례에 특히 강력하며, 쿼리당 수십억 개의 원시 레코드를 스캔할 필요가 없습니다.
### Lakehouse support {#lakehouse-support}

ClickHouse와 Elasticsearch는 lakehouse 통합 접근 방식이 근본적으로 다릅니다. ClickHouse는 [Iceberg](/sql-reference/table-functions/iceberg) 및 [Delta Lake](/sql-reference/table-functions/deltalake)와 같은 lakehouse 형식에 대해 쿼리를 실행할 수 있는 완전한 쿼리 실행 엔진이며, [AWS Glue](/use-cases/data-lake/glue-catalog) 및 [Unity catalog](/use-cases/data-lake/unity-catalog)와 같은 데이터 레이크 카탈로그와 통합할 수 있습니다. 이러한 형식은 ClickHouse에서 완전히 지원하는 [Parquet](/interfaces/formats/Parquet) 파일의 효율적인 쿼리에 의존합니다. ClickHouse는 Iceberg 및 Delta Lake 테이블을 직접 읽을 수 있어 현대 데이터 레이크 구조와 원활하게 통합됩니다.

대조적으로, Elasticsearch는 내부 데이터 형식 및 Lucene 기반 스토리지 엔진에 강하게 결합되어 있습니다. 그것은 lakehouse 형식이나 Parquet 파일을 직접 쿼리할 수 없으므로 현대 데이터 레이크 아키텍처에 참여하는 능력이 제한됩니다. Elasticsearch는 쿼리될 수 있도록 데이터가 변환되어 독점 형식으로 로드되어야 합니다.

ClickHouse의 lakehouse 기능은 단순히 데이터를 읽는 것 이상의 기능을 제공합니다:

- **데이터 카탈로그 통합**: ClickHouse는 [AWS Glue](/use-cases/data-lake/glue-catalog)와 같은 데이터 카탈로그와의 통합을 지원하여 객체 스토리지의 테이블에 대한 자동 발견 및 액세스를 가능하게 합니다.
- **객체 스토리지 지원**: 데이터 이동 없이 [S3](/engines/table-engines/integrations/s3), [GCS](/sql-reference/table-functions/gcs) 및 [Azure Blob Storage](/engines/table-engines/integrations/azureBlobStorage)에 존재하는 데이터를 쿼리할 수 있는 기본 지원.
- **쿼리 연합**: [external dictionaries](/dictionary) 및 [table functions](/sql-reference/table-functions)를 사용하여 lakehouse 테이블, 전통적인 데이터베이스 및 ClickHouse 테이블 간의 데이터를 상관하는 기능.
- **증분 로딩**: [MergeTree](/engines/table-engines/mergetree-family/mergetree) 테이블로의 lakehouse 테이블에서의 지속적인 로드를 지원하며, [S3Queue](/engines/table-engines/integrations/s3queue) 및 [ClickPipes](/integrations/clickpipes)와 같은 기능을 사용합니다.
- **성능 최적화**: [cluster functions](/sql-reference/table-functions)를 사용하여 lakehouse 데이터에 대한 분산 쿼리 실행을 통한 개선된 성능.

이러한 기능은 ClickHouse를 lakehouse 아키텍처를 채택하는 조직에 자연스럽게 적합하게 하며, 데이터 레이크의 유연성과 컬럼형 데이터베이스의 성능을 동시에 활용할 수 있게 해줍니다.
