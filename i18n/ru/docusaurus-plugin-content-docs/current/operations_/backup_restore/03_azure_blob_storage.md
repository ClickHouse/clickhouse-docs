---
description: 'Подробная информация о резервном копировании и восстановлении в/из конечной точки Azure Blob Storage'
sidebar_label: 'AzureBlobStorage'
slug: /operations/backup/azure
title: 'Резервное копирование и восстановление в/из Azure Blob Storage'
doc_type: 'guide'
---

import Syntax from '@site/docs/operations_/backup_restore/_snippets/_syntax.md';


# BACKUP/RESTORE в Azure Blob Storage и из него {#backup-to-azure-blob-storage}


## Синтаксис {#syntax}

<Syntax />


## Настройка BACKUP / RESTORE для использования конечной точки AzureBlobStorage {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

Для записи резервных копий в контейнер AzureBlobStorage требуется следующая информация:

- Строка подключения / URL конечной точки AzureBlobStorage,
- Контейнер,
- Путь,
- Имя учетной записи (если указан URL),
- Ключ учетной записи (если указан URL)

Место назначения для резервной копии указывается следующим образом:

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```
