---
slug: /migrations/postgresql/appendix
title: '부록'
keywords: ['postgres', 'postgresql', 'data types', 'types']
description: 'PostgreSQL에서의 마이그레이션과 관련된 추가 정보'
doc_type: 'reference'
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';


## Postgres vs ClickHouse: 유사점과 차이점이 있는 개념들 \{#postgres-vs-clickhouse-equivalent-and-different-concepts\}

OLTP 시스템에서 ACID 트랜잭션에 익숙한 사용자는 ClickHouse가 성능을 위해 이러한 특성을 완전히 제공하지 않는 대신 의도적으로 타협을 택한다는 점을 인지해야 합니다. ClickHouse의 동작 방식을 잘 이해하면 강력한 내구성 보장과 높은 쓰기 처리량을 달성할 수 있습니다. 아래에서는 Postgres 환경에서 ClickHouse를 사용하기 전에 숙지해야 할 몇 가지 핵심 개념을 정리합니다.

### 세그먼트 vs 레플리카 \{#shards-vs-replicas\}

샤딩과 복제(replication)는 스토리지 및/또는 컴퓨트 리소스가 성능의 병목이 될 때 하나의 Postgres 인스턴스를 넘어 확장하기 위해 사용하는 두 가지 전략입니다. Postgres에서의 샤딩은 큰 데이터베이스를 여러 노드에 걸쳐 더 작고 관리하기 쉬운 조각으로 분할하는 것을 의미합니다. 그러나 Postgres는 샤딩을 기본적으로 지원하지 않습니다. 대신 [Citus](https://www.citusdata.com/)와 같은 확장을 사용해 샤딩을 구현할 수 있으며, 이를 통해 Postgres는 수평 확장이 가능한 분산 데이터베이스가 됩니다. 이 접근 방식은 여러 머신에 부하를 분산시켜 Postgres가 더 높은 트랜잭션 처리량과 더 큰 데이터셋을 처리할 수 있도록 합니다. 세그먼트는 트랜잭션 또는 분석과 같은 워크로드 유형에 유연하게 대응하기 위해 행 기준 또는 스키마 기준으로 구성할 수 있습니다. 샤딩은 여러 머신 간의 조정과 일관성 보장이 필요하므로, 데이터 관리와 쿼리 실행 측면에서 상당한 복잡성을 초래할 수 있습니다.

세그먼트와 달리, 레플리카는 기본(primary) 노드의 전체 또는 일부 데이터를 포함하는 추가 Postgres 인스턴스입니다. 레플리카는 읽기 성능 향상 및 HA(High Availability, 고가용성) 시나리오 등 다양한 목적으로 사용됩니다. 물리적 복제는 Postgres의 기본 기능으로, 모든 데이터베이스, 테이블, 인덱스를 포함한 전체 데이터베이스 또는 상당 부분을 다른 서버로 복사하는 방식입니다. 이를 위해 기본 노드에서 레플리카로 WAL 세그먼트를 TCP/IP를 통해 스트리밍합니다. 반면, 논리적 복제는 `INSERT`, `UPDATE`, `DELETE` 작업을 기반으로 변경 사항을 스트리밍하는 더 높은 수준의 추상화입니다. 결과만 놓고 보면 물리적 복제와 유사할 수 있지만, 특정 테이블과 작업을 대상으로 하거나 데이터 변환을 적용하고, 서로 다른 Postgres 버전을 지원하는 등 더 높은 유연성을 제공합니다.

**이에 반해, ClickHouse 세그먼트와 레플리카는 데이터 분산과 중복성에 관련된 두 가지 핵심 개념입니다.** ClickHouse 레플리카는 Postgres 레플리카와 유사한 개념으로 이해할 수 있지만, 복제는 최종적 일관성(eventual consistency)을 가지며 primary 개념이 없습니다. 샤딩은 Postgres와 달리 기본적으로 지원됩니다.

세그먼트는 테이블 데이터의 일부입니다. 항상 최소 하나의 세그먼트를 가지게 됩니다. 데이터를 여러 서버에 걸쳐 샤딩하면 단일 서버의 용량을 초과하는 경우에도 모든 세그먼트를 사용해 쿼리를 병렬로 실행하여 부하를 분산할 수 있습니다. 서로 다른 서버에 대해 테이블의 세그먼트를 수동으로 생성하고, 해당 세گ먼트에 직접 데이터를 삽입할 수 있습니다. 또는 분산 테이블(distributed table)을 사용해 어떤 세그먼트로 데이터가 라우팅될지 정의하는 샤딩 키를 사용할 수도 있습니다. 샤딩 키는 랜덤이거나 해시 함수의 결과일 수 있습니다. 중요한 점은 하나의 세그먼트가 여러 레플리카로 구성될 수 있다는 것입니다.

레플리카는 데이터의 사본입니다. ClickHouse는 항상 데이터의 최소 한 개 사본을 가지므로, 레플리카의 최소 개수는 1개입니다. 두 번째 레플리카를 추가하면 장애 허용(fault tolerance)이 제공되며, 더 많은 쿼리를 처리하기 위한 추가 컴퓨트 자원도 확보됩니다([Parallel Replicas](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov)를 사용하면 단일 쿼리의 컴퓨트를 레플리카 간에 분산하여 지연 시간을 줄일 수도 있습니다). 레플리카는 [ReplicatedMergeTree table engine](/engines/table-engines/mergetree-family/replication)을 통해 구현되며, 이를 통해 ClickHouse는 서로 다른 서버 간에 여러 데이터 사본을 동기화 상태로 유지합니다. 복제는 물리적으로 수행되며, 노드 간에는 쿼리가 아니라 압축된 파트만 전송됩니다.

요약하면, 레플리카는 중복성과 신뢰성(그리고 잠재적으로 분산 처리)을 제공하는 데이터 사본이며, 세그먼트는 분산 처리와 부하 분산을 가능하게 하는 데이터의 부분 집합입니다.

> ClickHouse Cloud는 S3에 저장된 단일 데이터 사본과 여러 컴퓨트 레플리카를 사용합니다. 데이터는 각 레플리카 노드에서 사용 가능하며, 각 노드는 로컬 SSD 캐시를 가집니다. 이는 ClickHouse Keeper를 통한 메타데이터 복제에만 의존합니다.

## Eventual consistency \{#eventual-consistency\}

ClickHouse는 내부 복제(replication) 메커니즘을 관리하기 위해 ClickHouse Keeper(C++ ZooKeeper 구현체, ZooKeeper도 사용할 수 있음)를 사용하며, 메타데이터 저장과 최종 일관성(eventual consistency)을 보장하는 데 중점을 둡니다. Keeper는 분산 환경에서 각 insert 작업에 고유한 순차 번호를 할당하는 데 사용됩니다. 이는 전체 연산에서 순서와 일관성을 유지하는 데 중요합니다. 이 프레임워크는 머지(merge)와 뮤테이션(mutations)과 같은 백그라운드 작업도 처리하여, 해당 작업이 분산되도록 하면서도 모든 레플리카에서 동일한 순서로 실행되도록 보장합니다. 메타데이터 외에도 Keeper는 저장된 데이터 파트(parts)에 대한 체크섬 추적을 포함하여 복제의 종합적인 제어 센터로 동작하며, 레플리카 간 분산 알림 시스템 역할도 수행합니다.

ClickHouse에서의 복제 프로세스는 (1) 데이터가 임의의 레플리카에 insert될 때 시작됩니다. 이 데이터는 원시 insert 형태로 (2) 체크섬과 함께 디스크에 기록됩니다. 기록이 완료되면, 해당 레플리카는 (3) 고유한 블록 번호를 할당받고 새 데이터 파트의 세부 정보를 기록(logging)하여 이 새로운 데이터 파트를 Keeper에 등록하려고 시도합니다. 다른 레플리카들은 (4) 복제 로그에서 새로운 엔트리를 감지하면, (5) 내부 HTTP 프로토콜을 통해 해당 데이터 파트를 다운로드하고 ZooKeeper에 기록된 체크섬과 대조하여 검증합니다. 이 방식은 처리 속도 차이나 잠재적인 지연이 있더라도 모든 레플리카가 결국 일관되고 최신 상태의 데이터를 보유하도록 보장합니다. 또한 시스템은 여러 작업을 동시에 처리할 수 있어, 데이터 관리 프로세스를 최적화하고, 시스템 확장성과 하드웨어 차이에 대한 견고성을 제공합니다.

<Image img={postgresReplicas} size="md" alt="Eventual consistency"/>

ClickHouse Cloud는 스토리지와 컴퓨트 분리 아키텍처에 맞게 조정된 [클라우드 최적화 복제 메커니즘](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)을 사용한다는 점에 유의하십시오. 데이터를 공유 객체 스토리지(object storage)에 저장함으로써, 노드 간에 데이터를 물리적으로 복제할 필요 없이 모든 컴퓨트 노드에서 데이터에 자동으로 접근할 수 있습니다. 대신 Keeper는 컴퓨트 노드 간에 메타데이터(객체 스토리지의 어느 위치에 어떤 데이터가 존재하는지)만 공유하는 데 사용됩니다.

PostgreSQL은 ClickHouse와는 다른 복제 전략을 사용하며, 주로 스트리밍 복제(streaming replication)를 사용합니다. 이는 프라이머리(primary)-레플리카 모델을 기반으로 하며, 프라이머리 노드에서 하나 이상의 레플리카 노드로 데이터가 지속적으로 스트리밍됩니다. 이러한 유형의 복제는 거의 실시간에 가까운 일관성을 보장하며, 동기(synchronous) 또는 비동기(asynchronous) 방식으로 동작하여 관리자가 가용성과 일관성 간 균형을 제어할 수 있게 합니다. ClickHouse와 달리 PostgreSQL은 노드 간 데이터 객체와 변경 사항을 스트리밍하기 위해 논리적 복제(logical replication)와 디코딩을 수반하는 WAL(Write-Ahead Logging)에 의존합니다. PostgreSQL의 이러한 접근 방식은 더 단순하지만, 고도로 분산된 환경에서 ClickHouse가 Keeper를 복잡하게 활용하여 분산 작업 조정과 최종 일관성을 달성하는 수준의 확장성과 장애 허용(fault tolerance)을 제공하지 못할 수 있습니다.

## 사용자에 대한 영향 \{#user-implications\}

ClickHouse에서는 한 레플리카에 데이터를 기록한 뒤, 다른 레플리카에서 아직 복제되지 않은 데이터를 읽게 되는 dirty 읽기가 발생할 수 있습니다. 이는 Keeper가 관리하는 최종 일관성 복제 모델에서 비롯됩니다. 이 모델은 분산 시스템 전반에서 성능과 확장성을 강조하며, 레플리카가 독립적으로 동작하고 비동기적으로 동기화되도록 합니다. 그 결과, 복제 지연과 시스템 전반에 변경 사항이 전파되는 데 걸리는 시간에 따라, 새로 삽입된 데이터가 모든 레플리카에서 즉시 보이지 않을 수 있습니다.

반면에 PostgreSQL의 스트리밍 복제 모델은 기본(primary)이 트랜잭션을 커밋하기 전에 최소 한 개의 레플리카가 데이터 수신을 확인하도록 하는 동기식 복제 옵션을 사용하여, 일반적으로 dirty 읽기를 방지할 수 있습니다. 이 방식은 한 번 트랜잭션이 커밋되면 다른 레플리카에도 해당 데이터가 존재한다는 보장을 제공합니다. 기본 노드에 장애가 발생하더라도 레플리카를 통해 쿼리가 항상 커밋된 데이터만 조회되도록 보장함으로써, 더 엄격한 수준의 일관성을 유지합니다.

## 권장 사항 \{#recommendations\}

ClickHouse를 처음 접하는 사용자는 이러한 차이점이 레플리카 환경에서 나타난다는 점을 인지해야 합니다. 일반적으로 수십억, 많게는 수조 개의 데이터 포인트를 대상으로 하는 분석 워크로드에서는 최종 일관성으로도 충분합니다. 이 경우 새로운 데이터가 매우 높은 속도로 지속적으로 삽입되므로, 메트릭은 비교적 안정적이거나 추정치만으로도 충분합니다.

읽기 일관성을 더 높여야 하는 경우 사용할 수 있는 여러 옵션이 있습니다. 두 가지 예시는 모두 복잡성과 오버헤드를 증가시켜 쿼리 성능을 저하시킬 뿐 아니라 ClickHouse 확장을 더 어렵게 만듭니다. **이러한 접근 방식은 절대적으로 필요한 경우에만 사용할 것을 권장합니다.**

## Consistent routing \{#consistent-routing\}

최종 일관성의 일부 한계를 극복하려면 클라이언트가 항상 동일한 레플리카로 라우팅되도록 구성할 수 있습니다. 이는 여러 사용자가 ClickHouse에 쿼리를 보내며, 요청 간에 결과가 결정적으로 동일하게 유지되어야 하는 경우에 유용합니다. 새로운 데이터가 삽입됨에 따라 결과는 달라질 수 있지만, 항상 동일한 레플리카에 대해 쿼리하도록 하면 일관된 결과를 보장할 수 있습니다.

이는 아키텍처와 ClickHouse OSS를 사용하는지, 아니면 ClickHouse Cloud를 사용하는지에 따라 여러 가지 접근 방식으로 구현할 수 있습니다.

## ClickHouse Cloud \{#clickhouse-cloud\}

ClickHouse Cloud는 여러 개의 컴퓨트 레플리카를 사용하면서 S3에 저장된 단일 데이터 사본을 백엔드로 사용합니다. 각 레플리카 노드는 로컬 SSD 캐시를 가지며, 데이터는 각 레플리카 노드에서 사용할 수 있습니다. 결과의 일관성을 보장하려면 동일한 노드로 일관되게 라우팅되도록 하기만 하면 됩니다.

ClickHouse Cloud 서비스의 노드와의 통신은 프록시를 통해 이루어집니다. HTTP 및 Native 프로토콜 연결은 열려 있는 동안 동일한 노드로 라우팅됩니다. 대부분의 클라이언트에서 사용하는 HTTP 1.1 연결의 경우, 이는 Keep-Alive 기간에 따라 달라집니다. 이 값은 대부분의 클라이언트(예: Node.js)에서 설정할 수 있습니다. 또한 서버 측 설정도 필요하며, 이는 클라이언트보다 크게 설정되며 ClickHouse Cloud에서는 10초로 설정되어 있습니다.

연결 풀을 사용하거나 연결이 만료되는 경우 등 여러 연결에 걸쳐 일관된 라우팅을 보장하려면, 동일한 연결을 사용하도록 구성(네이티브 프로토콜에서 더 용이)하거나 sticky endpoint 노출을 요청하면 됩니다. 이렇게 하면 클러스터의 각 노드에 대해 endpoint 집합이 제공되어 클라이언트가 쿼리가 결정론적으로 라우팅되도록 할 수 있습니다.

> sticky endpoint에 대한 액세스는 지원팀에 문의하십시오.

## ClickHouse OSS \{#clickhouse-oss\}

OSS에서 이 동작을 구현하려면 세그먼트와 레플리카 토폴로지, 그리고 쿼리를 위해 [분산 테이블](/engines/table-engines/special/distributed)을 사용하는지 여부에 따라 달라집니다.

세그먼트가 1개이고 여러 레플리카가 있는 경우(ClickHouse가 수직 확장을 하기 때문에 일반적입니다), 클라이언트 계층에서 노드를 선택하여 특정 레플리카에 직접 쿼리를 보내도록 구성하여, 항상 동일한 레플리카가 결정론적으로 선택되도록 합니다.

여러 세ग먼트와 레플리카가 있는 토폴로지는 분산 테이블 없이도 구성할 수 있지만, 이러한 고급 배포는 일반적으로 자체 라우팅 인프라를 보유합니다. 따라서 1개를 초과하는 세그먼트를 사용하는 배포는 분산 테이블을 사용한다고 가정합니다(분산 테이블은 단일 세그먼트 배포에서도 사용할 수 있지만, 보통은 필요하지 않습니다).

이 경우 `session_id` 또는 `user_id`와 같은 속성에 기반하여 일관된 노드 라우팅이 이루어지도록 해야 합니다. [`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica), [`load_balancing=in_order`](/operations/settings/settings#load_balancing) 설정을 [쿼리에서 설정](/operations/settings/query-level)해야 합니다. 이렇게 하면 세그먼트의 로컬 레플리카가 우선적으로 선택되고, 그렇지 않은 경우 구성에 나열된 순서대로 레플리카가 선호됩니다. 단, 오류 수가 동일한 경우에 한하며, 오류 수가 더 많으면 무작위 선택 방식으로 페일오버가 발생합니다. 이와 같은 결정론적인 세그먼트 선택을 위해 [`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing)을 대안으로 사용할 수도 있습니다.

> 분산 테이블을 생성할 때는 클러스터를 지정합니다. 이 클러스터 정의는 config.xml에 지정되며, 세그먼트(및 해당 레플리카)를 나열합니다. 이를 통해 각 노드에서 어떤 세그먼트와 레플리카가 어떤 순서로 사용될지 제어할 수 있습니다. 이를 활용하면 선택이 결정론적으로 이루어지도록 보장할 수 있습니다.

## 순차적 일관성 \{#sequential-consistency\}

예외적인 경우에는 순차적 일관성이 필요할 수 있습니다.

데이터베이스에서의 순차적 일관성이란 데이터베이스에 대한 연산들이 어떤 연속적인 하나의 순서로 실행되는 것처럼 보이고, 이 순서가 데이터베이스와 상호 작용하는 모든 프로세스에서 동일하게 유지되는 상태를 의미합니다. 즉, 각 연산이 호출과 완료 사이의 어느 시점에 순간적으로 효과를 발휘하는 것처럼 보이며, 모든 연산이 어떤 프로세스에 의해서든 동일하고 합의된 하나의 순서로 관찰되는 것을 말합니다.

사용자 관점에서는 일반적으로 ClickHouse에 데이터를 기록한 뒤 데이터를 읽을 때, 가장 최근에 삽입된 행이 반환되도록 보장해야 하는 요구로 나타납니다.
이는 다음과 같은 여러 방법으로 (선호 순으로) 달성할 수 있습니다:

1. **동일한 노드에 읽기/쓰기** - 네이티브 프로토콜을 사용하거나 [HTTP 세션을 통해 쓰기/읽기](/interfaces/http#default-database)를 수행하는 경우, 동일한 레플리카에 연결되어 있어야 합니다. 이 시나리오에서는 데이터를 기록하는 노드에서 직접 읽기를 수행하므로, 읽기가 항상 일관되게 유지됩니다.
1. **레플리카를 수동으로 동기화** - 한 레플리카에 쓰고 다른 레플리카에서 읽는 경우, 읽기 전에 `SYSTEM SYNC REPLICA LIGHTWEIGHT`를 실행할 수 있습니다.
1. **순차적 일관성 활성화** - 쿼리 설정 [`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)을 통해 활성화합니다. OSS에서는 `insert_quorum = 'auto'` 설정도 함께 지정해야 합니다.

<br />

이러한 설정을 활성화하는 방법에 대한 자세한 내용은 [여기](/cloud/reference/shared-merge-tree#consistency)를 참조하십시오.

> 순차적 일관성을 사용하면 ClickHouse Keeper에 더 큰 부하가 가해집니다. 그 결과
삽입과 읽기가 더 느려질 수 있습니다. ClickHouse Cloud에서 기본 테이블 엔진으로 사용되는 SharedMergeTree에서는 순차적 일관성이 [오버헤드가 더 적고 확장성이 더 좋습니다](/cloud/reference/shared-merge-tree#consistency). OSS에서는 이 접근 방식을 신중하게 사용하고 Keeper 부하를 측정해야 합니다.

## Transactional (ACID) support \{#transactional-acid-support\}

PostgreSQL에서 마이그레이션하는 사용자는 트랜잭션 데이터베이스에 적합한 신뢰할 수 있는 선택지로 만들어 주는 ACID(Atomicity, Consistency, Isolation, Durability) 특성에 대한 PostgreSQL의 강력한 지원에 익숙할 수 있습니다. PostgreSQL의 Atomicity는 각 트랜잭션이 단일 단위로 처리되도록 보장하여 전적으로 성공하거나 완전히 롤백되도록 함으로써, 부분 업데이트를 방지합니다. Consistency는 제약 조건, 트리거, 규칙을 강제 적용하여 모든 데이터베이스 트랜잭션이 유효한 상태로 이어지도록 보장함으로써 유지됩니다. Read Committed부터 Serializable까지의 Isolation 수준이 PostgreSQL에서 지원되며, 동시 트랜잭션에 의해 수행된 변경 사항의 가시성을 세밀하게 제어할 수 있도록 합니다. 마지막으로 Durability는 write-ahead logging(WAL)을 통해 달성되며, 한 번 트랜잭션이 커밋되면 시스템 장애가 발생하더라도 해당 상태가 유지되도록 보장합니다.

이러한 특성은 단일 진실의 원천(source of truth) 역할을 하는 OLTP 데이터베이스에서 일반적입니다.

이 기능은 강력하지만 그에 따른 고유한 한계가 존재하며, 페타바이트(PB)급 규모를 다루기 어렵게 만듭니다. ClickHouse는 대규모 환경에서 높은 쓰기 처리량을 유지하면서도 빠른 분석 쿼리를 제공하기 위해 이러한 특성 일부를 희생합니다.

ClickHouse는 [제한된 구성](/guides/developer/transactional)에서 ACID 특성을 제공합니다. 가장 단순한 예로, 하나의 파티션만 사용하는 비복제(Non-replicated) MergeTree 테이블 엔진 인스턴스를 사용할 때입니다. 이러한 경우 외에는 해당 특성을 기대해서는 안 되며, 해당 특성이 필수 요건이 아닌 사용 사례에서만 사용해야 합니다.

## 압축 \{#compression\}

ClickHouse의 컬럼 지향 스토리지 구조로 인해 Postgres와 비교했을 때 압축률이 훨씬 더 뛰어난 경우가 많습니다. 다음은 두 데이터베이스에서 모든 Stack Overflow 테이블의 저장 공간 요구 사항을 비교한 예시입니다:

```sql title="Query (Postgres)"
SELECT
    schemaname,
    tablename,
    pg_total_relation_size(schemaname || '.' || tablename) AS total_size_bytes,
    pg_total_relation_size(schemaname || '.' || tablename) / (1024 * 1024 * 1024) AS total_size_gb
FROM
    pg_tables s
WHERE
    schemaname = 'public';
```

```sql title="Query (ClickHouse)"
SELECT
        `table`,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size
FROM system.parts
WHERE (database = 'stackoverflow') AND active
GROUP BY `table`
```

```response title="Response"
┌─table───────┬─compressed_size─┐
│ posts       │ 25.17 GiB       │
│ users       │ 846.57 MiB      │
│ badges      │ 513.13 MiB      │
│ comments    │ 7.11 GiB        │
│ votes       │ 1.28 GiB        │
│ posthistory │ 40.44 GiB       │
│ postlinks   │ 79.22 MiB       │
└─────────────┴─────────────────┘
```

압축 최적화와 측정에 대한 자세한 내용은 [여기](/data-compression/compression-in-clickhouse)를 참고하십시오.


## 데이터 타입 매핑 \{#data-type-mappings\}

다음 표는 Postgres 데이터 타입에 해당하는 ClickHouse 데이터 타입을 보여줍니다.

| Postgres 데이터 타입 | ClickHouse 타입 |
| --- | --- |
| `DATE` | [Date](/sql-reference/data-types/date) |
| `TIMESTAMP` | [DateTime](/sql-reference/data-types/datetime) |
| `REAL` | [Float32](/sql-reference/data-types/float) |
| `DOUBLE` | [Float64](/sql-reference/data-types/float) |
| `DECIMAL, NUMERIC` | [Decimal](/sql-reference/data-types/decimal) |
| `SMALLINT` | [Int16](/sql-reference/data-types/int-uint) |
| `INTEGER` | [Int32](/sql-reference/data-types/int-uint) |
| `BIGINT` | [Int64](/sql-reference/data-types/int-uint) |
| `SERIAL` | [UInt32](/sql-reference/data-types/int-uint) |
| `BIGSERIAL` | [UInt64](/sql-reference/data-types/int-uint) |
| `TEXT, CHAR, BPCHAR` | [String](/sql-reference/data-types/string) |
| `INTEGER` | Nullable([Int32](/sql-reference/data-types/int-uint)) |
| `ARRAY` | [Array](/sql-reference/data-types/array) |
| `FLOAT4` | [Float32](/sql-reference/data-types/float) |
| `BOOLEAN` | [Bool](/sql-reference/data-types/boolean) |
| `VARCHAR` | [String](/sql-reference/data-types/string) |
| `BIT` | [String](/sql-reference/data-types/string) |
| `BIT VARYING` | [String](/sql-reference/data-types/string) |
| `BYTEA` | [String](/sql-reference/data-types/string) |
| `NUMERIC` | [Decimal](/sql-reference/data-types/decimal) |
| `GEOGRAPHY` | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon) |
| `GEOMETRY` | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon) |
| `INET` | [IPv4](/sql-reference/data-types/ipv4), [IPv6](/sql-reference/data-types/ipv6) |
| `MACADDR` | [String](/sql-reference/data-types/string) |
| `CIDR` | [String](/sql-reference/data-types/string) |
| `HSTORE` | [Map(K, V)](/sql-reference/data-types/map), [Map](/sql-reference/data-types/map)(K,[Variant](/sql-reference/data-types/variant)) |
| `UUID` | [UUID](/sql-reference/data-types/uuid) |
| `ARRAY<T>` | [ARRAY(T)](/sql-reference/data-types/array) |
| `JSON` | [String](/sql-reference/data-types/string), [Variant](/sql-reference/data-types/variant), [Nested](/sql-reference/data-types/nested-data-structures/nested#nestedname1-type1-name2-type2-), [Tuple](/sql-reference/data-types/tuple) |
| `JSONB` | [String](/sql-reference/data-types/string) |