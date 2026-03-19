---
description: 'AWS Glue, Unity, REST, Lakekeeper, Nessie, OneLake를 포함한 데이터 레이크 카탈로그에 ClickHouse를 연결하기 위한 참조 가이드입니다.'
pagination_prev: null
pagination_next: null
sidebar_position: 2
slug: /use-cases/data-lake/reference
title: '카탈로그 가이드'
keywords: ['data lake', 'lakehouse', 'catalog', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'landing-page'
---

ClickHouse는 [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) 데이터베이스 엔진을 통해 다양한 데이터 레이크 카탈로그와 연동합니다. 아래 가이드에서는 각 지원 카탈로그에 ClickHouse를 연결하는 방법을 구성, 인증, 쿼리 예제와 함께 설명합니다.

| Catalog | Description |
|---------|-------------|
| [AWS Glue](/use-cases/data-lake/glue-catalog) | S3에 저장된 데이터에서 AWS Glue Data Catalog에 등록된 Iceberg 테이블을 쿼리합니다. |
| [Databricks Unity Catalog](/use-cases/data-lake/unity-catalog) | Databricks Unity Catalog에 연결하여 Delta Lake 및 Iceberg 테이블을 사용합니다. |
| [Iceberg REST Catalog](/use-cases/data-lake/rest-catalog) | Tabular와 같이 Iceberg REST 사양을 구현한 모든 카탈로그를 사용합니다. |
| [Lakekeeper](/use-cases/data-lake/lakekeeper-catalog) | Iceberg 테이블용 Lakekeeper Catalog에 연결합니다. |
| [Project Nessie](/use-cases/data-lake/nessie-catalog) | Git과 유사한 데이터 버전 관리를 제공하는 Nessie Catalog를 사용해 Iceberg 테이블을 쿼리합니다. |
| [Microsoft OneLake](/use-cases/data-lake/onelake-catalog) | Microsoft Fabric OneLake의 Iceberg 테이블을 쿼리합니다. |