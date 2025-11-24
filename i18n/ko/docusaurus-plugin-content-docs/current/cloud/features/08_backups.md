---
'sidebar_label': '백업'
'slug': '/cloud/features/backups'
'title': '백업'
'keywords':
- 'backups'
- 'cloud backups'
- 'restore'
'description': 'ClickHouse Cloud의 백업 기능에 대한 개요를 제공합니다.'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';

Database backups provide a safety net by ensuring that if data is lost for any unforeseen reason, the service can be restored to a previous state from the last successful backup. This minimizes downtime and prevents business critical data from being permanently lost.

## Backups {#backups}

### How backups work in ClickHouse Cloud {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloud backups are a combination of "full" and "incremental" backups that constitute a backup chain. The chain starts with a full backup, and incremental backups are then taken over the next several scheduled time periods to create a sequence of backups. Once a backup chain reaches a certain length, a new chain is started. This entire chain of backups can then be utilized to restore data to a new service if needed. Once all backups included in a specific chain are past the retention time frame set for the service (more on retention below), the chain is discarded.

In the screenshot below, the solid line squares show full backups and the dotted line squares show incremental backups. The solid line rectangle around the squares denotes the retention period and the backups that are visible to the end user, which can be used for a backup restore. In the scenario below, backups are being taken every 24 hours and are retained for 2 days.

On Day 1, a full backup is taken to start the backup chain. On Day 2, an incremental backup is taken, and we now have a full and incremental backup available to restore from. By Day 7, we have one full backup and six incremental backups in the chain, with the most recent two incremental backups visible to the user. On Day 8, we take a new full backup, and on Day 9, once we have two backups in the new chain, the previous chain is discarded.

<Image img={backup_chain} size="lg" alt="Backup chain example in ClickHouse Cloud" />

### Default backup policy {#default-backup-policy}

In the Basic, Scale, and Enterprise tiers, backups are metered and billed separately from storage. All services will default to one daily backup with the ability to configure more, starting with the Scale tier, via the Settings tab of the Cloud console. Each backup will be retained for at least 24 hours.

See ["Review and restore backups"](/cloud/manage/backups/overview) for further details.

## Configurable backups {#configurable-backups}

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True"/>

ClickHouse Cloud allows you to configure the schedule for your backups for **Scale** and **Enterprise** tier services. Backups can be configured along the following dimensions based on your business needs.

- **Retention**: The duration of days, for which each backup will be retained. Retention can be specified as low as 1 day, and as high as 30 days with several values to pick in between.
- **Frequency**: The frequency allows you to specify the time duration between subsequent backups. For instance, a frequency of "every 12 hours" means that backups will be spaced 12 hours apart. Frequency can range from "every 6 hours" to "every 48 hours" in the following hourly increments: `6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`.
- **Start Time**: The start time for when you want to schedule backups each day. Specifying a start time implies that the backup "Frequency" will default to once every 24 hours. Clickhouse Cloud will start the backup within an hour of the specified start time.

:::note
The custom schedule will override the default backup policy in ClickHouse Cloud for your given service.

In some rare scenarios, the backup scheduler will not respect the **Start Time** specified for backups. Specifically, this happens if there was a successful backup triggered < 24 hours from the time of the currently scheduled backup. This could happen due to a retry mechanism we have in place for backups. In such instances, the scheduler will skip over the backup for the current day, and will retry the backup the next day at the scheduled time.
:::

See ["Configure backup schedules"](/cloud/manage/backups/configurable-backups) for steps to configure your backups.

## Bring Your Own Bucket (BYOB) Backups {#byob}

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud allows exporting backups to your own cloud service provider (CSP) account storage (AWS S3, Google Cloud Storage, or Azure Blob Storage). If you configure backups to your own bucket, ClickHouse Cloud will still take daily backups to its own bucket. This is to ensure that we have at least one copy of the data to restore from in case the backups in your bucket get corrupted. For details of how ClickHouse Cloud backups work, see the [backups](/cloud/manage/backups/overview) docs.

In this guide, we walk through how you can export backups to your AWS, GCP, Azure object storage, as well as how to restore these backups in your account to a new ClickHouse Cloud service. We also share backup / restore commands that allow you to export backups to your bucket and restore them.

:::note Cross-region backups
Users should be aware that any usage where backups are being exported to a different region in the same cloud provider will incur [data transfer](/cloud/manage/network-data-transfer) charges.

Currently, we do not support cross-cloud backups, nor backup / restore for services utilizing [Transparent Data Encryption (TDE)](/cloud/security/cmek#transparent-data-encryption-tde) or for regulated services.
:::

See ["Export backups to your own Cloud account"](/cloud/manage/backups/export-backups-to-own-cloud-account) for examples of how to take full and incremental backups to AWS, GCP, Azure object storage as well as how to restore from the backups.

### Backup options {#backup-options}

To export backups to your own cloud account, you have two options:

<VerticalStepper headerLevel="h5">

##### Via Cloud Console UI {#via-ui}

External backups can be [configured in the UI](/cloud/manage/backups/backup-restore-via-ui). By default, backups will then be taken daily (as specified in the [default backup policy](/cloud/features/backups#default-backup-policy)). However, we also support [configurable](/cloud/manage/backups/configurable-backups) backups to your own cloud account, which allows for setting a custom schedule. It is important to note that all backups to your bucket are full backups with no relationship to other previous or future backups.

##### Using SQL commands {#using-commands}

You can use [SQL commands](/cloud/manage/backups/backup-restore-via-commands) to export backups to your bucket.

</VerticalStepper>

:::warning
ClickHouse Cloud will not manage the lifecycle of backups in customer buckets. Customers are responsible for ensuring that backups in their bucket are managed appropriately for adhering to compliance standards as well as managing cost. If the backups are corrupted, they will not be able to be restored.
:::

---

데이터베이스 백업은 데이터가 예기치 않은 이유로 손실될 경우, 마지막으로 성공적으로 백업된 상태로 서비스를 복원할 수 있도록 보장하여 안전망을 제공합니다. 이는 다운타임을 최소화하고 비즈니스에 중요한 데이터가 영구적으로 손실되는 것을 방지합니다.

## 백업 {#backups}

### ClickHouse Cloud에서 백업 작동 방식 {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloud 백업은 백업 체인을 구성하는 "전체" 및 "증분" 백업의 조합입니다. 체인은 전체 백업으로 시작되며, 그 다음 여러 예약된 시간 동안 증분 백업이 수행되어 백업의 시퀀스가 생성됩니다. 백업 체인이 특정 길이에 도달하면 새로운 체인이 시작됩니다. 이 전체 백업 체인은 필요에 따라 새로운 서비스로 데이터를 복원하는 데 활용될 수 있습니다. 특정 체인에 포함된 모든 백업이 서비스에 설정된 보존 기간을 초과하면 (아래 보존에 대한 내용) 체인은 폐기됩니다.

아래 스크린샷에서 실선 정사각형은 전체 백업을 보여주고 점선 정사각형은 증분 백업을 보여줍니다. 정사각형 주위의 실선 사각형은 보존 기간과 최종 사용자에게 표시되는 백업을 나타내며, 이는 백업 복원에 사용할 수 있습니다. 아래 시나리오에서는 백업이 매일 24시간마다 수행되며 2일 동안 유지됩니다.

첫째 날에 전체 백업이 수행되어 백업 체인이 시작됩니다. 둘째 날에 증분 백업이 수행되고, 이제 복원할 수 있는 전체 및 증분 백업이 있습니다. 일곱째 날까지, 체인에 하나의 전체 백업과 여섯 개의 증분 백업이 있으며, 사용자는 가장 최근의 두 개의 증분 백업을 볼 수 있습니다. 여덟째 날에 새로운 전체 백업을 수행하고 아홉째 날에는 새 체인에서 두 개의 백업이 있으면 이전 체인은 폐기됩니다.

<Image img={backup_chain} size="lg" alt="ClickHouse Cloud의 백업 체인 예시" />

### 기본 백업 정책 {#default-backup-policy}

Basic, Scale 및 Enterprise 계층에서 백업은 측정되며 스토리지와 별도로 청구됩니다. 모든 서비스는 기본적으로 하루에 하나의 백업을 수행하며, Scale 계층의 경우 Cloud 콘솔의 설정 탭을 통해 더 많은 백업을 구성할 수 있는 기능이 있습니다. 각 백업은 최소 24시간 동안 유지됩니다.

자세한 내용은 ["백업 검토 및 복원"](/cloud/manage/backups/overview)를 참조하십시오.

## 구성 가능한 백업 {#configurable-backups}

<ScalePlanFeatureBadge feature="구성 가능한 백업" linking_verb_are="True"/>

ClickHouse Cloud는 **Scale** 및 **Enterprise** 계층 서비스에 대해 백업 일정을 구성할 수 있도록 해줍니다. 백업은 비즈니스 필요에 따라 다음과 같은 측면에서 구성될 수 있습니다.

- **보존**: 각 백업이 유지될 일수입니다. 보존은 최소 1일에서 최대 30일까지 설정할 수 있으며, 그 사이의 여러 값에서 선택할 수 있습니다.
- **빈도**: 빈도를 사용하여 후속 백업 간의 시간 간격을 지정할 수 있습니다. 예를 들어 "12시간마다"라는 빈도는 백업이 12시간 간격으로 이루어짐을 의미합니다. 빈도는 "6시간마다"부터 "48시간마다"까지 다음 시간 간격에서 선택할 수 있습니다: `6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`.
- **시작 시간**: 매일 백업을 예약할 시간을 지정하는 시작 시간입니다. 시작 시간을 지정하면 백업 "빈도"는 기본적으로 24시간마다 한 번으로 설정됩니다. Clickhouse Cloud는 지정된 시작 시간 내 한 시간 이내에 백업을 시작합니다.

:::note
사용자 지정 일정은 지정된 서비스의 ClickHouse Cloud 기본 백업 정책을 무시합니다.

일부 희귀한 시나리오에서는 백업 스케줄러가 백업에 대해 지정된 **시작 시간**을 존중하지 않을 수 있습니다. 구체적으로, 현재 예약된 백업 시간 < 24시간 전에 성공적인 백업이 실행되었던 경우 이 문제가 발생합니다. 이는 백업을 위한 리트라이 메커니즘으로 인해 발생할 수 있습니다. 이러한 경우, 스케줄러는 현재 날짜의 백업을 건너뛰고 예약된 시간에 다음 날에 백업을 재시도합니다.
:::

백업을 구성하는 단계에 대한 정보는 ["백업 일정 구성"](/cloud/manage/backups/configurable-backups)를 참조하십시오.

## 내 버킷 사용 (BYOB) 백업 {#byob}

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud는 자신의 클라우드 서비스 제공업체(CSP) 계정 스토리지(AWS S3, Google Cloud Storage 또는 Azure Blob Storage)로 백업을 내보낼 수 있습니다. 자신의 버킷에 백업을 구성할 경우, ClickHouse Cloud는 여전히 자신의 버킷에 매일 백업을 수행합니다. 이는 백업이 손상될 경우 데이터를 복원할 수 있는 최소한의 백업 사본을 확보하기 위한 것입니다. ClickHouse Cloud 백업 작동 방식에 대한 자세한 내용은 [백업](/cloud/manage/backups/overview) 문서를 참조하십시오.

이 가이드에서는 AWS, GCP, Azure 객체 저장소로 백업을 내보내는 방법과 이러한 백업을 계정의 새 ClickHouse Cloud 서비스로 복원하는 방법을 안내합니다. 또한 버킷에 백업을 내보내고 복원할 수 있도록 하는 백업 / 복원 명령도 공유합니다.

:::note 교차 지역 백업
사용자는 백업이 동일한 클라우드 제공업체의 다른 지역으로 내보내질 때 [데이터 전송](/cloud/manage/network-data-transfer) 비용이 발생한다는 점을 유의해야 합니다.

현재 우리는 교차 클라우드 백업을 지원하지 않으며, [투명 데이터 암호화 (TDE)](/cloud/security/cmek#transparent-data-encryption-tde)를 사용하는 서비스나 규제가 있는 서비스에 대한 백업 / 복원도 지원하지 않습니다.
:::

어떻게 AWS, GCP, Azure 객체 저장소에 전체 및 증분 백업을 수행하고 백업에서 복원할 수 있는지에 대한 예제는 ["내 클라우드 계정으로 백업 내보내기"](/cloud/manage/backups/export-backups-to-own-cloud-account)를 참조하십시오.

### 백업 옵션 {#backup-options}

자신의 클라우드 계정으로 백업을 내보내려면 두 가지 옵션이 있습니다:

<VerticalStepper headerLevel="h5">

##### Cloud 콘솔 UI를 통해 {#via-ui}

외부 백업은 [UI에서 구성할 수 있습니다](/cloud/manage/backups/backup-restore-via-ui). 기본적으로 백업은 매일 수행됩니다 ( [기본 백업 정책](/cloud/features/backups#default-backup-policy)에서 지정된 대로). 그러나 사용자의 클라우드 계정에 대한 [구성 가능한](/cloud/manage/backups/configurable-backups) 백업도 지원되며, 이를 통해 사용자 지정 일정을 설정할 수 있습니다. 모든 버킷의 백업은 다른 이전 또는 미래의 백업과는 관계없는 전체 백업임을 유의해야 합니다.

##### SQL 명령 사용 {#using-commands}

[SQL 명령](/cloud/manage/backups/backup-restore-via-commands)을 사용하여 백업을 버킷으로 내보낼 수 있습니다.

</VerticalStepper>

:::warning
ClickHouse Cloud는 고객의 버킷에서 백업의 생애주기를 관리하지 않습니다. 고객은 버킷에 있는 백업이 준수 기준을 준수하도록 적절하게 관리되는지 및 비용 관리가 이루어지는지를 책임져야 합니다. 백업이 손상된 경우 복원이 불가능합니다.
:::

