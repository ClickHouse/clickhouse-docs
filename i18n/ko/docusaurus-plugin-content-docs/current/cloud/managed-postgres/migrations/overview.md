---
slug: /cloud/managed-postgres/migrations/overview
sidebar_label: '개요'
title: 'ClickHouse Managed Postgres 데이터 마이그레이션'
description: 'ClickHouse Managed Postgres로 마이그레이션하는 4가지 경로를 비교하고, 소스 DB와 다운타임 요구 사항에 맞는 경로를 선택합니다.'
keywords: ['managed postgres', '데이터 마이그레이션', 'postgres 마이그레이션', 'clickpipes', 'peerdb', 'pg_dump', 'pg_restore', '논리적 복제']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

# Managed Postgres 데이터 마이그레이션 \{#managed-postgres-data-migration\}

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.migration-overview-beta" />

Managed Postgres로의 마이그레이션은 4가지 경로로 수행할 수 있습니다. 어떤
방법이 적합한지는 지속적인 복제(CDC)가 필요한지, 어떤 원본에서
마이그레이션하는지, 그리고 전환 시 애플리케이션에서 허용할 수 있는
다운타임이 얼마나 되는지에 따라 달라집니다.

| 방법                                                                                      | 지속적인 복제(CDC) | 실행 위치               | 가장 적합한 경우                                  |
| --------------------------------------------------------------------------------------- | ------------ | ------------------- | ------------------------------------------ |
| [ClickPipes](/cloud/managed-postgres/migrations/clickpipes)                             | 예            | ClickHouse Cloud 콘솔 | 대부분의 마이그레이션 — 초기 적재와 CDC를 기본 제공하는 가이드형 마법사 |
| [PeerDB](/cloud/managed-postgres/migrations/peerdb)                                     | 예            | 자체 호스팅(Docker)      | ClickPipes UI에서 지원하지 않는 원본 또는 워크플로         |
| [pg&#95;dump and pg&#95;restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore) | 아니요          | 로컬 머신               | 다운타임 허용이 가능한 작거나 정적인 데이터셋의 일회성 이동 작업       |
| [논리적 복제](/cloud/managed-postgres/migrations/logical-replication)                        | 예            | 원본 및 대상 Postgres    | 서드파티 도구 없이 네이티브 Postgres 복제를 직접 제어해야 하는 경우 |

## ClickPipes \{#clickpipes\}

[ClickPipes](/cloud/managed-postgres/migrations/clickpipes)는 대부분의 마이그레이션에 권장되는
경로입니다. 모든 작업이 ClickHouse Cloud 콘솔 내에서 이루어지며,
소스에 연결하고, 스키마(schema)를 내보내고 가져오고, CDC 사용 여부와 관계없이
초기 적재를 시작하는 과정을 단계별로 안내합니다. 사전 구축된 소스
커넥터는 Amazon RDS, Aurora, Supabase, Google Cloud SQL, Azure
Flexible Server, Neon, Crunchy Bridge, TimescaleDB 및 모든 일반적인 Postgres
인스턴스를 지원합니다.

## PeerDB \{#peerdb\}

[PeerDB](/cloud/managed-postgres/migrations/peerdb)는 Docker로 실행하는 자체 호스팅 마이그레이션
도구입니다. 소스 또는 워크플로가 ClickPipes 마법사에 맞지 않을 때 사용하십시오.
예를 들어, 여러 데이터베이스에 걸쳐 peer 생성을 스크립트로 처리해야 하거나
마이그레이션을 전적으로 자체 네트워크 내부에서 실행해야 하는 경우에 적합합니다.
PeerDB는 인덱스, 제약 조건 또는 트리거를 자동으로 마이그레이션하지 않으므로
데이터가 적재된 후 대상에서 이를 다시 생성해야 합니다.

## pg_dump and pg_restore \{#pg-dump-pg-restore\}

[pg&#95;dump and pg&#95;restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore)
는 소스의 스냅샷을 만든 다음 이를 대상에 다시 적용합니다. 지속적인
복제가 없으므로 덤프 및 복원 기간 동안 소스에 대한 쓰기를
중단해야 합니다. 따라서 규모가 작거나 변경이 거의 없는 데이터셋, 또는
유지 관리 기간을 허용할 수 있는 비프로덕션 환경에 적합합니다.

## 논리적 복제 \{#logical-replication\}

[논리적 복제](/cloud/managed-postgres/migrations/logical-replication)는
Postgres의 네이티브 publication과 subscription을 사용해
원본에서 대상으로 변경 사항을 스트리밍합니다. `wal_level`, replication slot,
그리고 `REPLICATION` 권한은 직접 구성해야 하며, 중간에 개입하는
서드파티 도구는 없습니다. 복제
메커니즘을 완전히 제어해야 하거나 환경상 외부 마이그레이션 도구를 사용할 수 없는 경우 이 방식을 선택하십시오.

## 마이그레이션 후 \{#after-migration\}

데이터 이동이 진행되기 시작하면 [데이터 검증](/cloud/managed-postgres/migrations/data-validation)을 사용하여
애플리케이션 트래픽을 전환하기 전에 소스와 대상의 행 수와 데이터 내용이 일치하는지
확인하십시오. [마이그레이션 FAQ](/cloud/managed-postgres/migrations/faq)에서는
자주 발생하는 오류와 복구 절차를 다룹니다.

## Supabase에서 마이그레이션하기 \{#supabase\}

Supabase에서 마이그레이션하는 경우, 단계별 절차는 [Supabase to Managed Postgres migration guide](https://github.com/iskakaushik/supa-auth-migrate/blob/main/MIGRATION.md)를 참조하십시오.