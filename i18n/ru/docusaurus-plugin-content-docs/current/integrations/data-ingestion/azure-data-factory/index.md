---
slug: /integrations/azure-data-factory
description: 'Импорт данных Azure в ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Импорт данных Azure в ClickHouse'
---

| Страница                                                                           | Описание                                                                                                                                                                 |
|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Обзор](./overview.md)                                                           | Обзор двух подходов, используемых для импорта данных Azure в ClickHouse                                                                                                 |
| [Использование табличной функции azureBlobStorage ClickHouse](./using_azureblobstorage.md) | Вариант 1 - эффективный и простой способ копирования данных из Azure Blob Storage или Azure Data Lake Storage в ClickHouse с использованием табличной функции `azureBlobStorage` |
| [Использование HTTP интерфейса ClickHouse](./using_http_interface.md)             | Вариант 2 - вместо того чтобы ClickHouse извлекал данные из Azure, пусть Azure Data Factory отправляет данные в ClickHouse, используя его HTTP интерфейс                   |
