---
slug: /sql-reference/table-functions/iceberg
sidebar_position: 90
sidebar_label: iceberg
title: 'iceberg'
description: '提供对存储在 Amazon S3、Azure、HDFS 或本地的 Apache Iceberg 表的只读表状接口。'
---


# iceberg 表函数

提供对存储在 Apache [Iceberg](https://iceberg.apache.org/) 表中的只读表状接口，这些表可位于 Amazon S3、Azure、HDFS 或本地。

## 语法 {#syntax}

``` sql
icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3(named_collection[, option=value [,..]])

icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzure(named_collection[, option=value [,..]])

icebergHDFS(path_to_table, [,format] [,compression_method])
icebergHDFS(named_collection[, option=value [,..]])

icebergLocal(path_to_table, [,format] [,compression_method])
icebergLocal(named_collection[, option=value [,..]])
```

## 参数 {#arguments}

参数说明与表函数 `s3`、`azureBlobStorage`、`HDFS` 和 `file` 的参数描述相符。
`format` 指的是 Iceberg 表中数据文件的格式。

**返回值**
具有指定结构的表，用于从指定的 Iceberg 表中读取数据。

**示例**

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse 目前支持通过 `icebergS3`、`icebergAzure`、`icebergHDFS` 和 `icebergLocal` 表函数以及 `IcebergS3`、`icebergAzure`、`IcebergHDFS` 和 `IcebergLocal` 表引擎读取 Iceberg 格式的 v1 和 v2。
:::

## 定义命名集合 {#defining-a-named-collection}

以下是配置用于存储 URL 和凭证的命名集合的示例：

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
            <format>auto</format>
            <structure>auto</structure>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
SELECT * FROM icebergS3(iceberg_conf, filename = 'test_table')
DESCRIBE icebergS3(iceberg_conf, filename = 'test_table')
```

**模式演变**
目前，通过 CH，您可以读取 Iceberg 表的模式，这些模式随着时间而变化。我们当前支持读取已添加和删除列的表，以及列的顺序已更改。您还可以将要求值的列更改为允许 NULL 的列。此外，我们支持简单类型的允许类型转换，即：
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) 其中 P' > P。

目前，不可能更改嵌套结构或数组和映射中元素的类型。

**分区裁剪**

ClickHouse 在对 Iceberg 表执行 SELECT 查询时支持分区裁剪，这有助于通过跳过不相关的数据文件来优化查询性能。目前，它仅支持身份转换和基于时间的转换（小时、天、月、年）。要启用分区裁剪，请设置 `use_iceberg_partition_pruning = 1`。

**别名**

表函数 `iceberg` 现在是 `icebergS3` 的别名。

**另请参见**

- [Iceberg 引擎](/engines/table-engines/integrations/iceberg.md)
- [Iceberg 集群表函数](/sql-reference/table-functions/icebergCluster.md)
