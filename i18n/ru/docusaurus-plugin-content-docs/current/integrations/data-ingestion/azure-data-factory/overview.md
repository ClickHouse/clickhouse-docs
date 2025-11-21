---
sidebar_label: 'Обзор'
slug: /integrations/azure-data-factory/overview
description: 'Загрузка данных Azure в ClickHouse — обзор'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Загрузка данных Azure в ClickHouse'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Загрузка данных из Azure в ClickHouse

<ClickHouseSupportedBadge/>

Microsoft Azure предоставляет широкий набор инструментов для хранения, преобразования
и анализа данных. Однако во многих сценариях ClickHouse может обеспечивать значительно
более высокую производительность для запросов с низкой задержкой и обработки огромных
наборов данных. Кроме того, колоночное хранение и сжатие в ClickHouse могут существенно
снизить стоимость выполнения запросов к большим объёмам аналитических данных по сравнению
с универсальными базами данных Azure.

В этом разделе документации мы рассмотрим два способа загрузки данных из Microsoft Azure
в ClickHouse:

| Метод                                                                      | Описание                                                                                                                                                                                                             |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Использование табличной функции `azureBlobStorage`](./using_azureblobstorage.md) | Предполагает использование табличной функции ClickHouse [`azureBlobStorage`](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) для прямой передачи данных из Azure Blob Storage.          |
| [Использование HTTP-интерфейса ClickHouse](./using_http_interface.md)      | Использование [HTTP-интерфейса ClickHouse](https://clickhouse.com/docs/interfaces/http) в качестве источника данных в Azure Data Factory, что позволяет копировать данные или задействовать их в действиях потоков данных в составе ваших конвейеров. |