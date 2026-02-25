---
slug: /migrations/postgresql/overview
title: 'PostgreSQL와 ClickHouse 비교'
description: 'PostgreSQL에서 ClickHouse로의 마이그레이션 가이드'
keywords: ['postgres', 'postgresql', 'migrate', 'migration']
sidebar_label: '개요'
doc_type: 'guide'
---

# ClickHouse와 PostgreSQL 비교 \{#comparing-clickhouse-and-postgresql\}

## 왜 Postgres 대신 ClickHouse를 사용해야 할까요? \{#why-use-clickhouse-over-postgres\}

요약하면, ClickHouse는 OLAP 데이터베이스로서 빠른 분석, 특히 `GROUP BY` 쿼리를 위해 설계된 반면, Postgres는 트랜잭션 워크로드를 위해 설계된 OLTP 데이터베이스이기 때문입니다.

OLTP(online transactional processing) 데이터베이스는 트랜잭션 정보를 관리하도록 설계되었습니다. Postgres가 대표적인 예인 이러한 데이터베이스의 주요 목적은 엔지니어가 데이터베이스에 일련의 업데이트 블록을 제출했을 때, 그 작업이 전부 성공하거나 전부 실패하도록 보장하는 데 있습니다. 이러한 ACID 특성을 갖는 트랜잭션 보장은 OLTP 데이터베이스의 핵심 초점이며, Postgres의 큰 강점입니다. 이러한 요구 사항 때문에 OLTP 데이터베이스는 대규모 데이터셋에 대한 분석 쿼리를 실행할 때 일반적으로 성능 한계에 부딪히게 됩니다.

OLAP(online analytical processing) 데이터베이스는 이러한 요구를 충족하도록, 즉 분석 워크로드를 처리하도록 설계되었습니다. 이 데이터베이스의 주요 목적은 엔지니어가 방대한 데이터셋에 대해 효율적으로 쿼리하고 집계할 수 있도록 보장하는 것입니다. ClickHouse와 같은 실시간 OLAP 시스템은 데이터가 실시간으로 수집되는 동시에 분석을 수행할 수 있게 해 줍니다.

ClickHouse와 PostgreSQL에 대한 보다 심층적인 비교는 [여기](/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)를 참고하십시오.

분석 쿼리에서 ClickHouse와 Postgres 간의 잠재적인 성능 차이를 확인하려면 [Rewriting PostgreSQL Queries in ClickHouse](/migrations/postgresql/rewriting-queries)를 참고하십시오.

## 마이그레이션 전략 \{#migration-strategies\}

PostgreSQL에서 ClickHouse로 마이그레이션할 때 적절한 전략은 사용 사례, 인프라, 데이터 요구사항에 따라 달라집니다. 일반적으로 실시간 변경 데이터 포착(Change Data Capture, CDC)은 대부분의 최신 사용 사례에 가장 적합한 접근 방식이며, 수동 대량 적재 후 주기적인 업데이트를 수행하는 방식은 더 단순한 시나리오나 1회성 마이그레이션에 적합합니다.

아래 섹션에서는 마이그레이션을 위한 두 가지 주요 전략인 **실시간 CDC** 및 **수동 대량 적재 + 주기적 업데이트**를 설명합니다.

### 실시간 복제(CDC) \{#real-time-replication-cdc\}

Change Data Capture (CDC)는 두 데이터베이스 간에 테이블을 동기화 상태로 유지하는 과정입니다. PostgreSQL에서 ClickHouse로 수행되는 대부분의 마이그레이션에 가장 효율적인 접근 방식이지만, PostgreSQL에서 발생하는 insert, update, delete를 거의 실시간으로 처리해야 하므로 더 복잡합니다. 실시간 분석이 중요한 사용 사례에 이상적입니다. 

실시간 Change Data Capture (CDC)는 ClickHouse Cloud를 사용하는 경우 [ClickPipes](/integrations/clickpipes/postgres/deduplication)를, 온프레미스에서 ClickHouse를 실행하는 경우 [PeerDB](https://github.com/PeerDB-io/peerdb)를 사용하여 ClickHouse에서 구현할 수 있습니다. 이러한 솔루션은 PostgreSQL에서 insert, update, delete를 캡처하여 ClickHouse로 복제하면서, 초기 적재(initial load)를 포함한 실시간 데이터 동기화의 복잡성을 처리합니다. 이 접근 방식은 수동 개입 없이도 ClickHouse의 데이터가 항상 최신 상태이면서 정확하게 유지되도록 합니다.

### 수동 대량 적재 + 주기적 업데이트 \{#manual-bulk-load-periodic-updates\}

일부 경우에는 수동 대량 적재 후 주기적으로 업데이트하는 보다 단순한 방식으로도 충분합니다. 이 전략은 일회성 마이그레이션이나 실시간 복제가 필요하지 않은 상황에 적합합니다. PostgreSQL에서 ClickHouse로 데이터를 대량으로 적재하는 방식이며, 직접 SQL `INSERT` 명령을 사용하거나 CSV 파일을 내보내기/가져오기를 통해 수행할 수 있습니다. 초기 마이그레이션 이후에는 PostgreSQL의 변경 분을 정기적으로 동기화하여 ClickHouse의 데이터를 주기적으로 업데이트합니다.

대량 적재 프로세스는 단순하고 유연하지만, 실시간 업데이트가 지원되지 않는다는 단점이 있습니다. 초기 데이터가 ClickHouse에 적재된 이후에는 변경 사항이 즉시 반영되지 않으므로, PostgreSQL에서 발생한 변경 내용을 동기화하기 위한 주기적 업데이트를 반드시 스케줄링해야 합니다. 이 접근 방식은 실시간성이 그리 중요하지 않은 사용 사례에 잘 맞지만, PostgreSQL의 데이터가 변경되는 시점과 해당 변경 사항이 ClickHouse에 반영되는 시점 사이에 지연이 발생합니다.

### 어떤 전략을 선택해야 할까요? \{#which-strategy-to-choose\}

최신 데이터를 ClickHouse에 지속적으로 반영해야 하는 대부분의 애플리케이션에는 ClickPipes를 통한 실시간 CDC 방식이 권장됩니다. 이 방식은 최소한의 설정과 운영 부담으로 연속적인 데이터 동기화를 제공합니다. 반면, 수동 대용량 적재와 주기적인 업데이트 방식은 단순한 1회성 마이그레이션이거나 실시간 업데이트가 중요하지 않은 워크로드에는 유효한 선택지가 될 수 있습니다.

---

**[여기에서 PostgreSQL 마이그레이션 가이드를 시작하십시오](/migrations/postgresql/dataset).**