---
slug: /cloud/managed-postgres/backup-and-restore
sidebar_label: '백업 및 복원'
title: '백업 및 복원'
description: 'ClickHouse Managed Postgres의 백업 전략과 시점 복구(point-in-time recovery)를 이해할 수 있도록 설명합니다'
keywords: ['백업', '복원', '시점 복구', 'pitr', '재해 복구', 'Postgres 백업']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import backupAndRestore from '@site/static/images/managed-postgres/backup-and-restore.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="backup-and-restore" />

Managed Postgres는 자동 백업과 시점 복구(point-in-time recovery) 기능으로 데이터의 안전성과 가용성을 보장합니다. 인스턴스의 **Backups** 화면에서 백업 이력을 확인하고 복구를 시작할 수 있습니다.

<Image img={backupAndRestore} alt="백업 이력과 시점 복구 옵션을 보여주는 Backups 화면" size="lg" border />


## 백업 \{#backups\}

### 백업 빈도 \{#backup-frequency\}

Managed Postgres에서는 데이터베이스의 전체 백업을 매일 수행합니다. 또한 전체 백업과 더불어, 사전 기록 로그(Write-Ahead Log, WAL) 파일은 60초마다 또는 WAL 데이터가 16 MB 누적될 때마다(둘 중 먼저 도달하는 시점에) 아카이브됩니다. 전체 백업과 지속적인 WAL 아카이빙을 결합하면 보존 기간(retention window) 내에서 임의의 시점으로 시점 복구(point-in-time recovery)를 수행할 수 있습니다.

### 보존 기간 \{#retention-period\}

백업은 7일 동안 보존되며, 데이터 손실 또는 손상 발생 시 복구할 수 있는 충분한 기간을 제공합니다. 더 긴 백업 보존 기간이 필요한 경우 [support](https://clickhouse.com/support/program)에 문의하십시오.

### Storage and durability \{#storage-and-durability\}

백업은 이레이저 코딩을 사용하여 여러 서버에 복제되므로, 일부 스토리지 서버를 사용할 수 없게 되더라도 백업에 계속 접근할 수 있습니다. 백업 스토리지는 버킷 수준에서 격리되며, 각 Managed Postgres 인스턴스는 자체 전용 스토리지 버킷을 가지며 자격 증명은 해당 인스턴스의 백업에만 접근할 수 있도록 범위가 제한되도록 구성됩니다.

## 시점 복구(Point-in-time recovery) \{#point-in-time-recovery\}

시점 복구를 사용하면 백업 보존 기간 내에서 원하는 특정 시점으로 데이터베이스를 복원할 수 있습니다. 이는 실수로 인한 데이터 삭제, 데이터 손상 또는 정상적인 상태로 되돌려야 하는 기타 문제에서 복구하는 데 유용합니다.

시점 복구를 수행하려면:

1. Managed Postgres 인스턴스의 **Backups** 화면으로 이동합니다.
2. **Point in time recovery** 섹션에서 복원하려는 기준 시점의 날짜와 시간(UTC 기준)을 선택합니다.
3. **Restore to point in time**을 클릭합니다.

복원 작업은 선택한 시점에 존재하던 데이터베이스 상태를 가진 새 Managed Postgres 인스턴스를 생성합니다. 원래 인스턴스는 변경되지 않은 상태로 유지되므로, 어떤 인스턴스를 유지할지 결정하기 전에 복원된 데이터를 확인할 수 있습니다.