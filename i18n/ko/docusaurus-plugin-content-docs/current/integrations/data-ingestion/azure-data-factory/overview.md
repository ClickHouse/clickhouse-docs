---
sidebar_label: '개요'
slug: /integrations/azure-data-factory/overview
description: 'Azure 데이터를 ClickHouse로 가져오기 - 개요'
keywords: ['azure data factory', 'azure', 'microsoft', '데이터']
title: 'Azure 데이터를 ClickHouse로 가져오기'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

<ClickHouseSupportedBadge />

Microsoft Azure는 데이터를 저장, 변환, 분석하기 위한 다양한 도구를 제공합니다. 그러나 많은 경우 ClickHouse는 대규모 데이터셋에 대해 낮은 지연 시간의 쿼리와 처리에서 훨씬 뛰어난 성능을 제공합니다. 또한 ClickHouse의 열 지향 스토리지와 압축 기능은 범용 Azure 데이터베이스와 비교할 때 대량의 분석 데이터를 쿼리하는 비용을 크게 줄여줍니다.

이 문서 섹션에서는 Microsoft Azure에서 ClickHouse로 데이터를 수집하는 두 가지 방법을 살펴보겠습니다.

| 방법                                                                         | 설명                                                                                                                                                                 |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Using the `azureBlobStorage` Table Function](./using_azureblobstorage.md) | ClickHouse의 [`azureBlobStorage` 테이블 함수](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)를 사용하여 Azure Blob Storage에서 데이터를 직접 전송하는 방법입니다. |
| [Using the ClickHouse HTTP interface](./using_http_interface.md)           | Azure Data Factory에서 [ClickHouse HTTP 인터페이스](https://clickhouse.com/docs/interfaces/http)를 데이터 소스로 사용하여 데이터를 복사하거나, 파이프라인의 일부로 데이터 흐름 작업에 활용하는 방법입니다.              |