---
slug: /cloud/reference/shared-catalog
sidebar_label: '공유 카탈로그'
title: '공유 카탈로그와 공유 데이터베이스 엔진'
keywords: ['SharedCatalog', 'SharedDatabaseEngine']
description: 'ClickHouse Cloud의 Shared Catalog 구성 요소와 Shared Database 엔진을 설명합니다'
doc_type: 'reference'
---

# Shared catalog and shared database engine \{#shared-catalog-and-shared-database-engine\}

**ClickHouse Cloud (및 퍼스트파티 파트너 Cloud 서비스)에서만 사용할 수 있습니다**

Shared Catalog는 ClickHouse Cloud에서 stateless 엔진을 사용하는 데이터베이스와 테이블의 메타데이터 및 DDL 작업을 레플리카 간에 복제하는 역할을 하는 클라우드 네이티브 컴포넌트입니다. 이 컴포넌트는 이러한 객체에 대해 일관되고 중앙화된 상태 관리를 가능하게 하여, 동적이거나 일부 노드가 오프라인인 환경에서도 메타데이터의 일관성을 보장합니다.

Shared Catalog는 **테이블 자체를 복제하지는 않지만**, DDL 쿼리와 메타데이터를 복제하여 모든 레플리카가 데이터베이스와 테이블 정의를 일관되게 볼 수 있도록 보장합니다.

다음 데이터베이스 엔진의 복제를 지원합니다:

- Shared
- PostgreSQL
- MySQL
- DataLakeCatalog

## 아키텍처와 메타데이터 저장 \{#architecture-and-metadata-storage\}

Shared Catalog의 모든 메타데이터와 DDL 쿼리 이력은 ZooKeeper에 중앙에서 저장됩니다. 로컬 디스크에는 어떤 데이터도 영구적으로 저장되지 않습니다. 이러한 아키텍처는 다음을 보장합니다:

- 모든 레플리카 간의 일관된 상태
- 컴퓨트 노드의 상태 비저장(stateless) 특성
- 빠르고 신뢰할 수 있는 레플리카 부트스트래핑

## 공유 데이터베이스 엔진 \{#shared-database-engine\}

**Shared database engine**은 Shared Catalog와 함께 동작하여 `SharedMergeTree`와 같은 **stateless 테이블 엔진**을 사용하는 데이터베이스를 관리합니다. 이러한 테이블 엔진은 디스크에 영구 상태를 기록하지 않으며, 동적 컴퓨팅 환경과 호환됩니다.

Shared database engine은 Replicated database engine의 동작을 기반으로 이를 개선하여, 추가적인 보장과 운영상 이점을 제공합니다.

### 주요 이점 \{#key-benefits\}

- **Atomic CREATE TABLE ... AS SELECT**
  테이블 생성과 데이터 삽입이 원자적으로 실행되므로, 전체 작업이 모두 완료되거나 테이블이 아예 생성되지 않습니다.

- **데이터베이스 간 RENAME TABLE**
  데이터베이스 간 테이블을 원자적으로 이동할 수 있습니다:
  ```sql
  RENAME TABLE db1.table TO db2.table;
  ```

- **UNDROP TABLE을 통한 자동 테이블 복구**
  DROP된 테이블은 기본값으로 8시간 동안 유지되며 복구할 수 있습니다:
  ```sql
  UNDROP TABLE my_table;
  ```
  보존 기간은 서버 설정으로 구성할 수 있습니다.

- **향상된 컴퓨트-컴퓨트 분리**
  DROP 쿼리를 처리하기 위해 모든 레플리카가 온라인 상태여야 하는 Replicated database engine과 달리, Shared Catalog는 메타데이터 삭제를 중앙에서 수행합니다. 이를 통해 일부 레플리카가 오프라인 상태여도 작업이 성공적으로 완료됩니다.

- **자동 메타데이터 복제**
  Shared Catalog는 서버 시작 시 데이터베이스 정의를 모든 서버에 자동으로 복제합니다. 운영자는 신규 인스턴스에서 메타데이터를 수동으로 구성하거나 동기화할 필요가 없습니다.

- **중앙 집중식 버전 관리 메타데이터 상태**
  Shared Catalog는 ZooKeeper에 단일 진실 소스(single source of truth)를 저장합니다. 레플리카가 시작되면 최신 상태를 가져와 차이(diff)를 적용하여 일관성을 맞춥니다. 쿼리 실행 중 시스템은 정확성을 보장하기 위해 다른 레플리카가 최소한 필요한 메타데이터 버전에 도달할 때까지 대기할 수 있습니다.

## ClickHouse Cloud에서의 사용 \{#usage-in-clickhouse-cloud\}

최종 사용자 관점에서는 Shared Catalog와 Shared database engine을 사용하는 데 추가 구성이 필요하지 않습니다. 데이터베이스 생성 방법은 평소와 동일합니다:

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloud는 데이터베이스에 Shared 데이터베이스 엔진을 자동으로 할당합니다. 이러한 데이터베이스 내에서 stateless 엔진을 사용해 생성된 모든 테이블은 Shared Catalog의 복제 및 조정 기능을 자동으로 활용할 수 있습니다.


## 요약 \{#summary\}

Shared Catalog 및 Shared database 엔진은 다음을 제공합니다:

- 상태 비저장 엔진을 위한 신뢰할 수 있고 자동화된 메타데이터 복제
- 로컬 메타데이터 영속성이 없는 상태 비저장 컴퓨트
- 복잡한 DDL을 위한 원자적 연산
- 탄력적이고 일시적이거나 부분적으로 오프라인인 컴퓨트 환경에 대한 향상된 지원
- ClickHouse Cloud 사용자에게 원활한 사용 경험

이러한 기능으로 Shared Catalog는 ClickHouse Cloud에서 확장 가능하고 클라우드 네이티브한 메타데이터 관리의 기반이 됩니다.