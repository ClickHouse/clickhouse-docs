---
slug: /integrations/azure-data-factory
description: 'Bringing Azure Data into ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Bringing Azure Data into ClickHouse'
doc_type: 'overview'
---

| Page                                                                              | Description                                                                                                                                                                 |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview.md)                                                         | Overview of the two approaches used for bringing Azure Data into ClickHouse                                                                                                 |
| [Using ClickHouse's azureBlobStorage table function](./using_azureblobstorage.md) | Option 1 - an efficient and straightforward way to copy data from Azure Blob Storage or Azure Data Lake Storage into ClickHouse using the `azureBlobStorage` table function |
| [Using ClickHouse's HTTP interface](./using_http_interface.md)                    | Option 2 - instead of having ClickHouse pull the data from Azure, have Azure Data Factory push the data to ClickHouse using it's HTTP interface                             |
