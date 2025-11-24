---
'sidebar_label': '백업 검토 및 복원'
'sidebar_position': 0
'slug': '/cloud/manage/backups/overview'
'title': '개요'
'keywords':
- 'backups'
- 'cloud backups'
- 'restore'
'description': 'ClickHouse Cloud에서 백업에 대한 개요를 제공합니다.'
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';
import backup_status_list from '@site/static/images/cloud/manage/backup-status-list.png';
import backup_usage from '@site/static/images/cloud/manage/backup-usage.png';
import backup_restore from '@site/static/images/cloud/manage/backup-restore.png';
import backup_service_provisioning from '@site/static/images/cloud/manage/backup-service-provisioning.png';


# 백업 검토 및 복원

이 가이드는 ClickHouse Cloud에서 백업이 어떻게 작동하는지, 서비스에 대한 백업을 구성하는 데 사용할 수 있는 옵션, 그리고 백업에서 복원하는 방법을 다룹니다.

## 백업 상태 목록 {#backup-status-list}

귀하의 서비스는 기본적인 일일 일정이든, 귀하가 선택한 [사용자 정의 일정](/cloud/manage/backups/configurable-backups)이든 설정된 일정에 따라 백업됩니다. 사용 가능한 모든 백업은 서비스의 **Backups** 탭에서 볼 수 있습니다. 여기서 백업의 상태, 지속 시간, 백업 크기를 확인할 수 있습니다. 또한 **Actions** 열을 사용하여 특정 백업을 복원할 수 있습니다.

<Image img={backup_status_list} size="md" alt="ClickHouse Cloud의 백업 상태 목록" border/>

## 백업 비용 이해하기 {#understanding-backup-cost}

기본 정책에 따라 ClickHouse Cloud는 매일 백업을 의무화하며, 24시간 보존됩니다. 더 많은 데이터를 보존해야 하거나 더 빈번한 백업을 요구하는 일정을 선택하면 백업에 대한 추가 저장 비용이 발생할 수 있습니다.

백업 비용을 이해하기 위해 사용 화면에서 서비스별 백업 비용을 확인할 수 있습니다(아래와 같이 표시됨). 몇 일 동안 맞춤형 일정에 따라 백업을 실행한 후, 비용을 파악하고 월별 백업 비용을 추정할 수 있습니다.

<Image img={backup_usage} size="md" alt="ClickHouse Cloud의 백업 사용 차트" border/>

백업에 대한 총 비용을 추정하려면 일정을 설정해야 합니다. 우리는 또한 [가격 계산기](https://clickhouse.com/pricing)를 업데이트하는 작업을 진행 중이며, 일정을 설정하기 전에 월별 비용 추정치를 얻을 수 있습니다. 비용을 추정하려면 다음 입력이 필요합니다:
- 전체 및 증분 백업의 크기
- 원하는 빈도
- 원하는 보존 기간
- 클라우드 제공업체 및 지역

:::note
서비스의 데이터 크기가 시간이 지남에 따라 증가함에 따라 백업 비용 추정치는 변경될 수 있습니다.
:::

## 백업 복원 {#restore-a-backup}

백업은 기존 백업을 가져온 서비스가 아닌 새로운 ClickHouse Cloud 서비스로 복원됩니다.

**Restore** 백업 아이콘을 클릭한 후 생성될 새로운 서비스의 서비스 이름을 지정하고 이 백업을 복원할 수 있습니다:

<Image img={backup_restore} size="md" alt="ClickHouse Cloud에서 백업 복원" />

새 서비스는 준비될 때까지 서비스 목록에서 `Provisioning`으로 표시됩니다:

<Image img={backup_service_provisioning} size="md" alt="서비스 프로비저닝 진행 중" border/>

## 복원된 서비스 작업 {#working-with-your-restored-service}

백업이 복원된 후 이제 두 개의 유사한 서비스가 있습니다: 복원이 필요한 **원래 서비스**와 원본의 백업에서 복원된 새로운 **복원 서비스**.

백업 복원이 완료되면 다음 중 하나를 수행해야 합니다:
- 새로운 복원된 서비스를 사용하고 원래 서비스를 제거합니다.
- 새로운 복원된 서비스에서 원래 서비스로 데이터를 마이그레이션하고 새로운 복원된 서비스를 제거합니다.

### **새 복원된 서비스** 사용 {#use-the-new-restored-service}

새 서비스를 사용하려면 다음 단계를 수행하십시오:

1. 새로운 서비스에 사용 사례에 필요한 IP 액세스 목록 항목이 있는지 확인합니다.
1. 새로운 서비스에 필요한 데이터가 포함되어 있는지 확인합니다.
1. 원래 서비스를 제거합니다.

### **새로 복원된 서비스**에서 **원래 서비스**로 데이터 마이그레이션 {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

어떤 이유로 인해 새로 복원된 서비스에서 작업할 수 없는 경우, 예를 들면 기존 서비스에 여전히 연결되는 사용자나 애플리케이션이 있을 수 있습니다. 새로 복원된 데이터를 원래 서비스로 마이그레이션할 수 있습니다. 마이그레이션은 다음 단계를 수행하여 수행할 수 있습니다:

**새로 복원된 서비스에 원격 액세스 허용**

새 서비스는 원래 서비스와 동일한 IP 허용 목록을 가지고 있는 백업에서 복원해야 합니다. 이는 **Anywhere**에서의 액세스를 허용하지 않는 한 다른 ClickHouse Cloud 서비스로의 연결이 허용되지 않기 때문입니다. 허용 목록을 수정하고 일시적으로 **Anywhere**에서의 액세스를 허용합니다. 자세한 내용은 [IP 액세스 목록](/cloud/security/setting-ip-filters) 문서를 참조하십시오.

**새로 복원된 ClickHouse 서비스에서 (복원된 데이터가 호스팅되는 시스템)**

:::note
새 서비스에 액세스하려면 비밀번호를 재설정해야 합니다. 서비스 목록 **Settings** 탭에서 수행할 수 있습니다.
:::

원본 테이블을 읽을 수 있는 읽기 전용 사용자를 추가합니다 (`db.table` 예시):

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

테이블 정의를 복사합니다:

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

**목적지 ClickHouse Cloud 시스템에서 (손상된 테이블이 있었던 시스템):**

목적지 데이터베이스를 생성합니다:
```sql
CREATE DATABASE db
```

소스의 `CREATE TABLE` 문을 사용하여 목적지를 생성합니다:

:::tip
`CREATE` 문을 실행할 때 매개변수 없이 `ReplicatedMergeTree`로 `ENGINE`을 변경합니다. ClickHouse Cloud는 항상 테이블을 복제하고 올바른 매개변수를 제공합니다.
:::

```sql
CREATE TABLE db.table ...
ENGINE = ReplicatedMergeTree
ORDER BY ...
```

`remoteSecure` 함수를 사용하여 새로 복원된 ClickHouse Cloud 서비스에서 원래 서비스로 데이터를 가져옵니다:

```sql
INSERT INTO db.table
SELECT *
FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

원래 서비스에 데이터를 성공적으로 삽입한 후, 서비스에서 데이터를 검증해야 합니다. 데이터가 검증되면 새로운 서비스를 삭제해야 합니다.

## 테이블 복원 또는 복원 취소 {#undeleting-or-undropping-tables}

`UNDROP` 명령은 [공유 카탈로그](https://clickhouse.com/docs/cloud/reference/shared-catalog)를 통해 ClickHouse Cloud에서 지원됩니다.

사용자가 실수로 테이블을 드롭하지 않도록 [전용 사용자 또는 역할에 대해 `DROP TABLE` 명령에 대한 권한을 취소하는 `GRANT` 문](/sql-reference/statements/grant)을 사용할 수 있습니다.

:::note
데이터의 우발적 삭제를 방지하기 위해 기본적으로 ClickHouse Cloud에서는 크기가 >`1TB`인 테이블을 삭제할 수 없습니다. 이 임계값보다 큰 테이블을 삭제하고자 하는 경우 설정 `max_table_size_to_drop`을 사용해야 합니다:

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2000000000000 -- increases the limit to 2TB
```
:::

:::note
레거시 계획: 레거시 계획에 있는 고객의 경우 기본 일일 백업이 24시간 동안 보존되며 저장 비용에 포함됩니다.
:::

## 구성 가능한 백업 {#configurable-backups}

기본 백업 일정과 다르게 백업 일정을 설정하려면 [구성 가능한 백업](/cloud/manage/backups/configurable-backups)을 확인하십시오.

## 백업을 자신의 클라우드 계정으로 내보내기 {#export-backups-to-your-own-cloud-account}

자신의 클라우드 계정으로 백업을 내보내고자 하는 사용자는 [여기](/cloud/manage/backups/export-backups-to-own-cloud-account)를 참조하십시오.
