---
'sidebar_label': '개요'
'slug': '/integrations/azure-data-factory/overview'
'description': 'Azure 데이터를 ClickHouse로 가져오기 - 개요'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
'title': 'Azure 데이터를 ClickHouse로 가져오기'
'doc_type': 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Azure 데이터를 ClickHouse로 가져오기

<ClickHouseSupportedBadge/>

Microsoft Azure는 데이터를 저장하고 변환하며 분석하는 다양한 도구를 제공합니다. 그러나 많은 시나리오에서 ClickHouse는 대규모 데이터 세트를 위한 저지연 쿼리 및 처리에서 훨씬 더 나은 성능을 제공할 수 있습니다. 또한 ClickHouse의 컬럼형 스토리지와 압축 기능은 일반 Azure 데이터베이스와 비교했을 때 대량의 분석 데이터를 쿼리하는 비용을 크게 줄일 수 있습니다.

이 문서의 섹션에서는 Microsoft Azure에서 ClickHouse로 데이터를 수집하는 두 가지 방법을 살펴보겠습니다:

| 방법                                                                        | 설명                                                                                                                                                                                                                   |
|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`azureBlobStorage` 테이블 함수 사용하기](./using_azureblobstorage.md)      | ClickHouse의 [`azureBlobStorage` 테이블 함수](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)를 사용하여 Azure Blob Storage에서 직접 데이터를 전송하는 방식입니다.                       |
| [ClickHouse HTTP 인터페이스 사용하기](./using_http_interface.md)          | Azure Data Factory 내에서 데이터 소스로 [ClickHouse HTTP 인터페이스](https://clickhouse.com/docs/interfaces/http)를 사용하여 데이터 복사 또는 파이프라인의 일환으로 데이터 흐름 활동에서 사용할 수 있습니다. |
