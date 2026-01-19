---
description: 'Подробное описание резервного копирования и восстановления в и из конечной точки Azure Blob Storage'
sidebar_label: 'AzureBlobStorage'
slug: /operations/backup/azure
title: 'Резервное копирование и восстановление в и из Azure Blob Storage'
doc_type: 'guide'
---

import Syntax from '@site/i18n/ru/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';

# Резервное копирование и восстановление в/из Azure Blob Storage \{#backup-to-azure-blob-storage\}

## Синтаксис \{#syntax\}

<Syntax/>

## Настройка BACKUP / RESTORE для использования конечной точки AzureBlobStorage \{#configuring-backuprestore-to-use-an-azureblobstorage-endpoint\}

Чтобы записывать резервные копии в контейнер AzureBlobStorage, вам необходима следующая информация:

* Строка подключения/URL конечной точки AzureBlobStorage,
* Контейнер,
* Путь,
* Имя учётной записи (если указан URL),
* Ключ учётной записи (если указан URL).

Назначение места резервного копирования будет задаваться следующим образом:

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```
