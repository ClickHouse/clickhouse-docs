---
sidebar_label: '백업 검토 및 복원'
sidebar_position: 0
slug: /cloud/manage/backups/overview
title: '개요'
keywords: ['백업', 'Cloud 백업', '복원']
description: 'ClickHouse Cloud의 백업에 대한 개요를 제공합니다'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';
import backup_status_list from '@site/static/images/cloud/manage/backup-status-list.png';
import backup_usage from '@site/static/images/cloud/manage/backup-usage.png';
import backup_restore from '@site/static/images/cloud/manage/backup-restore.png';
import backup_service_provisioning from '@site/static/images/cloud/manage/backup-service-provisioning.png';


# 백업 검토 및 복원 \{#review-and-restore-backups\}

이 가이드는 ClickHouse Cloud에서 백업이 동작하는 방식, 서비스에 대한 백업 구성 옵션, 그리고 백업에서 복원하는 방법을 설명합니다.

**사전 준비 사항**

- ["ClickHouse Cloud에서 백업이 작동하는 방식"](/cloud/features/backups#how-backups-work-in-clickhouse-cloud) (기능 개요 페이지)를 읽었습니다.

## 백업 상태 목록 \{#backup-status-list\}

서비스는 기본 일일 스케줄이든 사용자가 선택한 [사용자 정의 스케줄](/cloud/manage/backups/configurable-backups)이든 설정된 일정에 따라 백업됩니다. 사용 가능한 모든 백업은 서비스의 **Backups** 탭에서 확인할 수 있습니다. 여기에서 백업 상태, 백업 수행 시간, 백업 크기를 확인할 수 있습니다. 또한 **Actions** 컬럼을 사용하여 특정 백업을 복원할 수 있습니다.

<Image img={backup_status_list} size="md" alt="ClickHouse Cloud에서 백업 상태 목록" border/>

## 백업 비용 이해하기 \{#understanding-backup-cost\}

기본 정책에 따라 ClickHouse Cloud는 하루에 한 번 백업을 수행하며, 보존 기간은 24시간입니다. 더 많은 데이터를 보존해야 하는 일정이나 더 자주 백업을 수행하는 일정을 선택하면 백업 저장소에 대한 추가 비용이 발생할 수 있습니다.

백업 비용을 파악하려면 사용량 화면에서 서비스별 백업 비용을 확인할 수 있습니다(아래 그림 참조). 사용자 지정 일정을 적용한 상태로 며칠간 백업을 실행한 후에는, 그 비용 수준을 파악하고 이를 바탕으로 월간 백업 비용을 추정할 수 있습니다.

<Image img={backup_usage} size="md" alt="ClickHouse Cloud의 백업 사용량 차트" border/>

백업 총비용을 추정하려면 먼저 백업 일정을 설정해야 합니다. 또한 일정 설정 전에 월간 비용을 미리 추정할 수 있도록 [pricing calculator](https://clickhouse.com/pricing)를 업데이트하고 있습니다. 비용을 추정하려면 다음과 같은 입력값이 필요합니다:

- 전체 백업과 증분 백업의 크기
- 원하는 수행 주기
- 원하는 보존 기간
- Cloud 제공자 및 리전

:::note
서비스 내 데이터 크기가 시간이 지남에 따라 증가함에 따라, 백업에 대한 예상 비용 역시 변동된다는 점을 유의해야 합니다.
:::

## 백업 복원 \{#restore-a-backup\}

백업은 이를 생성한 기존 서비스가 아니라, 새로운 ClickHouse Cloud 서비스로 복원됩니다.

**Restore** 백업 아이콘을 클릭하면 새로 생성될 서비스의 이름을 지정한 후, 해당 백업을 복원할 수 있습니다:

<Image img={backup_restore} size="md" alt="ClickHouse Cloud에서 백업 복원" />

새 서비스는 준비가 완료될 때까지 서비스 목록에 `Provisioning` 상태로 표시됩니다:

<Image img={backup_service_provisioning} size="md" alt="프로비저닝 중인 서비스" border/>

## 복원된 서비스 사용 \{#working-with-your-restored-service\}

백업을 복원하면, 복원이 필요했던 **원본 서비스**와 원본 서비스의 백업에서 복원된 새로운 **복원된 서비스**라는 서로 유사한 두 개의 서비스가 존재하게 됩니다.

백업 복원이 완료되면 다음 중 하나를 선택해야 합니다.

- 새로 복원된 서비스를 사용하고 원본 서비스를 제거합니다.
- 새로 복원된 서비스에서 원본 서비스로 데이터를 마이그레이션한 후 새로 복원된 서비스를 제거합니다.

### **새로 복원된 서비스** 사용하기 \{#use-the-new-restored-service\}

새 서비스를 사용하려면 다음 단계를 따르십시오.

1. 새 서비스에 사용 사례에 필요한 IP Access List 항목이 있는지 확인합니다.
1. 새 서비스에 필요한 데이터가 포함되어 있는지 확인합니다.
1. 기존 서비스를 제거합니다.

### **새로 복원된 서비스**에서 **원래 서비스**로 데이터 마이그레이션 \{#migrate-data-from-the-newly-restored-service-back-to-the-original-service\}

어떤 이유로든 새로 복원된 서비스에서 작업할 수 없는 상황일 수 있습니다. 예를 들어 여전히 기존 서비스에 연결하는 사용자나 애플리케이션이 있는 경우입니다. 이 경우 새로 복원된 데이터를 원래 서비스로 마이그레이션하기로 결정할 수 있습니다. 다음 단계에 따라 마이그레이션을 수행합니다:

**새로 복원된 서비스에 대한 원격 액세스 허용**

새 서비스는 원래 서비스와 동일한 IP 허용 목록으로 백업에서 복원되어야 합니다. 이는 **Anywhere**에서의 액세스를 허용해 두지 않았다면 다른 ClickHouse Cloud 서비스로의 연결이 허용되지 않기 때문에 필요합니다. 허용 목록을 수정하여 일시적으로 **Anywhere**에서의 액세스를 허용하십시오. 자세한 내용은 [IP Access List](/cloud/security/setting-ip-filters) 문서를 참고하십시오.

**새로 복원된 ClickHouse 서비스(복원된 데이터를 호스팅하는 시스템)에서**

:::note
새 서비스에 액세스하려면 해당 서비스의 비밀번호를 재설정해야 합니다. 서비스 목록의 **Settings** 탭에서 비밀번호를 재설정할 수 있습니다.
:::

소스 테이블(이 예제에서는 `db.table`)을 읽을 수 있는 읽기 전용 사용자를 추가합니다:

```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
```

```sql
  GRANT SELECT ON db.table TO exporter;
```

테이블 정의를 복사하십시오:

```sql
  SELECT create_table_query
  FROM system.tables
  WHERE database = 'db' AND table = 'table'
```

**대상 ClickHouse Cloud 시스템(테이블이 손상되었던 시스템)에서:**

대상 데이터베이스를 생성합니다:

```sql
  CREATE DATABASE db
```

원본의 `CREATE TABLE` 문을 사용하여 대상 테이블을 생성합니다:

:::tip
`CREATE` 문을 실행할 때 `ENGINE`을 추가 매개변수 없이 `ReplicatedMergeTree`로 변경하십시오. ClickHouse Cloud에서는 테이블이 항상 복제되며 적절한 매개변수가 자동으로 설정됩니다.
:::

```sql
  CREATE TABLE db.table ...
  ENGINE = ReplicatedMergeTree
  ORDER BY ...
```

새로 복원된 ClickHouse Cloud 서비스에서 원래 서비스로 데이터를 가져오려면 `remoteSecure` 함수를 사용하십시오.

```sql
  INSERT INTO db.table
  SELECT *
  FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

원본 서비스에 데이터를 성공적으로 삽입한 후에는 해당 서비스에서 데이터가 올바르게 반영되었는지 반드시 확인해야 합니다. 데이터가 정상적으로 확인되면 새 서비스를 삭제해야 합니다.


## 테이블 삭제 또는 드롭 취소하기 \{#undeleting-or-undropping-tables\}

`UNDROP` 명령은 ClickHouse Cloud에서 [Shared Catalog](https://clickhouse.com/docs/cloud/reference/shared-catalog)를 통해 지원합니다.

사용자가 실수로 테이블을 드롭하지 않도록, 특정 사용자나 역할에 대해 [`DROP TABLE` 명령](/sql-reference/statements/drop#drop-table)에 대한 권한을 회수하도록 [`GRANT` SQL 문](/sql-reference/statements/grant)을 사용할 수 있습니다.

:::note
데이터가 실수로 삭제되는 것을 방지하기 위해, 기본적으로 ClickHouse Cloud에서는 크기가 `1TB`를 초과하는 테이블은 드롭할 수 없습니다.
이 임계값을 초과하는 테이블을 드롭하려면 `max_table_size_to_drop` SETTING을 사용할 수 있습니다:

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2000000000000 -- increases the limit to 2TB
```

:::

:::note
레거시 요금제: 레거시 요금제를 사용하는 고객은 기본 일일 백업이 24시간 동안 보관되며, 해당 비용은 스토리지 요금에 포함됩니다.
:::


## 백업 소요 시간 \{#backup-durations\}

백업 및 복구에 소요되는 시간은 데이터베이스의 크기, 스키마, 데이터베이스 내 테이블 개수 등 여러 요소에 따라 달라집니다.
증분 백업은 전체 백업보다 백업되는 데이터 양이 적기 때문에 일반적으로 훨씬 더 빠르게 완료됩니다.
증분 백업에서 복구하는 경우, 위에서 설명한 것처럼 체인에 포함된 모든 증분 백업과 마지막 전체 백업이 순차적으로 포함되어야 하므로 전체 백업에서 복구하는 것보다 약간 더 느릴 수 있습니다.

테스트 결과, 약 1 TB 정도의 작은 백업은 백업에 10~15분 정도 또는 그 이상이 소요될 수 있습니다.
20 TB 미만의 백업은 1시간 이내에 완료되는 편이며, 50 TB의 데이터를 백업하는 데는 약 2~3시간 정도 소요됩니다.
백업은 규모가 커질수록 규모의 경제가 적용되며, 일부 내부 서비스의 경우 최대 1 PB까지의 백업이 약 10시간 내에 완료된 사례가 있습니다.

:::note
외부 버킷으로의 백업은 ClickHouse 버킷으로의 백업보다 느릴 수 있습니다.
:::

복구 소요 시간은 백업 소요 시간과 거의 비슷합니다.

실제 소요 시간은 위에서 설명한 여러 요소에 따라 달라지므로, 자체 데이터베이스 또는 샘플 데이터를 사용하여 테스트하여 보다 정확한 소요 시간 추정치를 얻기 위해 검증해 볼 것을 권장합니다.

## 구성 가능한 백업 \{#configurable-backups\}

기본 백업 일정과 다른 백업 주기를 구성하려는 경우 [구성 가능한 백업](/cloud/manage/backups/configurable-backups) 문서를 참조하십시오.

## 자체 Cloud 계정으로 백업 내보내기 \{#export-backups-to-your-own-cloud-account\}

자체 Cloud 계정으로 백업을 내보내려면 [여기](/cloud/manage/backups/export-backups-to-own-cloud-account)를 참조하십시오.