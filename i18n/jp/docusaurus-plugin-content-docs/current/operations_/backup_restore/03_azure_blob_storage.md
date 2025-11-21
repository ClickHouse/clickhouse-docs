---
description: 'Azure Blob Storage エンドポイントとの間で行うバックアップおよび復元の詳細'
sidebar_label: 'AzureBlobStorage'
slug: /operations/backup/azure
title: 'Azure Blob Storage との間で行うバックアップおよび復元'
doc_type: 'guide'
---

import Syntax from '@site/docs/operations_/backup_restore/_snippets/_syntax.md';


# Azure Blob StorageへのBACKUP/RESTOREまたはAzure Blob Storageからの復元 {#backup-to-azure-blob-storage}


## 構文 {#syntax}

<Syntax />


## AzureBlobStorageエンドポイントを使用するBACKUP / RESTOREの設定 {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

AzureBlobStorageコンテナにバックアップを書き込むには、以下の情報が必要です:

- AzureBlobStorageエンドポイントの接続文字列 / URL
- コンテナ
- パス
- アカウント名(URLが指定されている場合)
- アカウントキー(URLが指定されている場合)

バックアップの保存先は次のように指定します:

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```
