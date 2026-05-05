---
slug: /cloud/data-resiliency
sidebar_label: '데이터 복원력'
title: '재해 복구'
description: '이 가이드는 재해 복구에 대한 개요를 제공합니다.'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'data resiliency', '재해 복구']
---

import Image from '@theme/IdealImage';
import restore_backup from '@site/static/images/cloud/guides/restore_backup.png';


# 데이터 복원력 \{#clickhouse-cloud-data-resiliency\}

이 페이지에서는 ClickHouse Cloud에 대한 재해 복구 권장 사항과 장애 발생 시 고객이 복구할 수 있는 방법에 대한 가이드를 제공합니다.
현재 ClickHouse Cloud는 자동 장애 조치(failover) 또는 여러 지리적 리전 간 자동 동기화를 지원하지 않습니다.

:::tip
고객은 서비스 규모와 구성에 따른 구체적인 RTO를 파악하기 위해 백업 복원 테스트를 정기적으로 수행해야 합니다.
:::

## 정의 \{#definitions\}

먼저 몇 가지 용어를 정의해 두면 도움이 됩니다.

**RPO (Recovery Point Objective)**: 장애 발생 이후 시간 기준으로 허용 가능한 최대 데이터 손실 범위를 의미합니다. 예: RPO가 30분이라면, 장애가 발생했을 때 데이터베이스를 최대 30분 이내 시점의 데이터까지는 복구할 수 있어야 함을 의미합니다. 이는 물론 백업을 얼마나 자주 수행하는지에 따라 달라집니다.

**RTO (Recovery Time Objective)**: 장애로 인한 중단 이후 정상 운영이 재개되기까지 허용 가능한 최대 다운타임을 의미합니다. 예: RTO가 30분이라면, 장애가 발생했을 때 팀이 데이터와 애플리케이션을 복구하여 정상 운영을 30분 이내에 재개할 수 있어야 함을 의미합니다.

**데이터베이스 백업 및 스냅샷(Snapshot)**: 백업은 데이터의 별도 사본을 통해 내구성이 뛰어난 장기 보관을 제공합니다. 스냅샷은 데이터의 추가 사본을 생성하지 않으며, 일반적으로 더 빠르고 더 나은 RPO를 제공합니다.

## 데이터베이스 백업 \{#database-backups\}

기본 서비스의 백업을 유지하는 것은, 기본 서비스에 장애가 발생했을 때 해당 백업을 활용해 복원할 수 있는 효과적인 방법입니다.
ClickHouse Cloud는 백업을 위해 다음과 같은 기능을 지원합니다.

1. **기본 백업**

기본적으로 ClickHouse Cloud는 24시간마다 서비스의 [백업](/cloud/manage/backups)을 수행합니다.
이 백업은 서비스와 동일한 리전에 위치하며, ClickHouse CSP(클라우드 서비스 제공자) 스토리지 버킷에 저장됩니다.
기본 서비스의 데이터가 손상되는 경우, 이 백업을 사용해 새 서비스로 복원할 수 있습니다.

2. **외부 백업(고객 소유 스토리지 버킷 사용)**

Enterprise Tier 고객은 자신의 계정에 있는 객체 스토리지로, 동일 리전 또는 다른 리전에 [백업을 내보낼](/cloud/manage/backups/export-backups-to-own-cloud-account) 수 있습니다.
Cloud 간 백업 내보내기 지원은 곧 제공될 예정입니다.
리전 간 및 Cloud 간 백업에는 해당되는 데이터 전송 요금이 적용됩니다.

:::note
이 기능은 현재 PCI/HIPAA 서비스에서는 사용할 수 없습니다.
:::

3. **구성 가능한 백업**

고객은 RPO를 개선하기 위해 최대 6시간마다 백업이 수행되도록 [백업을 구성](/cloud/manage/backups/configurable-backups)할 수 있습니다.
또한 더 긴 보존 기간을 구성할 수도 있습니다.

현재 서비스에서 사용 가능한 백업은 ClickHouse Cloud 콘솔의 「backups」 페이지에 나열됩니다.
이 섹션에서는 각 백업에 대한 성공/실패 상태도 제공합니다.

## 백업에서 복원하기 \{#restoring-from-a-backup\}

1. ClickHouse Cloud 버킷에 있는 기본 백업은 동일한 리전의 새 서비스로 복원할 수 있습니다.
2. 외부 백업(고객 객체 스토리지에 저장된 백업)은 동일하거나 다른 리전의 새 서비스로 복원할 수 있습니다.

## 백업 및 복구 소요 시간 안내 \{#backup-and-restore-duration-guidance\}

백업 및 복구 소요 시간은 데이터베이스의 크기, 스키마, 테이블 개수 등 여러 요소에 따라 달라집니다.

테스트 결과, 약 1 TB 정도의 작은 백업도 백업을 완료하는 데 10–15분 또는 그 이상이 소요되는 것을 확인했습니다.
20 TB 미만의 백업은 일반적으로 1시간 이내에 완료되며, 약 50 TB의 데이터를 백업하는 데는 2–3시간 정도가 소요됩니다.
백업 크기가 커질수록 규모의 경제 효과가 나타나며, 일부 내부 서비스에서 최대 1 PB까지의 백업이 10시간 이내에 완료되는 것을 확인했습니다.

실제 소요 시간은 위에서 설명한 여러 요소에 따라 달라지므로, 자체 데이터베이스 또는 샘플 데이터를 사용해 테스트하여 보다 정확한 추정치를 파악할 것을 권장합니다.

복구 소요 시간은 동일한 데이터 크기인 경우 백업 소요 시간과 비슷합니다.
앞에서 언급했듯이, 백업을 복구하는 데 어느 정도 시간이 걸리는지 파악하기 위해 자체 데이터베이스로 테스트할 것을 권장합니다.

:::note
현재 동일 리전이든 다른 리전이든 2개의 ClickHouse Cloud 인스턴스 간 자동 장애 조치는 지원되지 않습니다.
현재 동일 리전 또는 다른 리전에 있는 서로 다른 ClickHouse Cloud 서비스 간 데이터 자동 동기화(즉, 액티브-액티브 복제)는 지원되지 않습니다.
:::

## 복구 프로세스 \{#recovery-process\}

이 섹션에서는 다양한 복구 옵션과 각 경우별로 따를 수 있는 절차를 설명합니다.

### 기본 서비스 데이터 손상 \{#primary-service-data-corruption\}

이 경우 동일한 리전의 다른 서비스로 백업 데이터를 [복원할 수 있습니다](/cloud/manage/backups/overview#restore-a-backup).
기본 백업 정책을 사용하는 경우 백업은 최대 24시간 이전 시점의 데이터일 수 있으며, 6시간 주기로 구성 가능한 백업을 사용하는 경우 최대 6시간 이전 시점의 데이터일 수 있습니다.

#### 복원 단계 \{#restoration-steps\}

기존 백업에서 복원하려면 다음 단계를 수행합니다.

<VerticalStepper headerLevel="list">

1. ClickHouse Cloud 콘솔의 「Backups」 섹션으로 이동합니다.
2. 복원하려는 특정 백업의 「Actions」 아래에 있는 세 점 아이콘을 클릭합니다.
3. 새 서비스에 고유한 이름을 지정한 후 이 백업에서 복원합니다.

<Image img={restore_backup} size="md" alt="백업에서 복원"/>

</VerticalStepper>

### 기본 리전 다운타임 \{#primary-region-downtime\}

Enterprise Tier 고객은 백업을 자체 클라우드 제공업체의 버킷으로 [내보낼 수 있습니다](/cloud/manage/backups/export-backups-to-own-cloud-account).
리전 장애가 우려되는 경우, 백업을 다른 리전으로 내보낼 것을 권장합니다.
리전 간 데이터 전송 요금이 적용된다는 점을 유의하십시오.

기본 리전이 장애로 인해 중단되는 경우, 다른 리전에 있는 백업을 사용해 해당 리전에 새 서비스를 생성하여 복원할 수 있습니다.

백업을 다른 서비스로 복원한 후에는 DNS, 로드 밸런서 또는 연결 문자열 구성이 새 서비스를 가리키도록 모두 업데이트되어 있는지 확인해야 합니다.
이를 위해 다음 작업이 필요할 수 있습니다.

- 환경 변수 또는 시크릿 업데이트
- 새 연결을 설정하기 위해 애플리케이션 서비스 재시작

:::note
외부 버킷으로의 백업/복구는 현재 [Transparent Data Encryption (TDE)](/cloud/security/cmek#transparent-data-encryption-tde)를 사용하는 서비스에서는 지원되지 않습니다.
:::

## 추가 옵션 \{#additional-options\}

추가로 고려할 수 있는 옵션이 있습니다.

1. **별도 클러스터에 이중 쓰기**

이 옵션에서는 서로 다른 리전에 2개의 별도 클러스터를 구성한 후, 두 클러스터 모두에 이중으로 데이터를 기록합니다.
여러 서비스를 동시에 실행해야 하므로 비용이 더 많이 들지만, 한 리전에 장애가 발생했을 때 더 높은 가용성을 제공합니다.

2. **CSP 복제 활용**

이 옵션에서는 클라우드 서비스 제공자의 네이티브 객체 스토리지 복제 기능을 사용하여 데이터를 복사합니다.
예를 들어 BYOB를 사용하는 경우, 기본(primary) 리전에 있는 소유한 버킷으로 백업을 내보낸 후, [AWS cross region replication](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html)을 사용하여 다른 리전으로 복제되도록 설정할 수 있습니다.