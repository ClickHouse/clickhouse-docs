---
description: 'Azure Blob Storage エンドポイントへのバックアップおよびそこからの復元の詳細'
sidebar_label: 'AzureBlobStorage'
slug: /operations/backup/azure
title: 'Azure Blob Storage へのバックアップおよびそこからの復元'
doc_type: 'guide'
---

import Syntax from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';

# Azure Blob Storage への/からのバックアップ/リストア \{#backup-to-azure-blob-storage\}

## 構文 \{#syntax\}

<Syntax/>

## Azure Blob Storage エンドポイントを使用するように BACKUP / RESTORE を構成する \{#configuring-backuprestore-to-use-an-azureblobstorage-endpoint\}

バックアップを Azure Blob Storage コンテナに書き込むには、次の情報が必要です。

* Azure Blob Storage エンドポイント接続文字列 / URL
* コンテナ
* パス
* アカウント名（URL を指定する場合）
* アカウントキー（URL を指定する場合）

バックアップの保存先は次のように指定します。

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```
