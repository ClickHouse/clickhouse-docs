---
description: '提供类似表的只读接口，用于访问存储在 Amazon S3、Azure、HDFS 或本地的 Apache Paimon 表。'
sidebar_label: 'paimon'
sidebar_position: 90
slug: /sql-reference/table-functions/paimon
title: 'paimon'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# paimon 表函数 \{#paimon-table-function\}

<ExperimentalBadge />

为存储在 Amazon S3、Azure、HDFS 或本地的 Apache [Paimon](https://paimon.apache.org/) 表提供只读的类似表的接口。

## 语法 \{#syntax\}

```sql
paimon(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

paimonS3(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

paimonAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

paimonHDFS(path_to_table, [,format] [,compression_method])

paimonLocal(path_to_table, [,format] [,compression_method])
```

## 参数 \{#arguments\}

参数说明与表函数 `s3`、`azureBlobStorage`、`HDFS` 和 `file` 中参数的说明相同。
`format` 表示 Paimon 表中数据文件的格式。

### 返回值 \{#returned-value\}

一个具有指定结构的表，用于读取指定 Paimon 表中的数据。

## 定义命名集合 \{#defining-a-named-collection\}

下面是一个示例，展示如何配置一个命名集合用于存储 URL 和凭证：

```xml
<clickhouse>
    <named_collections>
        <paimon_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
            <format>auto</format>
            <structure>auto</structure>
        </paimon_conf>
    </named_collections>
</clickhouse>
```

```sql
SELECT * FROM paimonS3(paimon_conf, filename = 'test_table')
DESCRIBE paimonS3(paimon_conf, filename = 'test_table')
```

## 别名 \{#aliases\}

表函数 `paimon` 现在是 `paimonS3` 的别名。

## 虚拟列 \{#virtual-columns\}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（字节）。类型：`Nullable(UInt64)`。如果文件大小未知，该值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，该值为 `NULL`。
- `_etag` — 文件的 etag。类型：`LowCardinality(String)`。如果 etag 未知，该值为 `NULL`。

## 支持的数据类型 \{#data-types-supported\}

| Paimon 数据类型 | ClickHouse 数据类型 
|-------|--------|
|BOOLEAN     |Int8      |
|TINYINT     |Int8      |
|SMALLINT     |Int16      |
|INTEGER     |Int32      |
|BIGINT     |Int64      |
|FLOAT     |Float32      |
|DOUBLE     |Float64      |
|STRING, VARCHAR, BYTES, VARBINARY     |String      |
|DATE     |Date      |
|TIME(p), TIME     |Time('UTC')      |
|TIMESTAMP(p) WITH LOCAL TIME ZONE     |DateTime64      |
|TIMESTAMP(p)     |DateTime64('UTC')      |
|CHAR     |FixedString(1)      |
|BINARY(n)     |FixedString(n)      |
|DECIMAL(P,S)     |Decimal(P,S)      |
|ARRAY     |Array      |
|MAP     |Map    |

## 支持的分区 \{#partition-supported\}
Paimon 分区键支持如下数据类型：
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

## 另请参阅 \{#see-also\}

* [Paimon 集群表函数](/sql-reference/table-functions/paimonCluster.md)
