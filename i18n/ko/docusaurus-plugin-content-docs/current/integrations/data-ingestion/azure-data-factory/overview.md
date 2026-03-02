---
sidebar_label: '개요'
slug: /integrations/azure-data-factory/overview
description: 'Azure 데이터를 ClickHouse로 가져오기 - 개요'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Azure 데이터를 ClickHouse로 가져오기'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Azure 데이터를 ClickHouse로 가져오기 \{#bringing-azure-data-into-clickhouse\}

<ClickHouseSupportedBadge />

Microsoft Azure는 데이터를 저장하고 변환하며 분석하기 위한 다양한 도구를 제공합니다. 그러나 많은 시나리오에서 ClickHouse는 저지연 쿼리와 대규모 데이터 세트 처리에서 훨씬 더 뛰어난 성능을 제공합니다. 또한 ClickHouse의 열 지향 저장 방식과 압축 기능은 범용 Azure 데이터베이스에 비해 대규모 분석 데이터에 대한 쿼리 비용을 크게 절감할 수 있습니다.

이 섹션에서는 Microsoft Azure에서 ClickHouse로 데이터를 수집하는 두 가지 방법을 살펴봅니다:

| Method                                                                     | Description                                                                                                                                                                                                          |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Using the `azureBlobStorage` Table Function](./using_azureblobstorage.md) | Azure Blob Storage에서 데이터를 직접 전송하기 위해 ClickHouse의 [`azureBlobStorage` Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)을 사용하는 방법입니다.            |
| [Using the ClickHouse HTTP interface](./using_http_interface.md)           | Azure Data Factory 내에서 [ClickHouse HTTP 인터페이스](https://clickhouse.com/docs/interfaces/http)를 데이터 소스로 사용하여, 파이프라인의 일부로 데이터를 복사하거나 데이터 흐름 작업에서 활용하는 방법입니다.      |