---
slug: /cloud/managed-postgres
title: '관리형 Postgres'
description: 'NVMe 스토리지 기반의 빠르고 확장 가능하며 엔터프라이즈급 Postgres로, 실시간 분석을 위한 네이티브 ClickHouse 통합을 제공합니다'
keywords: ['관리형 Postgres', 'PostgreSQL', '클라우드 데이터베이스', 'Postgres 서비스', 'NVMe Postgres', 'ClickHouse 통합']
doc_type: 'guide'
pagination_next: cloud/managed-postgres/quickstart
pagination_prev: null
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="overview" />

ClickHouse Managed Postgres는 성능과 확장성을 위해 설계된 엔터프라이즈급 관리형 Postgres 서비스입니다. 컴퓨트와 물리적으로 동일한 위치에 있는 NVMe 스토리지를 기반으로, EBS와 같은 네트워크 연결 스토리지를 사용하는 다른 서비스에 비해 디스크 입출력에 병목이 있는 워크로드에서 최대 10배 더 빠른 성능을 제공합니다.

Citus Data, Heroku, Microsoft에서 세계적 수준의 Postgres를 제공해 온 이력을 가진 창업 팀이 있는 [Ubicloud](https://www.ubicloud.com/)와의 파트너십으로 구축된 Managed Postgres는 빠르게 성장하는 애플리케이션이 흔히 직면하는 성능 문제를 해결합니다. 예를 들어 느린 수집 및 업데이트, 느린 vacuum 작업, 증가하는 테일 레이턴시, 제한된 디스크 IOPS로 인해 발생하는 WAL 스파이크 등이 있습니다.

{/* TODO: Postgres와 ClickHouse 통합 아키텍처 다이어그램
    Path: /static/images/cloud/managed-postgres/architecture-overview.png */}


## NVMe 기반 성능 \{#nvme-performance\}

대부분의 관리형 Postgres 서비스는 Amazon EBS와 같은 네트워크 연결 스토리지를 사용하며, 디스크에 접근할 때마다 네트워크 왕복이 발생합니다. 이는 밀리초(ms) 단위의 지연 시간을 유발하고 IOPS를 제한하여, 쓰기 집약적이거나 I/O 집약적인 워크로드에서 병목 현상을 초래합니다.

관리형 Postgres는 데이터베이스와 동일한 서버에 물리적으로 연결된 NVMe 스토리지를 사용합니다. 이러한 아키텍처 차이는 다음과 같은 이점을 제공합니다.

- 밀리초가 아닌 **마이크로초(µs) 수준의 디스크 지연 시간**
- 네트워크 병목이 없는 **무제한 로컬 IOPS**
- 동일한 비용으로 디스크 성능에 제약을 받는 워크로드에서 **최대 10배 빠른 성능**

Postgres 워크로드가 주로 디스크 IOPS와 지연 시간에 의해 제한되는 경우, 이는 더 빠른 데이터 수집, 더 신속한 VACUUM 작업, 더 낮은 테일 레이턴시(tail latency), 부하 상태에서도 더 예측 가능한 성능으로 이어집니다.

## 네이티브 ClickHouse 통합 \{#clickhouse-integration\}

Managed Postgres는 ClickHouse와 네이티브로 통합되어, 복잡한 ETL 파이프라인 없이 트랜잭션과 분석을 함께 처리할 수 있게 합니다.

### Postgres에서 ClickHouse로 복제 \{#postgres-replication\}

[ClickPipes의 Postgres CDC 커넥터](/integrations/clickpipes/postgres)를 사용하여 Postgres 데이터를 ClickHouse로 복제합니다. 이 커넥터는 초기 로드와 지속적인 증분 동기화를 모두 처리하며, 수백 개의 엔터프라이즈 고객이 매달 수백 테라바이트의 데이터를 전송하는 실제 운영 환경에서 검증되었습니다.

### pg_clickhouse: 통합 쿼리 계층 \{#pg-clickhouse\}

모든 Managed Postgres 인스턴스에는 [`pg_clickhouse`](https://github.com/ClickHouse/pg_clickhouse) 확장 기능이 포함되어 있어 Postgres에서 ClickHouse를 직접 쿼리할 수 있습니다. 애플리케이션은 여러 데이터베이스에 각각 연결할 필요 없이 트랜잭션과 분석 워크로드 모두에 대해 Postgres를 통합 쿼리 계층으로 사용할 수 있습니다.

이 확장 기능은 필터, 조인, 세미 조인, 집계, 함수에 대한 지원을 포함하여, 효율적인 실행을 위해 쿼리를 ClickHouse로 포괄적으로 푸시다운합니다. 현재 22개의 TPC-H 쿼리 중 14개가 완전히 푸시다운되며, 표준 Postgres에서 동일한 쿼리를 실행하는 것과 비교해 60배 이상의 성능 향상을 제공합니다.

## 엔터프라이즈급 안정성 \{#enterprise-reliability\}

Managed Postgres는 운영 환경 워크로드에 필요한 안정성과 보안 기능을 제공합니다.

### 고가용성 \{#high-availability\}

쿼럼 기반 복제를 사용하여 서로 다른 가용 영역에 최대 2개의 대기 레플리카를 구성합니다. 이러한 대기 레플리카는 고가용성과 자동 장애 조치에 전용으로 사용되며, 데이터베이스가 장애로부터 신속하게 복구되도록 보장합니다. 읽기 확장을 위해 별도의 [읽기 레플리카](/cloud/managed-postgres/read-replicas)를 프로비저닝할 수 있습니다. 구성 방식에 대한 자세한 내용은 [고가용성](/cloud/managed-postgres/high-availability) 페이지를 참조하십시오.

### 백업 및 복구 \{#backups\}

모든 인스턴스에는 포크(fork)와 시점 복구(point-in-time recovery)를 지원하는 자동 백업이 제공됩니다. 백업은 잘 알려진 오픈 소스 도구인 [WAL-G](https://github.com/wal-g/wal-g)를 사용하여 수행되며, 전체 백업과 WAL의 연속 아카이빙을 통해 데이터를 객체 스토리지에 저장합니다.

### 보안 및 규정 준수 \{#security-compliance\}

Managed Postgres는 ClickHouse Cloud와 동일한 보안 표준을 충족하도록 설계되었습니다.

- **인증**: SAML/SSO 지원
- **네트워크 보안**: IP 허용 목록 구성, 저장 및 전송 중 암호화(TLS 1.3)
- **액세스 제어**: 데이터베이스 관리를 위한 완전한 superuser 권한 제공

### 오픈 소스 기반 \{#open-source\}

Postgres와 ClickHouse는 모두 크고 활발한 커뮤니티를 가진 오픈 소스 데이터베이스입니다. `pg_clickhouse` 확장과 PeerDB로 구동되는 CDC 복제를 포함한 통합 구성 요소 또한 모두 오픈 소스입니다. 이러한 기반을 통해 벤더 종속성이 발생하지 않고, 데이터 스택에 대한 완전한 제어권과 장기적인 유연성을 확보할 수 있습니다.