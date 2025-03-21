sidebar_label: 'Snowflake'
sidebar_position: 20
slug: '/migrations/snowflake'
description: '从 Snowflake 迁移到 ClickHouse'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'snowflake']
```

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';


# 从 Snowflake 迁移到 ClickHouse

本指南介绍如何将数据从 Snowflake 迁移到 ClickHouse。

在 Snowflake 和 ClickHouse 之间迁移数据需要使用对象存储（如 S3）作为传输的中间存储。迁移过程还依赖于使用 Snowflake 的 `COPY INTO` 命令和 ClickHouse 的 `INSERT INTO SELECT`。

## 1. 从 Snowflake 导出数据 {#1-exporting-data-from-snowflake}

<img src={migrate_snowflake_clickhouse} class="image" alt="从 Snowflake 迁移到 ClickHouse" style={{width: '600px', marginBottom: '20px', textAlign: 'left'}} />

从 Snowflake 导出数据需要使用外部阶段，如上图所示。

假设我们要导出一个具有以下架构的 Snowflake 表：

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

要将此表的数据移动到 ClickHouse 数据库，我们首先需要将数据复制到外部阶段。在复制数据时，我们建议使用 Parquet 作为中间格式，因为它允许共享类型信息，保留精度，压缩效果良好，并且原生支持在分析中常见的嵌套结构。

在下面的示例中，我们在 Snowflake 中创建一个命名文件格式来表示 Parquet 和所需的文件选项。然后，我们指定哪个存储桶将包含我们的复制数据集。最后，我们将数据集复制到该存储桶。

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- 创建外部阶段，指定要复制到的 S3 存储桶
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- 将 "mydataset" 前缀应用于所有文件，并指定最大文件大小为 150mb
-- `header=true` 参数是必要的，以获取列名
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

对于大约 5TB 的数据，最大文件大小为 150MB，并且使用一个位于同一 AWS `us-east-1` 区域的 2X-Large Snowflake 仓库，复制数据到 S3 存储桶大约需要 30 分钟。

## 2. 导入到 ClickHouse {#2-importing-to-clickhouse}

一旦数据被临时存储在中间对象存储中，就可以使用 ClickHouse 函数，例如 [s3 表函数](/sql-reference/table-functions/s3)，将数据插入表中，如下所示。

此示例使用 [s3 表函数](/sql-reference/table-functions/s3) 针对 AWS S3，但可以使用 [gcs 表函数](/sql-reference/table-functions/gcs) 针对 Google Cloud Storage，使用 [azureBlobStorage 表函数](/sql-reference/table-functions/azureBlobStorage) 针对 Azure Blob Storage。

假设目标表架构如下：

```sql
CREATE TABLE default.mydataset
(
	`timestamp` DateTime64(6),
	`some_text` String,
	`some_file` Tuple(filename String, version String),
	`complex_data` Tuple(name String, description String),
)
ENGINE = MergeTree
ORDER BY (timestamp)
```

然后，我们可以使用 `INSERT INTO SELECT` 命令将 S3 中的数据插入 ClickHouse 表：

```sql
INSERT INTO mydataset
SELECT
	timestamp,
	some_text,
	JSONExtract(
		ifNull(some_file, '{}'),
		'Tuple(filename String, version String)'
	) AS some_file,
	JSONExtract(
		ifNull(complex_data, '{}'),
		'Tuple(filename String, description String)'
	) AS complex_data,
FROM s3('https://mybucket.s3.amazonaws.com/mydataset/mydataset*.parquet')
SETTINGS input_format_null_as_default = 1, -- 确保在值为 null 时列插入为默认值
input_format_parquet_case_insensitive_column_matching = 1 -- 源数据和目标表之间的列匹配应不区分大小写
```

:::note 关于嵌套列结构的说明
原始 Snowflake 表架构中的 `VARIANT` 和 `OBJECT` 列将默认输出为 JSON 字符串，迫使我们在将其插入 ClickHouse 时进行转换。

像 `some_file` 这样的嵌套结构在复制时会被 Snowflake 转换为 JSON 字符串。导入这些数据需要我们在 ClickHouse 中插入时将这些结构转换为 Tuples，使用如上所示的 [JSONExtract 函数](/sql-reference/functions/json-functions#jsonextract)。
:::

## 3. 测试成功的数据导出 {#3-testing-successful-data-export}

要测试数据是否正确插入，只需在新表上运行 `SELECT` 查询：

```sql
SELECT * FROM mydataset limit 10;
```

## 进一步阅读和支持 {#further-reading-and-support}

除了本指南，我们还建议阅读我们的博客文章 [比较 Snowflake 和 ClickHouse](https://clickhouse.com/blog/clickhouse-vs-snowflake-for-real-time-analytics-comparison-migration-guide)。

如果您在将数据从 Snowflake 传输到 ClickHouse 时遇到问题，请随时通过 support@clickhouse.com 联系我们。
