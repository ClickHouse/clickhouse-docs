---
description: 'Azure Blob Storage 엔드포인트로의/로부터 백업 및 복원에 대한 상세 정보'
sidebar_label: 'AzureBlobStorage'
slug: /operations/backup/azure
title: 'Azure Blob Storage로의/로부터 백업 및 복원'
doc_type: 'guide'
---

import Syntax from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';


# Azure Blob Storage로/에서 백업/복원 \{#backup-to-azure-blob-storage\}



## 구문 \{#syntax\}

<Syntax/>



## AzureBlobStorage 엔드포인트를 사용하도록 BACKUP / RESTORE 구성하기 \{#configuring-backuprestore-to-use-an-azureblobstorage-endpoint\}

백업을 AzureBlobStorage 컨테이너에 저장하려면 다음 정보가 필요합니다:

* AzureBlobStorage 엔드포인트 연결 문자열 / URL
* 컨테이너
* 경로(Path)
* 계정 이름(URL이 지정된 경우)
* 계정 키(URL이 지정된 경우)

백업 대상은 다음과 같이 지정합니다:

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```
