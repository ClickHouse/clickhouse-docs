---
slug: /about-us/distinctive-features
sidebar_label: 'ClickHouse가 특별한 이유'
sidebar_position: 50
description: 'ClickHouse가 다른 데이터베이스 관리 시스템과 어떻게 차별화되는지 알아봅니다'
title: 'ClickHouse의 고유한 특징'
keywords: ['compression', 'secondary-indexes','column-oriented']
doc_type: 'guide'
---

# ClickHouse의 주요 특징 \{#distinctive-features-of-clickhouse\}

## 진정한 컬럼 지향 데이터베이스 관리 시스템 \{#true-column-oriented-database-management-system\}

진정한 컬럼 지향 DBMS에서는 값과 함께 불필요한 추가 데이터가 저장되지 않습니다. 이는 값의 길이를 나타내는 「숫자」를 값 옆에 따로 저장하지 않기 위해, 반드시 고정 길이 값을 지원해야 함을 의미합니다. 예를 들어, 10억 개의 `UInt8` 타입 값은 압축하지 않은 상태에서 약 1 GB 정도만 사용해야 하며, 이 기준을 벗어나면 CPU 사용량에 크게 영향을 미칩니다. 압축되지 않은 상태에서도 데이터가 불필요한 「잡동사니」 없이 컴팩트하게 저장되는 것이 중요합니다. 압축 해제 속도(사용되는 CPU 자원)는 주로 압축을 풀었을 때의 데이터 양에 의해 결정되기 때문입니다.

이는 서로 다른 컬럼의 값을 분리해서 저장할 수는 있지만, HBase, Bigtable, Cassandra, Hypertable처럼 다른 시나리오에 최적화되어 있어 분석 쿼리를 효율적으로 처리하지 못하는 시스템과는 대조적입니다. 이러한 시스템에서는 초당 약 수십만 행 정도의 처리량은 가능하지만, 초당 수억 행 수준의 처리량은 달성하지 못합니다.

마지막으로, ClickHouse는 단일 데이터베이스가 아니라 데이터베이스 관리 시스템입니다. 런타임에 테이블과 데이터베이스를 생성하고, 데이터를 적재하며, 서버를 재구성하거나 재시작할 필요 없이 쿼리를 실행할 수 있습니다.

## 데이터 압축 \{#data-compression\}

일부 컬럼 지향 DBMS는 데이터 압축을 사용하지 않습니다. 그러나 데이터 압축은 뛰어난 성능을 구현하는 데 핵심적인 역할을 합니다.

디스크 공간과 CPU 사용량 사이에서 서로 다른 트레이드오프를 가지는 효율적인 범용 압축 코덱뿐만 아니라, ClickHouse는 특정 종류의 데이터에 특화된 [전용 코덱](/sql-reference/statements/create/table.md#specialized-codecs)을 제공합니다. 이를 통해 ClickHouse는 시계열 데이터베이스와 같은 특수 목적의 데이터베이스와 경쟁하거나 이를 능가할 수 있습니다.

## 데이터의 디스크 저장 \{#disk-storage-of-data\}

데이터를 기본 키(primary key) 기준으로 물리적으로 정렬된 상태로 유지하면, 특정 값이나 값 범위에 기반한 데이터를 수십 밀리초 이하의 짧은 지연 시간으로 조회할 수 있습니다. SAP HANA, Google PowerDrill과 같은 일부 컬럼 지향 DBMS는 RAM에서만 동작할 수 있습니다. 이러한 접근 방식은 실시간 분석에 필요한 것보다 더 큰 하드웨어 예산을 요구합니다.

ClickHouse는 일반 하드 드라이브에서 동작하도록 설계되어 GB당 데이터 저장 비용이 낮습니다. 또한 사용 가능한 경우 SSD와 추가 RAM도 최대한 활용합니다.

## 여러 코어에서의 병렬 처리 \{#parallel-processing-on-multiple-cores\}

대규모 쿼리는 현재 서버에서 사용 가능한 모든 필요한 리소스를 활용하도록 자동으로 병렬화됩니다.

## 여러 서버에서의 분산 처리 \{#distributed-processing-on-multiple-servers\}

앞서 언급한 열 지향 DBMS 대부분은 분산 쿼리 처리를 지원하지 않습니다.

ClickHouse에서는 데이터가 서로 다른 세그먼트에 위치할 수 있습니다. 각 세그먼트는 장애 허용을 위한 레플리카 그룹이 될 수 있습니다. 모든 세그먼트가 함께, 사용자 입장에서는 투명하게, 쿼리를 병렬로 실행하는 데 사용됩니다.

## SQL 지원 \{#sql-support\}

ClickHouse는 ANSI SQL 표준과 대부분 호환되는 SQL 기반의 [선언적 쿼리 언어](/sql-reference/)를 지원합니다.

지원되는 쿼리에는 [GROUP BY](../sql-reference/statements/select/group-by.md), [ORDER BY](../sql-reference/statements/select/order-by.md), [FROM](../sql-reference/statements/select/from.md) 절의 서브쿼리, [JOIN](../sql-reference/statements/select/join.md) 절, [IN](../sql-reference/operators/in.md) 연산자, [윈도 함수](../sql-reference/window-functions/index.md) 및 스칼라 서브쿼리가 포함됩니다.

상관 서브쿼리(의존 서브쿼리)는 현재 시점에는 지원되지 않지만, 향후 제공될 수 있습니다.

## 벡터 연산 엔진 \{#vector-engine\}

데이터는 컬럼별로만 저장되는 것이 아니라 벡터(컬럼의 일부 구간) 단위로 처리되어 높은 CPU 효율을 제공합니다.

## 실시간 데이터 삽입 \{#real-time-data-updates\}

ClickHouse는 기본 키를 사용하는 테이블을 지원합니다. 기본 키 범위에 대한 쿼리를 빠르게 수행하기 위해 데이터는 MergeTree를 사용하여 증분적으로 정렬됩니다. 따라서 테이블에 데이터를 지속적으로 추가할 수 있습니다. 새로운 데이터가 수집될 때 잠금을 걸지 않습니다.

## 기본 인덱스 \{#primary-index\}

데이터를 기본 키(primary key)에 따라 물리적으로 정렬해 두면, 특정 값이나 값 범위를 기준으로 데이터를 추출할 때 수십 밀리초 미만의 낮은 지연 시간으로 처리할 수 있습니다.

## 보조 인덱스 \{#secondary-indexes\}

다른 데이터베이스 관리 시스템과 달리 ClickHouse의 보조 인덱스는 특정 행이나 행 범위를 가리키지 않습니다. 대신 데이터베이스가 미리, 일부 데이터 파트 내의 모든 행이 쿼리의 필터링 조건과 일치하지 않는다는 것을 알 수 있게 하여 해당 파트를 아예 읽지 않도록 합니다. 이러한 이유로 [데이터 스키핑 인덱스](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)라고 부릅니다.

## 온라인 쿼리에 적합함 \{#suitable-for-online-queries\}

대부분의 OLAP 데이터베이스 관리 시스템은 1초 미만 지연 시간의 온라인 쿼리를 목표로 하지 않습니다. 다른 시스템에서는 수십 초 또는 심지어 수분이 소요되는 보고서 생성 시간도 종종 허용 가능한 수준으로 간주됩니다. 때로는 그보다 더 오래 걸리기도 하여, 보고서를 미리 오프라인으로 준비하거나 「나중에 다시 오십시오」와 같이 응답하도록 시스템이 동작하기도 합니다.

ClickHouse에서 「저지연」이란, 사용자 인터페이스 페이지가 로드되는 바로 그 시점에, 사전에 응답을 준비하려는 시도 없이 지연 없이 쿼리를 처리할 수 있다는 의미입니다. 다시 말해, *온라인*으로 처리할 수 있음을 의미합니다.

## 근사 계산 지원 \{#support-for-approximated-calculations\}

ClickHouse는 정확도와 성능을 절충할 수 있는 다양한 방법을 제공합니다:

1.  서로 다른 값의 개수, 중앙값, 분위수를 근사 계산하기 위한 집계 함수들.
2.  데이터의 일부([SAMPLE](../sql-reference/statements/select/sample.md))에 기반해 쿼리를 실행하고 근사 결과를 얻는 방법. 이 경우 디스크에서 읽어 오는 데이터 양이 그에 비례해 줄어듭니다.
3.  모든 키가 아니라 제한된 개수의 임의의 키에 대해서만 집계를 실행하는 방법. 데이터에서 키 분포가 특정 조건을 만족할 때 더 적은 리소스를 사용하면서도 충분히 정확한 결과를 제공합니다.

## 적응형 조인 알고리즘 \{#adaptive-join-algorithm\}

ClickHouse는 여러 테이블을 [JOIN](../sql-reference/statements/select/join.md)할 때, 우선적으로 해시 조인(hash join)을 사용하고 대용량 테이블이 여러 개일 경우 머지 조인(merge join)으로 전환하는 방식으로 조인 방식을 적응적으로 선택합니다.

## 데이터 복제(replication) 및 데이터 무결성 지원 \{#data-replication-and-data-integrity-support\}

ClickHouse는 비동기 멀티 마스터 복제(asynchronous multi-master replication)를 사용합니다. 사용 가능한 레플리카 중 하나에 데이터가 기록되면, 나머지 레플리카들은 백그라운드에서 해당 데이터의 사본을 가져옵니다. 시스템은 모든 레플리카 간에 데이터를 동일하게 유지합니다. 대부분의 장애에 대한 복구는 자동으로 수행되며, 복잡한 경우에는 반자동으로 수행됩니다.

자세한 내용은 [데이터 복제(Data replication)](../engines/table-engines/mergetree-family/replication.md) 섹션을 참조하십시오.

## 역할 기반 접근 제어(Role-Based Access Control) \{#role-based-access-control\}

ClickHouse는 SQL 쿼리를 사용하여 사용자 계정 관리 기능을 구현하고, ANSI SQL 표준과 널리 사용되는 관계형 데이터베이스 관리 시스템에서 제공되는 것과 유사한 [역할 기반 접근 제어 구성](/guides/sre/user-management/index.md)을 지원합니다.

## 단점으로 간주될 수 있는 기능 \{#clickhouse-features-that-can-be-considered-disadvantages\}

1.  완전한 트랜잭션 기능이 없습니다.
2.  이미 삽입된 데이터를 높은 처리량과 낮은 지연 시간으로 수정하거나 삭제하는 기능이 부족합니다. 예를 들어 [GDPR](https://gdpr-info.eu)을 준수하기 위해 데이터를 정리하거나 수정할 수 있도록 일괄 삭제 및 업데이트 작업이 제공됩니다.
3.  희소 인덱스 때문에 키로 단일 행을 조회하는 포인트 쿼리를 수행할 때 ClickHouse는 그다지 효율적이지 않습니다.