---
'description': 'Azure Blob Storage 엔드포인트로 또는 Azure Blob Storage에서의 백업/복원에 대한 자세한 내용'
'sidebar_label': 'AzureBlobStorage'
'slug': '/operations/backup/azure'
'title': 'Azure Blob Storage에 대한 백업 및 복원'
'doc_type': 'guide'
---

import Syntax from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';


# BACKUP/RESTORE to or from Azure Blob Storage {#backup-to-azure-blob-storage}

## Syntax {#syntax}

<Syntax/>

## Configuring BACKUP / RESTORE to use an AzureBlobStorage endpoint {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

AzureBlobStorage 컨테이너에 백업을 작성하려면 다음 정보가 필요합니다:
- AzureBlobStorage 엔드포인트 연결 문자열 / URL,
- 컨테이너,
- 경로,
- 계정 이름 (URL이 지정된 경우)
- 계정 키 (URL이 지정된 경우)

백업의 대상은 다음과 같이 지정됩니다:

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```
