---
title: '使用对象存储'
description: '将数据从对象存储迁移到 ClickHouse Cloud'
keywords: ['object storage', 's3', 'azure blob', 'gcs', 'migration']
slug: /integrations/migration/object-storage-to-clickhouse
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# 将云对象存储中的数据迁移到 ClickHouse Cloud

<Image img={object_storage_01} size='md' alt='Migrating Self-managed ClickHouse' background='white' />

如果你将云对象存储用作数据湖并希望将这些数据导入 ClickHouse Cloud，
或者当前数据库系统可以直接将数据写入云对象存储，那么你可以使用以下任一
表函数，将存储在云对象存储中的数据迁移到 ClickHouse Cloud 表中：

- [s3](/sql-reference/table-functions/s3.md) 或 [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

如果当前数据库系统无法将数据直接写入云对象存储，可以使用[第三方 ETL/ELT 工具](/cloud/migration/etl-tool-to-clickhouse)或 [clickhouse-local](/cloud/migration/clickhouse-local)，
先将数据从当前数据库系统迁移到云对象存储，然后在第二步再将这些数据迁移到 ClickHouse Cloud 表中。

尽管这是一个两步流程（先将数据写入云对象存储，然后再加载到 ClickHouse），但其优势在于，
借助 [ClickHouse Cloud 对云对象存储高并行读取的强大支持](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)，
该方法可以扩展到 PB 级数据规模。
同时，你还可以利用 [Parquet](/interfaces/formats/Parquet) 等高级压缩格式。

这里有一篇[博客文章](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)，通过具体代码示例展示了如何使用 S3 将数据导入 ClickHouse Cloud。