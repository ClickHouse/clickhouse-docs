---
slug: /integrations/azure-data-factory
description: 'Импорт данных из Azure в ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Импорт данных из Azure в ClickHouse'
doc_type: 'guide'
---

| Страница                                                                          | Описание                                                                                                                                                                    |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview.md)                                                         | Обзор двух подходов к импорту данных из Azure в ClickHouse                                                                                                                  |
| [Using ClickHouse's azureBlobStorage table function](./using_azureblobstorage.md) | Вариант 1 — эффективный и простой способ копировать данные из Azure Blob Storage или Azure Data Lake Storage в ClickHouse с помощью табличной функции `azureBlobStorage`   |
| [Using ClickHouse's HTTP interface](./using_http_interface.md)                    | Вариант 2 — вместо того чтобы ClickHouse забирал данные из Azure, Azure Data Factory отправляет данные в ClickHouse, используя его HTTP-интерфейс                         |