---
'slug': '/migrations/postgresql/appendix'
'title': '부록'
'keywords':
- 'postgres'
- 'postgresql'
- 'data types'
- 'types'
'description': 'PostgreSQL에서 마이그레이션하는 것과 관련된 추가 정보'
'doc_type': 'reference'
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';

## Postgres vs ClickHouse: Equivalent and different concepts {#postgres-vs-clickhouse-equivalent-and-different-concepts}

OLTP 시스템에서 ACID 트랜잭션에 익숙한 사용자들은 ClickHouse가 성능을 위해 이러한 기능을 완전하게 제공하지 않음으로써 의도적으로 타협을 한다는 점을 인식해야 합니다. ClickHouse의 의미론은 잘 이해하고 있다면 높은 내구성 보장과 높은 쓰기 처리량을 제공할 수 있습니다. 우리는 사용자들이 Postgres에서 ClickHouse로 작업하기 전에 익숙해져야 할 몇 가지 주요 개념을 아래에 강조합니다.

### Shards vs replicas {#shards-vs-replicas}

샤딩과 복제는 저장소 및/또는 계산이 성능의 병목현상으로 작용할 때 하나의 Postgres 인스턴스를 넘어 확장하기 위해 사용되는 두 가지 전략입니다. Postgres에서 샤딩은 대규모 데이터베이스를 여러 노드에 걸쳐 더 작고 관리하기 쉬운 조각으로 분할하는 것을 포함합니다. 그러나 Postgres는 기본적으로 샤딩을 지원하지 않습니다. 대신, Postgres가 수평으로 확장할 수 있는 분산 데이터베이스가 되도록 [Citus](https://www.citusdata.com/)와 같은 확장을 사용하여 샤딩을 달성할 수 있습니다. 이 접근 방식은 Postgres가 여러 기계에 로드를 분산시켜 더 높은 트랜잭션 속도와 더 큰 데이터 세트를 처리할 수 있게 합니다. 샤드는 트랜잭셔널 또는 분석과 같은 작업 유형에 유연성을 제공하기 위해 행 또는 스키마 기반으로 구성될 수 있습니다. 그러나 샤딩은 여러 기계 간의 조정과 일관성 보장을 요구하므로 데이터 관리 및 쿼리 실행 측면에서 상당한 복잡성을 도입할 수 있습니다.

샤드와 달리, 복제본은 기본 노드의 모든 데이터 또는 일부 데이터를 포함하는 추가 Postgres 인스턴스입니다. 복제본은 향상된 읽기 성능 및 HA (고가용성) 시나리오 등 다양한 이유로 사용됩니다. 물리적 복제는 데이터베이스의 전체 또는 상당 부분을 다른 서버로 복사하는 Postgres의 기본 기능으로, 모든 데이터베이스, 테이블 및 인덱스를 포함합니다. 이는 TCP/IP를 통해 기본 노드에서 복제본으로 WAL 세그먼트를 스트리밍하는 것을 포함합니다. 그에 반해, 논리적 복제는 `INSERT`, `UPDATE`, `DELETE` 작업을 기반으로 변화를 스트리밍하는 높은 수준의 추상화입니다. 물리적 복제에 대해 동일한 결과가 적용될 수 있지만, 특정 테이블 및 작업, 데이터 변환 및 다양한 Postgres 버전을 지원하기 위해 더 큰 유연성이 제공됩니다.

**대조적으로 ClickHouse의 샤드와 복제본은 데이터 분배 및 중복과 관련된 두 가지 주요 개념입니다.** ClickHouse의 복제본은 Postgres의 복제본과 유사하다고 볼 수 있지만, 복제는 궁극적으로 일관성이 있으며 기본 개념이 없습니다. 샤드는 Postgres와 달리 기본적으로 지원됩니다.

샤드는 테이블 데이터의 일부입니다. 항상 최소 하나의 샤드가 있습니다. 여러 서버에 걸쳐 데이터를 샤딩하면 모든 샤드를 통해 쿼리를 병렬로 실행할 수 있는 단일 서버의 용량을 초과할 경우 부하를 나누는 데 사용할 수 있습니다. 사용자는 다른 서버에서 테이블을 위한 샤드를 수동으로 생성하고 데이터 삽입을 직접 수행할 수 있습니다. 또는 데이터가 라우팅되는 샤드를 정의하는 샤딩 키가 있는 분산 테이블을 사용할 수 있습니다. 샤딩 키는 무작위일 수도 있고 해시 함수의 출력일 수도 있습니다. 중요한 점은 샤드가 여러 복제본으로 구성될 수 있다는 점입니다.

복제본은 데이터의 복사본입니다. ClickHouse는 항상 최소 하나의 데이터 복사본을 보유하므로 최소 복제본 수는 하나입니다. 데이터의 두 번째 복제본을 추가하면 오류 내성이 제공되며, 더 많은 쿼리를 처리하기 위한 추가 계산이 가능해집니다 ([Parallel Replicas](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov) 또한 단일 쿼리 처리용 컴퓨트를 분산시키는 데 사용될 수 있으므로 대기 시간 감소 효과가 있습니다). 복제본은 [ReplicatedMergeTree 테이블 엔진](/engines/table-engines/mergetree-family/replication)으로 구현되며, ClickHouse가 서로 다른 서버 간의 데이터 복사본을 동기화 상태로 유지할 수 있도록 합니다. 복제는 물리적입니다: 쿼리가 아니라 압축된 파트만 노드 간에 전송됩니다.

요약하자면, 복제본은 중복성과 신뢰성을 제공하는 데이터 복사본이며(및 잠재적으로 분산 처리를 제공), 샤드는 분산 처리 및 부하 분산을 허용하는 데이터의 하위 집합입니다.

> ClickHouse Cloud는 S3에 백업된 데이터의 단일 복사본과 여러 계산 복제본을 사용합니다. 데이터는 각 복제본 노드에서 사용할 수 있으며, 각 노드는 로컬 SSD 캐시를 가지고 있습니다. 이는 ClickHouse Keeper를 통해서만 메타데이터 복제를 의존합니다.

## Eventual consistency {#eventual-consistency}

ClickHouse는 내부 복제 메커니즘을 관리하기 위해 ClickHouse Keeper (C++ ZooKeeper 구현, ZooKeeper도 사용 가능)를 사용하며, 주로 메타데이터 저장과 궁극적인 일관성 보장에 집중합니다. Keeper는 분산 환경 내에서 각 삽입에 대한 고유한 순차 번호를 할당하는 데 사용됩니다. 이는 작업 간의 순서와 일관성을 유지하는 데 매우 중요합니다. 이 프레임워크는 병합 및 변형과 같은 백그라운드 작업을 처리하여 이 작업들이 분산되면서도 모든 복제본에서 동일한 순서로 실행되도록 보장합니다. 메타데이터 외에도 Keeper는 복제를 위한 종합적인 제어 센터 역할을 하며, 저장된 데이터 파트의 체크섬 추적을 포함하고 복제본 간의 분산 알림 시스템 역할을 합니다.

ClickHouse의 복제 과정은 (1) 데이터가 어떤 복제본에 삽입될 때 시작됩니다. 이 데이터는 (2) 체크섬과 함께 디스크에 기록됩니다. 기록된 후, 복제본은 (3) Keeper에 이 새로운 데이터 파트를 등록하려고 시도하여 고유한 블록 번호를 할당하고 새로운 파트의 세부 정보를 로그에 기록합니다. 다른 복제본은 복제 로그에서 새로운 항목을 (4) 감지하면 (5) 내부 HTTP 프로토콜을 통해 해당 데이터 파트를 다운로드하며, ZooKeeper에 나열된 체크섬과 비교하여 이를 검증합니다. 이 방법은 모든 복제본이 처리 속도나 잠재적인 지연이 다르더라도 결국 일관되고 최신 데이터를 보유하도록 보장합니다. 더 나아가, 시스템은 여러 작업을 동시에 처리할 수 있는 능력이 있어 데이터 관리 프로세스를 최적화하고 시스템 확장성 및 하드웨어 불일치에 대한 강인성을 허용합니다.

<Image img={postgresReplicas} size="md" alt="Eventual consistency"/>

ClickHouse Cloud는 S3에 저장소와 계산 아키텍처의 분리를 기반으로 한 [클라우드 최적화 복제 메커니즘](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)을 사용합니다. 데이터가 공유 객체 저장소에 저장되기 때문에, 데이터는 노드 간에 물리적으로 복제할 필요 없이 모든 계산 노드에서 자동으로 사용할 수 있습니다. 대신, Keeper는 메타데이터(저장소의 데이터가 어디에 존재하는지)만 계산 노드 간에 공유하는 데 사용됩니다.

PostgreSQL은 ClickHouse와는 다른 복제 전략을 사용하며, 주로 기본 복제본 모델을 사용하는 스트리밍 복제를 통해 기본에서 하나 이상의 복제 노드로 데이터를 지속적으로 스트리밍합니다. 이 유형의 복제는 거의 실시간 일관성을 보장하며 동기식 또는 비동기식으로 제공되어, 관리자에게 가용성과 일관성 간의 균형을 조정할 수 있는 권한을 부여합니다. ClickHouse와는 달리 PostgreSQL은 WAL (Write-Ahead Logging) 및 논리적 복제와 디코딩을 통해 노드 간에 데이터 객체와 변경 사항을 스트리밍합니다. PostgreSQL의 이 접근 방식은 더 간단하지만 ClickHouse가 Keeper의 복잡한 사용을 통해 이룰 수 있는 높은 분산 환경에서의 확장성과 결함 허용성을 제공하지 못할 수도 있습니다.

## User implications {#user-implications}

ClickHouse에서는 더러운 읽기 가능성 - 사용자가 한 복제본에 데이터를 작성한 후 다른 복제본에서 잠재적으로 비복제된 데이터를 읽을 수 있는 상황이 - Keeper로 관리되는 결국 일관성 복제 모델에서 발생할 수 있습니다. 이 모델은 성능과 분산 시스템 전반의 확장성을 강조하여, 복제본이 독립적으로 작동하고 비동기적으로 동기화할 수 있게 합니다. 결과적으로 새로운 데이터가 삽입될 경우, 복제 지연 및 변화가 시스템을 통해 전파되는 데 걸리는 시간에 따라 새로 삽입된 데이터가 모든 복제본에서 즉시 보이지 않을 수 있습니다.

반대로 PostgreSQL의 스트리밍 복제 모델은 일반적으로 기본이 트랜잭션을 커밋하기 전에 데이터를 수신했음을 확인하기 위해 적어도 하나의 복제본을 기다리는 동기식 복제 옵션을 활용하여 더러운 읽기를 방지할 수 있습니다. 이렇게 하면 트랜잭션이 커밋될 때 다른 복제본에서 데이터가 사용 가능하다는 보장이 존재합니다. 기본 실패가 발생할 경우, 복제본은 쿼리가 커밋된 데이터를 확인하여 더 엄격한 일관성을 유지합니다.

## Recommendations {#recommendations}

ClickHouse에 새로 온 사용자는 이러한 차이점을 인식해야 하며, 이는 복제 환경에서 나타날 것입니다. 일반적으로 궁극적인 일관성은 수십억, 아니면 수 조 점의 데이터에 대한 분석에서 충분합니다 - 이 경우 메트릭은 더 안정적이거나 새로운 데이터가 지속적으로 높은 속도로 삽입되기 때문에 추정이 충분할 수 있습니다.

읽기의 일관성을 증가시키기 위한 여러 옵션이 존재합니다. 이 두 가지 예시 모두 증가된 복잡성 또는 오버헤드를 요구하여 쿼리 성능을 저하시킬 수 있으며 ClickHouse의 확장을 더 어렵게 만들 수 있습니다. **우리는 이러한 접근 방식을 절대적으로 필요한 경우에만 권장합니다.**

## Consistent routing {#consistent-routing}

궁극적인 일관성의 일부 제한을 극복하기 위해, 사용자는 클라이언트가 동일한 복제본으로 라우팅되도록 보장할 수 있습니다. 이는 여러 사용자가 ClickHouse를 쿼리하고 결과가 요청 간에 결정론적이어야 하는 경우에 유용합니다. 결과는 다를 수 있지만, 새로운 데이터가 삽입되면서도 동일한 복제본을 쿼리해야 일관된 뷰를 보장할 수 있습니다.

이는 아키텍처와 ClickHouse OSS 또는 ClickHouse Cloud를 사용하는 여부에 따라 몇 가지 접근 방식을 통해 달성할 수 있습니다.

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud는 S3에 백업된 데이터의 단일 복사본과 여러 계산 복제본을 사용합니다. 데이터는 각 복제본 노드에서 사용할 수 있으며, 각 노드는 로컬 SSD 캐시를 가지고 있습니다. 따라서 일관된 결과를 보장하려면 사용자가 동일한 노드로 일관되게 라우팅되도록 해야 합니다.

ClickHouse Cloud 서비스의 노드와의 통신은 프록시를 통해 이루어집니다. HTTP 및 네이티브 프로토콜 연결은 열려 있는 기간 동안 동일한 노드로 라우팅됩니다. 대부분의 클라이언트에서 HTTP 1.1 연결의 경우, 이는 Keep-Alive 윈도우에 따라 달라집니다. 이는 대부분의 클라이언트 (예: Node Js)에서 구성할 수 있습니다. 또한 서버 측 구성도 필요하며, 이는 클라이언트보다 높아야 하며 ClickHouse Cloud에서는 10초로 설정되어 있습니다.

연결 간 일관된 라우팅을 보장하기 위해, 사용자는 동일한 연결을 사용하거나(connection pool 사용 시) 스티키 엔드포인트 노출을 요청하는 두 가지 방법 중 하나를 선택할 수 있습니다. 이는 클러스터의 각 노드에 대한 엔드포인트 집합을 제공하므로, 클라이언트는 쿼리를 결정론적으로 라우팅할 수 있도록 합니다.

> 스티키 엔드포인트에 대한 액세스를 원할 경우 지원에 문의하십시오.

## ClickHouse OSS {#clickhouse-oss}

OSS에서 이러한 동작을 달성하는 것은 사용 중인 샤드 및 복제본 토폴로지 및 [Distributed table](/engines/table-engines/special/distributed)를 활용하여 쿼리를 할 수 있는지 여부에 따라 다릅니다.

샤드와 복제본이 하나만 있는 경우(ClickHouse가 수직으로 확장되므로 일반적임), 사용자는 클라이언트 레이어에서 노드를 선택하고 복제본에 직접 쿼리하여 이를 결정론적으로 선택하도록 합니다.

샤드와 복제본이 여러 개 있는 토폴로지는 분산 테이블 없이도 가능하지만, 이러한 고급 배포는 일반적으로 자체 라우팅 인프라를 갖추고 있습니다. 따라서 우리가 하나 이상의 샤드가 있는 배포는 Distributed table을 사용하고 있다고 가정합니다 (Distributed tables는 단일 샤드 배포에 사용할 수 있지만 일반적으로 불필요합니다).

이 경우 사용자는 `session_id` 또는 `user_id`와 같은 프로퍼티에 따라 일관된 노드 라우팅을 보장해야 합니다. 설정 [`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica), [`load_balancing=in_order`](/operations/settings/settings#load_balancing) 은 [쿼리에서 설정해야 합니다](/operations/settings/query-level). 이는 샤드의 로컬 복제본이 선호되도록 보장하며, 그렇지 않은 경우 설정된 구성에 나열된 복제본이 우선됩니다 - 오류 수가 동일할 경우에는 높은 오류가 발생할 경우 무작위 선택이 이루어집니다. [`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing) 도 이 결정론적 샤드 선택을 위한 대안으로 사용될 수 있습니다.

> Distributed table을 만들 때 사용자는 클러스터를 지정합니다. config.xml에 지정된 이 클러스터 정의는 샤드(및 그 복제본)를 나열하며 - 따라서 사용자가 각 노드에서 사용되는 순서를 제어할 수 있게 합니다. 이를 통해 사용자는 선택이 결정론적이도록 할 수 있습니다.

## Sequential consistency {#sequential-consistency}

예외적인 경우 사용자는 순차적 일관성이 필요할 수 있습니다.

데이터베이스의 순차적 일관성이란 데이터베이스의 작업이 어떤 순차적 순서로 실행되는 것처럼 보이며, 이 순서가 데이터베이스와 상호작용하는 모든 프로세스에서 일관되도록 보장하는 것입니다. 이는 각 작업이 호출과 완료 간에 즉시 효과를 나타내며, 모든 작업이 어떠한 프로세스에서 관찰되느냐에 대해 동의된 단일 순서가 존재한다는 것을 의미합니다.

사용자의 관점에서 볼 때 이는 일반적으로 ClickHouse에 데이터를 작성할 때 발생하고, 데이터를 읽을 때 가장 최근에 삽입된 행이 반환되도록 할 때 필요합니다.
이는 몇 가지 방법으로 달성할 수 있습니다(선호도 순서):

1. **동일한 노드에서 읽기/쓰기** - 네이티브 프로토콜을 사용 중이거나 [HTTP를 통해 쓰기/읽기 세션을 사용하는 경우](/interfaces/http#default-database), 동일한 복제본에 연결되어 있어야 합니다: 이 시나리오에서는 쓰기를 하는 노드에서 직접 읽고 있으므로 읽기 결과가 항상 일관적입니다.
1. **복제본 수동 동기화** - 한 복제본에 데이터를 작성하고 다른 복제본에서 읽는 경우, 읽기 전에 `SYSTEM SYNC REPLICA LIGHTWEIGHT` 명령어를 사용할 수 있습니다.
1. **순차적 일관성 활성화** - 쿼리 설정 [`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)을 통해서 가능합니다. OSS에서는 설정 `insert_quorum = 'auto'`도 지정되어야 합니다.

<br />

이 설정을 활성화하는 자세한 내용은 [여기](/cloud/reference/shared-merge-tree#consistency)를 참조하십시오.

> 순차적 일관성의 사용은 ClickHouse Keeper에 더 많은 부하를 발생시킵니다. 그 결과로 인해 느린 삽입과 읽기가 발생할 수 있습니다. ClickHouse Cloud에서 주 테이블 엔진으로 사용되는 SharedMergeTree는 순차적 일관성이 [부하가 적고 확장성이 더 뛰어납니다](/cloud/reference/shared-merge-tree#consistency). OSS 사용자는 이 접근 방식을 신중하게 사용하고 Keeper 부하를 측정해야 합니다.

## Transactional (ACID) support {#transactional-acid-support}

PostgreSQL에서 마이그레이션하는 사용자는 ACID (원자성, 일관성, 격리성, 내구성) 속성에 대한 강력한 지원에 익숙할 수 있으며, 이는 트랜잭션 데이터베이스에 신뢰할 수 있는 선택이 됩니다. PostgreSQL의 원자성은 각 트랜잭션이 완전히 성공하거나 완전히 롤백되는 단일 단위로 처리되도록 보장하여 부분 업데이트를 방지합니다. 일관성은 모든 데이터베이스 트랜잭션이 유효한 상태로 이어지도록 보장하는 제약 조건, 트리거 및 규칙을 시행하여 유지됩니다. Read Committed에서 Serializable까지의 격리 수준이 PostgreSQL에서 지원되어 동시 실행되는 트랜잭션에 의해 가해진 변경이 보이는 것을 세밀하게 제어할 수 있습니다. 마지막으로, 내구성은 Write-Ahead Logging(WAL)을 통해 달성되어, 트랜잭션이 커밋된 후 시스템 실패 시에도 그 상태가 유지되도록 합니다.

이러한 속성은 진실의 원천으로 작용하는 OLTP 데이터베이스에서 일반적입니다.

강력하지만, 이는 고유한 제한 사항과 PB 스케일이 어려워지는 경우를 동반합니다. ClickHouse는 빠른 분석 쿼리를 대규모로 제공하면서 높은 쓰기 처리량을 유지하기 위해 이러한 속성을 타협합니다.

ClickHouse는 [제한된 구성](/guides/developer/transactional)에서 ACID 속성을 제공합니다 - 가장 간단하게는 하나의 파티션을 가진 MergeTree 테이블 엔진의 비복제 인스턴스를 사용할 때입니다. 사용자는 이러한 경우 이외의 속성을 기대하지 말고, 이러한 요구가 없는지 확인해야 합니다.

## Compression {#compression}

ClickHouse의 컬럼 중심 저장소는 Postgres에 비해 압축률이 상당히 더 좋을 수 있음을 의미합니다. 다음은 두 데이터베이스에서 모든 Stack Overflow 테이블의 저장 요구 사항을 비교한 것입니다:

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

압축 최적화 및 측정에 대한 더 자세한 내용은 [여기](/data-compression/compression-in-clickhouse)에서 확인할 수 있습니다.

## Data type mappings {#data-type-mappings}

다음 표는 Postgres에 대한 ClickHouse 데이터 유형의 동등한 유형을 보여줍니다.

| Postgres 데이터 유형 | ClickHouse 유형 |
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
| `JSON*` | [String](/sql-reference/data-types/string), [Variant](/sql-reference/data-types/variant), [Nested](/sql-reference/data-types/nested-data-structures/nested#nestedname1-type1-name2-type2-), [Tuple](/sql-reference/data-types/tuple) |
| `JSONB` | [String](/sql-reference/data-types/string) |

*\* ClickHouse에서 JSON에 대한 운영 지원은 개발 중입니다. 현재 사용자는 JSON을 String으로 매핑하고 [JSON 함수](/sql-reference/functions/json-functions)를 사용하거나 구조가 예상 가능한 경우 JSON을 [튜플](/sql-reference/data-types/tuple) 및 [중첩](/sql-reference/data-types/nested-data-structures/nested)으로 직접 매핑할 수 있습니다. JSON에 대한 자세한 내용은 [여기](/integrations/data-formats/json/overview)에서 확인하십시오.*
