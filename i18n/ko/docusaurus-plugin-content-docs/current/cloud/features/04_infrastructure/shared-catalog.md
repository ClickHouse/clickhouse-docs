---
'slug': '/cloud/reference/shared-catalog'
'sidebar_label': '공유 카탈로그'
'title': '공유 카탈로그 및 공유 데이터베이스 엔진'
'keywords':
- 'SharedCatalog'
- 'SharedDatabaseEngine'
'description': 'ClickHouse Cloud에서 Shared Catalog 구성 요소와 Shared database engine을 설명합니다.'
'doc_type': 'reference'
---


# Shared catalog and shared database engine {#shared-catalog-and-shared-database-engine}

**ClickHouse Cloud(및 제1자 파트너 클라우드 서비스) 전용 제공**

Shared Catalog는 ClickHouse Cloud에서 상태 비저장 엔진을 사용하는 데이터베이스 및 테이블의 메타데이터 및 DDL 작업을 복제하는 클라우드 네이티브 구성 요소입니다. 이는 이러한 객체에 대한 일관되고 중앙 집중화된 상태 관리를 가능하게 하여, 동적이거나 부분적으로 오프라인인 환경에서도 메타데이터 일관성을 보장합니다.

Shared Catalog는 **테이블 자체를 복제하지 않고**, DDL 쿼리 및 메타데이터를 복제하여 모든 복제본이 데이터베이스 및 테이블 정의에 대한 일관된 뷰를 갖도록 보장합니다.

다음 데이터베이스 엔진의 복제를 지원합니다:

- Shared
- PostgreSQL
- MySQL
- DataLakeCatalog

## Architecture and metadata storage {#architecture-and-metadata-storage}

Shared Catalog의 모든 메타데이터 및 DDL 쿼리 기록은 ZooKeeper에 중앙 집중화되어 저장됩니다. 로컬 디스크에 어떤 것도 지속되지 않습니다. 이 아키텍처는 다음을 보장합니다:

- 모든 복제본 간의 일관된 상태
- 컴퓨트 노드의 비상태성
- 빠르고 신뢰할 수 있는 복제본 부트스트랩

## Shared database engine {#shared-database-engine}

**Shared database engine**은 Shared Catalog와 함께 작동하여 **상태 비저장 테이블 엔진**인 `SharedMergeTree`와 같은 테이블을 사용하는 데이터베이스를 관리합니다. 이러한 테이블 엔진은 지속적인 상태를 디스크에 기록하지 않으며 동적 컴퓨트 환경과 호환됩니다.

Shared database engine은 Replicated database engine의 동작을 개선하고 추가 보장 및 운영상의 이점을 제공합니다.

### Key benefits {#key-benefits}

- **원자적 CREATE TABLE ... AS SELECT**
  테이블 생성 및 데이터 삽입은 원자적으로 실행됩니다—전체 작업이 완료되거나 테이블이 전혀 생성되지 않습니다.

- **데이터베이스 간 RENAME TABLE**
  데이터베이스 간 테이블의 원자적 이동을 가능하게 합니다:
```sql
RENAME TABLE db1.table TO db2.table;
```

- **자동 테이블 복구를 통한 UNDROP TABLE**
  삭제된 테이블은 기본적으로 8시간 동안 유지되며 복원할 수 있습니다:
```sql
UNDROP TABLE my_table;
```
  보존 창은 서버 설정을 통해 구성 가능합니다.

- **개선된 컴퓨트-컴퓨트 분리**
  DROP 쿼리를 처리하기 위해 모든 복제본이 온라인 상태여야 하는 Replicated database engine과는 달리, Shared Catalog는 중앙 집중화된 메타데이터 삭제를 수행합니다. 이는 일부 복제본이 오프라인인 경우에도 작업이 성공할 수 있게 합니다.

- **자동 메타데이터 복제**
  Shared Catalog는 데이터베이스 정의가 시작 시 모든 서버에 자동으로 복제되도록 보장합니다. 운영자는 새 인스턴스에서 메타데이터를 수동으로 구성하거나 동기화할 필요가 없습니다.

- **중앙 집중식, 버전 관리된 메타데이터 상태**
  Shared Catalog는 ZooKeeper에 단일 진실의 출처를 저장합니다. 복제본이 시작되면 최신 상태를 가져와 일관성을 달성하기 위해 차이를 적용합니다. 쿼리 실행 중에는 시스템이 정확성을 보장하기 위해 다른 복제본이 적어도 요구되는 메타데이터 버전에 도달할 때까지 기다릴 수 있습니다.

## Usage in ClickHouse Cloud {#usage-in-clickhouse-cloud}

최종 사용자는 Shared Catalog 및 Shared database engine을 사용할 때 추가 구성이 필요하지 않습니다. 데이터베이스 생성은 항상 동일합니다:

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloud는 자동으로 Shared database engine을 데이터베이스에 할당합니다. 상태 비저장 엔진을 사용하여 이러한 데이터베이스 내에서 생성된 모든 테이블은 자동으로 Shared Catalog의 복제 및 조정 기능을 활용하게 됩니다.

## Summary {#summary}

Shared Catalog와 Shared database engine은 다음을 제공합니다:

- 상태 비저장 엔진에 대한 신뢰할 수 있고 자동화된 메타데이터 복제
- 로컬 메타데이터 지속성 없는 비상태 컴퓨트
- 복잡한 DDL에 대한 원자적 작업
- 탄력적, 일시적, 또는 부분적으로 오프라인 컴퓨트 환경에 대한 견고한 지원
- ClickHouse Cloud 사용자를 위한 원활한 사용

이러한 기능들은 Shared Catalog가 ClickHouse Cloud에서 확장 가능한 클라우드 네이티브 메타데이터 관리의 기초가 되게 만듭니다.
