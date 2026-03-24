---
title: '支持矩阵'
sidebar_label: '支持矩阵'
slug: /use-cases/data-lake/support-matrix
sidebar_position: 3
pagination_prev: null
pagination_next: null
description: 'ClickHouse 开放表格式集成与数据目录连接的全面支持矩阵。'
keywords: ['data lake', 'lakehouse', 'support', 'iceberg', 'delta lake', 'hudi', 'paimon', 'catalog', 'features']
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

本页提供 ClickHouse 数据湖集成的全面支持矩阵。内容涵盖各开放表格式可用的功能、ClickHouse 可连接的目录，以及每个目录所支持的能力。

## 开放表格式支持 \{#format-support\}

ClickHouse 集成支持四种开放表格式：[Apache Iceberg](/engines/table-engines/integrations/iceberg)、[Delta Lake](/engines/table-engines/integrations/deltalake)、[Apache Hudi](/engines/table-engines/integrations/hudi) 和 [Apache Paimon](/sql-reference/table-functions/paimon)。在下方选择一种格式以查看对应的支持矩阵。

**图例：** ✅ 已支持 | ⚠️ 部分支持 / 实验性 | ❌ 不支持

<Tabs groupId="format-matrix">
  <TabItem value="iceberg" label="Apache Iceberg" default>
    | 功能                      |  状态 | 说明                                                                                                                                                                                                                                     |
    | ----------------------- | :-: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **存储后端**                |     |                                                                                                                                                                                                                                        |
    | AWS S3                  |  ✅  | 通过 [`icebergS3()`](/sql-reference/table-functions/iceberg) 或其 `iceberg()` 别名                                                                                                                                                           |
    | GCS                     |  ✅  | 通过 [`icebergS3()`](/sql-reference/table-functions/iceberg) 函数或 `iceberg()` 函数别名                                                                                                                                                        |
    | Azure Blob Storage      |  ✅  | 通过 [`icebergAzure()`](/sql-reference/table-functions/iceberg)                                                                                                                                                                          |
    | HDFS                    |  ⚠️ | 通过 [`icebergHDFS()`](/sql-reference/table-functions/iceberg)。已弃用。                                                                                                                                                                      |
    | 本地文件系统                  |  ✅  | 通过 [`icebergLocal()`](/sql-reference/table-functions/iceberg)                                                                                                                                                                          |
    | **访问方式**                |     |                                                                                                                                                                                                                                        |
    | 表函数                     |  ✅  | [`icebergS3()`](/sql-reference/table-functions/iceberg) 并针对不同后端提供变体                                                                                                                                                                    |
    | 表引擎                     |  ✅  | [`IcebergS3`](/engines/table-engines/integrations/iceberg)，针对不同后端提供变体                                                                                                                                                                  |
    | 集群分布式读取                 |  ✅  | [`icebergS3Cluster`](/sql-reference/table-functions/icebergCluster), [`icebergAzureCluster`](/sql-reference/table-functions/icebergCluster), [`icebergHDFSCluster`](/sql-reference/table-functions/icebergCluster)                     |
    | 命名集合                    |  ✅  | [定义命名集合](/sql-reference/table-functions/iceberg#defining-a-named-collection)                                                                                                                                                           |
    |                         |     |                                                                                                                                                                                                                                        |
    | **读取功能**                |     |                                                                                                                                                                                                                                        |
    | 读操作支持                   |  ✅  | 对所有 ClickHouse SQL 函数的 SELECT 查询提供完整支持                                                                                                                                                                                                 |
    | 分区剪枝                    |  ✅  | 参见[分区裁剪](/engines/table-engines/integrations/iceberg#partition-pruning)。                                                                                                                                                               |
    | 隐藏式分区                   |  ✅  | 支持基于 Iceberg transform 的分区方案                                                                                                                                                                                                           |
    | 分区演进                    |  ✅  | 支持读取分区规范随时间演变的表                                                                                                                                                                                                                        |
    | 模式演进                    |  ✅  | 列的添加、删除和重新排序。请参阅[架构演进](/engines/table-engines/integrations/iceberg#schema-evolution)。                                                                                                                                                  |
    | 类型提升/扩展                 |  ✅  | `int` → `long`、`float` → `double`、`decimal(P,S)` → `decimal(P',S)`，其中 P&#39; &gt; P。参见[模式演进](/engines/table-engines/integrations/iceberg#schema-evolution)。                                                                            |
    | 时间旅行/快照                 |  ✅  | 通过 `iceberg_timestamp_ms` 或 `iceberg_snapshot_id` 配置实现。参见[时间回溯](/engines/table-engines/integrations/iceberg#time-travel)。                                                                                                              |
    | 基于位置的删除                 |  ✅  | 请参阅[处理已删除行](/engines/table-engines/integrations/iceberg#deleted-rows)。                                                                                                                                                                 |
    | 等值删除                    |  ✅  | 仅支持表引擎，自 v25.8+ 起。参见 [Processing deleted rows](/engines/table-engines/integrations/iceberg#deleted-rows)。                                                                                                                              |
    | 读时合并                    |  ⚠️ | 实验性功能。支持[删除操作](/sql-reference/table-functions/iceberg#iceberg-writes-delete)。                                                                                                                                                          |
    | 格式版本                    |  ⚠️ | 支持 v1 和 v2，不支持 v3。                                                                                                                                                                                                                     |
    | 列统计信息                   |  ✅  |                                                                                                                                                                                                                                        |
    | Bloom 过滤器 / Puffin 文件   |  ❌  | 不支持 Puffin 文件中的 Bloom 过滤器索引                                                                                                                                                                                                            |
    | 虚拟列                     |  ✅  | `_path`, `_file`, `_size`, `_time`, `_etag`。参见[虚拟列](/sql-reference/table-functions/iceberg#virtual-columns)。                                                                                                                           |
    |                         |     |                                                                                                                                                                                                                                        |
    | **写入功能**                |     |                                                                                                                                                                                                                                        |
    | 创建表                     |  ✅  | 实验特性。需将 `allow_insert_into_iceberg` 设为 1。自 v25.7+ 起提供。参见[创建表](/sql-reference/table-functions/iceberg#create-iceberg-table)。                                                                                                            |
    | INSERT                  |  ✅  | 自 26.2 版本起为 Beta。需要 `allow_insert_into_iceberg = 1`。参见[插入数据](/sql-reference/table-functions/iceberg#writes-inserts)。                                                                                                                   |
    | DELETE                  |  ✅  | 实验性功能。需要 `allow_insert_into_iceberg = 1`。通过 `ALTER TABLE ... DELETE WHERE` 实现。参见[删除数据](/sql-reference/table-functions/iceberg#iceberg-writes-delete)。                                                                                  |
    | ALTER TABLE (Schema 变更) |  ✅  | 实验性功能。需要 `allow_insert_into_iceberg = 1`。支持添加、删除、修改和重命名列。参见[模式演进](/sql-reference/table-functions/iceberg#iceberg-writes-schema-evolution)。                                                                                             |
    | 压缩                      |  ⚠️ | 实验性功能。需要将 `allow_experimental_iceberg_compaction` 设置为 1。将 position delete 文件合并到数据文件中。参见 [Compaction](/sql-reference/table-functions/iceberg#iceberg-writes-compaction)。不支持其他 Iceberg 压缩操作。                                             |
    | UPDATE / MERGE          |  ❌  | 不支持，请参阅“压缩”。                                                                                                                                                                                                                           |
    | 写时复制                    |  ❌  | 不支持                                                                                                                                                                                                                                    |
    | 快照过期处理                  |  ❌  | 不支持                                                                                                                                                                                                                                    |
    | 删除孤立文件                  |  ❌  | 不支持                                                                                                                                                                                                                                    |
    | 写入分区                    |  ✅  | 已支持。                                                                                                                                                                                                                                   |
    | 修改分区方案                  |  ❌  | ClickHouse 不支持更改分区方案。ClickHouse 可以向分区方案已演进的 Iceberg 表写入数据。                                                                                                                                                                             |
    |                         |     |                                                                                                                                                                                                                                        |
    | **元数据**                 |     |                                                                                                                                                                                                                                        |
    | 分支和标签                   |  ❌  | 不支持 Iceberg 分支和标签引用。                                                                                                                                                                                                                   |
    | 元数据文件解析                 |  ✅  | 通过 catalogs、简单目录列举、使用 &#39;version-hint&#39; 以及特定路径来进行元数据解析。可通过 `iceberg_metadata_file_path` 和 `iceberg_metadata_table_uuid` 进行配置。参见 [Metadata file resolution](/engines/table-engines/integrations/iceberg#metadata-file-resolution)。 |
    | 数据缓存                    |  ✅  | 与 S3/Azure/HDFS 存储引擎采用相同机制。参见[数据缓存](/engines/table-engines/integrations/iceberg#data-cache)。                                                                                                                                           |
    | 元数据缓存                   |  ✅  | 清单文件和元数据文件缓存在内存中。默认情况下通过 `use_iceberg_metadata_files_cache` 启用。参见[元数据缓存](/engines/table-engines/integrations/iceberg#metadata-cache)。                                                                                                  |
  </TabItem>

  <TabItem value="delta" label="Delta Lake">
    从 25.6 版本开始，ClickHouse 使用 Delta Lake Rust 内核读取 Delta Lake 表，从而提供更广泛的功能支持；但是，在访问 Azure Blob Storage 中的数据时会出现已知问题。出于这个原因，在读取 Azure Blob Storage 上的数据时会禁用该内核。下面我们说明哪些特性需要该内核。

    | Feature                   | Status | Notes                                                                                                                                            |
    | ------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------ |
    | **Storage backends**      |        |                                                                                                                                                  |
    | AWS S3                    |    ✅   | 通过 [`deltaLake()`](/sql-reference/table-functions/deltalake) 或 `deltaLakeS3()`                                                                   |
    | GCS                       |    ✅   | 通过 [`deltaLake()`](/sql-reference/table-functions/deltalake) 或 `deltaLakeS3()`                                                                   |
    | Azure Blob Storage        |    ✅   | 通过 [`deltaLakeAzure()`](/sql-reference/table-functions/deltalake)                                                                                |
    | HDFS                      |    ❌   | 不支持                                                                                                                                              |
    | Local filesystem          |    ✅   | 通过 [`deltaLakeLocal()`](/sql-reference/table-functions/deltalake)                                                                                |
    | **Access methods**        |        |                                                                                                                                                  |
    | Table function            |    ✅   | 使用 [`deltaLake()`](/sql-reference/table-functions/deltalake)，针对不同后端有不同变体                                                                         |
    | Table engine              |    ✅   | [`DeltaLake`](/engines/table-engines/integrations/deltalake)                                                                                     |
    | Cluster-distributed reads |    ✅   | [`deltaLakeCluster`](/sql-reference/table-functions/deltalakeCluster)、[`deltaLakeAzureCluster`](/sql-reference/table-functions/deltalakeCluster) |
    | Named collections         |    ✅   | [Named collection](/sql-reference/table-functions/deltalake#arguments)                                                                           |
    | **Read features**         |        |                                                                                                                                                  |
    | Read support              |    ✅   | 对所有 ClickHouse SQL 函数的 SELECT 查询提供完整支持                                                                                                           |
    | Partition pruning         |    ✅   | 需要 Delta 内核。                                                                                                                                     |
    | Schema evolution          |    ✅   | 需要 Delta 内核。                                                                                                                                     |
    | Time travel               |    ✅   | 需要 Delta 内核。                                                                                                                                     |
    | Deletion vectors          |    ✅   |                                                                                                                                                  |
    | Column mapping            |    ✅   |                                                                                                                                                  |
    | Change data feed          |    ✅   | 需要 Delta 内核。                                                                                                                                     |
    | Virtual columns           |    ✅   | `_path`、`_file`、`_size`、`_time`、`_etag`。参见 [Virtual columns](/sql-reference/table-functions/deltalake#virtual-columns)。                          |
    | **Write features**        |        |                                                                                                                                                  |
    | INSERT                    |    ✅   | 实验性特性。需要将 `allow_experimental_delta_lake_writes` 设置为 `1`。参见 [DeltaLake engine](/engines/table-engines/integrations/deltalake)。需要 Delta 内核。       |
    | DELETE / UPDATE / MERGE   |    ❌   | 不支持                                                                                                                                              |
    | CREATE empty table        |    ❌   | 不支持创建新的空 Delta Lake 表。`CREATE TABLE` 操作假定对象存储中已存在 Delta Lake。                                                                                    |
    | **Caching**               |        |                                                                                                                                                  |
    | Data caching              |    ✅   | 采用与 S3/Azure/HDFS 存储引擎相同的机制。参见 [Data cache](/engines/table-engines/integrations/deltalake#data-cache)。                                           |
  </TabItem>

  <TabItem value="hudi" label="Apache Hudi">
    | 功能                       |  状态 | 备注                                                                                                    |
    | ------------------------ | :-: | ----------------------------------------------------------------------------------------------------- |
    | **存储后端**                 |     |                                                                                                       |
    | AWS S3                   |  ✅  | 通过 [`hudi()`](/sql-reference/table-functions/hudi)                                                    |
    | GCS                      |  ✅  | 通过 [`hudi()`](/sql-reference/table-functions/hudi)                                                    |
    | Azure Blob Storage       |  ❌  | 不支持                                                                                                   |
    | HDFS                     |  ❌  | 不支持                                                                                                   |
    | 本地文件系统                   |  ❌  | 不支持                                                                                                   |
    | **访问方式**                 |     |                                                                                                       |
    | 表函数                      |  ✅  | [`hudi()`](/sql-reference/table-functions/hudi)                                                       |
    | 表引擎                      |  ✅  | [`Hudi`](/engines/table-engines/integrations/hudi)                                                    |
    | 集群分布式读取                  |  ✅  | [`hudiCluster`](/sql-reference/table-functions/hudiCluster) (仅限 S3)                                   |
    | 命名集合                     |  ✅  | [Hudi 参数](/sql-reference/table-functions/hudi#arguments)                                              |
    | **读取特性**                 |     |                                                                                                       |
    | 读取支持                     |  ✅  | 支持完整的 SELECT，兼容所有 ClickHouse SQL 函数                                                                   |
    | Schema 演化                |  ❌  | 不支持                                                                                                   |
    | 时间旅行 (Time travel)       |  ❌  | 不支持                                                                                                   |
    | 虚拟列                      |  ✅  | `_path`、`_file`、`_size`、`_time`、`_etag`。参见[虚拟列](/sql-reference/table-functions/hudi#virtual-columns)。 |
    | **写入特性**                 |     |                                                                                                       |
    | INSERT / DELETE / UPDATE |  ❌  | 只读集成                                                                                                  |
    | **缓存**                   |     |                                                                                                       |
    | 数据缓存                     |  ❌  | 不支持                                                                                                   |
  </TabItem>

  <TabItem value="paimon" label="Apache Paimon">
    | 功能                       |  状态 | 备注                                                                                                                                                                                                             |
    | ------------------------ | :-: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **存储后端**                 |     |                                                                                                                                                                                                                |
    | S3                       |  ✅  | 实验性。通过 [`paimon()`](/sql-reference/table-functions/paimon) 或 `paimonS3()`                                                                                                                                      |
    | GCS                      |  ✅  | 实验性。通过 [`paimon()`](/sql-reference/table-functions/paimon) 或 `paimonS3()`                                                                                                                                      |
    | Azure Blob Storage       |  ✅  | 实验性。通过 [`paimonAzure()`](/sql-reference/table-functions/paimon)                                                                                                                                                |
    | HDFS                     |  ⚠️ | 实验性。通过 [`paimonHDFS()`](/sql-reference/table-functions/paimon)。已弃用。                                                                                                                                            |
    | 本地文件系统                   |  ✅  | 实验性。通过 [`paimonLocal()`](/sql-reference/table-functions/paimon)                                                                                                                                                |
    | **访问方法**                 |     |                                                                                                                                                                                                                |
    | 表函数                      |  ✅  | 实验性。使用 [`paimon()`](/sql-reference/table-functions/paimon)，并根据不同后端提供变体                                                                                                                                         |
    | 表引擎                      |  ❌  | 无专用表引擎                                                                                                                                                                                                         |
    | 集群分布式读取                  |  ✅  | 实验性。[`paimonS3Cluster`](/sql-reference/table-functions/paimonCluster)、[`paimonAzureCluster`](/sql-reference/table-functions/paimonCluster)、[`paimonHDFSCluster`](/sql-reference/table-functions/paimonCluster) |
    | 命名集合                     |  ✅  | 实验性。[定义命名集合](/sql-reference/table-functions/paimon#defining-a-named-collection)                                                                                                                                |
    | **读取特性**                 |     |                                                                                                                                                                                                                |
    | 读取能力                     |  ✅  | 实验性。对所有 ClickHouse SQL 函数的 SELECT 提供完整支持                                                                                                                                                                       |
    | 模式演进                     |  ❌  | 不支持                                                                                                                                                                                                            |
    | 时间回溯                     |  ❌  | 不支持                                                                                                                                                                                                            |
    | 虚拟列                      |  ✅  | 实验性。`_path`、`_file`、`_size`、`_time`、`_etag`。参见 [虚拟列](/sql-reference/table-functions/paimon#virtual-columns)。                                                                                                   |
    | **写入特性**                 |     |                                                                                                                                                                                                                |
    | INSERT / DELETE / UPDATE |  ❌  | 仅支持只读集成                                                                                                                                                                                                        |
    | **缓存**                   |     |                                                                                                                                                                                                                |
    | 数据缓存                     |  ❌  | 不支持                                                                                                                                                                                                            |
  </TabItem>
</Tabs>

## 目录支持 \{#catalog-support\}

ClickHouse 可以使用 [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) 数据库引擎连接到外部数据目录，该引擎会将目录暴露为一个 ClickHouse 数据库。目录中注册的表会自动出现，并且可以使用标准 SQL 进行查询。

当前支持以下目录。完整的配置说明请参阅各目录的参考指南。

| Catalog | Formats | Read | Create table | INSERT | Reference guide |
|---------|---------|:-:|:-:|:-:|---------|
| [AWS Glue](/use-cases/data-lake/glue-catalog) | Iceberg | ✅ Beta | ❌ | ❌ | [Glue 目录指南](/use-cases/data-lake/glue-catalog) |
| [Databricks Unity](/use-cases/data-lake/unity-catalog) | Delta, Iceberg | ✅ Experimental | ❌ | ❌ | [Unity 目录指南](/use-cases/data-lake/unity-catalog) |
| [Iceberg REST](/use-cases/data-lake/rest-catalog) | Iceberg | ✅ Beta | ❌ | ❌ | [REST 目录指南](/use-cases/data-lake/rest-catalog) |
| [Lakekeeper](/use-cases/data-lake/lakekeeper-catalog) | Iceberg | ✅ Experimental | ❌ | ❌ | [Lakekeeper 目录指南](/use-cases/data-lake/lakekeeper-catalog) |
| [Project Nessie](/use-cases/data-lake/nessie-catalog) | Iceberg | ✅ Experimental | ❌ | ❌ | [Nessie 目录指南](/use-cases/data-lake/nessie-catalog) |
| [Microsoft OneLake](/use-cases/data-lake/onelake-catalog) | Iceberg | ✅ Beta | ❌ | ❌ | [OneLake 目录指南](/use-cases/data-lake/onelake-catalog) |

目前所有目录集成都需要启用实验性或 Beta 设置，并且仅提供**只读**访问——可以通过目录连接查询表，但不能创建或写入。要从目录中将数据加载到 ClickHouse 中以加速分析，请使用 `INSERT INTO SELECT`，具体说明参见[加速分析指南](/use-cases/data-lake/getting-started/accelerating-analytics)。要将数据写回开放表格式，请按照[写入数据指南](/use-cases/data-lake/getting-started/writing-data)中的说明创建独立的 Iceberg 表。