---
sidebar_label: 'Обзор'
slug: /integrations/azure-data-factory/overview
description: 'Загрузка данных Azure в ClickHouse — обзор'
keywords: ['azure data factory', 'azure', 'microsoft', 'данные']
title: 'Загрузка данных Azure в ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

<ClickHouseSupportedBadge />

Microsoft Azure предлагает широкий набор инструментов для хранения, преобразования и анализа
данных. Однако во многих сценариях ClickHouse может обеспечивать значительно более высокую
производительность при выполнении низколатентных запросов и обработке огромных наборов данных. Кроме того,
столбцовое хранение и сжатие в ClickHouse могут существенно снизить
стоимость выполнения запросов к большим объёмам аналитических данных по сравнению с базами данных Azure общего назначения.

В этом разделе документации мы рассмотрим два способа приёма данных из Microsoft Azure
в ClickHouse:

| Способ                                                                            | Описание                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Использование табличной функции `azureBlobStorage`](./using_azureblobstorage.md) | Предполагает использование табличной функции ClickHouse [`azureBlobStorage`](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) для прямой передачи данных из Azure Blob Storage.                                      |
| [Использование HTTP-интерфейса ClickHouse](./using_http_interface.md)             | Использует [HTTP-интерфейс ClickHouse](https://clickhouse.com/docs/interfaces/http) в качестве источника данных в Azure Data Factory, что позволяет копировать данные или использовать их в операциях потока данных в составе ваших конвейеров. |