---
'sidebar_label': '명령을 사용하여 백업 또는 복원'
'slug': '/cloud/manage/backups/backup-restore-via-commands'
'title': '백업을 수행하거나 명령을 사용하여 백업을 복원하는 방법'
'description': '명령을 사용하여 자신의 버킷을 사용하여 백업을 수행하거나 백업을 복원하는 방법을 설명하는 페이지'
'sidebar_position': 3
'doc_type': 'guide'
'keywords':
- 'backups'
- 'disaster recovery'
- 'data protection'
- 'restore'
- 'cloud features'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 백업 또는 복원 명령 사용하기 {#commands-experience}

사용자는 `BACKUP` 및 `RESTORE` 명령을 사용하여 백업을 스토리지 버킷에 내보낼 수 있으며, [사용자 인터페이스를 통한 백업 또는 복원](/cloud/manage/backups/backup-restore-via-ui)도 가능합니다. 세 가지 CSP에 대한 명령은 본 가이드에 제공됩니다.

## 요구 사항 {#requirements}

자신의 CSP 스토리지 버킷에 백업을 내보내거나 복원하려면 다음 세부 정보가 필요합니다:

<Tabs>
  <TabItem value="AWS" label="AWS" default>
    1. AWS S3 엔드포인트, 형식: `s3://<bucket_name>.s3.amazonaws.com/<optional_directory>`
       예: `s3://testchbackups.s3.amazonaws.com/`
       여기서:
         * `testchbackups`는 백업을 내보낼 S3 버킷의 이름입니다.
         * `backups`는 선택적 하위 디렉터리입니다.
    2. AWS 액세스 키 및 비밀. AWS 역할 기반 인증도 지원되며, 위 섹션에서 설명한 대로 AWS 액세스 키 및 비밀 대신 사용할 수 있습니다.
    <br/>
  </TabItem>
  <TabItem value="GCP" label="GCP">
   1. GCS 엔드포인트, 형식: `https://storage.googleapis.com/<bucket_name>/`
   2. HMAC 키 및 HMAC 비밀.
   <br/>
  </TabItem>
  <TabItem value="Azure" label="Azure">
    1. Azure 스토리지 연결 문자열.
    2. 스토리지 계정 내 Azure 컨테이너 이름.
    3. 컨테이너 내의 Azure Blob.
    <br/>
  </TabItem>
</Tabs>

## 특정 DB 백업 / 복원 {#backup_restore_db}

여기에서는 *단일* 데이터베이스의 백업 및 복원을 보여줍니다. 전체 백업 및 복원 명령에 대한 [백업 명령 요약](/operations/backup#command-summary)을 참조하세요.

### AWS S3 {#aws-s3-bucket}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>

```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```

여기서 `uuid`는 백업 세트를 구별하는 데 사용되는 고유 식별자입니다.

:::note
이 하위 디렉터리에서 각 새로운 백업에 대해 다른 uuid를 사용해야 합니다. 그렇지 않으면 `BACKUP_ALREADY_EXISTS` 오류가 발생합니다. 예를 들어, 매일 백업을 수행하는 경우 매일 새로운 uuid를 사용해야 합니다.
:::
  </TabItem>
  <TabItem value="Restore" label="RESTORE" default>

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

### Google Cloud Storage (GCS) {#google-cloud-storage}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>
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
이 하위 디렉터리에서 각 새로운 백업에 대해 다른 uuid를 사용해야 합니다. 그렇지 않으면 `BACKUP_ALREADY_EXISTS` 오류가 발생합니다. 예를 들어, 매일 백업을 수행하는 경우 매일 새로운 uuid를 사용해야 합니다.
:::

  </TabItem>
  <TabItem value="Restore" label="RESTORE" default>
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

### Azure Blob Storage {#azure-blob-storage}

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

여기서 `uuid`는 백업을 식별하는 데 사용되는 고유 식별자입니다.

:::note
이 하위 디렉터리에서 각 새로운 백업에 대해 다른 uuid를 사용해야 합니다. 그렇지 않으면 `BACKUP_ALREADY_EXISTS` 오류가 발생합니다. 예를 들어, 매일 백업을 수행하는 경우 매일 새로운 uuid를 사용해야 합니다.
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

## 전체 서비스 백업 / 복원 {#backup_restore_entire_service}

전체 서비스를 백업하려면 아래 명령을 사용하십시오. 이 백업에는 생성된 개체에 대한 모든 사용자 데이터 및 시스템 데이터, 설정 프로파일, 역할 정책, 쿼터 및 함수가 포함됩니다. 우리는 AWS S3에 대해 이 목록을 나열합니다. 위에서 설명한 구문을 사용하여 GCS 및 Azure Blob 스토리지에 대한 백업을 수행할 수 있습니다.

<Tabs>
<TabItem value="Backup" label="BACKUP" default>

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
<TabItem value="Restore" label="RESTORE" default>

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

## FAQ {#backups-faq}

<details>
<summary>클라우드 객체 스토리지의 백업은 어떻게 됩니까? ClickHouse에서 특정 시점에 정리합니까?</summary>

백업을 버킷에 내보낼 수 있는 기능을 제공하지만, 한 번 작성된 백업을 ClickHouse에서 정리하거나 삭제하지 않습니다. 버킷 내 백업의 수명 주기를 관리하는 것은 귀하의 책임이며, 필요에 따라 삭제하거나 아카이브하거나 전체 비용을 최적화하기 위해 저렴한 스토리지를 이동해야 합니다.

</details>

<details>
<summary>기존 백업을 다른 위치로 이동하면 복원 프로세스는 어떻게 됩니까?</summary>

백업이 다른 위치로 이동되면, 복원 명령은 백업이 저장된 새 위치를 참조하도록 업데이트해야 합니다.

</details>

<details>
<summary>객체 스토리지에 접근하는 데 필요한 자격 증명을 변경하면 어떻게 됩니까?</summary>

백업이 성공적으로 다시 시작되도록 UI에서 변경된 자격 증명을 업데이트해야 합니다.

</details>

<details>
<summary>외부 백업을 내보낼 위치를 변경하면 어떻게 됩니까?</summary>

UI에서 새 위치를 업데이트해야 하며, 백업은 새 위치로 시작됩니다. 기존의 백업은 원래 위치에 남아 있습니다.

</details>

<details>
<summary>제가 외부 백업을 활성화한 서비스에서 외부 백업을 비활성화하려면 어떻게 합니까?</summary>

서비스에 대한 외부 백업을 비활성화하려면 서비스 설정 화면으로 이동하여 외부 백업 변경을 클릭합니다. 다음 화면에서 설정 제거를 클릭하여 서비스의 외부 백업을 비활성화합니다.

</details>
