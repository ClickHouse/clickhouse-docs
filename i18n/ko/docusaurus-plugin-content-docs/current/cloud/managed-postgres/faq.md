---
slug: /cloud/managed-postgres/faq
sidebar_label: 'FAQ'
title: 'Managed Postgres 자주 묻는 질문(FAQ)'
description: 'ClickHouse Managed Postgres에 대한 자주 묻는 질문'
keywords: ['managed postgres faq', 'postgres questions', 'metrics', 'extensions', 'migration', 'terraform', 'pgbouncer', 'prepared statements']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.faq-beta" />

## 모니터링 및 메트릭 \{#monitoring-and-metrics\}

### Managed Postgres 인스턴스의 메트릭은 어떻게 확인할 수 있습니까? \{#metrics-access\}

ClickHouse Cloud 콘솔의 Managed Postgres 인스턴스 **모니터링** 탭에서 CPU, 메모리, IOPS 및 스토리지 사용량을 직접 모니터링할 수 있습니다.

또한 **Query Insights** 탭에서 쿼리를 자세히 분석할 수 있도록 [Query Performance Insights](https://clickhouse.com/blog/postgres-query-insights-clickhouse-cloud)를 살펴볼 수 있습니다.

## 백업 및 복구 \{#backup-and-recovery\}

### 사용 가능한 백업 옵션은 무엇입니까? \{#backup-options\}

Managed Postgres에는 연속 WAL 아카이빙이 포함된 자동 일별 백업이 제공되며, 이를 통해 7일 보존 기간 내의 임의 시점으로 시점 복구(point-in-time recovery)를 수행할 수 있습니다. 백업은 S3에 저장됩니다.

백업 주기, 보존 기간 및 시점 복구 수행 방법에 대한 자세한 내용은 [Backup and restore](/cloud/managed-postgres/backup-and-restore) 문서를 참조하십시오.

## 인프라 및 자동화 \{#infrastructure-and-automation\}

### Managed Postgres에서 Terraform을 사용할 수 있습니까? \{#terraform-support\}

현재 Managed Postgres는 Terraform을 지원하지 않습니다. 인스턴스를 생성하고 관리하려면 ClickHouse Cloud 콘솔 또는 [OpenAPI](openapi.md) 사용을 권장합니다.

## 확장 기능 및 구성 \{#extensions-and-configuration\}

### 어떤 확장 기능이 지원되나요? \{#extensions-supported\}

Managed Postgres는 PostGIS, pgvector, pg&#95;cron 등과 같은 인기 있는 확장 기능을 포함하여 90개가 넘는 PostgreSQL 확장 기능을 지원합니다. 사용 가능한 확장 기능의 전체 목록과 설치 방법은 [Extensions](/cloud/managed-postgres/extensions) 문서를 참고하십시오.

### PostgreSQL 구성 파라미터를 사용자 지정할 수 있습니까? \{#config-customization\}

예, 콘솔의 **Settings** 탭을 통해 PostgreSQL 및 PgBouncer 구성 파라미터를 변경할 수 있습니다. 사용 가능한 파라미터와 변경 방법에 대한 자세한 내용은 [Settings](/cloud/managed-postgres/settings) 문서를 참조하십시오.

:::tip
현재 제공되지 않는 파라미터가 필요한 경우 [support](https://clickhouse.com/support/program)에 문의하여 요청하십시오.
:::

## 연결 풀링 \{#connection-pooling\}

### PgBouncer를 통해 `prepared statement does not exist` 오류가 표시되는 이유는 무엇입니까? \{#prepared-statement-errors\}

Managed Postgres는 **transaction pooling** 모드로 PgBouncer를 실행합니다. 이 모드에서는 백엔드 Postgres connection이 단일 transaction 동안에만 클라이언트에 할당된 뒤 풀로 반환됩니다. 따라서 동일한 클라이언트의 다음 transaction은 다른 백엔드에 할당될 수 있습니다.

이 때문에 **server-side prepared statements**가 정상적으로 동작하지 않습니다. 이는 `PREPARE`(또는 확장 쿼리 `Parse`)를 실행한 특정 백엔드에 종속되기 때문입니다. 해당 `EXECUTE`가 다른 백엔드로 전달되면 다음과 같은 오류가 발생합니다:

```text
ERROR:  prepared statement "..." does not exist
ERROR:  unnamed prepared statement does not exist
```

다음과 같은 증상도 흔히 같은 근본 원인에서 비롯됩니다:

* 특히 백필이나 높은 동시성의 쓰기 작업 중 `prepared statement does not exist` 오류가 급증함
* &quot;조용히 실패하는&quot; 것처럼 보이는 삽입 — SQL 문에 오류가 발생하고 드라이버가 재시도하면서, 배치가 일부만 적용되거나 누락될 수 있음
* 잘못된 유형의 반환값(예: `BIGINT` 컬럼이 `float64` 비트 패턴으로 디코딩됨) — 이는 캐시된 클라이언트 측 실행 계획이, 해당 `Parse`를 한 번도 받지 않은 백엔드에 대해 오래된 유형/형식 코드를 재사용할 때 발생함

**해결 방법: 드라이버에서 서버 측 prepared statement를 비활성화하십시오.** 정확한 설정은 사용하는 클라이언트 라이브러리에 따라 다릅니다:

| Driver                           | Setting                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| **pgx** (Go)                     | `statement_cache_capacity=0` and `default_query_exec_mode=exec` (or `simple_protocol`) |
| **psycopg3** (Python)            | `prepare_threshold=None`                                                               |
| **asyncpg** (Python)             | `statement_cache_size=0`                                                               |
| **JDBC** (Java)                  | `prepareThreshold=0`                                                                   |
| **node-postgres / pg** (Node.js) | `query()`에 `name`을 전달하지 마십시오 (`name`이 지정된 쿼리는 서버 측 prepared statement가 됨)              |

워크로드가 prepared statement에 의존하는 경우, PgBouncer 풀러를 거치지 말고 **PostgreSQL에 직접**(포트 5432) 연결하십시오. 직접 연결은 prepared statement를 정상적으로 지원합니다. 풀링 엔드포인트와 직접 엔드포인트 중 어떤 것을 선택할지에 대한 자세한 내용은 [Connection](/cloud/managed-postgres/connection)을 참조하십시오.

### PgBouncer의 `max_client_conn` 설정은 무엇을 의미하며, Postgres의 `max_connections`와는 어떤 관계가 있습니까? \{#pgbouncer-vs-pg-connections\}

이 둘은 서로 다른 대상을 제어합니다.

* **Postgres `max_connections`**는 PostgreSQL 자체에 대한 **백엔드** 연결 수의 상한을 정합니다. 이 값은 비용이 큰 항목입니다. 각 백엔드는 메모리와 프로세스 슬롯을 사용합니다.
* **PgBouncer `max_client_conn`**는 풀러 내부에서 동시에 열 수 있는 **클라이언트** 연결 수의 상한을 정합니다. PgBouncer는 이렇게 많은 클라이언트 연결을 훨씬 더 적은 수의 백엔드 연결로 다중화합니다.

일반적인 Managed Postgres 인스턴스는 PgBouncer가 **Postgres 백엔드 수보다 약 10배 많은 클라이언트 연결**을 허용하도록 구성됩니다(예: 클라이언트 5000개 / 백엔드 500개). 풀러에서 연결 오류가 발생한다면, 눈에 잘 띄는 클라이언트 한도보다는 풀별 백엔드 한도(`default_pool_size`)에 도달했을 가능성이 훨씬 높습니다.

## 데이터베이스 기능 \{#database-capabilities\}

### 여러 개의 데이터베이스와 스키마를 생성할 수 있습니까? \{#multiple-databases-schemas\}

예. Managed Postgres는 단일 인스턴스 내에서 여러 데이터베이스와 스키마를 지원하는 것을 포함하여 PostgreSQL의 모든 기본 기능을 제공합니다. 표준 PostgreSQL 명령어를 사용하여 데이터베이스와 스키마를 생성하고 관리할 수 있습니다.

### 역할 기반 접근 제어(RBAC)를 지원하나요? \{#rbac-support\}

Managed Postgres 인스턴스에 대한 완전한 슈퍼유저(superuser) 권한이 부여되므로, 표준 PostgreSQL 명령을 사용하여 역할을 생성하고 권한을 관리할 수 있습니다.

:::note
콘솔과 통합된 향상된 RBAC 기능이 올해 안에 제공될 예정입니다.
:::

## 업그레이드 \{#upgrades\}

### PostgreSQL 버전 업그레이드는 어떻게 처리됩니까? \{#version-upgrades\}

마이너(minor) 및 메이저(major) 버전 업그레이드는 모두 페일오버를 통해 수행되며, 일반적으로 몇 초 정도의 다운타임만 발생합니다. 업그레이드 적용 시점을 제어하기 위해 유지 관리 시간대를 구성할 수 있습니다. 자세한 내용은 [Upgrades](/cloud/managed-postgres/upgrades) 문서를 참조하십시오.

## 마이그레이션 \{#migration\}

### Managed Postgres로 마이그레이션할 때 사용할 수 있는 도구는 무엇입니까? \{#migration-tools\}

Managed Postgres는 여러 마이그레이션 방식을 지원합니다.

- **pg_dump 및 pg_restore**: 작은 데이터베이스나 1회성 마이그레이션에 적합합니다. [pg_dump 및 pg_restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore) 가이드를 참조하십시오.
- **논리적 복제(Logical replication)**: 최소 다운타임이 필요한 대규모 데이터베이스에 적합합니다. [Logical replication](/cloud/managed-postgres/migrations/logical-replication) 가이드를 참조하십시오.
- **PeerDB**: 다른 Postgres 소스에서 CDC 기반 복제를 수행할 때 사용합니다. [PeerDB 마이그레이션](/cloud/managed-postgres/migrations/peerdb) 가이드를 참조하십시오.

:::note
완전 관리형 마이그레이션 경험이 곧 제공될 예정입니다.
:::