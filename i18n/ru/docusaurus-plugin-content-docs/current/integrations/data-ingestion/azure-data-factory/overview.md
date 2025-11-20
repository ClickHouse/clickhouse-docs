---
sidebar_label: 'Обзор'
slug: /integrations/azure-data-factory/overview
description: 'Загрузка данных из Azure в ClickHouse — обзор'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Загрузка данных из Azure в ClickHouse'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Импорт данных из Azure в ClickHouse

<ClickHouseSupportedBadge/>

Microsoft Azure предоставляет широкий спектр инструментов для хранения,
преобразования и анализа данных. Однако во многих сценариях ClickHouse может
обеспечить существенно более высокую производительность для выполнения
запросов с низкой задержкой и обработки огромных наборов данных. Кроме того,
колоночное хранение и сжатие в ClickHouse могут значительно снизить стоимость
выполнения запросов к большим объёмам аналитических данных по сравнению с
универсальными базами данных Azure.

В этом разделе документации мы рассмотрим два способа загрузки данных из Microsoft
Azure в ClickHouse:

| Method                                                                     | Description                                                                                                                                                                                                          |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Using the `azureBlobStorage` Table Function](./using_azureblobstorage.md) | Involves using ClickHouse's [`azureBlobStorage` Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) to transfer data directly from Azure Blob Storage.                       |
| [Using the ClickHouse HTTP interface](./using_http_interface.md)           | Uses the [ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http) as a data source within Azure Data Factory, allowing you to copy data or use it in data flow activities as part of your pipelines. |