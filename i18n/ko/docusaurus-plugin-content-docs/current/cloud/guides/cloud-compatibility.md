---
'slug': '/whats-new/cloud-compatibility'
'sidebar_label': '클라우드 호환성'
'title': '클라우드 호환성'
'description': '이 가이드는 ClickHouse Cloud에서 기대할 수 있는 기능적 및 운영적 개요를 제공합니다.'
'keywords':
- 'ClickHouse Cloud'
- 'compatibility'
'doc_type': 'guide'
---


# ClickHouse Cloud 호환성 가이드

이 가이드는 ClickHouse Cloud의 기능적 및 운영적으로 기대할 수 있는 내용을 개괄합니다. ClickHouse Cloud는 오픈 소스 ClickHouse 배포를 기반으로 하지만, 아키텍처 및 구현에서 몇 가지 차이가 있을 수 있습니다. ClickHouse Cloud를 만드는 과정에 대한 [이 블로그](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year)를 읽어보는 것도 유익할 수 있습니다.

## ClickHouse Cloud 아키텍처 {#clickhouse-cloud-architecture}
ClickHouse Cloud는 운영 오버헤드를 크게 줄이고 대규모로 ClickHouse를 실행하는 비용을 절감합니다. 배포를 사전 크기 조정하고, 고가용성을 위한 복제를 설정하고, 데이터를 수동으로 샤딩하고, 작업량이 증가할 때 서버를 확장하고, 사용하지 않을 때 축소할 필요가 없습니다 — 이를 저희가 처리합니다.

이러한 이점은 ClickHouse Cloud의 기본 아키텍처 선택의 결과입니다:
- 컴퓨트와 스토리지가 분리되어 있어 서로 다른 차원에서 자동으로 확장할 수 있으므로, 정적인 인스턴스 구성에서 스토리지 또는 컴퓨트를 과도하게 할당할 필요가 없습니다.
- 오브젝트 스토어 위의 계층형 스토리지와 다단계 캐싱은 사실상 무제한의 확장성과 좋은 가격/성능 비율을 제공하므로, 스토리지 파티션을 미리 크기 조정하거나 높은 스토리지 비용에 대해 걱정할 필요가 없습니다.
- 고가용성은 기본적으로 활성화되어 있으며 복제는 투명하게 관리되므로, 애플리케이션을 개발하거나 데이터를 분석하는 데 집중할 수 있습니다.
- 가변 연속 작업량에 대한 자동 확장은 기본적으로 활성화되어 있으므로, 서비스 크기를 미리 지정할 필요가 없고, 작업량이 증가할 때 서버를 확장하거나 활동이 적을 때 수동으로 서버를 축소할 필요가 없습니다.
- 간헐적 작업량에 대한 원활한 절전 모드가 기본적으로 활성화되어 있습니다. 비활동이 일정 기간 지속되면 컴퓨트 리소스를 자동으로 일시 중지하고 새로운 쿼리가 도착할 때 다시 투명하게 시작하므로 유휴 리소스에 대한 비용을 지불할 필요가 없습니다.
- 고급 확장 제어 기능을 통해 추가 비용 제어를 위한 자동 확장 최대값이나 특수 성능 요구 사항이 있는 애플리케이션을 위해 컴퓨트 리소스를 예약하는 자동 확장 최소값을 설정할 수 있습니다.

## 기능 {#capabilities}
ClickHouse Cloud는 오픈 소스 ClickHouse 배포에서 선별된 기능 세트에 대한 접근을 제공합니다. 아래 표는 현재 ClickHouse Cloud에서 비활성화된 일부 기능을 설명합니다.

### DDL 구문 {#ddl-syntax}
전반적으로 ClickHouse Cloud의 DDL 구문은 자체 관리 설치에서 사용 가능한 것과 일치해야 합니다. 몇 가지 주목할 만한 예외가 있습니다:
- 현재 사용 가능한 `CREATE AS SELECT`에 대한 지원이 없습니다. 해결 방법으로, `CREATE ... EMPTY ... AS SELECT`를 사용한 후 해당 테이블에 삽입하는 것을 제안합니다(예제는 [이 블로그](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)를 참조하세요).
- 일부 실험적 구문은 비활성화될 수 있으며, 예를 들어 `ALTER TABLE ... MODIFY QUERY` 문장이 이에 해당합니다.
- 보안상의 이유로 어떤 내부 조회 기능이 비활성화될 수 있습니다. 예를 들어, `addressToLine` SQL 함수가 이에 해당합니다.
- ClickHouse Cloud에서는 `ON CLUSTER` 매개변수를 사용하지 마세요 - 이는 필요하지 않습니다. 대부분 노-옵 함수이지만, [매크로](/operations/server-configuration-parameters/settings#macros)를 사용하려 할 때 오류를 일으킬 수 있습니다. 매크로는 ClickHouse Cloud에서 대부분 작동하지 않으며 필요하지 않습니다.

### 데이터베이스 및 테이블 엔진 {#database-and-table-engines}

ClickHouse Cloud는 기본적으로 고가용성 및 복제 서비스를 제공합니다. 따라서 모든 데이터베이스 및 테이블 엔진은 "Replicated"입니다. "Replicated"를 명시할 필요는 없습니다 — 예를 들어 ClickHouse Cloud에서 사용될 때 `ReplicatedMergeTree`와 `MergeTree`는 동일합니다.

**지원되는 테이블 엔진**

- ReplicatedMergeTree (기본값, 명시되지 않은 경우)
- ReplicatedSummingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- MergeTree (ReplicatedMergeTree로 변환됨)
- SummingMergeTree (ReplicatedSummingMergeTree로 변환됨)
- AggregatingMergeTree (ReplicatedAggregatingMergeTree로 변환됨)
- ReplacingMergeTree (ReplicatedReplacingMergeTree로 변환됨)
- CollapsingMergeTree (ReplicatedCollapsingMergeTree로 변환됨)
- VersionedCollapsingMergeTree (ReplicatedVersionedCollapsingMergeTree로 변환됨)
- URL
- View
- MaterializedView
- GenerateRandom
- Null
- Buffer
- Memory
- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

### 인터페이스 {#interfaces}
ClickHouse Cloud는 HTTPS, 네이티브 인터페이스 및 [MySQL 와이어 프로토콜](/interfaces/mysql)을 지원합니다. Postgres와 같은 다른 인터페이스에 대한 지원이 곧 추가될 예정입니다.

### 딕셔너리 {#dictionaries}
딕셔너리는 ClickHouse에서 조회 속도를 높이는 인기 있는 방법입니다. 현재 ClickHouse Cloud는 PostgreSQL, MySQL, 원격 및 로컬 ClickHouse 서버, Redis, MongoDB 및 HTTP 소스의 딕셔너리를 지원합니다.

### 분산 쿼리 {#federated-queries}
우리는 클라우드 내의 크로스 클러스터 통신을 위한 분산 ClickHouse 쿼리 및 외부 자체 관리 ClickHouse 클러스터와의 통신을 지원합니다. ClickHouse Cloud는 현재 다음 통합 엔진을 사용한 분산 쿼리를 지원합니다:
- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

SQLite, ODBC, JDBC, Redis, HDFS 및 Hive와 같은 일부 외부 데이터베이스 및 테이블 엔진에 대한 분산 쿼리는 아직 지원되지 않습니다.

### 사용자 정의 함수 {#user-defined-functions}

사용자 정의 함수는 ClickHouse의 최신 기능입니다. ClickHouse Cloud는 현재 SQL UDF만 지원합니다.

### 실험적 기능 {#experimental-features}

ClickHouse Cloud 서비스에서의 실험적 기능은 서비스 배포의 안정성을 보장하기 위해 비활성화되어 있습니다.

### Kafka {#kafka}

[Kafka 테이블 엔진](/integrations/data-ingestion/kafka/index.md)은 ClickHouse Cloud에서 일반적으로 사용할 수 없습니다. 대신, Kafka 연결 구성 요소를 ClickHouse 서비스와 분리하여 관심사를 분리하는 아키텍처에 의존하는 것을 권장합니다. Kafka 스트림에서 데이터를 가져오기 위해 [ClickPipes](https://clickhouse.com/cloud/clickpipes)를 추천합니다. 또는 [Kafka 사용자 가이드](/integrations/data-ingestion/kafka/index.md)에서 나열된 푸시 기반 대안을 고려하세요.

### 명명된 컬렉션 {#named-collections}

[명명된 컬렉션](/operations/named-collections)은 현재 ClickHouse Cloud에서 지원되지 않습니다.

## 운영 기본값 및 고려 사항 {#operational-defaults-and-considerations}
다음은 ClickHouse Cloud 서비스의 기본 설정입니다. 특정 경우에 이 설정은 서비스의 올바른 작동을 보장하기 위해 고정되어 있으며, 다른 경우에는 조정할 수 있습니다.

### 운영 한계 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTree 테이블에 대한 `max_parts_in_total` 설정의 기본값이 100,000에서 10,000으로 줄어들었습니다. 이 변경의 이유는 클라우드에서 데이터 파트 수가 많으면 서비스의 시작 시간이 느려질 가능성이 높다는 것을 관찰했기 때문입니다. 많은 수의 파트는 일반적으로 너무 세분화된 파티션 키의 선택을 나타내며, 이는 일반적으로 실수로 이루어져야 하며 피해야 합니다. 기본값 변경은 이러한 사례를 일찍 발견할 수 있게 해 줍니다.

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
이 설정은 기본값 `100`에서 `1000`으로 증가하여 더 많은 동시성을 허용합니다. 
이는 제공되는 계층 서비스에 대해 `복제본 수 * 1,000`의 동시 쿼리를 초래합니다. 
기본 계층 서비스의 경우 단일 복제본으로 제한된 `1000` 동시 쿼리 및 `Scale` 및 `Enterprise`의 경우 구성된 복제본 수에 따라 `1000+` 동시 쿼리를 허용합니다.

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
이 설정을 50GB에서 증가시켜 최대 1TB의 테이블/파티션 삭제를 허용합니다.

### 시스템 설정 {#system-settings}
ClickHouse Cloud는 다양한 작업량에 맞게 조정되며, 그 이유로 대부분의 시스템 설정은 현재 조정할 수 없습니다. 대부분의 사용자에게 시스템 설정 조정의 필요성을 예상하지 않지만, 고급 시스템 조정에 대해 질문이 있는 경우 ClickHouse Cloud 지원팀에 문의하시기 바랍니다.

### 고급 보안 관리 {#advanced-security-administration}
ClickHouse 서비스를 생성하는 과정에서 기본 데이터베이스와 이 데이터베이스에 대한 광범위한 권한을 갖는 기본 사용자를 만듭니다. 이 초기 사용자는 추가 사용자를 생성하고 이 데이터베이스에 대한 권한을 할당할 수 있습니다. 이 외에도 Kerberos, LDAP 또는 SSL X.509 인증서를 사용하여 데이터베이스 내에서 다음 보안 기능을 활성화하는 기능은 현재 지원되지 않습니다.

## 로드맵 {#roadmap}

클라우드에서 실행 가능한 UDF에 대한 지원을 도입하고 있으며, 다른 많은 기능에 대한 수요를 평가하고 있습니다. 피드백이 있거나 특정 기능을 요청하고 싶으신 경우 [여기에서 제출해 주세요](https://console.clickhouse.cloud/support).
