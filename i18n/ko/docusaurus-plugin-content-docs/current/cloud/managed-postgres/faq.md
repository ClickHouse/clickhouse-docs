---
slug: /cloud/managed-postgres/faq
sidebar_label: 'FAQ'
title: 'Managed Postgres 자주 묻는 질문(FAQ)'
description: 'ClickHouse Managed Postgres에 대한 자주 묻는 질문'
keywords: ['managed postgres faq', 'postgres questions', 'metrics', 'extensions', 'migration', 'terraform']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="faq" />


## 모니터링 및 메트릭 \{#monitoring-and-metrics\}

### Managed Postgres 인스턴스의 메트릭은 어떻게 확인할 수 있습니까? \{#metrics-access\}

ClickHouse Cloud 콘솔의 Managed Postgres 인스턴스 **Monitoring** 탭에서 CPU, 메모리, IOPS 및 스토리지 사용량을 직접 모니터링할 수 있습니다.

:::note
세부적인 쿼리 분석을 위한 Query Performance Insights 기능은 곧 제공될 예정입니다.
:::

## 백업 및 복구 \{#backup-and-recovery\}

### 사용 가능한 백업 옵션은 무엇입니까? \{#backup-options\}

Managed Postgres에는 연속 WAL 아카이빙이 포함된 자동 일별 백업이 제공되며, 이를 통해 7일 보존 기간 내의 임의 시점으로 시점 복구(point-in-time recovery)를 수행할 수 있습니다. 백업은 S3에 저장됩니다.

백업 주기, 보존 기간 및 시점 복구 수행 방법에 대한 자세한 내용은 [Backup and restore](/cloud/managed-postgres/backup-and-restore) 문서를 참조하십시오.

## 인프라 및 자동화 \{#infrastructure-and-automation\}

### Managed Postgres에서 Terraform을 사용할 수 있습니까? \{#terraform-support\}

현재 Managed Postgres는 Terraform을 지원하지 않습니다. 인스턴스를 생성하고 관리하려면 ClickHouse Cloud 콘솔 사용을 권장합니다.

## 확장 기능 및 구성 \{#extensions-and-configuration\}

### 어떤 확장이 지원되나요? \{#extensions-supported\}

Managed Postgres는 PostGIS, pgvector, pg_cron 등과 같은 인기 있는 확장을 포함하여 100개가 넘는 PostgreSQL 확장을 지원합니다. 사용 가능한 확장의 전체 목록과 설치 방법은 [Extensions](/cloud/managed-postgres/extensions) 문서를 참고하십시오.

### PostgreSQL 구성 파라미터를 사용자 지정할 수 있습니까? \{#config-customization\}

예, 콘솔의 **Settings** 탭을 통해 PostgreSQL 및 PgBouncer 구성 파라미터를 변경할 수 있습니다. 사용 가능한 파라미터와 변경 방법에 대한 자세한 내용은 [Settings](/cloud/managed-postgres/settings) 문서를 참조하십시오.

:::tip
현재 제공되지 않는 파라미터가 필요한 경우 [support](https://clickhouse.com/support/program)에 문의하여 요청하십시오.
:::

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