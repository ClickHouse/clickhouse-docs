---
sidebar_label: '명령어로 백업 또는 복원하기'
slug: /cloud/manage/backups/backup-restore-via-commands
title: '명령어를 사용하여 백업 생성 또는 복원하기'
description: '명령어를 사용하여 자체 버킷을 사용해 백업을 생성하거나 복원하는 방법을 설명하는 페이지입니다'
sidebar_position: 3
doc_type: 'guide'
keywords: ['backups', 'disaster recovery', 'data protection', 'restore', 'Cloud 기능']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 명령을 사용해 백업 생성 또는 복원하기 \{#commands-experience\}

`BACKUP` 및 `RESTORE` 명령어를 사용해 백업을 스토리지 버킷으로 내보낼 수 있으며,
[사용자 인터페이스를 통해 백업하거나 복원](/cloud/manage/backups/backup-restore-via-ui)할 수도 있습니다.
이 가이드에서는 3개 주요 CSP 모두에 대한 명령을 제공합니다.

## 요구 사항 \{#requirements\}

사용 중인 CSP 스토리지 버킷으로 백업을 내보내거나 복원하려면 다음 정보가 필요합니다:

<Tabs>
  <TabItem value="AWS" label="AWS" default>
    1. 다음 형식의 AWS S3 엔드포인트: `s3://<bucket_name>.s3.amazonaws.com/<optional_directory>`
       예: `s3://testchbackups.s3.amazonaws.com/`
       구성:
         * `testchbackups`는 백업을 내보낼 S3 버킷의 이름입니다.
         * `backups`는 선택적인 하위 디렉터리입니다.
    2. AWS 액세스 키와 시크릿. 또한 위 섹션에서 설명한 대로 AWS 역할 기반 인증을 사용하여 AWS 액세스 키와 시크릿을 대체할 수도 있습니다.
    <br/>
  </TabItem>
  <TabItem value="GCP" label="GCP">
   1. 다음 형식의 GCS 엔드포인트: `https://storage.googleapis.com/<bucket_name>/`
   2. 액세스 HMAC 키와 HMAC 시크릿.
   <br/>
  </TabItem>
  <TabItem value="Azure" label="Azure">
    1. Azure 스토리지 연결 문자열.
    2. 스토리지 계정 내 Azure 컨테이너 이름.
    3. 컨테이너 내 Azure Blob 객체.
    <br/>
  </TabItem>
</Tabs>

## 특정 DB 백업 / 복원 \{#backup_restore_db\}

여기에서는 *단일* 데이터베이스에 대한 백업 및 복원 예를 보여줍니다.
전체 백업 및 복원 명령은 [backup 명령 요약](/operations/backup/overview#command-summary)을 참고하십시오.

### AWS S3 \{#aws-s3-bucket\}

<Tabs>
  <TabItem value="Backup" label="백업" default>

```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```

여기서 `uuid`는 이 백업 집합을 서로 구분하기 위해 사용하는 고유 식별자입니다.

:::note
이 하위 디렉터리 내에서 생성하는 각 새 백업마다 서로 다른 uuid를 사용해야 합니다. 그렇지 않으면 `BACKUP_ALREADY_EXISTS` 오류가 발생합니다.
예를 들어, 매일 백업을 수행하는 경우 하루마다 새로운 uuid를 사용해야 합니다.
:::
  </TabItem>
  <TabItem value="Restore" label="복원" default>

```sql
RESTORE DATABASE test_backups
FROM S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```
  </TabItem>
</Tabs>

### Google Cloud Storage (GCS) \{#google-cloud-storage\}

<Tabs>
  <TabItem value="Backup" label="백업" default>
```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://storage.googleapis.com/<bucket>/<uuid>',
  '<hmac-key>',
  '<hmac-secret>'
)
```

여기서 `uuid`는 백업을 식별하는 데 사용되는 고유 식별자입니다.

:::note
이 하위 디렉터리에서 새 백업을 생성할 때마다 서로 다른 uuid를 사용해야 합니다. 그렇지 않으면 `BACKUP_ALREADY_EXISTS` 오류가 발생합니다.
예를 들어 일별 백업을 수행하는 경우에는 매일 새로운 uuid를 사용해야 합니다.
:::

  </TabItem>
  <TabItem value="Restore" label="복원" default>
```sql
RESTORE DATABASE test_backups
FROM S3(
  'https://storage.googleapis.com/<bucket>/<uuid>',
  '<hmac-key>',
  '<hmac-secret>'
)
```
  </TabItem>
</Tabs>

### Azure Blob Storage \{#azure-blob-storage\}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>
```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage(
  '<AzureBlobStorage endpoint connection string>',
  '<container>',
  '<blob>/<>'
)
```

여기서 `uuid`는 백업을 구분하기 위한 고유 식별자입니다.

:::note
이 하위 디렉터리에서 새 백업을 생성할 때마다 서로 다른 `uuid`를 사용해야 합니다. 그렇지 않으면 `BACKUP_ALREADY_EXISTS` 오류가 발생합니다.
예를 들어 매일 백업을 수행하는 경우, 매일 새로운 `uuid`를 사용해야 합니다.
:::
</TabItem>
<TabItem value="Restore" label="RESTORE" default>
```sql
RESTORE DATABASE test_backups
FROM AzureBlobStorage(
  '<AzureBlobStorage endpoint connection string>',
  '<container>',
  '<blob>/<uuid>'
)
```
  </TabItem>
</Tabs>

## 전체 서비스 백업 / 복원 \{#backup_restore_entire_service\}

전체 서비스를 백업하려면 아래 명령을 사용하십시오.
이 백업에는 생성된 엔티티의 모든 사용자 데이터와 시스템 데이터, settings profile, role policy, quota, function이 모두 포함됩니다.
여기서는 AWS S3를 기준으로 예시를 제공합니다.
위에서 설명한 구문을 사용하여 GCS 및 Azure Blob Storage에서도 동일하게 백업을 수행할 수 있습니다.

<Tabs>
<TabItem value="Backup" label="백업" default>

```sql
BACKUP 
    TABLE system.users,
    TABLE system.roles,
    TABLE system.settings_profiles,
    TABLE system.row_policies,
    TABLE system.quotas,
    TABLE system.functions,
    ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3(
    'https://testchbackups.s3.amazonaws.com/<uuid>',
    '<key id>',
    '<key secret>'
)
```

여기서 `uuid`는 백업을 식별하는 데 사용되는 고유 식별자입니다.

</TabItem>
<TabItem value="Restore" label="복원" default>

```sql
RESTORE ALL
FROM S3(
    'https://testchbackups.s3.amazonaws.com/<uuid>',
    '<key id>',
    '<key secret>'
)
```
</TabItem>
</Tabs>

## FAQ \{#backups-faq\}

<details>
<summary>Cloud 객체 스토리지에 있는 백업은 어떻게 되나요? 나중에 ClickHouse에서 정리해 주나요?</summary>

백업을 버킷으로 내보낼 수 있는 기능을 제공하지만, 한 번 생성된 백업은 ClickHouse에서 정리하거나 삭제하지 않습니다. 버킷에 있는 백업의 라이프사이클(삭제, 필요 시 아카이빙, 전체 비용 최적화를 위한 더 저렴한 스토리지로 이동 등)을 관리하는 책임은 전적으로 사용자에게 있습니다.

</details>

<details>
<summary>기존 백업 일부를 다른 위치로 옮기면 복구 절차에는 어떤 영향이 있나요?</summary>

백업이 다른 위치로 이동된 경우, 백업이 저장된 새 위치를 참조하도록 복구 명령을 업데이트해야 합니다.

</details>

<details>
<summary>객체 스토리지에 접근하기 위한 자격 증명을 변경하면 어떻게 되나요?</summary>

백업이 다시 정상적으로 수행되도록, 변경된 자격 증명을 UI에서 업데이트해야 합니다.

</details>

<details>
<summary>외부 백업을 내보내는 위치를 변경하면 어떻게 되나요?</summary>

UI에서 새 위치를 업데이트해야 하며, 이후 백업은 새 위치로 생성됩니다. 기존 백업은 원래 위치에 그대로 남아 있습니다.

</details>

<details>
<summary>이미 활성화된 서비스에서 외부 백업을 비활성화하려면 어떻게 해야 하나요?</summary>

특정 서비스에 대한 외부 백업을 비활성화하려면 서비스 설정 화면으로 이동한 후, 「Change external backup」을 클릭합니다. 이어지는 화면에서 「Remove setup」을 클릭하면 해당 서비스의 외부 백업이 비활성화됩니다.

</details>