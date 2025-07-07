---
'sidebar_label': 'Snowflake'
'sidebar_position': 20
'slug': '/migrations/snowflake'
'description': '从 Snowflake 迁移到 ClickHouse'
'keywords':
- 'Snowflake'
'title': '从 Snowflake 迁移到 ClickHouse'
'show_related_blogs': true
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';


# 从 Snowflake 迁移到 ClickHouse

本指南展示如何将数据从 Snowflake 迁移到 ClickHouse。

在 Snowflake 和 ClickHouse 之间迁移数据需要使用对象存储，例如 S3，作为传输的中间存储。迁移过程还依赖于使用 Snowflake 的 `COPY INTO` 命令和 ClickHouse 的 `INSERT INTO SELECT`。

## 1. 从 Snowflake 导出数据 {#1-exporting-data-from-snowflake}

<Image img={migrate_snowflake_clickhouse} size="md" alt="从 Snowflake 迁移到 ClickHouse"/>

从 Snowflake 导出数据需要使用外部阶段，如上图所示。

假设我们想导出一个具有以下模式的 Snowflake 表：

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

要将此表的数据移动到 ClickHouse 数据库，我们首先需要将数据复制到外部阶段。在复制数据时，我们建议使用 Parquet 作为中间格式，因为它允许共享类型信息，保持精度，压缩效果良好，并原生支持分析中常见的嵌套结构。

在下面的示例中，我们在 Snowflake 中创建一个命名的文件格式以表示 Parquet 及所需的文件选项。然后，我们指定哪个桶将包含我们复制的数据集。最后，我们将数据集复制到该桶。

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- Create the external stage that specifies the S3 bucket to copy into
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- Apply "mydataset" prefix to all files and specify a max file size of 150mb
-- The `header=true` parameter is required to get column names
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

对于大约 5TB 数据的数据集，最大文件大小为 150MB，并使用位于同一 AWS `us-east-1` 区域的 2X-Large Snowflake 仓库，数据复制到 S3 存储桶大约需要 30 分钟。

## 2. 导入到 ClickHouse {#2-importing-to-clickhouse}

一旦数据在中间对象存储中备案，ClickHouse 的函数，如 [s3 表函数](/sql-reference/table-functions/s3)，可以用于将数据插入到表中，如下所示。

这个示例使用 AWS S3 的 [s3 表函数](/sql-reference/table-functions/s3)，但可以使用 Google Cloud Storage 的 [gcs 表函数](/sql-reference/table-functions/gcs) 和 Azure Blob Storage 的 [azureBlobStorage 表函数](/sql-reference/table-functions/azureBlobStorage)。

假设以下表的目标模式：

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

然后我们可以使用 `INSERT INTO SELECT` 命令将数据从 S3 插入到 ClickHouse 表：

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
SETTINGS input_format_null_as_default = 1, -- Ensure columns are inserted as default if values are null
input_format_parquet_case_insensitive_column_matching = 1 -- Column matching between source data and target table should be case insensitive
```

:::note 关于嵌套列结构的说明
原始 Snowflake 表模式中的 `VARIANT` 和 `OBJECT` 列默认将输出为 JSON 字符串，这需要我们在将其插入 ClickHouse 时进行转换。

嵌套结构如 `some_file` 在复制时被 Snowflake 转换为 JSON 字符串。导入此数据时需要在 ClickHouse 中插入时使用 [JSONExtract 函数](/sql-reference/functions/json-functions#jsonextract) 将这些结构转换为元组，如上所示。
:::

## 3. 测试数据导出是否成功 {#3-testing-successful-data-export}

要测试您的数据是否正确插入，只需对新表运行 `SELECT` 查询：

```sql
SELECT * FROM mydataset limit 10;
```
