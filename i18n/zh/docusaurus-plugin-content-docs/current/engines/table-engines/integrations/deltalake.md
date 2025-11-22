---
description: '此引擎为 Amazon S3 中现有的 Delta Lake 表提供只读集成。'
sidebar_label: 'DeltaLake'
sidebar_position: 40
slug: /engines/table-engines/integrations/deltalake
title: 'DeltaLake 表引擎'
doc_type: 'reference'
---



# DeltaLake 表引擎

此引擎为 Amazon S3 中现有的 [Delta Lake](https://github.com/delta-io/delta) 表提供只读访问集成。



## 创建表 {#create-table}

注意,Delta Lake 表必须已存在于 S3 中,该命令不接受 DDL 参数来创建新表。

```sql
CREATE TABLE deltalake
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,])
```

**引擎参数**

- `url` — 存储桶 URL,包含现有 Delta Lake 表的路径。
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) 账户用户的长期凭证。可使用这些凭证对请求进行身份验证。该参数为可选项。如果未指定凭证,将从配置文件中读取。

引擎参数可使用[命名集合](/operations/named-collections.md)指定。

**示例**

```sql
CREATE TABLE deltalake ENGINE=DeltaLake('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

使用命名集合:

```xml
<clickhouse>
    <named_collections>
        <deltalake_conf>
            <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
            <access_key_id>ABC123<access_key_id>
            <secret_access_key>Abc+123</secret_access_key>
        </deltalake_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE deltalake ENGINE=DeltaLake(deltalake_conf, filename = 'test_table')
```

### 数据缓存 {#data-cache}

`Iceberg` 表引擎和表函数支持数据缓存,与 `S3`、`AzureBlobStorage`、`HDFS` 存储相同。详见[此处](../../../engines/table-engines/integrations/s3.md#data-cache)。


## 另请参阅 {#see-also}

- [deltaLake 表函数](../../../sql-reference/table-functions/deltalake.md)
