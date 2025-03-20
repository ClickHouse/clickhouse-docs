---
slug: /engines/table-engines/integrations/hudi
sidebar_position: 86
sidebar_label: Hudi
title: "Hudi 表引擎"
description: "此引擎提供与 Amazon S3 中现有 Apache Hudi 表的只读集成。"
---


# Hudi 表引擎

此引擎提供与 Amazon S3 中现有 Apache [Hudi](https://hudi.apache.org/) 表的只读集成。

## 创建表 {#create-table}

请注意，Hudi 表必须已经存在于 S3 中，此命令不接受 DDL 参数以创建新表。

``` sql
CREATE TABLE hudi_table
    ENGINE = Hudi(url, [aws_access_key_id, aws_secret_access_key,])
```

**引擎参数**

- `url` — 指向现有 Hudi 表的存储桶 URL。
- `aws_access_key_id`, `aws_secret_access_key` - AWS 账户用户的长期凭证。 您可以使用这些凭证进行请求身份验证。 参数是可选的。如果未指定凭证，则使用配置文件中的凭证。

引擎参数可以使用 [命名集合](/operations/named-collections.md) 来指定。

**示例**

```sql
CREATE TABLE hudi_table ENGINE=Hudi('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

使用命名集合：

``` xml
<clickhouse>
    <named_collections>
        <hudi_conf>
            <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
            <access_key_id>ABC123<access_key_id>
            <secret_access_key>Abc+123</secret_access_key>
        </hudi_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE hudi_table ENGINE=Hudi(hudi_conf, filename = 'test_table')
```

## 另请参见 {#see-also}

- [hudi 表函数](/sql-reference/table-functions/hudi.md)
