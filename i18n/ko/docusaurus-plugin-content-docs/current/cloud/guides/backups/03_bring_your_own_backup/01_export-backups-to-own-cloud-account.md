---
'sidebar_label': '백업 내보내기'
'slug': '/cloud/manage/backups/export-backups-to-own-cloud-account'
'title': '자신의 클라우드 계정으로 백업 내보내기'
'description': '자신의 클라우드 계정으로 백업을 내보내는 방법을 설명합니다.'
'doc_type': 'guide'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud는 AWS S3, Google Cloud Storage 또는 Azure Blob Storage와 같은 클라우드 서비스 제공업체(CSP) 계정으로 백업을 지원합니다. "전체" 백업과 "증분" 백업을 포함하여 ClickHouse Cloud 백업이 작동하는 방식에 대한 자세한 내용은 [백업](/cloud/manage/backups/overview) 문서를 참조하세요.

이 가이드에서는 AWS, GCP, Azure 객체 저장소에 전체 및 증분 백업을 수행하는 방법뿐만 아니라 백업에서 복원하는 방법에 대한 예제를 보여줍니다.

:::note
사용자는 백업이 동일한 클라우드 제공업체의 다른 지역으로 내보내지는 모든 사용에 대해 [데이터 전송](/cloud/manage/network-data-transfer) 요금이 부과된다는 점을 인식해야 합니다. 현재 우리는 크로스 클라우드 백업을 지원하지 않습니다.
:::

## 요구 사항 {#requirements}

자체 CSP 저장소 버킷으로 백업을 내보내거나 복원하려면 다음 세부정보가 필요합니다.

### AWS {#aws}

1. AWS S3 엔드포인트, 형식:

```text
s3://<bucket_name>.s3.amazonaws.com/<directory>
```

  예를 들어: 
```text
s3://testchbackups.s3.amazonaws.com/backups/
```
  여기서:
    - `testchbackups`는 백업을 내보낼 S3 버킷의 이름입니다.
    - `backups`는 선택적 하위 디렉토리입니다.

2. AWS 액세스 키와 비밀. AWS 역할 기반 인증도 지원되며 AWS 액세스 키 및 비밀 대신 사용할 수 있습니다.

:::note
역할 기반 인증을 사용하려면 Secure s3 [설정](https://clickhouse.com/docs/cloud/security/secure-s3)을 따르십시오. 또한 IAM 정책에 `s3:PutObject` 및 `s3:DeleteObject` 권한을 추가해야 합니다 [여기서.](https://clickhouse.com/docs/cloud/security/secure-s3#option-2-manually-create-iam-role)
:::

### Azure {#azure}

1. Azure 스토리지 연결 문자열.
2. 스토리지 계정의 Azure 컨테이너 이름.
3. 컨테이너 내의 Azure Blob.

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. GCS 엔드포인트, 형식:

```text
https://storage.googleapis.com/<bucket_name>/
```
2. HMAC 키 및 HMAC 비밀.

<hr/>

# 백업 / 복원

## AWS S3 버킷으로 백업 / 복원 {#backup--restore-to-aws-s3-bucket}

### DB 백업 수행 {#take-a-db-backup}

**전체 백업**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

여기서 `uuid`는 백업 세트를 구별하는 데 사용되는 고유 식별자입니다.

:::note
이 하위 디렉토리의 각 새 백업에 대해 다른 UUID를 사용해야 합니다. 그렇지 않으면 `BACKUP_ALREADY_EXISTS` 오류가 발생합니다.  
예를 들어, 매일 백업을 수행하는 경우 매일 새 UUID를 사용해야 합니다.  
:::

**증분 백업**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>') 
SETTINGS base_backup = S3('https://testchbackups.s3.amazonaws.com/backups/<base-backup-uuid>', '<key id>', '<key secret>')
```

### 백업에서 복원 {#restore-from-a-backup}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored 
FROM S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

자세한 내용은 [S3 엔드포인트 사용을 위한 BACKUP/RESTORE 구성](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint)을 참조하세요.

## Azure Blob Storage로 백업 / 복원 {#backup--restore-to-azure-blob-storage}

### DB 백업 수행 {#take-a-db-backup-1}

**전체 백업**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

여기서 `uuid`는 백업 세트를 구별하는 데 사용되는 고유 식별자입니다.

**증분 백업**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>/my_incremental') 
SETTINGS base_backup = AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

### 백업에서 복원 {#restore-from-a-backup-1}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_azure 
FROM AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

자세한 내용은 [Azure Blob Storage 엔드포인트 사용을 위한 BACKUP/RESTORE 구성](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint)을 참조하세요.

## Google Cloud Storage (GCS)로 백업 / 복원 {#backup--restore-to-google-cloud-storage-gcs}

### DB 백업 수행 {#take-a-db-backup-2}

**전체 백업**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```
여기서 `uuid`는 백업 세트를 구별하는 데 사용되는 고유 식별자입니다.

**증분 백업**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/test_gcs_backups/<uuid>/my_incremental', 'key', 'secret')
SETTINGS base_backup = S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```

### 백업에서 복원 {#restore-from-a-backup-2}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_gcs 
FROM S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```
