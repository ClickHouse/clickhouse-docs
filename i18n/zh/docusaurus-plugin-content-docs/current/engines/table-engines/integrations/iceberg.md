---
slug: /engines/table-engines/integrations/iceberg
sidebar_position: 90
sidebar_label: Iceberg
title: 'Iceberg 表引擎'
description: '该引擎提供与 Amazon S3、Azure、HDFS 和本地存储表中现有 Apache Iceberg 表的只读集成。'
---


# Iceberg 表引擎

:::warning 
我们建议使用 [Iceberg 表函数](/sql-reference/table-functions/iceberg.md) 来处理 ClickHouse 中的 Iceberg 数据。Iceberg 表函数目前提供足够的功能，提供对 Iceberg 表的部分只读接口。

Iceberg 表引擎是可用的，但可能存在一些限制。ClickHouse 最初并没有设计为支持具有外部更改模式的表，这可能会影响 Iceberg 表引擎的功能。因此，某些在常规表上可用的功能可能不可用或可能无法正常工作，特别是在使用旧的分析器时。

为了获得最佳兼容性，我们建议在继续改进对 Iceberg 表引擎的支持时使用 Iceberg 表函数。
:::

该引擎提供与 Amazon S3、Azure、HDFS 和本地存储表中现有 Apache [Iceberg](https://iceberg.apache.org/) 表的只读集成。

## 创建表 {#create-table}

请注意，Iceberg 表必须已经存在于存储中，此命令不接受 DDL 参数来创建新表。

``` sql
CREATE TABLE iceberg_table_s3
    ENGINE = IcebergS3(url,  [, NOSIGN | access_key_id, secret_access_key, [session_token]], format, [,compression])

CREATE TABLE iceberg_table_azure
    ENGINE = IcebergAzure(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])

CREATE TABLE iceberg_table_hdfs
    ENGINE = IcebergHDFS(path_to_table, [,format] [,compression_method])

CREATE TABLE iceberg_table_local
    ENGINE = IcebergLocal(path_to_table, [,format] [,compression_method])
```

**引擎参数**

参数的描述与引擎 `S3`、`AzureBlobStorage`、`HDFS` 和 `File` 的参数描述相符。
`format` 表示 Iceberg 表中数据文件的格式。

引擎参数可以使用 [命名集合](../../../operations/named-collections.md) 指定。

**示例**

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

使用命名集合：

``` xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test</access_key_id>
            <secret_access_key>test</secret_access_key>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3(iceberg_conf, filename = 'test_table')
```

**别名**

表引擎 `Iceberg` 现在是 `IcebergS3` 的别名。

**模式演进**
目前，通过 CH，您可以读取模式随时间变化的 Iceberg 表。我们目前支持读取列已经添加和删除且其顺序发生变化的表。您还可以将要求值的列更改为允许 NULL 的列。此外，我们支持简单类型的类型转换，具体包括：
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S)，其中 P' > P。

目前，不支持更改嵌套结构或数组和映射内元素的类型。

要读取在其创建后模式已更改的表，可以在创建表时设置 allow_dynamic_metadata_for_data_lakes = true，以启用动态模式推断。

**分区裁剪**

ClickHouse 支持在 Iceberg 表上进行 SELECT 查询时的分区裁剪，这有助于通过跳过无关的数据文件来优化查询性能。现在，它仅适用于身份转换和基于时间的转换（小时、天、月、年）。要启用分区裁剪，请设置 `use_iceberg_partition_pruning = 1`。

### 数据缓存 {#data-cache}

`Iceberg` 表引擎和表函数支持与 `S3`、`AzureBlobStorage`、`HDFS` 存储相同的数据缓存。请参见 [这里](../../../engines/table-engines/integrations/s3.md#data-cache)。

## 另见 {#see-also}

- [iceberg 表函数](/sql-reference/table-functions/iceberg.md)
