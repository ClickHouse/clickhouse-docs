---
slug: /integrations/azure-data-factory
description: 'Azure 데이터를 ClickHouse로 가져오기'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Azure 데이터를 ClickHouse로 가져오기'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

| Page                                                                              | Description                                                                                                                                                                 |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview.md)                                                         | Azure 데이터를 ClickHouse로 가져오는 두 가지 접근 방식에 대한 개요입니다.                                                                                                 |
| [Using ClickHouse's azureBlobStorage table function](./using_azureblobstorage.md) | 옵션 1 - `azureBlobStorage` 테이블 함수를 사용하여 Azure Blob Storage 또는 Azure Data Lake Storage에서 ClickHouse로 데이터를 복사하는 효율적이고 직관적인 방법입니다. |
| [Using ClickHouse's HTTP interface](./using_http_interface.md)                    | 옵션 2 - ClickHouse가 Azure에서 데이터를 가져오도록 하는 대신, Azure Data Factory가 HTTP 인터페이스를 사용하여 ClickHouse로 데이터를 전송하도록 하는 방법입니다.                             |