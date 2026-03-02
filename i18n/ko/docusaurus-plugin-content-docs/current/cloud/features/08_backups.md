---
sidebar_label: '백업'
slug: /cloud/features/backups
title: '백업'
keywords: ['백업', '클라우드 백업', '복원']
description: 'ClickHouse Cloud의 백업 기능 개요입니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';

데이터베이스 백업은 예기치 못한 원인으로 데이터가 손실되더라도, 마지막으로 성공적으로 수행된 백업 시점의 상태로 서비스를 복원할 수 있도록 해 주는 일종의 안전망입니다.
이를 통해 서비스 중단 시간을 최소화하고 비즈니스에 중요한 데이터가 영구적으로 손실되는 것을 방지합니다.


## 백업 \{#backups\}

### ClickHouse Cloud에서 백업이 동작하는 방식 \{#how-backups-work-in-clickhouse-cloud\}

ClickHouse Cloud 백업은 백업 체인을 구성하는 「전체(full)」 백업과 「증분(incremental)」 백업의 조합으로 이루어집니다. 체인은 전체 백업으로 시작하고, 이후 여러 예약된 시간대에 증분 백업을 수행하여 일련의 백업 시퀀스를 만듭니다. 백업 체인이 일정 길이에 도달하면 새 체인을 시작합니다. 이렇게 생성된 백업 체인 전체는 필요할 때 새 서비스로 데이터를 복원하는 데 사용할 수 있습니다. 특정 체인에 포함된 모든 백업이 해당 서비스에 설정된 보존 기간(아래의 보존 설명 참고)을 초과하면, 해당 체인은 폐기됩니다.

아래 스크린샷에서 실선 사각형은 전체 백업을, 점선 사각형은 증분 백업을 나타냅니다. 사각형을 둘러싼 실선 직사각형은 보존 기간을 나타내며, 최종 사용자가 볼 수 있고 백업 복원에 사용할 수 있는 백업을 의미합니다. 아래 예시에서는 24시간마다 백업을 수행하며, 백업은 2일 동안 보존됩니다.

1일 차에는 백업 체인을 시작하기 위해 전체 백업을 수행합니다. 2일 차에는 증분 백업을 수행하며, 이제 전체 백업과 증분 백업 모두를 복원에 사용할 수 있습니다. 7일 차가 되면 체인에는 하나의 전체 백업과 여섯 개의 증분 백업이 있으며, 이 중 가장 최근의 두 개 증분 백업이 사용자에게 표시됩니다. 8일 차에는 새 전체 백업을 수행하고, 9일 차에 새 체인에 두 개의 백업이 생성되면 이전 체인은 폐기됩니다.

<Image img={backup_chain} size="lg" alt="ClickHouse Cloud에서 백업 체인 예시" />

### 기본 백업 정책 \{#default-backup-policy\}

Basic, Scale, Enterprise 티어에서는 백업이 스토리지와 별도로 측정되어 과금됩니다.
모든 서비스는 기본적으로 하루 1회 백업이 설정되며, Scale 티어부터는 Cloud 콘솔의 Settings 탭에서 더 많은 백업을 구성할 수 있습니다.
각 백업은 최소 24시간 동안 보존됩니다.

자세한 내용은 ["백업 검토 및 복원"](/cloud/manage/backups/overview)을 참조하십시오.

## 구성 가능한 백업 \{#configurable-backups\}

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True"/>

ClickHouse Cloud에서는 **Scale** 및 **Enterprise** 티어 서비스에 대해 백업 일정을 구성할 수 있습니다. 비즈니스 요구 사항에 따라 다음과 같은 항목을 기준으로 백업을 설정할 수 있습니다.

- **Retention**: 각 백업을 보존하는 기간(일 단위)입니다. Retention은 최소 1일부터 최대 30일까지 지정할 수 있으며, 그 사이의 여러 값 중에서 선택할 수 있습니다.
- **Frequency**: 백업 간 시간 간격을 지정하는 빈도입니다. 예를 들어 Frequency를 "every 12 hours"로 설정하면 백업 간 간격이 12시간이 됩니다. Frequency는 "every 6 hours"에서 "every 48 hours"까지 다음 시간 단위 증가분 중에서 선택할 수 있습니다: `6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`.
- **Start Time**: 매일 백업을 실행할 시작 시각입니다. Start Time을 지정하면 백업 **Frequency**는 기본적으로 24시간마다 한 번으로 설정됩니다. ClickHouse Cloud는 지정된 Start Time으로부터 1시간 이내에 백업을 시작합니다.

:::note
사용자 정의 일정은 해당 서비스에 대한 ClickHouse Cloud의 기본 백업 정책을 재정의합니다.

드물게는 백업 스케줄러가 지정된 **Start Time**을 따르지 않을 수 있습니다. 구체적으로, 현재 예약된 백업 시각으로부터 24시간 미만(< 24 hours) 전에 성공적인 백업이 실행된 경우에 발생합니다. 이는 백업을 위한 재시도 메커니즘 때문에 발생할 수 있습니다. 이러한 경우 스케줄러는 당일 백업을 건너뛰고, 다음 날 예약된 시각에 백업을 다시 시도합니다.
:::

백업을 구성하는 방법은 ["백업 일정 구성"](/cloud/manage/backups/configurable-backups)을 참고하십시오.

## Bring Your Own Bucket (BYOB) 백업 \{#byob\}

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud에서는 백업을 사용자의 클라우드 서비스 제공자(CSP) 계정 스토리지(AWS S3, Google Cloud Storage, Azure Blob Storage)로 내보낼 수 있습니다.
백업을 사용자의 버킷으로 저장하도록 구성하더라도, ClickHouse Cloud는 자체 버킷에도 매일 백업을 수행합니다.
이는 사용자의 버킷에 있는 백업이 손상된 경우에도 복구에 사용할 데이터 사본을 최소 한 개 이상 확보하기 위한 것입니다.
ClickHouse Cloud 백업이 어떻게 동작하는지에 대한 자세한 내용은 [backups](/cloud/manage/backups/overview) 문서를 참고하십시오.

이 가이드에서는 AWS, GCP, Azure 객체 스토리지로 백업을 내보내는 방법과, 이러한 백업을 사용자의 계정에서 새로운 ClickHouse Cloud 서비스로 복원하는 방법을 단계별로 설명합니다.
또한 버킷으로 백업을 내보내고 이를 복원할 수 있는 백업/복원 명령도 함께 제공합니다.

:::note Cross-region backups
백업을 동일한 클라우드 제공자의 다른 리전으로 내보내는 모든 사용 사례에는 [data transfer](/cloud/manage/network-data-transfer)
요금이 발생합니다.

현재는 클라우드 간(cross-cloud) 백업이나, [Transparent Data Encryption (TDE)](/cloud/security/cmek#transparent-data-encryption-tde)를 사용하는 서비스 또는 규제 대상 서비스에 대한 백업/복원을 지원하지 않습니다.
:::

AWS, GCP, Azure 객체 스토리지로 전체 백업과 증분 백업을 수행하고, 해당 백업으로부터 복원하는 예시는 ["Export backups to your own Cloud account"](/cloud/manage/backups/export-backups-to-own-cloud-account)를 참고하십시오.

### 백업 옵션 \{#backup-options\}

Cloud 계정으로 백업을 내보내려면 다음 두 가지 옵션이 있습니다.

<VerticalStepper headerLevel="h5">

##### Cloud Console UI를 통한 설정 \{#via-ui\}

외부 백업은 [UI에서 설정](/cloud/manage/backups/backup-restore-via-ui)할 수 있습니다.
기본적으로 백업은 [기본 백업 정책](/cloud/features/backups#default-backup-policy)에 지정된 대로 매일 수행됩니다.
또한 Cloud 계정으로 [구성 가능한](/cloud/manage/backups/configurable-backups) 백업도 지원하며, 이를 통해 사용자 정의 일정 설정이 가능합니다.
버킷으로 수행되는 모든 백업은 이전 또는 이후 백업과 관계없는 전체 백업이라는 점에 유의해야 합니다.

##### SQL 명령 사용 \{#using-commands\}

[SQL 명령](/cloud/manage/backups/backup-restore-via-commands)을 사용하여 백업을 버킷으로 내보낼 수 있습니다.

</VerticalStepper>

:::warning
ClickHouse Cloud는 고객 버킷 내 백업의 수명 주기를 관리하지 않습니다.
고객은 버킷에 저장된 백업이 규정 준수 표준을 준수하고 비용을 적절히 관리할 수 있도록 백업을 적절히 관리할 책임이 있습니다.
백업이 손상된 경우, 해당 백업은 복구할 수 없습니다.
:::