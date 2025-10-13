---
slug: '/integrations/azure-data-factory'
description: 'Импорт данных из Azure в ClickHouse'
title: 'Импорт данных Azure в ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
doc_type: guide
---
| Page                                                                              | Description                                                                                                                                                                 |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Обзор](./overview.md)                                                         | Обзор двух подходов, используемых для передачи данных из Azure в ClickHouse                                                                                                 |
| [Использование табличной функции azureBlobStorage в ClickHouse](./using_azureblobstorage.md) | Вариант 1 - эффективный и простой способ копирования данных из Azure Blob Storage или Azure Data Lake Storage в ClickHouse с использованием табличной функции `azureBlobStorage` |
| [Использование HTTP интерфейса ClickHouse](./using_http_interface.md)                    | Вариант 2 - вместо того чтобы ClickHouse загружал данные из Azure, используйте Azure Data Factory для их отправки в ClickHouse с использованием HTTP интерфейса                             |