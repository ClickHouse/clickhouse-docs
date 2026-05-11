---
description: '该引擎为 Amazon S3、Azure、HDFS 和本地存储中的现有 Apache Paimon
  表提供只读集成。'
sidebar_label: 'Paimon'
sidebar_position: 95
slug: /engines/table-engines/integrations/paimon
title: 'Paimon 表引擎'
doc_type: 'reference'
---

# Paimon 表引擎 \{#paimon-table-engine\}

该引擎可对存储在 Amazon S3、Azure、HDFS 以及本地的现有 Apache [Paimon](https://paimon.apache.org/) 表提供只读访问。
它支持快照读取、增量读取，以及该引擎提供的基本分区剪枝功能。

## 创建表 \{#create-table\}

请注意，Paimon 表必须已存在于存储中；此命令不接受用于创建新表的 DDL 参数。
创建 `Paimon*` 表受 `allow_experimental_paimon_storage_engine` 控制 (默认处于禁用状态) ，因此请先启用该选项，再运行 `CREATE TABLE`。

```sql
SET allow_experimental_paimon_storage_engine = 1;

CREATE TABLE paimon_table_s3
    ENGINE = PaimonS3(url,  [, access_key_id, secret_access_key] [,format] [,structure] [,compression])

CREATE TABLE paimon_table_azure
    ENGINE = PaimonAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

CREATE TABLE paimon_table_hdfs
    ENGINE = PaimonHDFS(path_to_table, [,format] [,compression_method])

CREATE TABLE paimon_table_local
    ENGINE = PaimonLocal(path_to_table, [,format] [,compression_method])
```

## 引擎参数 \{#engine-arguments\}

这些参数的说明分别与 `S3`、`AzureBlobStorage`、`HDFS` 和 `File` 引擎中的参数说明相同。
`format` 表示 Paimon 表中数据文件的格式。

可以使用[命名集合](../../../operations/named-collections.md)来指定引擎参数

### 示例 \{#example\}

```sql
CREATE TABLE paimon_table ENGINE=PaimonS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

使用命名集合：

```xml
<clickhouse>
    <named_collections>
        <paimon_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test</access_key_id>
            <secret_access_key>test</secret_access_key>
        </paimon_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE paimon_table ENGINE=PaimonS3(paimon_conf, filename = 'test_table')
```

## 功能 \{#capabilities\}

* 快照读取基于最新的表快照。
* 启用后，可基于已提交的快照 ID 进行增量读取。
* 启用 `use_paimon_partition_pruning` 时执行分区剪枝。
* 配置后，可选择在后台刷新元数据。
* 使用 Atomic/Replicated 数据库时，表 UUID 会保持稳定，从而可在 Keeper 路径中使用 `{uuid}` 宏。

## 设置 \{#settings\}

该引擎使用与相应对象存储引擎相同的设置，并额外提供了 Paimon 特有的设置：

* `allow_experimental_paimon_storage_engine` — 启用创建 `Paimon`、`PaimonS3`、`PaimonAzure`、`PaimonHDFS` 和 `PaimonLocal` 表引擎。默认值：`0` (禁用) 。
* `paimon_incremental_read` — 启用增量读取模式。
* `paimon_metadata_refresh_interval_sec` — 后台元数据刷新时间间隔 (秒) 。当该值设置为大于 0 时，后台任务会定期从对象存储中拉取最新的快照和 schema。默认值：30。
* `paimon_keeper_path` — 增量读取状态使用的 Keeper 路径。必须设置，且对每个表都唯一；支持 `{database}`、`{table}`、`{uuid}` 等宏。
* `paimon_replica_name` — 增量读取状态使用的副本名称。必须设置，且对每个副本都唯一；支持 `{replica}` 等宏。

## 增量读取示例 \{#incremental-read-examples\}

基于 Keeper 状态的增量读取：

```sql
CREATE TABLE paimon_inc
ENGINE = PaimonS3(paimon_conf, filename = 'paimon_all_types')
SETTINGS
    paimon_incremental_read = 1,
    paimon_keeper_path = '/clickhouse/{database}/{uuid}',
    paimon_replica_name = '{replica}';
```

### 增量读取的查询级设置 \{#query-level-settings-for-incremental-read\}

以下设置均为**查询级**设置 (通过 `SELECT ... SETTINGS` 传递，而不是在 `CREATE TABLE` 中设置) 。它们用于控制增量读取在每次查询中的行为：

* `paimon_target_snapshot_id` — 仅读取指定快照的增量数据。Keeper 中已提交的水位不会推进，因此同一个快照可重复读取任意次数。默认值：`-1` (禁用) 。
* `max_consume_snapshots` — 单次增量读取可消费的最大快照数。当源端累积了许多尚未读取的快照时，该设置会限制每次查询消费的快照数量，以控制批次大小。`0` 表示不限制。默认值：`0`。

**定向快照读取** — 无论当前水位是多少，始终返回快照 1 的增量数据：

```sql
SELECT count()
FROM paimon_inc
SETTINGS paimon_target_snapshot_id = 1;
```

**限制每个批次处理的快照数** — 如果有三个新快照待处理，则每次查询最多处理两个：

```sql
SELECT count()
FROM paimon_inc
SETTINGS max_consume_snapshots = 2;
```

## 通过可刷新materialized view 将 Paimon 同步到 MergeTree \{#paimon-to-mergetree-via-refresh-mv\}

您可以构建一条端到端管道，使用 `APPEND` 模式的可刷新materialized view，持续将 Paimon 表中的数据同步到 MergeTree 表。每次刷新仅从 Paimon 读取新增的增量数据，并将其追加到目标表。

**步骤 1 — 创建启用增量读取和元数据刷新的 Paimon 源表。**

下面的示例使用 `PaimonLocal`。请根据您的存储后端，将引擎替换为 `PaimonS3`、`PaimonAzure`、`PaimonHDFS` 或 `Paimon` 别名：

```sql
SET allow_experimental_paimon_storage_engine = 1;

-- Local storage
CREATE TABLE paimon_mv_source
ENGINE = PaimonLocal('/path/to/paimon/table')
SETTINGS
    paimon_incremental_read = 1,
    paimon_keeper_path = '/clickhouse/tables/{uuid}',
    paimon_replica_name = '{replica}',
    paimon_metadata_refresh_interval_sec = 1;

-- S3 storage (Paimon is an alias for PaimonS3)
CREATE TABLE paimon_mv_source
ENGINE = Paimon('http://minio:9000/bucket/path/to/table', 'access_key', 'secret_key')
SETTINGS
    paimon_incremental_read = 1,
    paimon_keeper_path = '/clickhouse/tables/{uuid}',
    paimon_replica_name = '{replica}',
    paimon_metadata_refresh_interval_sec = 1;
```

`paimon_metadata_refresh_interval_sec` 用于设置后台元数据刷新时间间隔 (以秒为单位) 。当该值大于 0 时，后台任务会定期从对象存储中拉取最新的快照和 schema，这样 MV 刷新周期就能发现新提交的数据，而无需等待由查询触发元数据更新。默认值为 30。在大量表上使用时请谨慎，以避免产生过多的对象存储和 Keeper I/O。

**步骤 2 — 创建 MergeTree 目标表 (schema 克隆自 Paimon 表) ：**

```sql
CREATE TABLE paimon_mv_dest AS paimon_mv_source
ENGINE = MergeTree()
ORDER BY tuple();
```

**步骤 3 — 创建可刷新的 materialized view：**

```sql
CREATE MATERIALIZED VIEW paimon_mv
REFRESH EVERY 10 SECOND
APPEND
TO paimon_mv_dest
AS SELECT * FROM paimon_mv_source;
```

MV 每 10 秒会执行一次 `SELECT * FROM paimon_mv_source`，该查询仅返回自上次已提交快照以来新增的行，并将其追加到 `paimon_mv_dest`。

**清理：**

```sql
SYSTEM STOP VIEW paimon_mv;
DROP VIEW IF EXISTS paimon_mv SYNC;
DROP TABLE IF EXISTS paimon_mv_dest SYNC;
DROP TABLE IF EXISTS paimon_mv_source SYNC;
```

:::note
先停止 MV，再将其删除，以防后台刷新阻塞 DDL 操作。
:::

## 限制 \{#limitations\}

* 增量读取需要先配置 Keeper (ZooKeeper) 。
* 增量读取要求设置 `paimon_keeper_path`，且每个表的该路径必须唯一。
* 在同一 Keeper 路径下，每个副本的 `paimon_replica_name` 都必须唯一。
* 增量读取采用至多一次传递：在实际消费数据之前，收集到数据文件时就会推进已提交的快照。如果查询在收集文件后失败，重试时不会重新读取已跳过的快照。
* 该表引擎为只读，不支持修改数据。
* 增量读取不会处理 Paimon 源中的历史数据删除。如果上游 Paimon 数据被删除或更新，已写入 ClickHouse MergeTree 目标表的对应行不会被自动删除。您必须在 MergeTree 表上手动执行 `ALTER TABLE ... DELETE` 来清理过期数据。

## 别名 \{#aliases\}

现在，表引擎 `Paimon` 是 `PaimonS3` 的别名。

## 虚拟列 \{#virtual-columns\}

* `_path` — 文件路径。类型：`LowCardinality(String)`。
* `_file` — 文件名。类型：`LowCardinality(String)`。
* `_size` — 文件大小 (以字节为单位) 。类型：`Nullable(UInt64)`。如果文件大小未知，则值为 `NULL`。
* `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。
* `_etag` — 文件的 etag。类型：`LowCardinality(String)`。如果 etag 未知，则值为 `NULL`。

## 支持的数据类型 \{#data-types-supported\}

| Paimon 数据类型                       | ClickHouse 数据类型           |
| --------------------------------- | ------------------------- |
| BOOLEAN                           | Int8                      |
| TINYINT                           | Int8                      |
| SMALLINT                          | Int16                     |
| INTEGER                           | Int32                     |
| BIGINT                            | Int64                     |
| FLOAT                             | Float32                   |
| DOUBLE                            | Float64                   |
| STRING,VARCHAR,BYTES,VARBINARY    | String                    |
| DATE                              | Date                      |
| TIME(p),TIME                      | Time(&#39;UTC&#39;)       |
| TIMESTAMP(p) WITH LOCAL TIME ZONE | DateTime64                |
| TIMESTAMP(p)                      | DateTime64(&#39;UTC&#39;) |
| CHAR                              | FixedString(1)            |
| BINARY(n)                         | FixedString(n)            |
| DECIMAL(P,S)                      | Decimal(P,S)              |
| ARRAY                             | Array                     |
| MAP                               | Map                       |

## 支持的分区键 \{#partition-supported\}

Paimon 分区键支持以下数据类型：

* `CHAR`
* `VARCHAR`
* `BOOLEAN`
* `DECIMAL`
* `TINYINT`
* `SMALLINT`
* `INTEGER`
* `DATE`
* `TIME`
* `TIMESTAMP`
* `TIMESTAMP WITH LOCAL TIME ZONE`
* `BIGINT`
* `FLOAT`
* `DOUBLE`