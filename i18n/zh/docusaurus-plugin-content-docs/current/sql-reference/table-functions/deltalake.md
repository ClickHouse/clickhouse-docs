---
description: '为存储在 Amazon S3 中的 Delta Lake 表提供类表的只读访问接口。'
sidebar_label: 'deltaLake'
sidebar_position: 45
slug: /sql-reference/table-functions/deltalake
title: 'deltaLake'
doc_type: 'reference'
---

# deltaLake 表函数 \{#deltalake-table-function\}

为存放在 Amazon S3、Azure Blob Storage 或本地挂载文件系统中的 [Delta Lake](https://github.com/delta-io/delta) 表提供类表访问接口，支持读写操作（自 v25.10 起）。

## 语法 \{#syntax\}

`deltaLake` 是 `deltaLakeS3` 的别名，为了兼容性而保留。

```sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

deltaLakeLocal(path, [,format])
```


## 参数 \{#arguments\}

此表函数的参数分别与表函数 `s3`、`azureBlobStorage`、`HDFS` 和 `file` 的参数相同。
`format` 表示 Delta Lake 表中数据文件的格式。

## 返回值 \{#returned_value\}

返回一个具有指定结构的表，用于从指定的 Delta Lake 表中读取或写入数据。

## 示例 \{#examples\}

### 读取数据 \{#reading-data\}

假设有一张存储在 S3 中的表，位于 `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/`。
要在 ClickHouse 中从该表读取数据，请运行：

```sql title="Query"
SELECT
    URL,
    UserAgent
FROM deltaLake('https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/')
WHERE URL IS NOT NULL
LIMIT 2
```

```response title="Response"
┌─URL───────────────────────────────────────────────────────────────────┬─UserAgent─┐
│ http://auto.ria.ua/search/index.kz/jobinmoscow/detail/55089/hasimages │         1 │
│ http://auto.ria.ua/search/index.kz/jobinmoscow.ru/gosushi             │         1 │
└───────────────────────────────────────────────────────────────────────┴───────────┘
```


### 插入数据 \{#inserting-data\}

考虑一个存储在 S3 中、路径为 `s3://ch-docs-s3-bucket/people_10k/` 的表。
要向该表插入数据，首先启用实验性功能：

```sql
SET allow_experimental_delta_lake_writes=1
```

然后输入：

```sql title="Query"
INSERT INTO TABLE FUNCTION deltaLake('s3://ch-docs-s3-bucket/people_10k/', '<access_key>', '<secret>') VALUES (10001, 'John', 'Smith', 'Male', 30)
```

```response title="Response"
Query id: 09069b47-89fa-4660-9e42-3d8b1dde9b17

Ok.

1 row in set. Elapsed: 3.426 sec.
```

您可以通过再次查询该表来确认插入是否成功：

```sql title="Query"
SELECT *
FROM deltaLake('s3://ch-docs-s3-bucket/people_10k/', '<access_key>', '<secret>')
WHERE (firstname = 'John') AND (lastname = 'Smith')
```

```response title="Response"
Query id: 65032944-bed6-4d45-86b3-a71205a2b659

   ┌────id─┬─firstname─┬─lastname─┬─gender─┬─age─┐
1. │ 10001 │ John      │ Smith    │ Male   │  30 │
   └───────┴───────────┴──────────┴────────┴─────┘
```


## 虚拟列 \{#virtual-columns\}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果文件大小未知，则该值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则该值为 `NULL`。
- `_etag` — 文件的 ETag。类型：`LowCardinality(String)`。如果 ETag 未知，则该值为 `NULL`。

## 相关 \{#related\}

- [DeltaLake 引擎](engines/table-engines/integrations/deltalake.md)
- [DeltaLake 集群表函数](sql-reference/table-functions/deltalakeCluster.md)