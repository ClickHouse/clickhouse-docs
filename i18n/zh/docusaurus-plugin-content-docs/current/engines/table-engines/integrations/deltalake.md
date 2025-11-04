---
'description': '该引擎提供与 Amazon S3 中现有 Delta Lake 表的只读集成。'
'sidebar_label': 'DeltaLake'
'sidebar_position': 40
'slug': '/engines/table-engines/integrations/deltalake'
'title': 'DeltaLake 表引擎'
'doc_type': 'reference'
---


# DeltaLake 表引擎

此引擎提供与 Amazon S3 中现有的 [Delta Lake](https://github.com/delta-io/delta) 表的只读集成。

## 创建表 {#create-table}

请注意，Delta Lake 表必须已经存在于 S3 中，此命令不接受 DDL 参数以创建新表。

```sql
CREATE TABLE deltalake
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,])
```

**引擎参数**

- `url` — 指向现有 Delta Lake 表的存储桶 URL 及路径。
- `aws_access_key_id`, `aws_secret_access_key` - 用于 [AWS](https://aws.amazon.com/) 账户用户的长期凭证。您可以使用这些凭证来验证您的请求。该参数是可选的。如果未指定凭证，则使用配置文件中的凭证。

引擎参数可以使用 [命名集合](/operations/named-collections.md) 进行指定。

**示例**

```sql
CREATE TABLE deltalake ENGINE=DeltaLake('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

使用命名集合：

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

`Iceberg` 表引擎和表函数支持与 `S3`、`AzureBlobStorage`、`HDFS` 存储相同的数据缓存。请参见 [这里](../../../engines/table-engines/integrations/s3.md#data-cache)。

## 另请参见 {#see-also}

- [deltaLake 表函数](../../../sql-reference/table-functions/deltalake.md)
