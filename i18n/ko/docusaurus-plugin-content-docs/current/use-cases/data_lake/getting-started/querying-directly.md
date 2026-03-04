---
title: '오픈 테이블 포맷을 직접 쿼리하기'
sidebar_label: '직접 쿼리하기'
slug: /use-cases/data-lake/getting-started/querying-directly
sidebar_position: 1
pagination_prev: use-cases/data_lake/getting-started/index
pagination_next: use-cases/data_lake/getting-started/connecting-catalogs
description: '사전 설정 없이 ClickHouse 테이블 함수를 사용하여 객체 스토리지에 있는 Iceberg, Delta Lake, Hudi, Paimon 테이블을 읽을 수 있습니다.'
toc_max_heading_level: 2
keywords: ['데이터 레이크', 'lakehouse', 'iceberg', 'delta lake', 'hudi', 'paimon', 'table functions']
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

ClickHouse는 객체 스토리지에 저장된 오픈 테이블 포맷 데이터를 직접 쿼리하기 위한 테이블 함수를 제공합니다. 이를 위해 외부 카탈로그에 연결할 필요가 없으며, AWS Athena가 S3에서 직접 데이터를 읽는 것과 유사하게 데이터를 그 위치에서 바로 쿼리합니다.

스토리지 경로와 자격 증명을 함수 호출에 직접 전달하면 나머지는 ClickHouse가 처리합니다. 모든 ClickHouse SQL 구문과 함수를 사용할 수 있으며, 쿼리는 ClickHouse의 병렬 실행과 [효율적인 네이티브 Parquet 리더(reader)](/blog/clickhouse-and-parquet-a-foundation-for-fast-lakehouse-analytics)의 이점을 활용합니다.

:::note 서버, clickhouse-local 또는 chDB
이 가이드의 단계는 기존 ClickHouse 서버 설치 환경에서 실행할 수 있습니다. 수시(ad hoc) 쿼리를 위해서는 [clickhouse-local](/operations/utilities/clickhouse-local)을 대신 사용하여 서버를 실행하지 않고도 동일한 워크플로를 완료할 수 있습니다. 약간의 조정을 통해 ClickHouse의 인프로세스 분산판인 [chDB](/chdb)를 사용해도 동일한 작업을 수행할 수 있습니다.
:::

다음 예제에서는 S3에 각 레이크하우스 포맷으로 저장된 [hits](/getting-started/example-datasets/star-schema) 데이터셋을 사용합니다. 각 레이크하우스 포맷마다, 각 객체 스토리지 프로바이더에 해당하는 전용 함수가 존재합니다.

<Tabs groupId="lake-format">
  <TabItem value="Iceberg" label="Apache Iceberg" default>
    [`iceberg`](/sql-reference/table-functions/iceberg) 테이블 함수(`icebergS3`의 별칭)는 객체 스토리지에서 직접 Iceberg 테이블을 읽어옵니다. 각 스토리지 백엔드별 변형으로 `icebergS3`, `icebergAzure`, `icebergHDFS`, `icebergLocal`이 있습니다.

    **예시 구문:**

    ```sql
    icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])

    icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    icebergLocal(path_to_table, [,format] [,compression_method])
    ```

    :::note GCS 지원
    S3 변형 함수는 Google Cloud Storage (GCS)에도 사용할 수 있습니다.
    :::

    **예시:**

    ```sql
    SELECT
        url,
        count() AS cnt
    FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
    GROUP BY url
    ORDER BY cnt DESC
    LIMIT 5

    ┌─url────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │ -- 3.29 million
    │ http://kinopoisk.ru                                │ 1625250 │ -- 1.63 million
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 3.375 sec. Processed 100.00 million rows, 9.98 GB (29.63 million rows/s., 2.96 GB/s.)
    Peak memory usage: 10.48 GiB.
    ```

    ### 클러스터 구성 방식 \{#iceberg-cluster-variant\}

    [`icebergS3Cluster`](/sql-reference/table-functions/icebergCluster) 함수는 ClickHouse 클러스터의 여러 노드에 읽기를 분산합니다. 이니시에이터 노드는 모든 노드에 연결을 설정하고 데이터 파일을 동적으로 배분합니다. 각 워커 노드는 모든 파일이 읽힐 때까지 작업을 요청하고 처리합니다. `icebergCluster`는 `icebergS3Cluster`의 별칭입니다. Azure([`icebergAzureCluster`](/sql-reference/table-functions/icebergCluster)) 및 HDFS([`icebergHDFSCluster`](/sql-reference/table-functions/icebergCluster))용 변형도 제공됩니다.

    **예제 구문:**

    ```sql
    icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
    -- icebergCluster is an alias for icebergS3Cluster

    icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
    ```

    **예시 (ClickHouse Cloud):**

    ```sql
    SELECT
        url,
        count() AS cnt
    FROM icebergS3Cluster(
        'default',
        'https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/'
    )
    GROUP BY url
    ORDER BY cnt DESC
    LIMIT 5
    ```

    ### 테이블 엔진 \{#iceberg-table-engine\}

    모든 쿼리마다 테이블 함수를 사용하는 대신, [`Iceberg` 테이블 엔진](/engines/table-engines/integrations/iceberg)을 사용하여 영구 테이블을 생성할 수 있습니다. 데이터는 여전히 객체 스토리지에 저장되며 필요 시에만 읽어오므로 ClickHouse로 데이터가 복사되지 않습니다. 테이블 정의가 ClickHouse에 저장되기 때문에, 각 사용자가 스토리지 경로와 자격 증명을 별도로 지정하지 않아도 여러 사용자와 세션 간에 공유할 수 있다는 장점이 있습니다. 각 스토리지 백엔드별로 엔진 변형이 제공됩니다: `IcebergS3`(또는 `Iceberg` 별칭), `IcebergAzure`, `IcebergHDFS`, `IcebergLocal`.

    테이블 엔진과 테이블 함수 모두 S3, AzureBlobStorage, HDFS 스토리지 엔진과 동일한 캐싱 메커니즘을 사용하는 [데이터 캐싱](/engines/table-engines/integrations/iceberg#data-cache)을 지원합니다. 또한 [메타데이터 캐시](/engines/table-engines/integrations/iceberg#metadata-cache)는 매니페스트 파일 정보를 메모리에 저장하여 Iceberg 메타데이터의 반복 읽기를 줄입니다. 이 캐시는 `use_iceberg_metadata_files_cache` 설정을 통해 기본적으로 활성화됩니다.

    **예제 구문:**

    테이블 엔진 `Iceberg`는 `IcebergS3`의 별칭입니다.

    ```sql
    CREATE TABLE iceberg_table
        ENGINE = IcebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])

    CREATE TABLE iceberg_table
        ENGINE = IcebergAzure(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])

    CREATE TABLE iceberg_table
        ENGINE = IcebergLocal(path_to_table, [,format] [,compression_method])
    ```

    :::note GCS 지원
    테이블 엔진의 S3 변형을 Google Cloud Storage (GCS)에 사용할 수 있습니다.
    :::

    **예시:**

    ```sql
    CREATE TABLE hits_iceberg
        ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')

    SELECT
        url,
        count() AS cnt
    FROM hits_iceberg
    GROUP BY url
    ORDER BY cnt DESC
    LIMIT 5

    ┌─url────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │
    │ http://kinopoisk.ru                                │ 1625250 │
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 2.737 sec. Processed 100.00 million rows, 9.98 GB (36.53 million rows/s., 3.64 GB/s.)
    Peak memory usage: 10.53 GiB.
    ```

    파티션 프루닝(partition pruning), 스키마 진화(schema evolution), 타임 트래블(time travel), 캐싱(caching) 등 지원되는 기능에 대한 자세한 내용은 [지원 매트릭스](/use-cases/data-lake/support-matrix#format-support)를 참조하십시오. 전체 참조 문서는 [`iceberg` 테이블 함수](/sql-reference/table-functions/iceberg) 및 [`Iceberg` 테이블 엔진](/engines/table-engines/integrations/iceberg) 문서를 참조하십시오.
  </TabItem>

  <TabItem value="델타" label="Delta Lake">
    [`deltaLake`](/sql-reference/table-functions/deltalake) 테이블 함수(`deltaLakeS3`의 별칭)는 객체 스토리지에서 Delta Lake 테이블을 읽어옵니다. 다른 백엔드를 위한 변형으로 `deltaLakeAzure` 및 `deltaLakeLocal`도 있습니다.

    **예제 구문:**

    ```sql
    deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

    deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    deltaLakeLocal(path, [,format])
    ```

    :::note GCS 지원
    S3 변형 함수는 Google Cloud Storage(GCS)에도 사용할 수 있습니다.
    :::

    **예시:**

    ```sql
    SELECT
        URL,
        count() AS cnt
    FROM deltaLake('https://datasets-documentation.s3.amazonaws.com/lake_formats/delta_lake/')
    GROUP BY URL
    ORDER BY cnt DESC
    LIMIT 5

    ┌─URL────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │ -- 3.29 million
    │ http://kinopoisk.ru                                │ 1625250 │ -- 1.63 million
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 3.878 sec. Processed 100.00 million rows, 14.82 GB (25.78 million rows/s., 3.82 GB/s.)
    Peak memory usage: 9.16 GiB.
    ```

    ### 클러스터 구성 방식 \{#delta-cluster-variant\}

    [`deltaLakeCluster`](/sql-reference/table-functions/deltalakeCluster) 함수는 ClickHouse 클러스터의 여러 노드에 읽기를 분산합니다. 이니시에이터 노드는 병렬 처리를 위해 데이터 파일을 워커 노드에 동적으로 배분합니다. `deltaLakeS3Cluster`는 `deltaLakeCluster`의 별칭입니다. Azure 변형([`deltaLakeAzureCluster`](/sql-reference/table-functions/deltalakeCluster))도 사용할 수 있습니다.

    **예제 구문:**

    ```sql
    deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    -- deltaLakeS3Cluster is an alias for deltaLakeCluster

    deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
    ```

    :::note GCS 지원
    S3 변형 함수는 Google Cloud Storage(GCS)에도 사용할 수 있습니다.
    :::

    **예시 (ClickHouse Cloud):**

    ```sql
    SELECT
        URL,
        count() AS cnt
    FROM deltaLakeCluster(
        'default',
        'https://datasets-documentation.s3.amazonaws.com/lake_formats/delta_lake/'
    )
    GROUP BY URL
    ORDER BY cnt DESC
    LIMIT 5
    ```

    ### 테이블 엔진 \{#delta-table-engine\}

    모든 쿼리에서 테이블 함수를 사용하는 대신, S3 호환 스토리지를 사용하는 경우 [`DeltaLake` 테이블 엔진](/engines/table-engines/integrations/deltalake)을 사용하여 영구 테이블을 생성할 수 있습니다. 데이터는 여전히 객체 스토리지에 저장되며 필요 시 읽어오므로 ClickHouse로 데이터가 복사되지 않습니다. 테이블 정의가 ClickHouse에 저장되어 사용자와 세션 간에 공유할 수 있으므로, 각 사용자가 스토리지 경로와 자격 증명을 별도로 지정할 필요가 없다는 장점이 있습니다.

    테이블 엔진과 테이블 함수 모두 S3, AzureBlobStorage, HDFS 스토리지 엔진과 동일한 캐싱 메커니즘을 사용하여 [데이터 캐싱](/engines/table-engines/integrations/deltalake#data-cache)을 지원합니다.

    **예제 구문:**

    ```sql
    CREATE TABLE delta_table
        ENGINE = DeltaLake(url [,aws_access_key_id, aws_secret_access_key])
    ```

    :::note GCS 지원
    이 테이블 엔진은 Google Cloud Storage(GCS)에 사용할 수 있습니다.
    :::

    **예시:**

    ```sql
    CREATE TABLE hits_delta
        ENGINE = DeltaLake('https://datasets-documentation.s3.amazonaws.com/lake_formats/delta_lake/')

    SELECT
        URL,
        count() AS cnt
    FROM hits_delta
    GROUP BY URL
    ORDER BY cnt DESC
    LIMIT 5

    ┌─URL────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │
    │ http://kinopoisk.ru                                │ 1625250 │
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 3.608 sec. Processed 100.00 million rows, 14.82 GB (27.72 million rows/s., 4.11 GB/s.)
    Peak memory usage: 9.27 GiB.
    ```

    스토리지 백엔드, 캐싱 등 지원되는 기능에 대한 자세한 내용은 [지원 매트릭스](/use-cases/data-lake/support-matrix#format-support)를 참조하십시오. 전체 참조 문서는 [`deltaLake` 테이블 함수](/sql-reference/table-functions/deltalake) 및 [`DeltaLake` 테이블 엔진](/engines/table-engines/integrations/deltalake) 문서를 확인하십시오.
  </TabItem>

  <TabItem value="hudi" label="Apache Hudi">
    [`hudi`](/sql-reference/table-functions/hudi) 테이블 함수는 S3에 저장된 Hudi 테이블을 읽습니다.

    **구문:**

    ```sql
    hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    ```

    ### 클러스터 변형 \{#hudi-cluster-variant\}

    [`hudiCluster`](/sql-reference/table-functions/hudiCluster) 함수는 ClickHouse 클러스터의 여러 노드에 읽기 작업을 분산합니다. 이니시에이터 노드는 병렬 처리를 위해 데이터 파일을 워커 노드에 동적으로 전달합니다.

    ```sql
    hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    ```

    ### 테이블 엔진 \{#hudi-table-engine\}

    모든 쿼리에서 테이블 함수를 사용하는 대신, [`Hudi` 테이블 엔진](/engines/table-engines/integrations/hudi)을 사용하여 영구 테이블을 생성할 수 있습니다. 데이터는 여전히 객체 스토리지에 존재하며, 요청 시에만 읽히고 ClickHouse로 복사되지는 않습니다. 이 방식의 장점은 테이블 정의가 ClickHouse에 저장되어, 각 사용자가 스토리지 경로와 인증 정보를 매번 지정하지 않아도 사용자와 세션 간에 공유될 수 있다는 점입니다.

    **구문:**

    ```sql
    CREATE TABLE hudi_table
        ENGINE = Hudi(url [,aws_access_key_id, aws_secret_access_key])
    ```

    스토리지 백엔드 등을 포함한 지원 기능 목록은 [support matrix](/use-cases/data-lake/support-matrix#format-support)를 참조하십시오. 전체 내용은 [`hudi` 테이블 함수](/sql-reference/table-functions/hudi) 및 [`Hudi` 테이블 엔진](/engines/table-engines/integrations/hudi) 문서를 참고하십시오.
  </TabItem>

  <TabItem value="paimon" label="Apache Paimon">
    <ExperimentalBadge />

    [`paimon`](/sql-reference/table-functions/paimon) 테이블 함수(`paimonS3`의 별칭)는 객체 스토리지에서 Paimon 테이블을 읽기 위해 사용됩니다. 각 스토리지 백엔드에 대해 `paimonS3`, `paimonAzure`, `paimonHDFS`, `paimonLocal`과 같은 변형이 있습니다.

    **구문:**

    ```sql
    paimon(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])
    paimonS3(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

    paimonAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    paimonHDFS(path_to_table, [,format] [,compression_method])

    paimonLocal(path_to_table, [,format] [,compression_method])
    ```

    ### 클러스터 변형 \{#paimon-cluster-variant\}

    [`paimonS3Cluster`](/sql-reference/table-functions/paimonCluster) 함수는 ClickHouse 클러스터의 여러 노드에 걸쳐 읽기를 분산합니다. 이니시에이터 노드는 병렬 처리를 위해 데이터 파일을 워커 노드에 동적으로 분배합니다. `paimonCluster`는 `paimonS3Cluster`의 별칭입니다. Azure용([`paimonAzureCluster`](/sql-reference/table-functions/paimonCluster)) 및 HDFS용([`paimonHDFSCluster`](/sql-reference/table-functions/paimonCluster)) 변형도 제공됩니다.

    ```sql
    paimonS3Cluster(cluster_name, url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])
    -- paimonCluster is an alias for paimonS3Cluster

    paimonAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    paimonHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
    ```

    ### 테이블 엔진 \{#paimon-table-engine\}

    Paimon은 현재 ClickHouse에 전용 테이블 엔진을 제공하지 않습니다. Paimon 테이블을 쿼리하려면 위의 table function을 사용하십시오.

    스토리지 백엔드 등 지원되는 기능은 [지원 매트릭스](/use-cases/data-lake/support-matrix#format-support)를 참조하십시오. 자세한 내용은 [`paimon` table function](/sql-reference/table-functions/paimon) 문서를 확인하십시오.
  </TabItem>
</Tabs>