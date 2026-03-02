---
sidebar_label: '백업 내보내기'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: '자체 Cloud 계정으로 백업 내보내기'
description: '소유한 Cloud 계정으로 백업을 내보내는 방법을 설명합니다'
doc_type: 'guide'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge />

ClickHouse Cloud는 자체 클라우드 서비스 제공자(CSP) 계정(AWS S3, Google Cloud Storage, Azure Blob Storage)에 백업을 저장하도록 지원합니다.
「전체(Full)」 백업과 「증분(Incremental)」 백업을 포함하여 ClickHouse Cloud 백업이 어떻게 동작하는지에 대한 자세한 내용은 [backups](/cloud/manage/backups/overview) 문서를 참조하십시오.

이 가이드에서는 AWS, GCP, Azure 객체 스토리지로 전체 백업 및 증분 백업을 수행하는 방법과 해당 백업으로부터 복원하는 방법의 예시를 보여줍니다.

:::note
백업을 동일한 클라우드 제공자 내의 다른 리전으로 내보내는 경우에는 [data transfer](/cloud/manage/network-data-transfer) 요금이 발생합니다. 현재 클라우드 간(cross cloud) 백업은 지원하지 않습니다.
:::


## Requirements \{#requirements\}

사용자의 CSP 스토리지 버킷으로 백업을 내보내거나 백업을 복원하려면 다음 정보가 필요합니다.

### AWS \{#aws\}

1. 다음 형식의 AWS S3 엔드포인트:

```text
  s3://<bucket_name>.s3.amazonaws.com/<directory>
```

예를 들어:

```text
  s3://testchbackups.s3.amazonaws.com/backups/
```

다음과 같습니다.

* `testchbackups`는 백업을 내보낼 S3 버킷의 이름입니다.
  * `backups`는 선택적인 하위 디렉터리입니다.

2. AWS 액세스 키와 시크릿 키. AWS 역할 기반 인증도 지원되며, AWS 액세스 키와 시크릿 키 대신 사용할 수 있습니다.

:::note
역할 기반 인증을 사용하려면 Secure S3 [설정](https://clickhouse.com/docs/cloud/security/secure-s3)을 참고하십시오. 추가로, [여기](https://clickhouse.com/docs/cloud/security/secure-s3#option-2-manually-create-iam-role)에 설명된 IAM 정책에 `s3:PutObject` 및 `s3:DeleteObject` 권한을 추가해야 합니다.
:::


### Azure \{#azure\}

1. Azure Storage 연결 문자열.
2. Azure Storage 계정의 컨테이너 이름.
3. 컨테이너 내 Azure Blob 개체.

### Google Cloud Storage (GCS) \{#google-cloud-storage-gcs\}

1. 다음 형식의 GCS 엔드포인트:

    ```text
    https://storage.googleapis.com/<bucket_name>/
    ```
2. 액세스용 HMAC 키와 HMAC 시크릿.

<hr/>

# 백업 / 복구 \{#backup-restore\}

## AWS S3 버킷을 통한 백업/복원 \{#backup--restore-to-aws-s3-bucket\}

### DB 백업 생성 \{#take-a-db-backup\}

**전체 백업**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

여기서 `uuid`는 백업 집합을 구분하는 데 사용되는 고유 식별자입니다.

:::note
이 하위 디렉터리에서 새 백업을 생성할 때마다 UUID를 다르게 지정해야 하며 그렇지 않으면 `BACKUP_ALREADY_EXISTS` 오류가 발생합니다.
예를 들어 매일 백업을 수행하는 경우 매일 새로운 UUID를 사용해야 합니다.
:::

**증분 백업**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>') 
SETTINGS base_backup = S3('https://testchbackups.s3.amazonaws.com/backups/<base-backup-uuid>', '<key id>', '<key secret>')
```


### 백업에서 복원하기 \{#restore-from-a-backup\}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored 
FROM S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

자세한 내용은 [S3 엔드포인트를 사용하도록 BACKUP/RESTORE를 구성하는 방법](/operations/backup/s3_endpoint)을 참조하십시오.


## Azure Blob Storage로 백업 / 복원 \{#backup--restore-to-azure-blob-storage\}

### DB 백업 생성 \{#take-a-db-backup-1\}

**전체 백업**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

여기서 `uuid`는 백업 집합을 구분하는 데 사용되는 고유 식별자입니다.

**증분 백업(Incremental Backup)**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>/my_incremental') 
SETTINGS base_backup = AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```


### 백업에서 복원 \{#restore-from-a-backup-1\}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_azure 
FROM AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

자세한 내용은 [AzureBlobStorage 엔드포인트를 사용하도록 BACKUP/RESTORE를 구성하는 방법](/operations/backup/azure#configuring-backuprestore-to-use-an-azureblobstorage-endpoint)을 참조하십시오.


## Google Cloud Storage(GCS)를 사용한 백업 및 복원 \{#backup--restore-to-google-cloud-storage-gcs\}

### DB 백업 생성 \{#take-a-db-backup-2\}

**전체 백업**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```

여기서 `uuid`는 백업 집합을 구분하는 데 사용되는 고유 식별자입니다.

**증분 백업**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/test_gcs_backups/<uuid>/my_incremental', 'key', 'secret')
SETTINGS base_backup = S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```


### 백업에서 복원하기 \{#restore-from-a-backup-2\}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_gcs 
FROM S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```
