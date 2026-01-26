---
description: '为存储在 Amazon S3 中的 Delta Lake 表提供类表的只读访问接口。'
sidebar_label: 'deltaLake'
sidebar_position: 45
slug: /sql-reference/table-functions/deltalake
title: 'deltaLake'
doc_type: 'reference'
---

# deltaLake 表函数 \{#deltalake-table-function\}

为存放在 Amazon S3、Azure Blob Storage 或本地挂载文件系统中的 [Delta Lake](https://github.com/delta-io/delta) 表提供只读的类表访问接口。

## 语法 \{#syntax\}

`deltaLake` 是 `deltaLakeS3` 的别名，为了兼容性而保留。

```sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

deltaLakeLocal(path, [,format])
```

## 参数 \{#arguments\}

参数说明分别与表函数 `s3`、`azureBlobStorage`、`HDFS` 和 `file` 中参数说明一致。
`format` 表示 Delta Lake 表中数据文件的格式。

## 返回值 \{#returned_value\}

具有指定结构的表，用于从指定的 Delta Lake 表中读取数据。

## 示例 \{#examples\}

从 S3 中的表 `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/` 中选择行：

```sql
SELECT
    URL,
    UserAgent
FROM deltaLake('https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/')
WHERE URL IS NOT NULL
LIMIT 2
```

```response
┌─URL───────────────────────────────────────────────────────────────────┬─UserAgent─┐
│ http://auto.ria.ua/search/index.kz/jobinmoscow/detail/55089/hasimages │         1 │
│ http://auto.ria.ua/search/index.kz/jobinmoscow.ru/gosushi             │         1 │
└───────────────────────────────────────────────────────────────────────┴───────────┘
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
