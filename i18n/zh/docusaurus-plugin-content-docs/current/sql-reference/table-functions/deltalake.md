
# deltaLake 表函数

提供一个只读的类似表格接口，以访问存储在 Amazon S3 或 Azure Blob Storage 中的 [Delta Lake](https://github.com/delta-io/delta) 表。

## 语法 {#syntax}

`deltaLake` 是 `deltaLakeS3` 的别名，支持兼容性。

```sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
```

## 参数 {#arguments}

参数的描述与表函数 `s3`、`azureBlobStorage`、`HDFS` 和 `file` 中的参数描述相一致。
`format` 代表 Delta Lake 表中数据文件的格式。

## 返回值 {#returned_value}

一个表，具有指定的结构，用于读取指定 Delta Lake 表中的数据。

## 示例 {#examples}

选择 S3 中表格的行 `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/`：

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

## 相关 {#related}

- [DeltaLake 引擎](engines/table-engines/integrations/deltalake.md)
- [DeltaLake 集群表函数](sql-reference/table-functions/deltalakeCluster.md)
