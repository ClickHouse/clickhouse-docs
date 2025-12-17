---
description: '介绍如何在 Azure Blob Storage 端点上执行备份和恢复'
sidebar_label: 'AzureBlobStorage'
slug: /operations/backup/azure
title: '使用 Azure Blob Storage 进行备份与恢复'
doc_type: 'guide'
---

import Syntax from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';

# 使用 Azure Blob Storage 进行备份/恢复 {#backup-to-azure-blob-storage}

## 语法 {#syntax}

<Syntax/>

## 配置 BACKUP / RESTORE 以使用 AzureBlobStorage 端点 {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

要将备份写入 AzureBlobStorage 容器，需要以下信息：

* AzureBlobStorage 端点连接字符串 / URL，
* 容器，
* 路径，
* 账户名称（如果指定了 URL），
* 账户密钥（如果指定了 URL）

备份目标将被指定为：

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```
