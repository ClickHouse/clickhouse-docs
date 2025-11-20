---
sidebar_label: 'Обзор'
slug: /integrations/azure-data-factory/overview
description: 'Загрузка данных из Azure в ClickHouse — обзор'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Загрузка данных из Azure в ClickHouse'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Загрузка данных из Azure в ClickHouse

<ClickHouseSupportedBadge/>

Microsoft Azure предлагает широкий набор инструментов для хранения, преобразования
и анализа данных. Однако во многих сценариях ClickHouse может обеспечить значительно
лучшую производительность для низколатентных запросов и обработки огромных
наборов данных. Кроме того, колонночное хранение и сжатие в ClickHouse могут значительно
снизить стоимость выполнения запросов к большим объёмам аналитических данных по сравнению с универсальными базами данных Azure.

В этом разделе документации мы рассмотрим два способа загрузки данных из Microsoft Azure
в ClickHouse:

| Method                                                                     | Description                                                                                                                                                                                                          |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Using the `azureBlobStorage` Table Function](./using_azureblobstorage.md) | Предполагает использование табличной функции ClickHouse [`azureBlobStorage`](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) для прямой передачи данных из Azure Blob Storage.          |
| [Using the ClickHouse HTTP interface](./using_http_interface.md)           | Использует [HTTP-интерфейс ClickHouse](https://clickhouse.com/docs/interfaces/http) как источник данных в Azure Data Factory, что позволяет копировать данные или использовать их в активностях потоков данных в рамках конвейеров. |