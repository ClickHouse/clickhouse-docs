---
sidebar_label: 'Overview'
slug: /integrations/azure-data-factory/overview
description: 'Bringing Azure Data into ClickHouse - Overview'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Bringing Azure Data into ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Bringing Azure Data into ClickHouse

<ClickHouseSupportedBadge/>

Microsoft Azure offers a wide range of tools to store, transform, and analyze
data. However, in many scenarios, ClickHouse can provide significantly better
performance for low-latency querying and processing of huge datasets. In
addition, ClickHouse's columnar storage and compression can greatly reduce the
cost of querying large volumes of analytical data compared to general-purpose
Azure databases.

In this section of the docs, we will explore two ways to ingest data from Microsoft Azure
into ClickHouse:

| Method                                                                     | Description                                                                                                                                                                                                          |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Using the `azureBlobStorage` Table Function](./using_azureblobstorage.md) | Involves using ClickHouse's [`azureBlobStorage` Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) to transfer data directly from Azure Blob Storage.                       |
| [Using the ClickHouse HTTP interface](./using_http_interface.md)           | Uses the [ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http) as a data source within Azure Data Factory, allowing you to copy data or use it in data flow activities as part of your pipelines. |
