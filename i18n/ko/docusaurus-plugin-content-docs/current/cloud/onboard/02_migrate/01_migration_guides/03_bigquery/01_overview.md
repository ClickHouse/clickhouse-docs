---
title: 'BigQuery와 ClickHouse Cloud 비교'
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: 'BigQuery와 ClickHouse Cloud의 차이점'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: '개요'
doc_type: 'guide'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloud와 BigQuery 비교  \{#comparing-clickhouse-cloud-and-bigquery\}

## 리소스 구성 \{#resource-organization\}

ClickHouse Cloud에서 리소스를 구성하는 방식은 [BigQuery의 리소스 계층 구조](https://cloud.google.com/bigquery/docs/resource-hierarchy)와 유사합니다. 아래 다이어그램에 나와 있는 ClickHouse Cloud 리소스 계층 구조를 바탕으로 주요 차이점을 설명합니다.

<Image img={bigquery_1} size="md" alt="리소스 구성"/>

### Organizations \{#organizations\}

BigQuery와 마찬가지로 Organization은 ClickHouse Cloud 리소스 계층 구조에서 루트 노드 역할을 합니다. ClickHouse Cloud 계정에서 처음 생성하는 사용자(USER)는 자동으로 해당 사용자가 소유한 Organization에 할당됩니다. 또한 이 사용자는 다른 사용자(USER)를 Organization에 초대할 수 있습니다.

### BigQuery Projects vs ClickHouse Cloud Services \{#bigquery-projects-vs-clickhouse-cloud-services\}

조직 내에서 저장된 데이터가 ClickHouse Cloud의 서비스와 연결되므로 BigQuery 프로젝트와 대략적으로 대응되는 서비스를 생성할 수 있습니다. ClickHouse Cloud에는 [여러 서비스 유형](/cloud/manage/cloud-tiers)이 제공됩니다. 각 ClickHouse Cloud 서비스는 특정 리전에 배포되며 다음을 포함합니다:

1. 컴퓨트 노드 그룹(현재 Development 티어 서비스는 노드 2개, Production 티어 서비스는 노드 3개). 이 노드에 대해 ClickHouse Cloud는 수동 및 자동 모두에 대해 [수직 및 수평 스케일링](/manage/scaling#how-scaling-works-in-clickhouse-cloud)을 지원합니다.
2. 서비스가 모든 데이터를 저장하는 객체 스토리지 폴더.
3. 엔드포인트(또는 ClickHouse Cloud UI 콘솔을 통해 생성된 여러 엔드포인트) - 서비스에 연결하는 데 사용하는 서비스 URL(예: `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`)

### BigQuery 데이터 세트 vs ClickHouse Cloud 데이터베이스 \{#bigquery-datasets-vs-clickhouse-cloud-databases\}

ClickHouse는 테이블을 데이터베이스 단위로 논리적으로 그룹화합니다. BigQuery 데이터 세트와 마찬가지로 ClickHouse 데이터베이스는 테이블 데이터를 구성하고 이에 대한 접근을 제어하는 논리적 컨테이너입니다.

### BigQuery Folders \{#bigquery-folders\}

현재 ClickHouse Cloud에는 BigQuery 폴더와 동일한 개념이 없습니다.

### BigQuery Slot reservations and Quotas \{#bigquery-slot-reservations-and-quotas\}

BigQuery slot reservations와 마찬가지로 ClickHouse Cloud에서도 [수직 및 수평 자동 확장](/manage/scaling#configuring-vertical-auto-scaling)을 구성할 수 있습니다. 수직 자동 확장을 위해 서비스의 컴퓨트 노드에 대해 메모리와 CPU 코어의 최소 및 최대 크기를 설정할 수 있습니다. 그러면 서비스는 해당 범위 내에서 필요에 따라 자동으로 확장 또는 축소됩니다. 이러한 설정은 초기 서비스 생성 과정에서도 사용할 수 있습니다. 서비스의 각 컴퓨트 노드는 동일한 크기를 가집니다. [수평 확장](/manage/scaling#manual-horizontal-scaling)을 사용하여 하나의 서비스 내에서 컴퓨트 노드 수를 변경할 수 있습니다.

또한 BigQuery quotas와 유사하게 ClickHouse Cloud는 동시성 제어, 메모리 사용량 제한, I/O 스케줄링을 제공하여 쿼리를 워크로드 클래스로 분리할 수 있도록 합니다. 특정 워크로드 클래스에 대해 공유 리소스(CPU 코어, DRAM, 디스크 및 네트워크 I/O)의 한도를 설정하면 해당 쿼리가 다른 중요 비즈니스 쿼리에 영향을 주지 않도록 보장합니다. 동시성 제어는 많은 수의 동시 쿼리가 존재하는 상황에서 스레드 오버서브스크립션(oversubscription), 즉 스레드 과다 할당을 방지합니다.

ClickHouse는 서버, 사용자, 쿼리 수준에서 메모리 할당의 바이트 단위 크기를 추적하여 메모리 사용량 한도를 유연하게 설정할 수 있도록 합니다. 메모리 오버커밋 기능을 사용하면 쿼리가 보장된 메모리를 넘어 사용 가능한 여유 메모리를 추가로 사용할 수 있으며, 동시에 다른 쿼리에 대한 메모리 한도는 보장됩니다. 또한 집계(aggregation), 정렬(sort), 조인(join) 절의 메모리 사용량도 제한할 수 있어, 메모리 한도를 초과하는 경우 외부 알고리즘으로 대체(fallback)하도록 할 수 있습니다.

마지막으로 I/O 스케줄링을 사용하면 워크로드 클래스에 대해 최대 대역폭, 진행 중인 요청 수, 정책을 기준으로 로컬 및 원격 디스크 접근을 제한할 수 있습니다.

### 권한 \{#permissions\}

ClickHouse Cloud는 [cloud console](/cloud/guides/sql-console/manage-sql-console-role-assignments)과 [database](/cloud/security/manage-database-users) 두 곳에서 사용자 접근을 제어합니다. 콘솔 접근은 [clickhouse.cloud](https://console.clickhouse.cloud) 사용자 인터페이스를 통해 관리됩니다. 데이터베이스 접근은 데이터베이스 사용자 계정과 역할을 통해 관리됩니다. 또한 콘솔 사용자에게 데이터베이스 내 역할을 부여하여, 해당 사용자가 [SQL console](/integrations/sql-clients/sql-console)을 통해 데이터베이스와 상호 작용할 수 있도록 할 수 있습니다.

## 데이터 타입 \{#data-types\}

ClickHouse는 숫자형에 대해 보다 세분화된 정밀도를 제공합니다. 예를 들어, BigQuery는 [`INT64`, `NUMERIC`, `BIGNUMERIC`, `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)와 같은 숫자형 데이터 타입을 제공합니다. 이에 비해 ClickHouse는 10진수, 부동 소수점, 정수에 대해 여러 가지 정밀도의 타입을 제공합니다. 이러한 데이터 타입을 활용하면 저장 공간과 메모리 오버헤드를 최적화하여 더 빠른 쿼리와 더 낮은 리소스 사용량을 달성할 수 있습니다. 아래 표에서는 각 BigQuery 타입에 해당하는 ClickHouse 타입을 정리합니다:

| BigQuery | ClickHouse                                                                                                                                                                        |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)                                                                                                                                       |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)                                                                                     |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal)                                                                                                                                |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)                                                                                                                                         |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring)                                                                                                                              |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32) (범위가 더 좁음)                                                                                                                  |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64) (범위는 더 좁지만 정밀도는 더 높음)                                               |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)                                                                                                                                        |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float)                                                                                                                                 |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint)                                                  |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | NA - [식으로 지원](/sql-reference/data-types/special-data-types/interval#usage-remarks) 혹은 [함수를 통해 지원](/sql-reference/functions/date-time-functions#addYears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)                                                                                                                                 |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string)                                                                                                                                |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested)                                                                       |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |

ClickHouse 타입에 여러 옵션이 제공되는 경우 실제 데이터 범위를 고려하여 필요한 최소 범위를 선택해야 합니다. 또한 추가 압축을 위해 [적절한 코덱](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)을 활용하는 것이 좋습니다.

## 쿼리 가속화 기법 \{#query-acceleration-techniques\}

### 기본 키와 외래 키, 그리고 기본 인덱스 \{#primary-and-foreign-keys-and-primary-index\}

BigQuery에서는 테이블에 [기본 키(primary key)와 외래 키(foreign key) 제약 조건](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)을 둘 수 있습니다. 일반적으로 기본 키와 외래 키는 관계형 데이터베이스에서 데이터 무결성을 보장하기 위해 사용됩니다. 기본 키 값은 보통 각 행마다 고유하며 `NULL`이 아닙니다. 각 행의 외래 키 값은 기본 키 테이블의 기본 키 컬럼에 존재해야 하거나 `NULL`이어야 합니다. BigQuery에서는 이러한 제약 조건이 실제로 강제되지는 않지만, 쿼리 옵티마이저가 이 정보를 활용해 쿼리를 더 잘 최적화할 수 있습니다.

ClickHouse에서도 테이블은 기본 키를 가질 수 있습니다. BigQuery와 마찬가지로, ClickHouse는 테이블 기본 키 컬럼 값의 고유성을 강제하지 않습니다. BigQuery와 달리, 테이블 데이터는 디스크에 저장될 때 기본 키 컬럼을 기준으로 [정렬된 순서](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)로 저장됩니다. 쿼리 옵티마이저는 이 정렬 순서를 활용하여 재정렬 작업을 방지하고, 조인 시 메모리 사용량을 최소화하며, LIMIT 절에 대해 조기 종료(short-circuit)가 가능하도록 합니다. BigQuery와 달리, ClickHouse는 기본 키 컬럼 값을 기반으로 [ (희소) 기본 인덱스 ](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)를 자동으로 생성합니다. 이 인덱스는 기본 키 컬럼에 대한 필터가 포함된 모든 쿼리를 빠르게 처리하는 데 사용됩니다. 현재 ClickHouse는 외래 키 제약 조건을 지원하지 않습니다.

## 보조 인덱스(ClickHouse에서만 사용 가능) \{#secondary-indexes-only-available-in-clickhouse\}

테이블 기본 키 컬럼 값으로부터 생성되는 기본 인덱스 외에도 ClickHouse에서는 기본 키에 포함되지 않은 컬럼에 대해 보조 인덱스를 생성할 수 있습니다. ClickHouse는 쿼리 유형에 따라 적합한 여러 종류의 보조 인덱스를 제공합니다:

- [**Bloom Filter Index**](/engines/table-engines/mergetree-family/mergetree#bloom-filter):
  - `=` 또는 `IN`과 같은 동등 조건이 포함된 쿼리를 빠르게 실행하는 데 사용됩니다.
  - 확률적 데이터 구조를 사용하여 데이터 블록에 특정 값이 존재하는지 여부를 판별합니다.
- [**Token Bloom Filter Index**](/engines/table-engines/mergetree-family/mergetree#token-bloom-filter):
  - Bloom Filter Index와 유사하지만 토큰화된 문자열에 사용되며, 전문 검색(full-text search) 쿼리에 적합합니다.
- [**Min-Max Index**](/engines/table-engines/mergetree-family/mergetree#minmax):
  - 각 데이터 파트에 대해 컬럼의 최소값과 최대값을 유지합니다.
  - 지정된 범위에 포함되지 않는 데이터 파트를 읽지 않고 건너뛸 수 있도록 합니다.

## 검색 인덱스 \{#search-indexes\}

BigQuery의 [검색 인덱스](https://cloud.google.com/bigquery/docs/search-index)와 유사하게, ClickHouse 테이블의 문자열 유형 컬럼에 대해 [전체 텍스트 인덱스](/engines/table-engines/mergetree-family/textindexes)를 생성할 수 있습니다.

## 벡터 인덱스 \{#vector-indexes\}

BigQuery는 최근 Pre-GA 기능으로 [벡터 인덱스](https://cloud.google.com/bigquery/docs/vector-index)를 도입했습니다. 마찬가지로 ClickHouse에도 벡터 검색 사용 사례를 가속하기 위한 [벡터 검색을 가속하는 인덱스](/engines/table-engines/mergetree-family/annindexes)에 대한 실험적 지원이 있습니다.

## Partitioning \{#partitioning\}

BigQuery와 마찬가지로 ClickHouse도 테이블을 더 작고 관리하기 쉬운 「파티션」 단위로 나누어 대규모 테이블의 성능과 관리 용이성을 향상시키는 테이블 파티션 기능을 사용합니다. ClickHouse 파티셔닝에 대해서는 [여기](/engines/table-engines/mergetree-family/custom-partitioning-key)에서 자세히 설명합니다.

## 클러스터링 \{#clustering\}

클러스터링을 사용하면 BigQuery는 지정된 일부 컬럼 값을 기준으로 테이블 데이터를 자동으로 정렬하고, 최적 크기의 블록에 함께 배치합니다. 클러스터링은 쿼리 성능을 향상시키며, 이를 통해 BigQuery가 쿼리 실행 비용을 더 정확하게 추정할 수 있습니다. 또한 클러스터링된 컬럼을 사용하면 쿼리에서 불필요한 데이터 스캔을 피할 수 있습니다.

ClickHouse에서는 테이블의 기본 키 컬럼을 기준으로 디스크 상에서 데이터가 자동으로 [클러스터링](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)되며, 기본 인덱스 데이터 구조를 활용하는 쿼리가 블록을 빠르게 찾거나 건너뛸 수 있도록(prune) 논리적인 블록 단위로 구성됩니다.

## 구체화된 뷰(Materialized View) \{#materialized-views\}

BigQuery와 ClickHouse 모두 구체화된 뷰(Materialized View)를 지원합니다. 이는 성능과 효율성을 높이기 위해 기본 테이블에 대한 변환 쿼리 결과를 미리 계산해 저장하는 기능입니다.

## 구체화된 뷰(materialized view) 쿼리하기 \{#querying-materialized-views\}

BigQuery materialized view는 직접 쿼리할 수 있고, 옵티마이저가 기본 테이블에 대한 쿼리를 처리하는 데 사용할 수도 있습니다. 기본 테이블에 대한 변경 사항이 materialized view를 무효화할 수 있는 경우에는 데이터를 기본 테이블에서 직접 읽습니다. 기본 테이블에 대한 변경 사항이 materialized view를 무효화하지 않는 경우에는 나머지 데이터는 materialized view에서 읽고, 변경된 부분만 기본 테이블에서 읽습니다.

ClickHouse에서는 materialized view를 직접 쿼리하는 방식으로만 사용할 수 있습니다. 그러나 BigQuery(기본 테이블 변경 후 5분 이내에 materialized view를 자동으로 새로 고치지만, [30분마다](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)보다 더 자주 새로 고치지는 않음)와 달리, materialized view는 항상 기본 테이블과 동기화되어 있습니다.

**materialized view 업데이트**

BigQuery는 기본 테이블에 대해 view의 변환 쿼리를 실행하여 materialized view를 주기적으로 전체 새로 고침합니다. 새로 고침 사이의 기간 동안 BigQuery는 materialized view의 데이터와 새로운 기본 테이블 데이터를 결합하여, materialized view를 계속 사용하면서도 일관된 쿼리 결과를 제공합니다.

ClickHouse에서는 materialized view가 증분 방식으로 업데이트됩니다. 이 증분 업데이트 메커니즘은 높은 확장성과 낮은 연산 비용을 제공합니다. 증분 업데이트되는 materialized view는 기본 테이블이 수십억 또는 수조 개의 행을 포함하는 시나리오에 특히 적합하도록 설계되었습니다. materialized view를 새로 고치기 위해 계속 증가하는 기본 테이블 전체를 반복적으로 쿼리하는 대신, ClickHouse는 새로 삽입된 기본 테이블 행의 값에서만 부분 결과를 계산합니다. 이 부분 결과는 백그라운드에서 이전에 계산된 부분 결과와 순차적으로 병합됩니다. 이러한 방식은 기본 테이블 전체에서 materialized view를 반복적으로 새로 고치는 것과 비교하여 연산 비용을 크게 절감합니다.

## 트랜잭션 \{#transactions\}

ClickHouse와 달리 BigQuery는 단일 쿼리 내에서 또는 세션을 사용할 경우 여러 쿼리에 걸쳐 멀티 스테이트먼트 트랜잭션(다중 문 트랜잭션)을 지원합니다. 멀티 스테이트먼트 트랜잭션을 사용하면 하나 이상의 테이블에 행을 삽입하거나 삭제하는 등의 변경 연산을 수행한 뒤, 변경 사항을 원자적으로 커밋하거나 롤백할 수 있습니다. 멀티 스테이트먼트 트랜잭션은 [ClickHouse의 2024년 로드맵](https://github.com/ClickHouse/ClickHouse/issues/58392)에 포함되어 있습니다.

## 집계 함수 \{#aggregate-functions\}

BigQuery와 비교하면, ClickHouse에는 훨씬 더 많은 기본 제공 집계 함수가 있습니다.

- BigQuery에는 [18개의 집계 함수](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)와 [4개의 근사 집계 함수](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)가 있습니다.
- ClickHouse에는 [150개가 넘는 미리 구현된 집계 함수](/sql-reference/aggregate-functions/reference)가 있으며, 미리 구현된 집계 함수의 동작을 [확장](https://www.youtube.com/watch?v=7ApwD0cfAFI)하기 위한 강력한 [aggregation combinator](/sql-reference/aggregate-functions/combinators)를 제공합니다. 예를 들어, 150개가 넘는 미리 구현된 집계 함수를 테이블 행 대신 배열에 적용하려면 [-Array 접미사](/sql-reference/aggregate-functions/combinators#-array)를 붙여 호출하기만 하면 됩니다. [-Map 접미사](/sql-reference/aggregate-functions/combinators#-map)를 사용하면 임의의 집계 함수를 맵에도 적용할 수 있습니다. 그리고 [-ForEach 접미사](/sql-reference/aggregate-functions/combinators#-foreach)를 사용하면 임의의 집계 함수를 중첩 배열에 적용할 수 있습니다.

## 데이터 소스 및 파일 포맷 \{#data-sources-and-file-formats\}

BigQuery와 비교하면 ClickHouse는 훨씬 더 다양한 파일 포맷과 데이터 소스를 지원합니다:

- ClickHouse는 사실상 모든 데이터 소스에서 90개 이상의 파일 포맷의 데이터를 불러오는 기능을 네이티브로 지원합니다
- BigQuery는 5개의 파일 포맷과 19개의 데이터 소스를 지원합니다

## SQL 언어 기능 \{#sql-language-features\}

ClickHouse는 분석 작업에 보다 적합하게 만들어 주는 다양한 확장과 개선 사항을 포함한 표준 SQL을 제공합니다. 예를 들어, ClickHouse SQL은 [람다 함수](/sql-reference/functions/overview#arrow-operator-and-lambda)와 고차 함수(higher order functions)를 지원하므로, 변환을 적용할 때 배열을 unnest/explode 연산으로 펼칠 필요가 없습니다. 이는 BigQuery와 같은 다른 시스템에 비해 큰 장점입니다.

## 배열(Arrays) \{#arrays\}

BigQuery의 배열 함수가 8개인 것과 비교하면, ClickHouse에는 다양한 문제를 우아하고 단순하게 모델링하고 해결하기 위한 80개가 넘는 [내장 배열 함수](/sql-reference/functions/array-functions)가 있습니다.

ClickHouse에서 전형적인 설계 패턴은 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 집계 함수를 사용하여 테이블의 특정 행의 값을 (일시적으로) 배열로 변환하는 것입니다. 이렇게 변환된 배열은 배열 함수를 통해 편리하게 처리할 수 있으며, 결과는 [`arrayJoin`](/sql-reference/functions/array-join) 집계 함수를 통해 다시 개별 테이블 행으로 변환할 수 있습니다.

ClickHouse SQL은 [고차 람다 함수](/sql-reference/functions/overview#arrow-operator-and-lambda)를 지원하므로, 많은 고급 배열 연산은 배열을 다시 테이블로 일시적으로 변환해야 하는 BigQuery에서 흔히 요구되는 작업(예: [필터링](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays) 또는 [zipping](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays) 배열)을 대신해, 단순히 고차 내장 배열 함수 중 하나를 호출하는 것만으로도 달성할 수 있습니다. ClickHouse에서는 이러한 연산이 각각 [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) 및 [`arrayZip`](/sql-reference/functions/array-functions#arrayZip)과 같은 고차 함수 호출로 간단히 처리됩니다.

다음은 BigQuery의 배열 연산을 ClickHouse에 대응시킨 매핑입니다:

| BigQuery                                                                                                                 | ClickHouse                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [ARRAY&#95;CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat)           | [arrayConcat](/sql-reference/functions/array-functions#arrayConcat)                         |
| [ARRAY&#95;LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length)           | [length](/sql-reference/functions/array-functions#length)                                   |
| [ARRAY&#95;REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse)         | [arrayReverse](/sql-reference/functions/array-functions#arrayReverse)                       |
| [ARRAY&#95;TO&#95;STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arrayStringConcat) |
| [GENERATE&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array)       | [range](/sql-reference/functions/array-functions#range)                                     |
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array)                             | [array](/sql-reference/data-types/array)                                                    |

**서브쿼리의 각 행마다 하나의 요소를 가진 배열 생성**

*BigQuery*

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

*ClickHouse*

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

**배열을 여러 행으로 변환**

*BigQuery*

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

*ClickHouse*

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

**날짜 배열을 반환**

*BigQuery*

[GENERATE&#95;DATE&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_date_array) 함수

```sql
SELECT GENERATE_DATE_ARRAY('2016-10-05', '2016-10-08') AS example;

/*--------------------------------------------------*
 | example                                          |
 +--------------------------------------------------+
 | [2016-10-05, 2016-10-06, 2016-10-07, 2016-10-08] |
 *--------------------------------------------------*/
```

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 함수들

*ClickHouse*

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**타임스탬프 배열을 반환합니다**

*BigQuery*

[GENERATE&#95;TIMESTAMP&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_timestamp_array) 함수

```sql
SELECT GENERATE_TIMESTAMP_ARRAY('2016-10-05 00:00:00', '2016-10-07 00:00:00',
                                INTERVAL 1 DAY) AS timestamp_array;

/*--------------------------------------------------------------------------*
 | timestamp_array                                                          |
 +--------------------------------------------------------------------------+
 | [2016-10-05 00:00:00+00, 2016-10-06 00:00:00+00, 2016-10-07 00:00:00+00] |
 *--------------------------------------------------------------------------*/
```

*ClickHouse*

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 함수들

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**배열 필터링**

*BigQuery*

배열을 테이블로 일시적으로 되돌리기 위해 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 연산자를 사용해야 합니다

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

*ClickHouse*

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

**배열 zip 하기**

*BigQuery*

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 연산자를 사용하여 배열을 임시로 다시 테이블로 변환해야 합니다.

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

*ClickHouse*

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

**배열 집계**

*BigQuery*

배열을 다시 테이블로 변환하기 위해 [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 연산자를 사용해야 함

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

*ClickHouse*

[arraySum](/sql-reference/functions/array-functions#arraySum), [arrayAvg](/sql-reference/functions/array-functions#arrayAvg) 등의 함수나 90개가 넘는 기존 집계 함수 이름을 [arrayReduce](/sql-reference/functions/array-functions#arrayReduce) 함수의 인자로 사용


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
