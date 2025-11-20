---
'slug': '/migrations/postgresql/overview'
'title': 'PostgreSQL와 ClickHouse 비교'
'description': 'PostgreSQL에서 ClickHouse로의 마이그레이션 가이드'
'keywords':
- 'postgres'
- 'postgresql'
- 'migrate'
- 'migration'
'sidebar_label': '개요'
'doc_type': 'guide'
---


# ClickHouse와 PostgreSQL 비교

## ClickHouse를 Postgres보다 사용하는 이유는 무엇인가요? {#why-use-clickhouse-over-postgres}

TLDR: ClickHouse는 OLAP 데이터베이스로서 빠른 분석을 위해 설계되었으며, 특히 `GROUP BY` 쿼리에 최적화되어 있는 반면, Postgres는 트랜잭션 작업을 위해 설계된 OLTP 데이터베이스입니다.

OLTP, 즉 온라인 트랜잭션 처리 데이터베이스는 트랜잭션 정보를 관리하기 위해 설계되었습니다. 이러한 데이터베이스의 주요 목표는 엔지니어가 데이터베이스에 업데이트 블록을 제출할 수 있도록 하여, 전체가 성공하거나 실패하는 것을 확실히 하는 것입니다. ACID 속성을 가진 이러한 유형의 트랜잭션 보장은 OLTP 데이터베이스의 주요 초점이며 Postgres의 큰 강점입니다. 이러한 요구 사항을 감안할 때, OLTP 데이터베이스는 대규모 데이터셋에 대한 분석 쿼리를 사용할 때 성능 제한에 직면하는 경우가 많습니다.

OLAP, 즉 온라인 분석 처리 데이터베이스는 이러한 필요를 충족시키기 위해 설계되었습니다 — 분석 작업을 관리합니다. 이러한 데이터베이스의 주요 목표는 엔지니어가 방대한 데이터셋에 대해 효율적으로 쿼리하고 집계할 수 있도록 하는 것입니다. ClickHouse와 같은 실시간 OLAP 시스템은 데이터가 실시간으로 수집되는 동안 이러한 분석이 이루어지도록 허용합니다.

ClickHouse와 PostgreSQL 간의 보다 심층적인 비교는 [여기](https://migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)를 참조하십시오.

ClickHouse와 Postgres 간의 분석 쿼리에 대한 잠재적인 성능 차이를 보려면 [ClickHouse에서 PostgreSQL 쿼리 재작성 보기](/migrations/postgresql/rewriting-queries)를 참조하십시오.

## 마이그레이션 전략 {#migration-strategies}

PostgreSQL에서 ClickHouse로 마이그레이션할 때 올바른 전략은 사용 사례, 인프라 및 데이터 요구 사항에 따라 달라집니다. 일반적으로 실시간 Change Data Capture (CDC)는 대부분의 현대 사용 사례에 가장 적합한 접근 방식이며, 수동 대량 로딩 후 정기적인 업데이트는 더 간단한 시나리오나 일회성 마이그레이션에 적합합니다.

아래 섹션에서는 **실시간 CDC**와 **수동 대량 로드 + 정기 업데이트**라는 두 가지 주요 마이그레이션 전략을 설명합니다.

### 실시간 복제 (CDC) {#real-time-replication-cdc}

Change Data Capture (CDC)는 두 데이터베이스 간의 테이블을 동기화하는 과정입니다. 이는 PostgreSQL에서 ClickHouse로 거의 실시간으로 삽입, 업데이트 및 삭제를 처리하므로 대부분의 PostgreSQL에서 마이그레이션을 위한 가장 효율적인 접근 방식입니다. 실시간 분석이 중요한 사용 사례에 적합합니다.

실시간 Change Data Capture (CDC)는 [ClickPipes](/integrations/clickpipes/postgres/deduplication)를 사용하여 ClickHouse에서 구현할 수 있으며, ClickHouse Cloud를 사용 중인 경우 또는 온프레미스에서 ClickHouse를 실행 중인 경우 [PeerDB](https://github.com/PeerDB-io/peerdb)를 사용할 수 있습니다. 이러한 솔루션은 PostgreSQL의 삽입, 업데이트 및 삭제를 캡처하여 ClickHouse에서 복제하는 실시간 데이터 동기화의 복잡성을 처리합니다. 이 접근 방식은 수동 개입 없이 ClickHouse의 데이터가 항상 신선하고 정확하도록 보장합니다.

### 수동 대량 로드 + 정기 업데이트 {#manual-bulk-load-periodic-updates}

일부 경우에는 수동 대량 로드 후 정기 업데이트와 같은 보다 간단한 접근 방식이 충분할 수 있습니다. 이 전략은 일회성 마이그레이션 또는 실시간 복제가 필요 없는 상황에 이상적입니다. 이는 PostgreSQL에서 ClickHouse로 대량으로 데이터를 로드하는 데 관련되며, 직접 SQL `INSERT` 명령을 사용하거나 CSV 파일을 내보내고 가져오는 방식으로 진행됩니다. 초기 마이그레이션 이후, 정기적인 간격으로 PostgreSQL의 변경 사항을 동기화하여 ClickHouse의 데이터를 정기적으로 업데이트할 수 있습니다.

대량 로드 프로세스는 간단하고 유연하지만 실시간 업데이트가 없다는 단점이 있습니다. 초기 데이터가 ClickHouse에 로드되면 업데이트는 즉시 반영되지 않으므로 PostgreSQL에서 변경 사항을 동기화하려면 주기적인 업데이트를 예약해야 합니다. 이 접근 방식은 시간에 민감하지 않은 사용 사례에 잘 작동하지만, PostgreSQL에서 데이터가 변경되고 그 변경 사항이 ClickHouse에 나타나기까지 지연이 발생합니다.

### 어떤 전략을 선택해야 하나요? {#which-strategy-to-choose}

ClickHouse에서 신선하고 최신 데이터를 요구하는 대부분의 애플리케이션에 대해 ClickPipes를 통한 실시간 CDC가 권장되는 접근 방식입니다. 이는 최소한의 설정과 유지 관리로 지속적인 데이터 동기화를 제공합니다. 반면, 수동 대량 로딩과 정기 업데이트는 더 간단한 일회성 마이그레이션이나 실시간 업데이트가 중요하지 않은 작업 부하에 대한 실행 가능한 옵션입니다.

---

**[여기에서 PostgreSQL 마이그레이션 가이드를 시작하세요](/migrations/postgresql/dataset).**
