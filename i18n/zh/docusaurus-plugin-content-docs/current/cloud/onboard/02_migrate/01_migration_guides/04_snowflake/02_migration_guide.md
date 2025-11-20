---
sidebar_label: '迁移指南'
slug: /migrations/snowflake
description: '从 Snowflake 迁移到 ClickHouse'
keywords: ['Snowflake']
title: '从 Snowflake 迁移到 ClickHouse'
show_related_blogs: false
doc_type: 'guide'
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';


# 从 Snowflake 迁移到 ClickHouse

> 本指南介绍如何将数据从 Snowflake 迁移到 ClickHouse。

从 Snowflake 迁移数据到 ClickHouse 需要使用对象存储(如 S3)作为中间存储进行数据传输。迁移过程依赖于 Snowflake 的 `COPY INTO` 命令和 ClickHouse 的 `INSERT INTO SELECT` 命令。

<VerticalStepper headerLevel="h2">


## 从 Snowflake 导出数据 {#1-exporting-data-from-snowflake}

<Image
  img={migrate_snowflake_clickhouse}
  size='md'
  alt='从 Snowflake 迁移到 ClickHouse'
/>

从 Snowflake 导出数据需要使用外部阶段(external stage),如上图所示。

假设我们要导出一个具有以下架构的 Snowflake 表:

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

要将此表的数据迁移到 ClickHouse 数据库,我们首先需要将数据复制到外部阶段。在复制数据时,我们推荐使用 Parquet 作为中间格式,因为它允许共享类型信息、保留精度、压缩效果好,并且原生支持分析场景中常见的嵌套结构。

在下面的示例中,我们在 Snowflake 中创建一个命名文件格式来表示 Parquet 及所需的文件选项。然后指定用于存放复制数据集的存储桶。最后,我们将数据集复制到该存储桶中。

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- 创建外部阶段,指定要复制到的 S3 存储桶
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- 为所有文件应用 "mydataset" 前缀,并指定最大文件大小为 150MB
-- 需要 `header=true` 参数来获取列名
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

对于约 5TB 的数据集,最大文件大小为 150MB,使用位于同一 AWS `us-east-1` 区域的 2X-Large Snowflake 仓库,将数据复制到 S3 存储桶大约需要 30 分钟。


## 导入到 ClickHouse {#2-importing-to-clickhouse}

数据暂存到中间对象存储后,可以使用 ClickHouse 函数(如 [s3 表函数](/sql-reference/table-functions/s3))将数据插入表中,如下所示。

此示例使用 [s3 表函数](/sql-reference/table-functions/s3) 访问 AWS S3,但也可以使用 [gcs 表函数](/sql-reference/table-functions/gcs) 访问 Google Cloud Storage,或使用 [azureBlobStorage 表函数](/sql-reference/table-functions/azureBlobStorage) 访问 Azure Blob Storage。

假设目标表结构如下:

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

然后可以使用 `INSERT INTO SELECT` 命令将数据从 S3 插入到 ClickHouse 表中:

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
SETTINGS input_format_null_as_default = 1, -- 确保值为 null 时列以默认值插入
input_format_parquet_case_insensitive_column_matching = 1 -- 源数据与目标表之间的列匹配不区分大小写
```

:::note 关于嵌套列结构的说明
原始 Snowflake 表结构中的 `VARIANT` 和 `OBJECT` 列默认会输出为 JSON 字符串,因此在插入 ClickHouse 时需要进行类型转换。

Snowflake 在复制时会将 `some_file` 等嵌套结构转换为 JSON 字符串。导入此数据时,需要在 ClickHouse 插入时使用 [JSONExtract 函数](/sql-reference/functions/json-functions#JSONExtract) 将这些结构转换为元组(Tuple),如上所示。
:::


## 测试数据导出是否成功 {#3-testing-successful-data-export}

要测试数据是否已正确插入,只需对新表执行 `SELECT` 查询:

```sql
SELECT * FROM mydataset LIMIT 10;
```

</VerticalStepper>
