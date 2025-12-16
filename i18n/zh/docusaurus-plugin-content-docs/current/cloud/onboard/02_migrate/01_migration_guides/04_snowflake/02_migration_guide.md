---
sidebar_label: '迁移指南'
slug: /migrations/snowflake
description: '从 Snowflake 迁移至 ClickHouse'
keywords: ['Snowflake']
title: '从 Snowflake 迁移至 ClickHouse'
show_related_blogs: false
doc_type: 'guide'
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';

# 从 Snowflake 迁移到 ClickHouse {#migrate-from-snowflake-to-clickhouse}

> 本指南介绍如何将数据从 Snowflake 迁移到 ClickHouse。

在 Snowflake 和 ClickHouse 之间迁移数据需要使用对象存储(如 S3)作为传输的中间存储。迁移过程还依赖于使用 Snowflake 的 `COPY INTO` 命令和 ClickHouse 的 `INSERT INTO SELECT` 命令。

<VerticalStepper headerLevel="h2">

## 从 Snowflake 导出数据 {#1-exporting-data-from-snowflake}

<Image img={migrate_snowflake_clickhouse} size="md" alt="Migrating from Snowflake to ClickHouse" />

如上图所示，从 Snowflake 导出数据需要使用一个 external stage（外部暂存区）。

假设我们要导出一个具有以下表结构的 Snowflake 表：

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

要将此表中的数据迁移到 ClickHouse 数据库，首先需要将这些数据复制到一个外部 stage（外部暂存区）。在复制数据时，我们推荐使用 Parquet 作为中间格式，因为它能够共享类型信息、保留精度、具有良好的压缩效果，并且原生支持分析场景中常见的嵌套结构。

在下面的示例中，我们在 Snowflake 中创建一个命名的 file format，用于指定 Parquet 以及所需的文件选项。然后，我们指定用于存放已复制数据集的对象存储桶（bucket）。最后，我们将数据集复制到该 bucket 中。

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

对于大约 5TB 的数据集（单个文件最大 150MB），在同一 AWS `us-east-1` 区域使用 2X-Large Snowflake 仓库时，将数据复制到 S3 存储桶大约需要 30 分钟。

## 导入 ClickHouse {#2-importing-to-clickhouse}

将数据暂存到中间对象存储后，就可以使用 ClickHouse 的函数（例如 [s3 表函数](/sql-reference/table-functions/s3)）将数据插入到表中，如下所示。

本示例针对 AWS S3 使用 [s3 表函数](/sql-reference/table-functions/s3)，但对于 Google Cloud Storage 可以使用 [gcs 表函数](/sql-reference/table-functions/gcs)，对于 Azure Blob Storage 可以使用 [azureBlobStorage 表函数](/sql-reference/table-functions/azureBlobStorage)。

假设目标表的表结构如下：

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

然后，我们可以使用 `INSERT INTO SELECT` 命令，将 S3 中的数据插入 ClickHouse 表：

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
原始 Snowflake 表结构中的 `VARIANT` 和 `OBJECT` 列默认会被输出为 JSON 字符串，因此在将其插入 ClickHouse 时需要进行类型转换。

诸如 `some_file` 之类的嵌套结构在通过 Snowflake 复制导出时会被转换为 JSON 字符串。导入这些数据时，我们需要在向 ClickHouse 插入时使用如上所示的 [JSONExtract 函数](/sql-reference/functions/json-functions#JSONExtract)，将这些结构转换为 Tuple。
:::

## 测试数据导出是否成功 {#3-testing-successful-data-export}

要测试数据是否已正确插入,只需对新表执行 `SELECT` 查询:

```sql
SELECT * FROM mydataset LIMIT 10;
```

</VerticalStepper>
