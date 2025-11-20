---
'slug': '/best-practices/use-materialized-views'
'sidebar_position': 10
'sidebar_label': '물리화된 뷰 사용'
'title': '물리화된 뷰 사용'
'description': '페이지 설명 Materialized Views'
'keywords':
- 'materialized views'
- 'medallion architecture'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import incremental_materialized_view from '@site/static/images/bestpractices/incremental_materialized_view.gif';
import refreshable_materialized_view from '@site/static/images/bestpractices/refreshable_materialized_view.gif';

ClickHouse는 두 종류의 물리화된 뷰를 지원합니다: [**증분**](/materialized-view/incremental-materialized-view) 및 [**갱신 가능**](/materialized-view/refreshable-materialized-view). 두 유형 모두 결과를 사전 계산하고 저장하여 쿼리를 가속화하도록 설계되었지만, 기본 쿼리가 실행되는 방법과 시기, 어떤 작업에 적합한지, 데이터 신선도가 처리되는 방식에서 크게 다릅니다.

**사용자는 이전 모범 사례 [딕셔너리](/best-practices/select-data-types) 및 [기본 키 최적화](/best-practices/choosing-a-primary-key)가 수행되었다고 가정할 때, 가속화가 필요한 특정 쿼리 패턴에 대해 물리화된 뷰를 고려해야 합니다.**

**증분 물리화된 뷰**는 실시간으로 업데이트됩니다. 새로운 데이터가 원본 테이블에 삽입되면, ClickHouse는 새로운 데이터 블록에 물리화된 뷰의 쿼리를 자동으로 적용하고 결과를 별도의 대상 테이블에 기록합니다. 시간이 지나면서 ClickHouse는 이러한 부분 결과를 병합하여 완전하고 최신의 뷰를 생성합니다. 이 접근법은 계산 비용을 삽입 시점으로 이동시켜 새로운 데이터만 처리하므로 매우 효율적입니다. 결과적으로 대상 테이블에 대한 `SELECT` 쿼리는 빠르고 경량입니다. 증분 뷰는 모든 집계 함수를 지원하며, 삽입되는 데이터셋의 작은 최신 하위 집합에서 각 쿼리가 작동하기 때문에 페타바이트 규모의 데이터까지 잘 확장됩니다.

<Image img={incremental_materialized_view} size="lg" alt="물리화된 뷰" />

반면에 **갱신 가능 물리화된 뷰**는 일정에 따라 업데이트됩니다. 이러한 뷰는 정기적으로 전체 쿼리를 다시 실행하고 결과를 대상 테이블에 덮어씁니다. 이는 Postgres와 같은 전통적인 OLTP 데이터베이스의 물리화된 뷰와 유사합니다.

<Image img={refreshable_materialized_view} size="lg" alt="갱신 가능 물리화된 뷰 다이어그램" />

증분 물리화된 뷰와 갱신 가능 물리화된 뷰 사이의 선택은 쿼리의 특성, 데이터가 변경되는 빈도, 뷰에 대한 업데이트가 삽입될 때마다 모든 행을 반영해야 하는지, 아니면 주기적인 갱신이 허용되는지에 크게 의존합니다. 이러한 거래를 이해하는 것은 ClickHouse에서 성능이 뛰어나고 확장 가능한 물리화된 뷰를 설계하는 데 필수적입니다.

## 증분 물리화된 뷰를 사용할 때 {#when-to-use-incremental-materialized-views}

증분 물리화된 뷰는 일반적으로 선호되며, 원본 테이블이 새로운 데이터를 수신할 때마다 자동으로 실시간으로 업데이트됩니다. 이들은 모든 집계 함수를 지원하며 단일 테이블에 대한 집계에 특히 효과적입니다. 삽입 시점에서 결과를 증분으로 계산함으로써 쿼리는 훨씬 더 작은 데이터 하위 집합에서 실행되며, 이러한 뷰는 페타바이트 규모의 데이터까지 effortlessly 확장할 수 있습니다. 대부분의 경우 전체 클러스터 성능에 실질적인 영향을 미치지 않습니다.

증분 물리화된 뷰를 사용할 때:

- 매 삽입 시마다 업데이트된 실시간 쿼리 결과가 필요합니다.
- 대량의 데이터를 자주 집계하거나 필터링하고 있습니다.
- 쿼리에 대해 단순한 변환이나 단일 테이블에 대한 집계가 포함되어 있습니다.

증분 물리화된 뷰의 예시는 [여기](/materialized-view/incremental-materialized-view)에서 확인하십시오.

## 갱신 가능 물리화된 뷰를 사용할 때 {#when-to-use-refreshable-materialized-views}

갱신 가능 물리화된 뷰는 증분이 아닌 주기적으로 쿼리를 실행하여 쿼리 결과 집합을 신속하게 검색할 수 있도록 저장합니다.

쿼리 성능이 중요한 경우(예: 서브 밀리세컨드 대기 시간) 약간의 오래된 결과가 허용될 때 가장 유용합니다. 전체 쿼리가 다시 실행되므로, 갱신 가능 뷰는 계산하기 상대적으로 빠르거나 불규칙한 간격(예: 매시간)으로 계산할 수 있는 쿼리에 가장 적합합니다. 이러한 쿼리에는 “상위 N” 결과나 조회 테이블을 캐싱하는 작업이 포함됩니다.

시스템에 과도한 부하를 피하기 위해 실행 빈도는 신중하게 조정해야 합니다. 자원이 많이 소모되는 매우 복잡한 쿼리는 조심스럽게 예약해야 하며, 이들은 캐시 및 CPU와 메모리를 소모하여 전체 클러스터 성능을 저하시킬 수 있습니다. 쿼리는 클러스터 과부하를 피하기 위해 갱신 간격에 비해 상대적으로 빨리 실행되어야 합니다. 예를 들어, 쿼리 자체가 계산하는 데 최소 10초가 걸리면 10초마다 뷰를 갱신하도록 예약하지 마십시오.

## 요약 {#summary}

요약하면, 갱신 가능 물리화된 뷰는 다음과 같은 경우에 사용하십시오:

- 즉시 사용할 수 있는 캐시된 쿼리 결과가 필요하고, 신선도의 약간의 지연이 허용됩니다.
- 쿼리 결과 집합에 대한 상위 N이 필요합니다.
- 결과 집합의 크기가 시간이 지남에 따라 무한정 커지지 않아야 합니다. 이는 대상 뷰의 성능을 저하시키게 됩니다.
- 여러 테이블을 포함하는 복잡한 조인 또는 비정규화 작업을 수행하고, 원본 테이블이 변경될 때마다 업데이트가 필요합니다.
- 배치 워크플로우, 비정규화 작업 또는 DBT DAG와 유사한 뷰 의존성을 구축하고 있을 때입니다.

갱신 가능 물리화된 뷰의 예시는 [여기](/materialized-view/refreshable-materialized-view)에서 확인하십시오.

### APPEND vs REPLACE 모드 {#append-vs-replace-mode}

갱신 가능 물리화된 뷰는 대상 테이블에 데이터를 쓰기 위한 두 가지 모드인 `APPEND`와 `REPLACE`를 지원합니다. 이러한 모드는 뷰가 갱신될 때 쿼리 결과가 기록되는 방식을 정의합니다.

`REPLACE`는 기본 동작입니다. 뷰가 갱신될 때마다, 대상 테이블의 이전 내용은 최신 쿼리 결과로 완전히 덮어씌워집니다. 이는 뷰가 항상 최신 상태를 반영해야 하는 사용 사례에 적합합니다.

반면에 `APPEND`는 새 행이 대상 테이블의 끝에 추가되어 기존 내용을 대체하는 것을 허용합니다. 이는 주기적인 스냅샷을 캡처하는 등의 추가 사용 사례를 가능하게 합니다. `APPEND`는 각 갱신이 특정 시점 또는 결과의 역사적 축적을 나타낼 때 특히 유용합니다.

`APPEND` 모드를 선택하십시오:

- 과거 갱신의 기록을 보존하고 싶을 때.
- 주기적인 스냅샷이나 보고서를 구축하고 있을 때.
- 시간이 지남에 따라 갱신된 결과를 점진적으로 수집해야 할 때.

`REPLACE` 모드를 선택하십시오:

- 최신 결과만 필요할 때.
- 오래된 데이터는 완전히 버려야 할 때.
- 뷰가 현재 상태 또는 조회를 나타낼 때.

사용자는 [Medallion architecture](https://clickhouse.com/blog/building-a-medallion-architecture-for-bluesky-json-data-with-clickhouse)를 구축할 때 `APPEND` 기능을 적용한 사례를 찾아볼 수 있습니다.
