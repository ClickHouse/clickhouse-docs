---
slug: /integrations/azure-data-factory
description: 'Загрузка данных из Azure в ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Загрузка данных из Azure в ClickHouse'
doc_type: 'guide'
---

| Page                                                                              | Description                                                                                                                                                                 |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview.md)                                                         | Обзор двух подходов для загрузки данных из Azure в ClickHouse                                                                                                               |
| [Using ClickHouse's azureBlobStorage table function](./using_azureblobstorage.md) | Вариант 1 — эффективный и простой способ копирования данных из Azure Blob Storage или Azure Data Lake Storage в ClickHouse с использованием табличной функции ClickHouse `azureBlobStorage` |
| [Using ClickHouse's HTTP interface](./using_http_interface.md)                    | Вариант 2 — вместо того чтобы ClickHouse самостоятельно считывал данные из Azure, Azure Data Factory отправляет данные в ClickHouse через его HTTP‑интерфейс               |