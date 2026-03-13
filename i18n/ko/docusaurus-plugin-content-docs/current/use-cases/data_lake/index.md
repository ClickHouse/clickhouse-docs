---
description: 'Apache Iceberg, Delta Lake, Apache Hudi, Apache Paimon과 같은 오픈 테이블 포맷의 데이터를 ClickHouse로 쿼리하고 가속화하며 분석합니다.'
pagination_prev: null
pagination_next: null
slug: /use-cases/data-lake
title: '데이터 레이크하우스'
keywords: ['데이터 레이크', 'lakehouse', 'iceberg', 'delta lake', 'hudi', 'paimon', 'glue', 'unity', 'rest', 'OneLake', 'BigLake']
doc_type: 'landing-page'
---

ClickHouse는 [Apache Iceberg](/engines/table-engines/integrations/iceberg), [Delta Lake](/engines/table-engines/integrations/deltalake), [Apache Hudi](/engines/table-engines/integrations/hudi), [Apache Paimon](/sql-reference/table-functions/paimon)과 같은 오픈 레이크하우스 테이블 포맷과 통합됩니다. 이를 통해 이러한 포맷을 사용해 객체 스토리지에 이미 저장된 데이터에 ClickHouse를 연결하여, 기존 데이터 레이크 인프라에 ClickHouse의 분석 성능을 결합할 수 있습니다.

## ClickHouse를 오픈 테이블 포맷과 함께 사용해야 하는 이유 \{#why-clickhouse-uses-lake-formats\}

### 기존 데이터를 원본 위치에서 쿼리하기 \{#querying-data-in-place\}

ClickHouse는 데이터를 복제하지 않고도 객체 스토리지에 있는 오픈 테이블 포맷을 직접 쿼리할 수 있습니다. Iceberg, Delta Lake, Hudi, Paimon으로 표준화된 조직은 기존 테이블을 ClickHouse에 지정하면, 즉시 ClickHouse의 SQL 방언, 분석 함수, 그리고 효율적인 네이티브 Parquet 리더를 사용할 수 있습니다. 동시에 [clickhouse-local](/operations/utilities/clickhouse-local) 및 [chDB](/chdb)와 같은 도구를 사용하면 원격 스토리지의 70개가 넘는 파일 포맷에 대해 탐색적 애드 혹(ad hoc) 분석을 수행할 수 있어, 추가 인프라 설정 없이도 레이크하우스 데이터셋을 대화형으로 탐색할 수 있습니다.

이는 [table functions and table engines](/use-cases/data-lake/getting-started/querying-directly)를 사용한 직접 읽기 방식이나, [데이터 카탈로그에 연결](/use-cases/data-lake/getting-started/connecting-catalogs)하는 방식으로 구현할 수 있습니다.

### ClickHouse를 활용한 실시간 분석 워크로드 \{#real-time-with-clickhouse\}

높은 동시성과 낮은 지연 시간 응답이 요구되는 워크로드의 경우, 오픈 테이블 포맷의 데이터를 ClickHouse의 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 엔진으로 로드할 수 있습니다. 이를 통해 데이터 레이크 기반 데이터 위에 실시간 분석 계층을 구성할 수 있으며, 대시보드, 운영 보고서, 그리고 MergeTree 열 지향 저장 및 인덱싱 기능의 이점을 활용하는 기타 지연 시간에 민감한 워크로드를 지원합니다.

[MergeTree로 분석 가속화](/use-cases/data-lake/getting-started/accelerating-analytics)에 대한 시작 가이드를 참고하십시오.

## 기능 \{#capabilities\}

### 데이터를 직접 읽기 \{#read-data-directly\}

ClickHouse는 객체 스토리지에서 오픈 테이블 포맷을 직접 읽기 위한 [table functions](/sql-reference/table-functions) 및 [엔진](/engines/table-engines/integrations)을 제공합니다. [`iceberg()`](/sql-reference/table-functions/iceberg), [`deltaLake()`](/sql-reference/table-functions/deltalake), [`hudi()`](/sql-reference/table-functions/hudi), [`paimon()`](/sql-reference/table-functions/paimon)과 같은 함수는 사전 구성 없이 SQL 문 내에서 오픈 테이블 포맷 테이블을 쿼리할 수 있게 해줍니다. 이러한 함수는 S3, Azure Blob Storage, GCS와 같은 가장 일반적인 객체 스토리지의 버전으로도 제공됩니다. 또한 이러한 함수에 대응하는 동등한 테이블 엔진도 있어, 기본 오픈 테이블 포맷 객체 스토리지를 참조하는 테이블을 ClickHouse 내에 생성하는 데 사용할 수 있으므로 쿼리를 더욱 편리하게 수행할 수 있습니다.

[직접 쿼리](/use-cases/data-lake/getting-started/querying-directly)하거나 [데이터 카탈로그에 연결](/use-cases/data-lake/getting-started/connecting-catalogs)하는 방법은 시작 가이드를 참고하세요.

### 카탈로그를 데이터베이스로 노출하기 \{#expose-catalogs-as-databases\}

[`DataLakeCatalog`](/engines/database-engines/datalakecatalog) 데이터베이스 엔진을 사용하면 ClickHouse를 외부 카탈로그에 연결하고 이를 데이터베이스로 노출할 수 있습니다. 카탈로그에 등록된 테이블은 ClickHouse 내의 테이블로 나타나며, ClickHouse SQL 구문과 모든 분석 함수를 투명하게 사용할 수 있습니다. 즉, 카탈로그에서 관리하는 테이블을 네이티브 ClickHouse 테이블처럼 쿼리하고 조인하며 집계할 수 있고, 이 과정에서 ClickHouse의 쿼리 최적화, 병렬 실행, 데이터 읽기 기능을 그대로 활용할 수 있습니다.

지원되는 카탈로그는 다음과 같습니다.

| Catalog                  | Guide                                                             |
| ------------------------ | ----------------------------------------------------------------- |
| AWS Glue                 | [Glue Catalog 가이드](/use-cases/data-lake/glue-catalog)             |
| BigLake Metastore        | [BigLake Metastore 가이드](/use-cases/data-lake/biglake-catalog)     |
| Databricks Unity Catalog | [Unity Catalog 가이드](/use-cases/data-lake/unity-catalog)           |
| Iceberg REST Catalog     | [REST Catalog 가이드](/use-cases/data-lake/rest-catalog)             |
| Lakekeeper               | [Lakekeeper Catalog 가이드](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie           | [Nessie Catalog 가이드](/use-cases/data-lake/nessie-catalog)         |
| Microsoft OneLake        | [OneLake Catalog 가이드](/use-cases/data-lake/onelake-catalog)       |

[카탈로그에 연결하기](/use-cases/data-lake/getting-started/connecting-catalogs)에 대한 시작 가이드를 참고하십시오.

### 레이크하우스 테이블 포맷으로 다시 쓰기 \{#write-back-to-lakehouse-formats\}

ClickHouse는 오픈 테이블 포맷으로 데이터를 다시 기록하는 기능을 지원하며, 이는 다음과 같은 시나리오에서 유용합니다:

- **실시간에서 장기 스토리지로** - 데이터는 ClickHouse를 실시간 분석 계층으로 거쳐 이동하며, 내구성이 뛰어나고 비용 효율적인 장기 스토리지에 보관하기 위해 결과를 Iceberg 또는 기타 포맷으로 내보내야 하는 경우가 있습니다.
- **Reverse ETL** - 사용자는 ClickHouse 내부에서 구체화된 뷰(Materialized View) 또는 예약된 쿼리를 사용해 변환 작업을 수행하고, 데이터 생태계의 다른 도구에서 활용할 수 있도록 그 결과를 오픈 테이블 포맷에 영구 저장하기를 원할 수 있습니다.

데이터 레이크로 쓰는 방법은 [데이터 레이크에 쓰기](/use-cases/data-lake/getting-started/writing-data) 시작 가이드를 참조하십시오.

## 다음 단계 \{#next-steps\}

직접 사용해 볼 준비가 되었다면, [시작하기 가이드](/use-cases/data-lake/getting-started)를 통해 오픈 테이블 형식에 직접 쿼리하고, 카탈로그에 연결하고, 고속 분석을 위해 데이터를 MergeTree에 적재하며, 결과를 다시 기록하는 작업까지 하나의 엔드 투 엔드 워크플로우로 수행하는 방법을 단계별로 확인할 수 있습니다.