---
slug: /sql-reference/table-functions/deltalake
sidebar_position: 45
sidebar_label: deltaLake
title: 'deltaLake'
description: '提供对 Amazon S3 中 Delta Lake 表的只读表格接口。'
---


# deltaLake 表函数

提供对 [Delta Lake](https://github.com/delta-io/delta) 在 Amazon S3 中的表的只读表格接口。

## 语法 {#syntax}

``` sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 参数 {#arguments}

- `url` — S3 中现有 Delta Lake 表的存储桶 URL 及路径。
- `aws_access_key_id`, `aws_secret_access_key` - AWS 账户用户的长期凭证。您可以使用这些凭证来验证您的请求。这些参数是可选的。如果未指定凭证，将使用 ClickHouse 配置中的凭证。有关更多信息，请参见 [使用 S3 进行数据存储](engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)。
- `format` — 文件的 [格式](/interfaces/formats)。
- `structure` — 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression` — 参数是可选的。支持的值：`none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。默认情况下，压缩将根据文件扩展名自动检测。

**返回值**

一个具有指定结构的表，用于读取 S3 中指定 Delta Lake 表的数据。

**示例**

从 S3 表 `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/` 中选择行：

``` sql
SELECT
    URL,
    UserAgent
FROM deltaLake('https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/')
WHERE URL IS NOT NULL
LIMIT 2
```

``` response
┌─URL───────────────────────────────────────────────────────────────────┬─UserAgent─┐
│ http://auto.ria.ua/search/index.kz/jobinmoscow/detail/55089/hasimages │         1 │
│ http://auto.ria.ua/search/index.kz/jobinmoscow.ru/gosushi             │         1 │
└───────────────────────────────────────────────────────────────────────┴───────────┘
```

**另请参阅**

- [DeltaLake 引擎](engines/table-engines/integrations/deltalake.md)
- [DeltaLake 集群表函数](sql-reference/table-functions/deltalakeCluster.md)
