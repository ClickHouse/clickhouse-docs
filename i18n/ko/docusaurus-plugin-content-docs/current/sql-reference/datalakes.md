---
description: '데이터 레이크에 대한 문서'
sidebar_label: '데이터 레이크'
sidebar_position: 2
slug: /sql-reference/datalakes
title: '데이터 레이크'
doc_type: 'reference'
---

이 섹션에서는 ClickHouse의 데이터 레이크 지원에 대해 살펴봅니다.
ClickHouse는 Iceberg, Delta Lake, Hudi, AWS Glue, REST Catalog, Unity Catalog, Microsoft OneLake 등을 포함하여 가장 널리 사용되는 테이블 형식과 데이터 카탈로그를 지원합니다.

# 오픈 테이블 포맷 \{#open-table-formats\}

## Iceberg \{#iceberg\}

Amazon S3 및 S3 호환 서비스, HDFS, Azure, 로컬 파일 시스템에서 데이터를 읽는 것을 지원하는 [iceberg](https://clickhouse.com/docs/sql-reference/table-functions/iceberg)를 참고하십시오. [icebergCluster](https://clickhouse.com/docs/sql-reference/table-functions/icebergCluster)는 `iceberg` 함수의 분산 버전입니다.

## Delta Lake \{#delta-lake\}

Amazon S3 및 S3 호환 서비스, Azure, 로컬 파일 시스템에서 읽기를 지원하는 [deltaLake](https://clickhouse.com/docs/sql-reference/table-functions/deltalake)를 참조하십시오. [deltaLakeCluster](https://clickhouse.com/docs/sql-reference/table-functions/deltalakeCluster)는 `deltaLake` 함수의 분산 버전입니다.

## Hudi \{#hudi\}

Amazon S3 및 S3 호환 서비스에서 읽기를 지원하는 [hudi](https://clickhouse.com/docs/sql-reference/table-functions/hudi)를 참조하십시오. [hudiCluster](https://clickhouse.com/docs/sql-reference/table-functions/hudiCluster)는 `hudi` 함수의 분산 버전입니다.

# 데이터 카탈로그 \{#data-catalogs\}

## AWS Glue \{#aws-glue\}

AWS Glue Data Catalog는 Iceberg 테이블에 사용할 수 있습니다. `iceberg` 테이블 엔진 또는 [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) 데이터베이스 엔진과 함께 사용할 수 있습니다.

## Iceberg REST Catalog \{#iceberg-rest-catalog\}

Iceberg REST Catalog는 Iceberg 테이블에 사용할 수 있습니다. `iceberg` 테이블 엔진이나 [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) 데이터베이스 엔진과 함께 사용할 수 있습니다.

## Unity Catalog \{#unity-catalog\}

Unity Catalog는 Delta Lake 테이블과 Iceberg 테이블 모두에서 사용할 수 있습니다. `iceberg` 또는 `deltaLake` 테이블 엔진과 함께 사용하거나 [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) 데이터베이스 엔진과 함께 사용할 수 있습니다.

## Microsoft OneLake \{#microsoft-onelake\}

Microsoft OneLake은 Delta Lake 테이블과 Iceberg 테이블 모두에 사용할 수 있습니다. [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) 데이터베이스 엔진과 함께 사용할 수 있습니다.