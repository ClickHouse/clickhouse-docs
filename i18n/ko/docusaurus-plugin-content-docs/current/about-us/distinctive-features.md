---
'slug': '/about-us/distinctive-features'
'sidebar_label': 'ClickHouse가 독특한 이유는 무엇인가?'
'sidebar_position': 50
'description': '다른 데이터베이스 관리 시스템과 ClickHouse를 구별짓는 요소를 이해하세요.'
'title': 'ClickHouse의 독특한 특징'
'keywords':
- 'compression'
- 'secondary-indexes'
- 'column-oriented'
'doc_type': 'guide'
---



# ClickHouse의 특징

## 진정한 컬럼형 데이터베이스 관리 시스템 {#true-column-oriented-database-management-system}

진정한 컬럼형 DBMS에서는 값과 함께 추가 데이터가 저장되지 않습니다. 이는 길이를 저장하지 않기 위해 고정 길이 값을 지원해야 함을 의미합니다. 예를 들어, 10억 개의 UInt8 유형 값은 압축되지 않은 상태에서 대략 1GB를 차지해야 하며, 그렇지 않으면 CPU 사용에 강한 영향을 미칩니다. 압축되지 않은 상태에서도 데이터를 간결하게 저장하는 것은 필수적입니다("쓰레기" 없이) 왜냐하면 압축 해제 속도(CPU 사용량)가 주로 압축되지 않은 데이터의 양에 따라 달라지기 때문입니다.

이는 값을 별도로 저장할 수 있지만, HBase, Bigtable, Cassandra, Hypertable과 같은 다른 시나리오에 최적화되어 있어 분석 쿼리를 효과적으로 처리할 수 없는 시스템과 대조적입니다. 이러한 시스템에서는 초당 약 십만 개의 행을 처리할 수 있지만, 수억 개의 행을 처리할 수는 없습니다.

마지막으로, ClickHouse는 단일 데이터베이스가 아닌 데이터베이스 관리 시스템입니다. 이는 서버를 재구성하거나 재시작하지 않고도 런타임에 테이블과 데이터베이스를 생성하고, 데이터를 로드하며 쿼리를 실행할 수 있게 합니다.

## 데이터 압축 {#data-compression}

일부 컬럼형 DBMS는 데이터 압축을 사용하지 않습니다. 그러나 데이터 압축은 뛰어난 성능을 달성하는 데 중요한 역할을 합니다.

ClickHouse는 디스크 공간과 CPU 소비 간의 서로 다른 트레이드오프를 가진 효율적인 범용 압축 코덱 외에도, 특정 데이터 유형을 위한 [전문 코덱](/sql-reference/statements/create/table.md#specialized-codecs)을 제공하여 ClickHouse가 시간 시리즈와 같은 더 전문화된 데이터베이스와 경쟁하고 이를 능가할 수 있게 합니다.

## 데이터의 디스크 저장 {#disk-storage-of-data}

기본 키에 의해 물리적으로 정렬된 데이터를 유지하면 특정 값이나 값 범위에 따라 낮은 대기 시간(수십 밀리초 이내)으로 데이터를 추출할 수 있습니다. SAP HANA와 Google PowerDrill과 같은 일부 컬럼형 DBMS는 RAM에서만 작동할 수 있습니다. 이 접근 방식은 실시간 분석을 위해 필요 이상의 하드웨어 예산 할당이 필요합니다.

ClickHouse는 일반 하드 드라이브에서 작업하도록 설계되었으며, 이는 데이터 저장의 GB당 비용이 낮음을 의미하지만, SSD 및 추가 RAM도 가능한 경우 완전히 활용됩니다.

## 여러 코어에서의 병렬 처리 {#parallel-processing-on-multiple-cores}

대규모 쿼리는 자연스럽게 병렬화되어 현재 서버에서 사용 가능한 모든 리소스를 사용합니다.

## 여러 서버에서의 분산 처리 {#distributed-processing-on-multiple-servers}

위에 언급된 거의 모든 컬럼형 DBMS는 분산 쿼리 처리를 지원하지 않습니다.

ClickHouse에서는 데이터가 서로 다른 샤드에 저장될 수 있습니다. 각 샤드는 내결함성을 위해 사용되는 복제본 그룹이 될 수 있습니다. 모든 샤드는 사용자가 투명하게 쿼리를 병렬로 실행하는 데 사용됩니다.

## SQL 지원 {#sql-support}

ClickHouse는 대부분 ANSI SQL 표준과 호환되는 SQL 기반의 [선언적 쿼리 언어](/sql-reference/)를 지원합니다.

지원되는 쿼리에는 [GROUP BY](../sql-reference/statements/select/group-by.md), [ORDER BY](../sql-reference/statements/select/order-by.md), [FROM](../sql-reference/statements/select/from.md) 문 내의 서브쿼리, [JOIN](../sql-reference/statements/select/join.md) 절, [IN](../sql-reference/operators/in.md) 연산자, [윈도우 함수](../sql-reference/window-functions/index.md) 및 스칼라 서브쿼리가 포함됩니다.

서로 연관된(의존하는) 서브쿼리는 현재 작성 시점에서는 지원되지 않지만, 미래에 제공될 가능성이 있습니다.

## 벡터 계산 엔진 {#vector-engine}

데이터는 컬럼별로 저장될 뿐만 아니라 벡터(컬럼의 일부)로 처리되어 높은 CPU 효율성을 달성할 수 있게 합니다.

## 실시간 데이터 삽입 {#real-time-data-updates}

ClickHouse는 기본 키가 있는 테이블을 지원합니다. 기본 키 범위에 대한 쿼리를 빠르게 수행하기 위해 데이터는 병합 트리를 사용하여 점진적으로 정렬됩니다. 이로 인해 데이터가 테이블에 지속적으로 추가될 수 있습니다. 새로운 데이터가 수집될 때는 잠금을 설정하지 않습니다.

## 기본 인덱스 {#primary-index}

기본 키에 의해 물리적으로 정렬된 데이터는 특정 값 또는 값 범위에 따라 낮은 대기 시간(수십 밀리초 이내)으로 데이터를 추출할 수 있게 합니다.

## 보조 인덱스 {#secondary-indexes}

다른 데이터베이스 관리 시스템과 달리, ClickHouse의 보조 인덱스는 특정 행이나 행 범위를 가리키지 않습니다. 대신, 데이터베이스가 일부 데이터 파트의 모든 행이 쿼리 필터링 조건에 일치하지 않을 것임을 미리 알 수 있어, 이를 전혀 읽지 않도록 하여 [데이터 스킵 인덱스](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)라고 불립니다.

## 온라인 쿼리에 적합 {#suitable-for-online-queries}

대부분의 OLAP 데이터베이스 관리 시스템은 초 단위 대기 시간을 목표로 하지 않습니다. 대체 시스템에서는 수십 초 또는 몇 분의 보고서 작성 시간이 종종 수용 가능하다고 간주됩니다. 때때로 더 많은 시간이 걸리기도 하여 시스템이 보고서를 오프라인에서 준비하도록 강제합니다(미리 또는 "나중에 다시 오세요"라는 응답으로).

ClickHouse에서 "낮은 대기 시간"은 쿼리를 지연 없이 처리할 수 있으며 사용자가 인터페이스 페이지를 로딩하는 순간에 미리 준비된 답변을 시도하지 않고 바로 처리할 수 있음을 의미합니다 — 다시 말해, *온라인*입니다.

## 근사 계산 지원 {#support-for-approximated-calculations}

ClickHouse는 성능을 위해 정확성을 거래할 수 있는 다양한 방법을 제공합니다:

1. 고유 값 수, 중앙값 및 사분위를 근사적으로 계산하기 위한 집계 함수.
2. 데이터의 일부([SAMPLE](../sql-reference/statements/select/sample.md))를 기반으로 쿼리를 실행하고 근사적인 결과를 얻기. 이 경우 디스크에서 비례적으로 적은 데이터를 검색합니다.
3. 모든 키가 아닌 제한된 수의 무작위 키에 대해 집계를 실행합니다. 데이터의 키 분포에 대한 특정 조건에서, 이는 적은 리소스를 사용하면서도 reasonably 정확한 결과를 제공합니다.

## 적응형 조인 알고리즘 {#adaptive-join-algorithm}

ClickHouse는 여러 테이블을 [JOIN](../sql-reference/statements/select/join.md)할 때 적응적으로 선택하며, 해시 조인을 선호하고 큰 테이블이 두 개 이상인 경우 병합 조인으로 되돌립니다.

## 데이터 복제 및 데이터 무결성 지원 {#data-replication-and-data-integrity-support}

ClickHouse는 비동기 다중 마스터 복제를 사용합니다. 사용 가능한 복제본에 기록된 후, 모든 나머지 복제본은 백그라운드에서 자신의 복사본을 수신합니다. 시스템은 서로 다른 복제본에서 동일한 데이터를 유지합니다. 대부분의 장애 후 복구는 자동으로 수행되거나 복잡한 사례에서는 반자동으로 진행됩니다.

자세한 내용은 [데이터 복제](../engines/table-engines/mergetree-family/replication.md) 섹션을 참조하십시오.

## 역할 기반 접근 제어 {#role-based-access-control}

ClickHouse는 SQL 쿼리를 사용한 사용자 계정 관리를 구현하고, ANSI SQL 표준 및 인기 있는 관계형 데이터베이스 관리 시스템에서 찾아볼 수 있는 [역할 기반 접근 제어 구성](/guides/sre/user-management/index.md)을 허용합니다.

## 단점으로 간주될 수 있는 특징 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  완전한 거래 지원 없음.
2.  높은 비율과 낮은 대기 시간으로 이미 삽입된 데이터를 수정하거나 삭제할 수 있는 기능 부족. 예를 들어, [GDPR](https://gdpr-info.eu) 준수를 위해 데이터를 정리하거나 수정하기 위한 배치 삭제 및 업데이트가 가능합니다.
3.  스파스 인덱스 때문에 ClickHouse는 키로 단일 행을 검색하는 포인트 쿼리에 대해 그리 효율적이지 않습니다.
