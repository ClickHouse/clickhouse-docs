---
title: '直接查询开放表格式表'
sidebar_label: '直接查询'
slug: /use-cases/data-lake/getting-started/querying-directly
sidebar_position: 1
pagination_prev: use-cases/data_lake/getting-started/index
pagination_next: use-cases/data_lake/getting-started/connecting-catalogs
description: '使用 ClickHouse 表函数，无需任何预先配置，即可从对象存储中读取 Iceberg、Delta Lake、Hudi 和 Paimon 表。'
toc_max_heading_level: 2
keywords: ['数据湖', '湖仓', 'Iceberg', 'Delta Lake', 'Hudi', 'Paimon', '表函数']
doc_type: '指南'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

ClickHouse 提供表函数，用于直接在对象存储中查询以开放表格式存储的数据。这样无需连接到外部目录——它会就地查询数据，类似于 AWS Athena 从 S3 读取数据的方式。

你可以在函数调用中直接传入存储路径和凭证，其余由 ClickHouse 处理。可以使用全部 ClickHouse SQL 语法和函数，查询还能受益于 ClickHouse 的并行执行以及[高效的原生 Parquet 读取器](/blog/clickhouse-and-parquet-a-foundation-for-fast-lakehouse-analytics)。

:::note Server, local or chDB
本指南中的步骤可以使用现有的 ClickHouse server 安装来执行。对于临时查询，你也可以使用 [clickhouse-local](/operations/utilities/clickhouse-local)，在不运行 server 的情况下完成相同的工作流。经过少量调整后，该流程也可以使用 ClickHouse 的进程内发行版 [chDB](/chdb) 来执行。
:::

下面的示例使用存储在 S3 上、以各个 lakehouse 格式保存的 [hits](/getting-started/example-datasets/star-schema) 数据集。对于每种 lakehouse 格式，在每个对象存储提供商上都提供了专用函数。

<Tabs groupId="lake-format">
  <TabItem value="Iceberg" label="Apache Iceberg" default>
    [`iceberg`](/sql-reference/table-functions/iceberg) 表函数（`icebergS3` 的别名）可直接从对象存储中读取 Iceberg 表。针对每种存储后端均有对应的变体：`icebergS3`、`icebergAzure`、`icebergHDFS` 和 `icebergLocal`。

    **示例语法：**

    ```sql
    icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])

    icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    icebergLocal(path_to_table, [,format] [,compression_method])
    ```

    :::note GCS 支持
    这些函数的 S3 变体可用于 Google Cloud Storage (GCS)。
    :::

    **示例：**

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

    ### 集群模式 \{#iceberg-cluster-variant\}

    [`icebergS3Cluster`](/sql-reference/table-functions/icebergCluster) 函数可将读取操作分布到 ClickHouse 集群中的多个节点上。发起节点与所有节点建立连接，并动态分发数据文件。每个工作节点请求并处理任务，直至所有文件读取完毕。`icebergCluster` 是 `icebergS3Cluster` 的别名。此外，还提供适用于 Azure（[`icebergAzureCluster`](/sql-reference/table-functions/icebergCluster)）和 HDFS（[`icebergHDFSCluster`](/sql-reference/table-functions/icebergCluster)）的变体版本。

    **示例语法：**

    ```sql
    icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
    -- icebergCluster is an alias for icebergS3Cluster

    icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
    ```

    **示例（ClickHouse Cloud）：**

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

    ### 表引擎 \{#iceberg-table-engine\}

    除了在每次查询中使用表函数外，您也可以使用 [`Iceberg` 表引擎](/engines/table-engines/integrations/iceberg) 创建持久化表。数据仍存储在对象存储中，按需读取——不会有任何数据被复制到 ClickHouse 中。其优势在于，表定义存储在 ClickHouse 中，可跨用户和会话共享，无需每个用户单独指定存储路径和凭据。每种存储后端均有对应的引擎变体：`IcebergS3`（或 `Iceberg` 别名）、`IcebergAzure`、`IcebergHDFS` 和 `IcebergLocal`。

    表引擎和表函数均支持[数据缓存](/engines/table-engines/integrations/iceberg#data-cache)，其缓存机制与 S3、AzureBlobStorage 和 HDFS 存储引擎相同。此外，[元数据缓存](/engines/table-engines/integrations/iceberg#metadata-cache)会将清单文件信息存储在内存中，从而减少对 Iceberg 元数据的重复读取。该缓存默认通过 `use_iceberg_metadata_files_cache` 设置启用。

    **示例语法：**

    表引擎 `Iceberg` 是 `IcebergS3` 的别名。

    ```sql
    CREATE TABLE iceberg_table
        ENGINE = IcebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])

    CREATE TABLE iceberg_table
        ENGINE = IcebergAzure(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])

    CREATE TABLE iceberg_table
        ENGINE = IcebergLocal(path_to_table, [,format] [,compression_method])
    ```

    :::note GCS 支持
    表引擎的 S3 变体可用于 Google Cloud Storage (GCS)。
    :::

    **示例：**

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

    有关支持的功能（包括分区裁剪、Schema 演进、时间旅行、缓存等），请参阅[支持矩阵](/use-cases/data-lake/support-matrix#format-support)。如需完整参考，请参阅 [`iceberg` 表函数](/sql-reference/table-functions/iceberg)和 [`Iceberg` 表引擎](/engines/table-engines/integrations/iceberg)文档。
  </TabItem>

  <TabItem value="差异" label="Delta Lake">
    [`deltaLake`](/sql-reference/table-functions/deltalake) 表函数（`deltaLakeS3` 的别名）用于从对象存储中读取 Delta Lake 表。其他后端也有对应的变体：`deltaLakeAzure` 和 `deltaLakeLocal`。

    **示例语法：**

    ```sql
    deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

    deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    deltaLakeLocal(path, [,format])
    ```

    :::note GCS 支持
    这些函数的 S3 变体可用于 Google Cloud Storage (GCS)。
    :::

    **示例：**

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

    ### 集群变体 \{#delta-cluster-variant\}

    [`deltaLakeCluster`](/sql-reference/table-functions/deltalakeCluster) 函数将读取操作分发至 ClickHouse 集群中的多个节点。发起节点动态地将数据文件调度至工作节点以进行并行处理。`deltaLakeS3Cluster` 是 `deltaLakeCluster` 的别名。此外，还提供 Azure 变体（[`deltaLakeAzureCluster`](/sql-reference/table-functions/deltalakeCluster)）。

    **示例语法：**

    ```sql
    deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    -- deltaLakeS3Cluster is an alias for deltaLakeCluster

    deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
    ```

    :::note GCS 支持
    这些函数的 S3 变体可用于 Google Cloud Storage (GCS)。
    :::

    **示例（ClickHouse Cloud）：**

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

    ### 表引擎 \{#delta-table-engine\}

    作为在每次查询中使用表函数的替代方案，如果使用 S3 兼容存储，您可以使用 [`DeltaLake` 表引擎](/engines/table-engines/integrations/deltalake) 创建持久化表。数据仍存储在对象存储中，按需读取——不会有任何数据被复制到 ClickHouse 中。其优势在于，表定义存储在 ClickHouse 中，可在用户和会话之间共享，无需每个用户单独指定存储路径和凭据。

    表引擎和表函数均支持[数据缓存](/engines/table-engines/integrations/deltalake#data-cache)，使用与 S3、AzureBlobStorage 和 HDFS 存储引擎相同的缓存机制。

    **示例语法：**

    ```sql
    CREATE TABLE delta_table
        ENGINE = DeltaLake(url [,aws_access_key_id, aws_secret_access_key])
    ```

    :::note GCS 支持
    此表引擎可用于 Google Cloud Storage (GCS)。
    :::

    **示例：**

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

    有关支持的功能（包括存储后端、缓存等），请参阅[支持矩阵](/use-cases/data-lake/support-matrix#format-support)。如需完整参考，请参阅 [`deltaLake` 表函数](/sql-reference/table-functions/deltalake)和 [`DeltaLake` 表引擎](/engines/table-engines/integrations/deltalake)文档。
  </TabItem>

  <TabItem value="hudi" label="Apache Hudi">
    [`hudi`](/sql-reference/table-functions/hudi) 表函数会从 S3 读取 Hudi 表。

    **语法：**

    ```sql
    hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    ```

    ### 集群变体 \{#hudi-cluster-variant\}

    [`hudiCluster`](/sql-reference/table-functions/hudiCluster) FUNCTION 会将读取请求分发到 ClickHouse 集群中的多个节点。发起节点会将数据文件动态调度到工作节点，以实现并行处理。

    ```sql
    hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    ```

    ### 表引擎 \{#hudi-table-engine\}

    作为在每个查询中使用表函数的替代方案，可以使用 [`Hudi` 表引擎](/engines/table-engines/integrations/hudi) 创建一张持久表。数据依然保存在对象存储中，并按需读取——不会有数据被复制到 ClickHouse 中。其优点在于表定义存储在 ClickHouse 中，可以在不同用户和会话之间共享，而无需每个用户都指定存储路径和凭证。

    **语法：**

    ```sql
    CREATE TABLE hudi_table
        ENGINE = Hudi(url [,aws_access_key_id, aws_secret_access_key])
    ```

    有关受支持的功能（包括存储后端等），请参阅[支持矩阵](/use-cases/data-lake/support-matrix#format-support)。完整参考请参见 [`hudi` 表函数](/sql-reference/table-functions/hudi) 和 [`Hudi` 表引擎](/engines/table-engines/integrations/hudi) 文档。
  </TabItem>

  <TabItem value="paimon" label="Apache Paimon">
    <ExperimentalBadge />

    [`paimon`](/sql-reference/table-functions/paimon) 表函数（`paimonS3` 的别名）用于从对象存储中读取 Paimon 表。针对每种存储后端都有对应的变体：`paimonS3`、`paimonAzure`、`paimonHDFS` 和 `paimonLocal`。

    **语法：**

    ```sql
    paimon(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])
    paimonS3(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

    paimonAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    paimonHDFS(path_to_table, [,format] [,compression_method])

    paimonLocal(path_to_table, [,format] [,compression_method])
    ```

    ### 集群变体 \{#paimon-cluster-variant\}

    [`paimonS3Cluster`](/sql-reference/table-functions/paimonCluster) 函数会在 ClickHouse 集群中的多个节点之间分布式地执行读取操作。发起请求的节点会将数据文件动态分派给工作节点，以便进行并行处理。`paimonCluster` 是 `paimonS3Cluster` 的别名。也提供适用于 Azure（[`paimonAzureCluster`](/sql-reference/table-functions/paimonCluster)）和 HDFS（[`paimonHDFSCluster`](/sql-reference/table-functions/paimonCluster)）的变体。

    ```sql
    paimonS3Cluster(cluster_name, url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])
    -- paimonCluster is an alias for paimonS3Cluster

    paimonAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    paimonHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
    ```

    ### 表引擎 \{#paimon-table-engine\}

    Paimon 目前在 ClickHouse 中没有专用的表引擎。请使用上面的表函数来查询 Paimon 表。

    有关受支持的特性（包括存储后端等），请参阅[支持矩阵](/use-cases/data-lake/support-matrix#format-support)。完整参考请参见 [`paimon` 表函数](/sql-reference/table-functions/paimon) 文档。
  </TabItem>
</Tabs>