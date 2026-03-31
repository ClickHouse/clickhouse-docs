---
title: '지원 매트릭스'
sidebar_label: '지원 매트릭스'
slug: /use-cases/data-lake/support-matrix
sidebar_position: 3
pagination_prev: null
pagination_next: null
description: 'ClickHouse 오픈 테이블 포맷 통합 및 데이터 카탈로그 연결에 대한 종합적인 지원 매트릭스입니다.'
keywords: ['data lake', 'lakehouse', 'support', 'iceberg', 'delta lake', 'hudi', 'paimon', 'catalog', 'features']
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

이 페이지는 ClickHouse의 데이터 레이크 통합에 대한 종합적인 지원 매트릭스를 제공합니다. 각 오픈 테이블 포맷에서 사용할 수 있는 기능, ClickHouse가 연결할 수 있는 카탈로그, 그리고 각 카탈로그에서 지원되는 기능을 다룹니다.

## 오픈 테이블 포맷 지원 \{#format-support\}

ClickHouse는 네 가지 오픈 테이블 포맷을 통합 지원합니다: [Apache Iceberg](/engines/table-engines/integrations/iceberg), [Delta Lake](/engines/table-engines/integrations/deltalake), [Apache Hudi](/engines/table-engines/integrations/hudi), [Apache Paimon](/sql-reference/table-functions/paimon). 아래에서 형식을 선택하여 해당 지원 매트릭스를 확인하십시오.

**범례:** ✅ 지원됨 | ⚠️ 부분 지원 / 실험적 | ❌ 지원되지 않음

<Tabs groupId="format-matrix">
  <TabItem value="iceberg" label="Apache Iceberg" default>
    | 기능                             |  상태 | 비고                                                                                                                                                                                                                                                             |
    | ------------------------------ | :-: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **스토리지 백엔드**                   |     |                                                                                                                                                                                                                                                                |
    | AWS S3                         |  ✅  | [`icebergS3()`](/sql-reference/table-functions/iceberg) 또는 `iceberg()` 별칭 사용                                                                                                                                                                                   |
    | GCS                            |  ✅  | [`icebergS3()`](/sql-reference/table-functions/iceberg) 또는 `iceberg()` 별칭 사용                                                                                                                                                                                   |
    | Azure Blob Storage             |  ✅  | [`icebergAzure()`](/sql-reference/table-functions/iceberg)을 통해                                                                                                                                                                                                 |
    | HDFS                           |  ⚠️ | [`icebergHDFS()`](/sql-reference/table-functions/iceberg)을 통해 지원됩니다. 사용 중단되었습니다.                                                                                                                                                                               |
    | 로컬 파일 시스템                      |  ✅  | [`icebergLocal()`](/sql-reference/table-functions/iceberg) 사용                                                                                                                                                                                                  |
    | **접근 방법**                      |     |                                                                                                                                                                                                                                                                |
    | 테이블 함수                         |  ✅  | [`icebergS3()`](/sql-reference/table-functions/iceberg) 및 백엔드별 다양한 변형                                                                                                                                                                                          |
    | 테이블 엔진                         |  ✅  | [`IcebergS3`](/engines/table-engines/integrations/iceberg), 백엔드별 변형 제공                                                                                                                                                                                         |
    | 클러스터 분산 읽기                     |  ✅  | [`icebergS3Cluster`](/sql-reference/table-functions/icebergCluster), [`icebergAzureCluster`](/sql-reference/table-functions/icebergCluster), [`icebergHDFSCluster`](/sql-reference/table-functions/icebergCluster)                                             |
    | Named collections(이름이 지정된 컬렉션) |  ✅  | [Named collection(이름이 지정된 컬렉션) 정의](/sql-reference/table-functions/iceberg#defining-a-named-collection)                                                                                                                                                         |
    |                                |     |                                                                                                                                                                                                                                                                |
    | **읽기 관련 기능**                   |     |                                                                                                                                                                                                                                                                |
    | 읽기 지원                          |  ✅  | 모든 ClickHouse SQL 함수와 함께 사용할 수 있는 완전한 SELECT 지원                                                                                                                                                                                                                |
    | 파티션 프루닝                        |  ✅  | 자세한 내용은 [파티션 프루닝](/engines/table-engines/integrations/iceberg#partition-pruning)을 참고하십시오.                                                                                                                                                                      |
    | 숨겨진 파티셔닝                       |  ✅  | Iceberg 변환 기반 파티셔닝을 지원합니다                                                                                                                                                                                                                                      |
    | 파티션 진화                         |  ✅  | 시간 경과에 따라 파티션 스펙이 변경되는 테이블의 읽기를 지원합니다                                                                                                                                                                                                                          |
    | 스키마 진화                         |  ✅  | 컬럼 추가, 제거 및 순서 재배치. [Schema evolution](/engines/table-engines/integrations/iceberg#schema-evolution)을 참조하십시오.                                                                                                                                                  |
    | 데이터 타입 승격 / 확장                 |  ✅  | `int` → `long`, `float` → `double`, `decimal(P,S)` → `decimal(P',S)` (이때 P&#39;는 P보다 커야 합니다). [스키마 진화(Schema evolution)](/engines/table-engines/integrations/iceberg#schema-evolution)을 참조하십시오.                                                                |
    | 타임 트래블 / 스냅샷                   |  ✅  | `iceberg_timestamp_ms` 또는 `iceberg_snapshot_id` 설정을 통해 사용할 수 있습니다. 자세한 내용은 [Time travel](/engines/table-engines/integrations/iceberg#time-travel)을 참조하십시오.                                                                                                     |
    | 포지션 삭제(position delete)        |  ✅  | [삭제된 행 처리](/engines/table-engines/integrations/iceberg#deleted-rows)를 참고하십시오.                                                                                                                                                                                  |
    | 동등 조건 DELETE                   |  ✅  | 테이블 엔진에서만 지원되며 v25.8+부터 사용할 수 있습니다. [삭제된 행 처리](/engines/table-engines/integrations/iceberg#deleted-rows)를 참조하십시오.                                                                                                                                              |
    | 읽기 시 병합(Merge-on-read)         |  ⚠️ | 실험적 기능입니다. [삭제 작업](/sql-reference/table-functions/iceberg#iceberg-writes-delete)을 지원합니다.                                                                                                                                                                       |
    | 포맷 버전                          |  ⚠️ | v1과 v2는 지원됩니다. v3는 지원되지 않습니다.                                                                                                                                                                                                                                  |
    | 컬럼 통계                          |  ✅  |                                                                                                                                                                                                                                                                |
    | 블룸 필터 / puffin 파일              |  ❌  | puffin 파일의 블룸 필터 인덱스는 지원되지 않습니다.                                                                                                                                                                                                                               |
    | 가상 컬럼                          |  ✅  | `_path`, `_file`, `_size`, `_time`, `_etag` 컬럼입니다. [가상 컬럼](/sql-reference/table-functions/iceberg#virtual-columns)을 참고하십시오.                                                                                                                                    |
    |                                |     |                                                                                                                                                                                                                                                                |
    | **쓰기 관련 기능**                   |     |                                                                                                                                                                                                                                                                |
    | 테이블 생성                         |  ✅  | 실험적 기능입니다. `allow_insert_into_iceberg = 1` 설정이 필요합니다. v25.7+에서 사용 가능합니다. 자세한 내용은 [테이블 생성](/sql-reference/table-functions/iceberg#create-iceberg-table)을 참조하십시오.                                                                                                |
    | INSERT                         |  ✅  | 26.2 버전부터 Beta입니다. `allow_insert_into_iceberg = 1` 설정이 필요합니다. [데이터 삽입](/sql-reference/table-functions/iceberg#writes-inserts)을 참조하십시오.                                                                                                                         |
    | DELETE                         |  ✅  | 실험적 기능입니다. `allow_insert_into_iceberg = 1` 설정이 필요합니다. `ALTER TABLE ... DELETE WHERE`를 통해 삭제합니다. [데이터 삭제](/sql-reference/table-functions/iceberg#iceberg-writes-delete)를 참고하십시오.                                                                                |
    | ALTER TABLE (스키마 변경)           |  ✅  | 실험적 기능입니다. `allow_insert_into_iceberg = 1` 설정이 필요합니다. 컬럼을 추가, 삭제, 수정하거나 이름을 변경할 수 있습니다. [스키마 변경](/sql-reference/table-functions/iceberg#iceberg-writes-schema-evolution)을 참조하십시오.                                                                              |
    | 컴팩션                            |  ⚠️ | 실험적 기능입니다. `allow_experimental_iceberg_compaction = 1` 설정이 필요합니다. position delete 파일을 데이터 파일로 병합합니다. [Compaction](/sql-reference/table-functions/iceberg#iceberg-writes-compaction)을 참조하십시오. 기타 Iceberg compaction 연산은 지원되지 않습니다.                              |
    | UPDATE / MERGE                 |  ❌  | 지원되지 않습니다. 컴팩션을 참조하십시오.                                                                                                                                                                                                                                        |
    | 쓰기 시 복사(Copy-on-write)         |  ❌  | 지원되지 않습니다.                                                                                                                                                                                                                                                     |
    | 스냅샷 만료 처리                      |  ❌  | 지원되지 않습니다                                                                                                                                                                                                                                                      |
    | 고아 파일 삭제                       |  ❌  | 지원되지 않습니다                                                                                                                                                                                                                                                      |
    | 파티션 단위 쓰기                      |  ✅  | 지원됩니다.                                                                                                                                                                                                                                                         |
    | 파티션 스키마 변경                     |  ❌  | ClickHouse에서는 파티션 방식(파티셔닝 스키마)을 변경하는 기능을 지원하지 않습니다. 다만 파티션 방식이 변경된 Iceberg 테이블에는 쓰기를 수행할 수 있습니다.                                                                                                                                                               |
    |                                |     |                                                                                                                                                                                                                                                                |
    | **메타데이터**                      |     |                                                                                                                                                                                                                                                                |
    | 브랜치 및 태그                       |  ❌  | Iceberg 브랜치 및 태그에 대한 참조는 지원되지 않습니다.                                                                                                                                                                                                                            |
    | 메타데이터 파일 확인                    |  ✅  | 카탈로그, 단순 디렉터리 목록, &#39;version-hint&#39;, 특정 경로를 통한 메타데이터 해석을 지원합니다. `iceberg_metadata_file_path` 및 `iceberg_metadata_table_uuid`를 통해 구성할 수 있습니다. [Metadata file resolution](/engines/table-engines/integrations/iceberg#metadata-file-resolution)을(를) 참조하십시오. |
    | 데이터 캐싱                         |  ✅  | S3/Azure/HDFS 스토리지 엔진과 같은 메커니즘을 사용합니다. [Data cache](/engines/table-engines/integrations/iceberg#data-cache)를 참조하십시오.                                                                                                                                           |
    | 메타데이터 캐싱                       |  ✅  | 매니페스트 및 메타데이터 파일이 메모리에 캐시됩니다. 기본적으로 `use_iceberg_metadata_files_cache`를 통해 활성화됩니다. [Metadata cache](/engines/table-engines/integrations/iceberg#metadata-cache)를 참조하십시오.                                                                                       |
  </TabItem>

  <TabItem value="delta" label="Delta Lake">
    버전 25.6부터 ClickHouse는 Delta Lake Rust 커널을 사용하여 Delta Lake 테이블을 읽어 더 폭넓은 기능을 지원합니다. 그러나 Azure Blob Storage의 데이터에 액세스할 때는 알려진 문제가 발생합니다. 이러한 이유로 Azure Blob Storage에서 데이터를 읽을 때는 이 커널이 비활성화됩니다. 아래 표에서 어떤 기능에 이 커널이 필요한지 표시합니다.

    | Feature                   | Status | Notes                                                                                                                                                            |
    | ------------------------- | :----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **Storage backends**      |        |                                                                                                                                                                  |
    | AWS S3                    |    ✅   | [`deltaLake()`](/sql-reference/table-functions/deltalake) 또는 `deltaLakeS3()`를 통해                                                                                 |
    | GCS                       |    ✅   | [`deltaLake()`](/sql-reference/table-functions/deltalake) 또는 `deltaLakeS3()`를 통해                                                                                 |
    | Azure Blob Storage        |    ✅   | [`deltaLakeAzure()`](/sql-reference/table-functions/deltalake)를 통해                                                                                               |
    | HDFS                      |    ❌   | 지원되지 않음                                                                                                                                                          |
    | Local filesystem          |    ✅   | [`deltaLakeLocal()`](/sql-reference/table-functions/deltalake)를 통해                                                                                               |
    | **Access methods**        |        |                                                                                                                                                                  |
    | Table function            |    ✅   | 각 스토리지 백엔드에 대한 변형과 함께 [`deltaLake()`](/sql-reference/table-functions/deltalake)                                                                                  |
    | Table engine              |    ✅   | [`DeltaLake`](/engines/table-engines/integrations/deltalake)                                                                                                     |
    | Cluster-distributed reads |    ✅   | [`deltaLakeCluster`](/sql-reference/table-functions/deltalakeCluster), [`deltaLakeAzureCluster`](/sql-reference/table-functions/deltalakeCluster)                |
    | Named collections         |    ✅   | [Named collection](/sql-reference/table-functions/deltalake#arguments)                                                                                           |
    | **Read features**         |        |                                                                                                                                                                  |
    | Read support              |    ✅   | 모든 ClickHouse SQL 함수와 함께 전체 SELECT를 지원합니다                                                                                                                        |
    | Partition pruning         |    ✅   | Delta Kernel이 필요합니다.                                                                                                                                             |
    | Schema evolution          |    ✅   | Delta Kernel이 필요합니다.                                                                                                                                             |
    | Time travel               |    ✅   | Delta Kernel이 필요합니다.                                                                                                                                             |
    | Deletion vectors          |    ✅   |                                                                                                                                                                  |
    | Column mapping            |    ✅   |                                                                                                                                                                  |
    | Change data feed          |    ✅   | Delta Kernel이 필요합니다.                                                                                                                                             |
    | Virtual columns           |    ✅   | `_path`, `_file`, `_size`, `_time`, `_etag`. [Virtual columns](/sql-reference/table-functions/deltalake#virtual-columns)을 참조하십시오.                                |
    | **Write features**        |        |                                                                                                                                                                  |
    | INSERT                    |    ✅   | 실험적 기능입니다. `allow_experimental_delta_lake_writes = 1` 설정이 필요합니다. [DeltaLake engine](/engines/table-engines/integrations/deltalake)을 참조하십시오. Delta Kernel이 필요합니다. |
    | DELETE / UPDATE / MERGE   |    ❌   | 지원되지 않음                                                                                                                                                          |
    | CREATE empty table        |    ❌   | 새로운 비어 있는 Delta Lake 테이블 생성은 지원되지 않습니다. `CREATE TABLE` 작업은 객체 스토리지에 기존 Delta Lake가 존재한다고 가정합니다.                                                                  |
    | **Caching**               |        |                                                                                                                                                                  |
    | Data caching              |    ✅   | S3/Azure/HDFS 스토리지 엔진과 동일한 메커니즘입니다. [Data cache](/engines/table-engines/integrations/deltalake#data-cache)를 참조하십시오.                                              |
  </TabItem>

  <TabItem value="hudi" label="Apache Hudi">
    | 기능                        |  상태 | 비고                                                                                                                           |
    | ------------------------- | :-: | ---------------------------------------------------------------------------------------------------------------------------- |
    | **스토리지 백엔드**              |     |                                                                                                                              |
    | AWS S3                    |  ✅  | [`hudi()`](/sql-reference/table-functions/hudi)를 통해 지원합니다                                                                    |
    | GCS                       |  ✅  | [`hudi()`](/sql-reference/table-functions/hudi)를 통해 지원합니다                                                                    |
    | Azure Blob Storage        |  ❌  | 지원되지 않습니다                                                                                                                    |
    | HDFS                      |  ❌  | 지원되지 않습니다                                                                                                                    |
    | Local filesystem          |  ❌  | 지원되지 않습니다                                                                                                                    |
    | **액세스 방식**                |     |                                                                                                                              |
    | Table function            |  ✅  | [`hudi()`](/sql-reference/table-functions/hudi)                                                                              |
    | Table engine              |  ✅  | [`Hudi`](/engines/table-engines/integrations/hudi)                                                                           |
    | Cluster-distributed reads |  ✅  | [`hudiCluster`](/sql-reference/table-functions/hudiCluster) (S3 전용)                                                          |
    | Named collections         |  ✅  | [Hudi arguments](/sql-reference/table-functions/hudi#arguments)                                                              |
    | **읽기 기능**                 |     |                                                                                                                              |
    | Read support              |  ✅  | 모든 ClickHouse SQL 함수와 함께 완전한 SELECT 쿼리를 지원합니다                                                                                |
    | Schema evolution          |  ❌  | 지원되지 않습니다                                                                                                                    |
    | Time travel               |  ❌  | 지원되지 않습니다                                                                                                                    |
    | Virtual columns           |  ✅  | `_path`, `_file`, `_size`, `_time`, `_etag`. [Virtual columns](/sql-reference/table-functions/hudi#virtual-columns)를 참조하십시오. |
    | **쓰기 기능**                 |     |                                                                                                                              |
    | INSERT / DELETE / UPDATE  |  ❌  | 읽기 전용 연동입니다                                                                                                                  |
    | **캐싱**                    |     |                                                                                                                              |
    | Data caching              |  ❌  | 지원되지 않습니다                                                                                                                    |
  </TabItem>

  <TabItem value="paimon" label="Apache Paimon">
    | Feature                   | Status | Notes                                                                                                                                                                                                                   |
    | ------------------------- | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **Storage backends**      |        |                                                                                                                                                                                                                         |
    | S3                        |    ✅   | 실험적 기능입니다. [`paimon()`](/sql-reference/table-functions/paimon) 또는 `paimonS3()`를 통해 사용합니다.                                                                                                                               |
    | GCS                       |    ✅   | 실험적 기능입니다. [`paimon()`](/sql-reference/table-functions/paimon) 또는 `paimonS3()`를 통해 사용합니다.                                                                                                                               |
    | Azure Blob Storage        |    ✅   | 실험적 기능입니다. [`paimonAzure()`](/sql-reference/table-functions/paimon)을 통해 사용합니다.                                                                                                                                          |
    | HDFS                      |   ⚠️   | 실험적 기능입니다. [`paimonHDFS()`](/sql-reference/table-functions/paimon)을 통해 사용합니다. 사용 중단(Deprecated)되었습니다.                                                                                                                   |
    | Local filesystem          |    ✅   | 실험적 기능입니다. [`paimonLocal()`](/sql-reference/table-functions/paimon)을 통해 사용합니다.                                                                                                                                          |
    | **Access methods**        |        |                                                                                                                                                                                                                         |
    | Table function            |    ✅   | 실험적 기능입니다. 각 스토리지 백엔드별 variant와 함께 [`paimon()`](/sql-reference/table-functions/paimon)을 사용합니다.                                                                                                                          |
    | Table engine              |    ❌   | 전용 table engine이 없습니다.                                                                                                                                                                                                  |
    | Cluster-distributed reads |    ✅   | 실험적 기능입니다. [`paimonS3Cluster`](/sql-reference/table-functions/paimonCluster), [`paimonAzureCluster`](/sql-reference/table-functions/paimonCluster), [`paimonHDFSCluster`](/sql-reference/table-functions/paimonCluster) |
    | Named collections         |    ✅   | 실험적 기능입니다. [Named collection 정의](/sql-reference/table-functions/paimon#defining-a-named-collection)를 참고하십시오.                                                                                                            |
    | **Read features**         |        |                                                                                                                                                                                                                         |
    | Read support              |    ✅   | 실험적 기능입니다. 모든 ClickHouse SQL 함수와 함께 전체 SELECT를 지원합니다.                                                                                                                                                                   |
    | Schema evolution          |    ❌   | 지원되지 않습니다.                                                                                                                                                                                                              |
    | Time travel               |    ❌   | 지원되지 않습니다.                                                                                                                                                                                                              |
    | Virtual columns           |    ✅   | 실험적 기능입니다. `_path`, `_file`, `_size`, `_time`, `_etag`를 지원합니다. [Virtual columns](/sql-reference/table-functions/paimon#virtual-columns)를 참고하십시오.                                                                        |
    | **Write features**        |        |                                                                                                                                                                                                                         |
    | INSERT / DELETE / UPDATE  |    ❌   | 읽기 전용 연동입니다.                                                                                                                                                                                                            |
    | **Caching**               |        |                                                                                                                                                                                                                         |
    | Data caching              |    ❌   | 지원되지 않습니다.                                                                                                                                                                                                              |
  </TabItem>
</Tabs>

## 카탈로그 지원 \{#catalog-support\}

ClickHouse는 [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) 데이터베이스 엔진을 사용하여 외부 데이터 카탈로그에 연결할 수 있으며, 해당 카탈로그를 ClickHouse 데이터베이스처럼 제공합니다. 카탈로그에 등록된 테이블은 자동으로 나타나며, 표준 SQL로 조회할 수 있습니다.

현재 다음 카탈로그가 지원됩니다. 전체 설정 방법은 각 카탈로그의 참조 가이드를 참고하십시오.

| Catalog | Formats | Read | Create table | INSERT | Reference guide |
|---------|---------|:-:|:-:|:-:|---------|
| [AWS Glue](/use-cases/data-lake/glue-catalog) | Iceberg | ✅ 베타 | ❌ | ❌ | [Glue catalog guide](/use-cases/data-lake/glue-catalog) |
| [Databricks Unity](/use-cases/data-lake/unity-catalog) | Delta, Iceberg | ✅ 실험적 | ❌ | ❌ | [Unity catalog guide](/use-cases/data-lake/unity-catalog) |
| [Iceberg REST](/use-cases/data-lake/rest-catalog) | Iceberg | ✅ 베타 | ❌ | ❌ | [REST catalog guide](/use-cases/data-lake/rest-catalog) |
| [Lakekeeper](/use-cases/data-lake/lakekeeper-catalog) | Iceberg | ✅ 실험적 | ❌ | ❌ | [Lakekeeper catalog guide](/use-cases/data-lake/lakekeeper-catalog) |
| [Project Nessie](/use-cases/data-lake/nessie-catalog) | Iceberg | ✅ 실험적 | ❌ | ❌ | [Nessie catalog guide](/use-cases/data-lake/nessie-catalog) |
| [Microsoft OneLake](/use-cases/data-lake/onelake-catalog) | Iceberg | ✅ 베타 | ❌ | ❌ | [OneLake catalog guide](/use-cases/data-lake/onelake-catalog) |

현재 모든 카탈로그 연동은 실험적 또는 베타 설정을 활성화해야 하며, **읽기 전용** 액세스만 제공합니다. 즉, 테이블을 조회할 수는 있지만 카탈로그 연결을 통해 테이블을 생성하거나 데이터를 쓰는 것은 불가능합니다. 카탈로그에서 ClickHouse로 데이터를 불러와 더 빠른 분석을 수행하려면 [분석 가속화 가이드](/use-cases/data-lake/getting-started/accelerating-analytics)에 설명된 대로 `INSERT INTO SELECT`를 사용하십시오. 오픈 테이블 포맷으로 다시 데이터를 기록하려면 [데이터 쓰기 가이드](/use-cases/data-lake/getting-started/writing-data)에 설명된 대로 독립형 Iceberg 테이블을 생성하십시오.