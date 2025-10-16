---
'sidebar_label': '迁移指南'
'slug': '/migrations/snowflake'
'description': '从 Snowflake 迁移到 ClickHouse'
'keywords':
- 'Snowflake'
'title': '从 Snowflake 迁移到 ClickHouse'
'show_related_blogs': false
'doc_type': 'guide'
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';


# 从 Snowflake 迁移到 ClickHouse

> 本指南将向您展示如何将数据从 Snowflake 迁移到 ClickHouse。

在 Snowflake 和 ClickHouse 之间迁移数据需要使用对象存储，如 S3，作为传输的中间存储。迁移过程还依赖于使用 Snowflake 的 `COPY INTO` 命令和 ClickHouse 的 `INSERT INTO SELECT`。

<VerticalStepper headerLevel="h2">

## 从 Snowflake 导出数据 {#1-exporting-data-from-snowflake}

<Image img={migrate_snowflake_clickhouse} size="md" alt="从 Snowflake 迁移到 ClickHouse"/>

从 Snowflake 导出数据需要使用外部阶段，如上图所示。

假设我们想要导出一个具有以下模式的 Snowflake 表：

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

要将此表的数据转移到 ClickHouse 数据库中，我们首先需要将这些数据复制到外部阶段。在复制数据时，我们建议使用 Parquet 作为中间格式，因为它允许共享类型信息、保留精度、压缩效果良好，并原生支持分析中常见的嵌套结构。

在下面的示例中，我们在 Snowflake 中创建一个命名文件格式来表示 Parquet 和所需的文件选项。然后，我们指定哪个存储桶将包含我们复制的数据集。最后，我们将数据集复制到存储桶中。

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

对于大约 5TB 的数据集，最大文件大小为 150MB，并使用位于 AWS `us-east-1` 区域的 2X-Large Snowflake 仓库，复制数据到 S3 存储桶大约需要 30 分钟。

## 导入到 ClickHouse {#2-importing-to-clickhouse}

一旦数据被暂存到中间对象存储中，可以使用 ClickHouse 函数，例如 [s3 表函数](/sql-reference/table-functions/s3)，将数据插入到表中，如下所示。

这个示例使用 AWS S3 的 [s3 表函数](/sql-reference/table-functions/s3)，但是 [gcs 表函数](/sql-reference/table-functions/gcs) 可用于 Google Cloud Storage，而 [azureBlobStorage 表函数](/sql-reference/table-functions/azureBlobStorage) 可用于 Azure Blob Storage。

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

然后，我们可以使用 `INSERT INTO SELECT` 命令将 S3 中的数据插入到 ClickHouse 表中：

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

:::note 嵌套列结构的注意事项
原始 Snowflake 表模式中的 `VARIANT` 和 `OBJECT` 列默认将作为 JSON 字符串输出，迫使我们在插入到 ClickHouse 时对这些进行转换。

诸如 `some_file` 这样的嵌套结构在复制时由 Snowflake 转换为 JSON 字符串。导入这些数据时，我们需要在 ClickHouse 插入时将这些结构转换为 Tuples，使用 [JSONExtract 函数](/sql-reference/functions/json-functions#JSONExtract)，如上所示。
:::

## 测试成功的数据导出 {#3-testing-successful-data-export}

要测试您的数据是否已正确插入，只需在新表上运行 `SELECT` 查询：

```sql
SELECT * FROM mydataset LIMIT 10;
```

</VerticalStepper>
