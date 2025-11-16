---
'title': 'BigQuery와 ClickHouse Cloud의 차이'
'slug': '/migrations/bigquery/biquery-vs-clickhouse-cloud'
'description': 'BigQuery가 ClickHouse Cloud와 어떻게 다른지'
'keywords':
- 'BigQuery'
'show_related_blogs': true
'sidebar_label': '개요'
'doc_type': 'guide'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloud와 BigQuery 비교하기 

## 리소스 조직 {#resource-organization}

ClickHouse Cloud의 리소스 조직 방식은 [BigQuery의 리소스 계층 구조](https://cloud.google.com/bigquery/docs/resource-hierarchy)와 유사합니다. 아래의 다이어그램을 기반으로 특정 차이점을 설명합니다:

<Image img={bigquery_1} size="md" alt="리소스 조직"/>

### 조직 {#organizations}

BigQuery와 유사하게, 조직은 ClickHouse Cloud 리소스 계층 구조의 루트 노드입니다. ClickHouse Cloud 계정에 설정한 첫 번째 사용자는 자동으로 사용자가 소유한 조직에 할당됩니다. 사용자는 추가 사용자들을 조직에 초대할 수 있습니다.

### BigQuery 프로젝트 vs ClickHouse Cloud 서비스 {#bigquery-projects-vs-clickhouse-cloud-services}

조직 내에서 ClickHouse Cloud에 저장된 데이터는 서비스와 연결되어 있기 때문에 BigQuery 프로젝트와 느슨하게 동등한 서비스를 생성할 수 있습니다. ClickHouse Cloud에는 [여러 가지 서비스 유형이 제공됩니다](/cloud/manage/cloud-tiers). 각 ClickHouse Cloud 서비스는 특정 지역에 배치되며 다음을 포함합니다:

1. 컴퓨트 노드 그룹(현재 개발 계층 서비스에는 2 노드, 생산 계층 서비스에는 3 노드). 이 노드는 ClickHouse Cloud가 [수직 및 수평 확장을 지원합니다](/manage/scaling#how-scaling-works-in-clickhouse), 수동 및 자동으로.
2. 서비스가 모든 데이터를 저장하는 오브젝트 스토리지 폴더.
3. 서비스에 연결하는 데 사용하는 엔드포인트(또는 ClickHouse Cloud UI 콘솔을 통해 생성된 여러 엔드포인트) - 서비스 URL(예: `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`)

### BigQuery 데이터세트 vs ClickHouse Cloud 데이터베이스 {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse는 논리적으로 테이블을 데이터베이스로 묶습니다. BigQuery 데이터세트와 마찬가지로 ClickHouse 데이터베이스는 테이블 데이터를 조직하고 접근을 제어하는 논리적 컨테이너입니다.

### BigQuery 폴더 {#bigquery-folders}

현재 ClickHouse Cloud에는 BigQuery 폴더에 해당하는 개념이 없습니다.

### BigQuery 슬롯 예약 및 할당량 {#bigquery-slot-reservations-and-quotas}

BigQuery 슬롯 예약처럼 ClickHouse Cloud에서 [수직 및 수평 자동 확장](/manage/scaling#configuring-vertical-auto-scaling)을 구성할 수 있습니다. 수직 자동 확장을 위해 서비스의 컴퓨트 노드의 메모리와 CPU 코어에 대한 최소 및 최대 크기를 설정할 수 있습니다. 그러면 서비스는 필요한 경우 이 범위 내에서 확장됩니다. 이러한 설정은 서비스 초기 생성 흐름 중에도 사용할 수 있습니다. 서비스 내 각 컴퓨트 노드는 동일한 크기입니다. [수평 확장](/manage/scaling#manual-horizontal-scaling)을 통해 서비스 내에서 컴퓨트 노드 수를 변경할 수 있습니다.

게다가, BigQuery 할당량과 유사하게 ClickHouse Cloud는 동시성 제어, 메모리 사용 제한 및 I/O 스케줄링을 제공하여 사용자가 쿼리를 워크로드 클래스에 분리할 수 있도록 합니다. 특정 워크로드 클래스에 대한 공유 자원(CPU 코어, DRAM, 디스크 및 네트워크 I/O)에 제한을 설정함으로써 이러한 쿼리가 다른 중요한 비즈니스 쿼리에 영향을 미치지 않도록 보장합니다. 동시성 제어는 동시 쿼리 수가 많은 시나리오에서 스레드 과다 구독을 방지합니다.

ClickHouse는 서버, 사용자 및 쿼리 수준에서 메모리 할당의 바이트 크기를 추적하여 유연한 메모리 사용 한도를 허용합니다. 메모리 과잉 사용은 쿼리가 보장된 메모리 이상으로 추가적인 여유 메모리를 사용할 수 있도록 하며, 다른 쿼리의 메모리 한도도 보장합니다. 또한 집계, 정렬 및 조인 절에서 메모리 사용량을 제한할 수 있어 메모리 한도가 초과될 경우 외부 알고리즘으로 대체할 수 있습니다.

마지막으로 I/O 스케줄링을 통해 사용자는 최대 대역폭, 비행 요청 및 정책에 따라 워크로드 클래스에 대한 로컬 및 원격 디스크 접근을 제한할 수 있습니다.

### 권한 {#permissions}

ClickHouse Cloud는 두 곳에서 사용자 액세스를 제어합니다. [클라우드 콘솔](/cloud/guides/sql-console/manage-sql-console-role-assignments)과 [데이터베이스](/cloud/security/manage-database-users)입니다. 콘솔 액세스는 [clickhouse.cloud](https://console.clickhouse.cloud) 사용자 인터페이스를 통해 관리됩니다. 데이터베이스 액세스는 데이터베이스 사용자 계정 및 역할을 통해 관리됩니다. 또한 콘솔 사용자에게는 데이터를 통해 콘솔 사용자가 데이터베이스와 상호 작용할 수 있도록 하는 역할을 부여할 수 있습니다. [SQL 콘솔](/integrations/sql-clients/sql-console).

## 데이터 유형 {#data-types}

ClickHouse는 숫자에 대해 더 세밀한 정밀도를 제공합니다. 예를 들어, BigQuery는 [`INT64`, `NUMERIC`, `BIGNUMERIC`, `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)와 같은 숫자 유형을 제공합니다. 이러한 유형을 ClickHouse와 대조하면, ClickHouse는 여러 정밀도 유형을 제공하여 소수, 부동 소수점 및 정수에 대해 저장 공간 및 메모리 오버헤드를 최적화할 수 있으므로 더 빠른 쿼리와 낮은 자원 소비로 이어집니다. 아래는 각 BigQuery 유형에 대한 ClickHouse의 동등한 유형을 나열한 표입니다:

| BigQuery | ClickHouse                                                                                                                                                                        |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)                                                                                                                                       |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)                                                                                     |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal)                                                                                                                                |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)                                                                                                                                         |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring)                                                                                                                              |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32) (범위가 더 좁음)                                                                                                                  |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64) (범위가 좁고 더 높은 정밀도)                                               |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)                                                                                                                                        |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float)                                                                                                                                 |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint)                                                  |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | NA - [표현으로 지원됨](/sql-reference/data-types/special-data-types/interval#usage-remarks) 또는 [함수를 통해](/sql-reference/functions/date-time-functions#addYears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)                                                                                                                                 |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string)                                                                                                                                |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested)                                                                       |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |

ClickHouse 유형에 대한 여러 옵션이 제공될 때 데이터의 실제 범위를 고려하고 요구되는 가장 낮은 값을 선택하세요. 또한 추가적인 압축을 위해 [적절한 코덱](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)의 사용을 고려하세요.

## 쿼리 가속 기술 {#query-acceleration-techniques}

### 기본 키 및 외래 키와 기본 인덱스 {#primary-and-foreign-keys-and-primary-index}

BigQuery에서는 테이블이 [기본 키 및 외래 키 제약 조건](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)을 가질 수 있습니다. 일반적으로 기본 키 및 외래 키는 데이터 무결성을 보장하기 위해 관계형 데이터베이스에서 사용됩니다. 기본 키 값은 일반적으로 각 행마다 고유하며 `NULL`이 아닙니다. 행의 각 외래 키 값은 기본 키 테이블의 기본 키 열에 있어야 하거나 `NULL`이어야 합니다. BigQuery에서는 이러한 제약 조건이 시행되지 않지만, 쿼리 최적화기는 이 정보를 사용하여 쿼리를 더 잘 최적화할 수 있습니다.

ClickHouse에서도 테이블은 기본 키를 가질 수 있습니다. ClickHouse는 기본 키 열 값의 유일성을 강제하지 않습니다. BigQuery와는 달리 ClickHouse에서는 테이블의 데이터가 기본 키 열로 [정렬된](https://guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files) 상태로 디스크에 저장됩니다. 쿼리 최적화기는 이 정렬 순서를 사용하여 재정렬을 방지하고, 조인의 메모리 사용량을 최소화하며, 제한 절의 단축 회로를 가능하게 합니다. BigQuery와는 달리 ClickHouse는 기본 키 열 값을 기반으로 [하나의 (스파스) 기본 인덱스](https://guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)를 자동으로 생성합니다. 이 인덱스는 기본 키 열에 대한 필터가 포함된 모든 쿼리를 가속화하는 데 사용됩니다. ClickHouse는 현재 외래 키 제약 조건을 지원하지 않습니다.

## 보조 인덱스 (ClickHouse에서만 사용 가능) {#secondary-indexes-only-available-in-clickhouse}

ClickHouse는 테이블의 기본 키 열 값에서 생성된 기본 인덱스 외에도 기본 키에 없는 다른 컬럼에 대한 보조 인덱스를 생성할 수 있습니다. ClickHouse는 각기 다른 쿼리 유형에 적합한 여러 종류의 보조 인덱스를 제공합니다:

- **블룸 필터 인덱스**:
  - 동등 조건(예: =, IN)이 있는 쿼리를 가속화하는 데 사용됩니다.
  - 데이터 블록에 값이 존재하는지 여부를 결정하기 위해 확률적 데이터 구조를 사용합니다.
- **토큰 블룸 필터 인덱스**:
  - 블룸 필터 인덱스와 유사하지만 토큰화된 문자열에 사용되며 전체 텍스트 검색 쿼리에 적합합니다.
- **최소-최대 인덱스**:
  - 각 데이터 파트에 대해 하나의 컬럼의 최소값과 최대값을 유지합니다.
  - 지정된 범위에 포함되지 않는 데이터 파트를 읽지 않도록 도와줍니다.

## 검색 인덱스 {#search-indexes}

BigQuery의 [검색 인덱스](https://cloud.google.com/bigquery/docs/search-index)와 유사하게, ClickHouse의 [전체 텍스트 인덱스](/engines/table-engines/mergetree-family/invertedindexes)는 문자열 값을 가진 열의 ClickHouse 테이블에 생성될 수 있습니다.

## 벡터 인덱스 {#vector-indexes}

BigQuery는 최근 [벡터 인덱스](https://cloud.google.com/bigquery/docs/vector-index)를 Pre-GA 기능으로 도입했습니다. 마찬가지로 ClickHouse는 벡터 검색 사용 사례를 가속화하기 위한 [인덱스에 대한 실험적 지원](https://engines/table-engines/mergetree-family/annindexes)을 제공합니다.

## 파티셔닝 {#partitioning}

BigQuery와 마찬가지로 ClickHouse는 테이블 파티셔닝을 사용하여 큰 테이블의 성능과 관리 용이성을 향상시킵니다. 테이블은 파티션이라 부르는 더 작고 관리 가능한 조각으로 나뉘어집니다. ClickHouse의 파티셔닝에 대한 자세한 설명은 [여기](https://engines/table-engines/mergetree-family/custom-partitioning-key)에서 확인할 수 있습니다.

## 클러스터링 {#clustering}

클러스터링을 사용하면 BigQuery는 몇 개의 지정된 열의 값을 기반으로 테이블 데이터를 자동으로 정렬하고 최적의 크기의 블록으로 함께 배치합니다. 클러스터링은 쿼리 성능을 향상시키며, BigQuery가 쿼리 실행 비용을 더 잘 추정할 수 있도록 합니다. 클러스터 열을 사용하면 불필요한 데이터 검색을 제거할 수 있습니다.

ClickHouse에서는 데이터가 기본 키 열을 기반으로 [디스크에 자동으로 클러스터링](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)되고, 기본 인덱스 데이터 구조를 활용하는 쿼리에 의해 신속하게 찾거나 추적할 수 있는 블록으로 논리적으로 조직됩니다.

## 물리화된 뷰 {#materialized-views}

BigQuery와 ClickHouse 모두 물리화된 뷰를 지원하여 기본 테이블에 대한 변환 쿼리의 결과를 기반으로 미리 계산된 결과를 생성하여 성능과 효율성을 높입니다.

## 물리화된 뷰 쿼리하기 {#querying-materialized-views}

BigQuery 물리화된 뷰는 직접 쿼리할 수 있으며, 최적화기에 의해 기본 테이블에 대한 쿼리를 처리하는 데 사용될 수 있습니다. 기본 테이블에 대한 변경이 물리화된 뷰를 무효화할 수 있는 경우, 데이터는 기본 테이블에서 직접 읽습니다. 기본 테이블에 대한 변경이 물리화된 뷰를 무효화하지 않으면 물리화된 뷰에서 나머지 데이터를 읽고 기본 테이블에서 변경 사항만 읽습니다.

ClickHouse에서는 물리화된 뷰를 오직 직접 쿼리할 수 있습니다. 그러나 ClickHouse의 물리화된 뷰는 기본 테이블에 대한 변경이 있을 경우 5분 이내에 자동으로 새로 고쳐지는 BigQuery와 달리 기본 테이블과 항상 동기화되어 있습니다.

**물리화된 뷰 업데이트**

BigQuery는 기본 테이블에 대해 뷰의 변환 쿼리를 실행하여 물리화된 뷰를 주기적으로 완전히 새로 고칩니다. 새로 고침 사이가 길어질 때에도 BigQuery는 물리화된 뷰의 데이터를 새로운 기본 테이블 데이터와 결합하여 일관된 쿼리 결과를 제공합니다.

ClickHouse에서는 물리화된 뷰가 점진적으로 업데이트됩니다. 이 점진적 업데이트 메커니즘은 높은 확장성과 낮은 컴퓨팅 비용을 제공합니다: 점진적으로 업데이트되는 물리화된 뷰는 기본 테이블에 수십억 또는 수조 행이 포함된 시나리오에 특히 맞춰 설계되었습니다. ClickHouse는 기본 테이블을 반복적으로 쿼리하여 물리화된 뷰를 새로 고치는 대신, 단지 신규 삽입된 기본 테이블 행의 값에서 부분 결과를 계산합니다. 이 부분 결과는 이전에 계산된 부분 결과와 백그라운드에서 점진적으로 병합됩니다. 이로 인해 전체 기본 테이블에서 반복적으로 물리화된 뷰를 새로 고치는 것에 비해 컴퓨팅 비용이 크게 낮아집니다.

## 트랜잭션 {#transactions}

ClickHouse와는 달리 BigQuery는 단일 쿼리 내에서 또는 세션을 사용할 때 여러 쿼리 간의 다중 문장 트랜잭션을 지원합니다. 다중 문장 트랜잭션을 사용하면 한 개 이상의 테이블에서 행을 삽입하거나 삭제하는 등의 변형 작업을 수행하고 변경 내용을 원자적으로 커밋하거나 롤백할 수 있습니다. 다중 문장 트랜잭션은 [ClickHouse의 2024년 로드맵](https://github.com/ClickHouse/ClickHouse/issues/58392)에 포함되어 있습니다.

## 집계 함수 {#aggregate-functions}

BigQuery에 비해 ClickHouse는 훨씬 더 많은 내장 집계 함수를 제공합니다:

- BigQuery는 [18개의 집계 함수](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)와 [4개의 근사 집계 함수](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)를 제공합니다.
- ClickHouse는 [150개 이상의 사전 구축된 집계 함수](/sql-reference/aggregate-functions/reference)와 [사전 구축된 집계 함수의 동작을 확장하기 위한 강력한 집계 조합자](/sql-reference/aggregate-functions/combinators)를 제공합니다. 예를 들어, 150개 이상의 사전 구축된 집계 함수를 테이블 행 대신 배열에 적용하려면 [-Array 접미사](/sql-reference/aggregate-functions/combinators#-array)를 호출하면 됩니다. [-Map 접미사](/sql-reference/aggregate-functions/combinators#-map)를 사용하면 지도의 모든 집계 함수를 적용할 수 있습니다. [-ForEach 접미사](/sql-reference/aggregate-functions/combinators#-foreach)를 통해 중첩 배열에 모든 집계 함수를 적용할 수 있습니다.

## 데이터 소스 및 파일 형식 {#data-sources-and-file-formats}

BigQuery와 비교할 때 ClickHouse는 훨씬 더 많은 파일 형식과 데이터 소스를 지원합니다:

- ClickHouse는 모든 데이터 소스에서 90개 이상의 파일 형식으로 데이터를 로드하는 네이티브 지원을 제공합니다.
- BigQuery는 5개의 파일 형식과 19개의 데이터 소스를 지원합니다.

## SQL 언어 기능 {#sql-language-features}

ClickHouse는 표준 SQL에 많은 확장 및 개선 사항을 제공하여 분석 작업에 더 친숙하도록 제작되어 있습니다. 예를 들어 ClickHouse SQL은 [람다 함수](/sql-reference/functions/overview#arrow-operator-and-lambda) 및 고차 함수를 지원하므로 변환 적용 시 배열을 펼치거나 폭발시킬 필요가 없습니다. 이는 BigQuery와 같은 다른 시스템에 비해 큰 장점입니다.

## 배열 {#arrays}

BigQuery의 8개 배열 함수에 비해 ClickHouse는 다양한 문제를 우아하고 간단하게 모델링하고 해결하기 위한 80개 이상의 [내장 배열 함수](/sql-reference/functions/array-functions)를 제공합니다.

ClickHouse의 일반적인 디자인 패턴은 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 집계 함수를 사용하여 테이블의 특정 행 값을 배열로 (일시적으로) 변환하는 것입니다. 그런 다음 배열 함수들을 사용하여 편리하게 처리할 수 있으며, 결과는 [`arrayJoin`](/sql-reference/functions/array-join) 집계 함수를 통해 개별 테이블 행으로 다시 변환할 수 있습니다.

ClickHouse SQL은 [고차 람다 함수](/sql-reference/functions/overview#arrow-operator-and-lambda)를 지원하므로, 배열을 일시적으로 테이블로 변환하는 대신 고차 내장 배열 함수 중 하나를 단순히 호출하여 여러 고급 배열 작업을 수행할 수 있습니다. 이는 BigQuery에서 [필터링](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays)이나 [압축](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays) 배열이 필요한 경우 자주 요구되는 방법입니다. ClickHouse에서는 이러한 작업이 각각 [arrayFilter](/sql-reference/functions/array-functions#arrayFilter) 및 [arrayZip](/sql-reference/functions/array-functions#arrayZip) 고차 함수의 단순한 함수 호출로 수행됩니다.

다음은 BigQuery에서 ClickHouse로의 배열 작업 매핑입니다:

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat) | [arrayConcat](/sql-reference/functions/array-functions#arrayConcat) |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length) | [length](/sql-reference/functions/array-functions#length) |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse) | [arrayReverse](/sql-reference/functions/array-functions#arrayReverse) |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arrayStringConcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array) | [range](/sql-reference/functions/array-functions#range) |

**서브쿼리에서 각 행에 대해 하나의 요소로 배열 만들기**

_BigQuery_

[ARRAY 함수](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array)

```sql
SELECT ARRAY
  (SELECT 1 UNION  ALL
   SELECT 2 UNION ALL
   SELECT 3) AS new_array;

/*-----------*
 | new_array |
 +-----------+
 | [1, 2, 3] |
 *-----------*/
```

_ClickHouse_

[groupArray](/sql-reference/aggregate-functions/reference/grouparray) 집계 함수

```sql
SELECT groupArray(*) AS new_array
FROM
(
    SELECT 1
    UNION ALL
    SELECT 2
    UNION ALL
    SELECT 3
)
   ┌─new_array─┐
1. │ [1,2,3]   │
   └───────────┘
```

**배열을 행 집합으로 변환하기**

_BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 연산자

```sql
SELECT *
FROM UNNEST(['foo', 'bar', 'baz', 'qux', 'corge', 'garply', 'waldo', 'fred'])
  AS element
WITH OFFSET AS offset
ORDER BY offset;

/*----------+--------*
 | element  | offset |
 +----------+--------+
 | foo      | 0      |
 | bar      | 1      |
 | baz      | 2      |
 | qux      | 3      |
 | corge    | 4      |
 | garply   | 5      |
 | waldo    | 6      |
 | fred     | 7      |
 *----------+--------*/
```

_ClickHouse_

[ARRAY JOIN](/sql-reference/statements/select/array-join) 절

```sql
WITH ['foo', 'bar', 'baz', 'qux', 'corge', 'garply', 'waldo', 'fred'] AS values
SELECT element, num-1 AS offset
FROM (SELECT values AS element) AS subquery
ARRAY JOIN element, arrayEnumerate(element) AS num;

/*----------+--------*
 | element  | offset |
 +----------+--------+
 | foo      | 0      |
 | bar      | 1      |
 | baz      | 2      |
 | qux      | 3      |
 | corge    | 4      |
 | garply   | 5      |
 | waldo    | 6      |
 | fred     | 7      |
 *----------+--------*/
```

**날짜 배열 반환하기**

_BigQuery_

[GENERATE_DATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_date_array) 함수

```sql
SELECT GENERATE_DATE_ARRAY('2016-10-05', '2016-10-08') AS example;

/*--------------------------------------------------*
 | example                                          |
 +--------------------------------------------------+
 | [2016-10-05, 2016-10-06, 2016-10-07, 2016-10-08] |
 *--------------------------------------------------*/
```

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 함수

_ClickHouse_

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**타임스탬프 배열 반환하기**

_BigQuery_

[GENERATE_TIMESTAMP_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_timestamp_array) 함수

```sql
SELECT GENERATE_TIMESTAMP_ARRAY('2016-10-05 00:00:00', '2016-10-07 00:00:00',
                                INTERVAL 1 DAY) AS timestamp_array;

/*--------------------------------------------------------------------------*
 | timestamp_array                                                          |
 +--------------------------------------------------------------------------+
 | [2016-10-05 00:00:00+00, 2016-10-06 00:00:00+00, 2016-10-07 00:00:00+00] |
 *--------------------------------------------------------------------------*/
```

_ClickHouse_

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 함수

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**배열 필터링**

_BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 연산자를 통해 배열을 일시적으로 테이블로 변환해야 합니다.

```sql
WITH Sequences AS
  (SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
   UNION ALL SELECT [2, 4, 8, 16, 32] AS some_numbers
   UNION ALL SELECT [5, 10] AS some_numbers)
SELECT
  ARRAY(SELECT x * 2
        FROM UNNEST(some_numbers) AS x
        WHERE x < 5) AS doubled_less_than_five
FROM Sequences;

/*------------------------*
 | doubled_less_than_five |
 +------------------------+
 | [0, 2, 2, 4, 6]        |
 | [4, 8]                 |
 | []                     |
 *------------------------*/
```

_ClickHouse_

[arrayFilter](/sql-reference/functions/array-functions#arrayFilter) 함수

```sql
WITH Sequences AS
    (
        SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
        UNION ALL
        SELECT [2, 4, 8, 16, 32] AS some_numbers
        UNION ALL
        SELECT [5, 10] AS some_numbers
    )
SELECT arrayMap(x -> (x * 2), arrayFilter(x -> (x < 5), some_numbers)) AS doubled_less_than_five
FROM Sequences;
   ┌─doubled_less_than_five─┐
1. │ [0,2,2,4,6]            │
   └────────────────────────┘
   ┌─doubled_less_than_five─┐
2. │ []                     │
   └────────────────────────┘
   ┌─doubled_less_than_five─┐
3. │ [4,8]                  │
   └────────────────────────┘
```

**배열 압축하기**

_BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 연산자를 통해 배열을 일시적으로 테이블로 변환해야 합니다.

```sql
WITH
  Combinations AS (
    SELECT
      ['a', 'b'] AS letters,
      [1, 2, 3] AS numbers
  )
SELECT
  ARRAY(
    SELECT AS STRUCT
      letters[SAFE_OFFSET(index)] AS letter,
      numbers[SAFE_OFFSET(index)] AS number
    FROM Combinations
    CROSS JOIN
      UNNEST(
        GENERATE_ARRAY(
          0,
          LEAST(ARRAY_LENGTH(letters), ARRAY_LENGTH(numbers)) - 1)) AS index
    ORDER BY index
  );

/*------------------------------*
 | pairs                        |
 +------------------------------+
 | [{ letter: "a", number: 1 }, |
 |  { letter: "b", number: 2 }] |
 *------------------------------*/
```

_ClickHouse_

[arrayZip](/sql-reference/functions/array-functions#arrayZip) 함수

```sql
WITH Combinations AS
    (
        SELECT
            ['a', 'b'] AS letters,
            [1, 2, 3] AS numbers
    )
SELECT arrayZip(letters, arrayResize(numbers, length(letters))) AS pairs
FROM Combinations;
   ┌─pairs─────────────┐
1. │ [('a',1),('b',2)] │
   └───────────────────┘
```

**배열 집계하기**

_BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 연산자를 통해 배열을 다시 테이블로 변환해야 합니다.

```sql
WITH Sequences AS
  (SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
   UNION ALL SELECT [2, 4, 8, 16, 32] AS some_numbers
   UNION ALL SELECT [5, 10] AS some_numbers)
SELECT some_numbers,
  (SELECT SUM(x)
   FROM UNNEST(s.some_numbers) AS x) AS sums
FROM Sequences AS s;

/*--------------------+------*
 | some_numbers       | sums |
 +--------------------+------+
 | [0, 1, 1, 2, 3, 5] | 12   |
 | [2, 4, 8, 16, 32]  | 62   |
 | [5, 10]            | 15   |
 *--------------------+------*/
```

_ClickHouse_

[arraySum](/sql-reference/functions/array-functions#arraySum), [arrayAvg](/sql-reference/functions/array-functions#arrayAvg) ... 등의 함수, 또는 [arrayReduce](/sql-reference/functions/array-functions#arrayReduce) 함수의 인수로 90개 이상의 기존 집계 함수 이름. 

```sql
WITH Sequences AS
    (
        SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
        UNION ALL
        SELECT [2, 4, 8, 16, 32] AS some_numbers
        UNION ALL
        SELECT [5, 10] AS some_numbers
    )
SELECT
    some_numbers,
    arraySum(some_numbers) AS sums
FROM Sequences;
   ┌─some_numbers──┬─sums─┐
1. │ [0,1,1,2,3,5] │   12 │
   └───────────────┴──────┘
   ┌─some_numbers──┬─sums─┐
2. │ [2,4,8,16,32] │   62 │
   └───────────────┴──────┘
   ┌─some_numbers─┬─sums─┐
3. │ [5,10]       │   15 │
   └──────────────┴──────┘
```
