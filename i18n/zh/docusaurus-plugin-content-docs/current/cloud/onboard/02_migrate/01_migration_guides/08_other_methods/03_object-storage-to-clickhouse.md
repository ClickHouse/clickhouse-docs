---
title: '使用对象存储'
description: '从对象存储将数据迁移到 ClickHouse Cloud'
keywords: ['对象存储', 's3', 'azure blob', 'gcs', '迁移']
slug: /integrations/migration/object-storage-to-clickhouse
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# 将数据从云对象存储迁移到 ClickHouse Cloud

<Image img={object_storage_01} size='md' alt='Migrating Self-managed ClickHouse' background='white' />

如果您将云对象存储用作数据湖，并希望将这些数据导入 ClickHouse Cloud，或者当前的数据库系统能够将数据直接导出到云对象存储，那么可以使用以下任一
表函数，将存储在云对象存储中的数据迁移到 ClickHouse Cloud 表中：

- [s3](/sql-reference/table-functions/s3.md) 或 [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

如果您当前的数据库系统无法直接将数据导出到云对象存储，可以使用[第三方 ETL/ELT 工具](/cloud/migration/etl-tool-to-clickhouse)或 [clickhouse-local](/cloud/migration/clickhouse-local)，
先将数据从当前数据库系统迁移到云对象存储，然后在第二步将这些数据迁移到 ClickHouse Cloud 表中。

虽然这是一个两步流程（先将数据导出到云对象存储，然后再加载到 ClickHouse），但其优势在于，
得益于 [ClickHouse Cloud 对从云对象存储进行高度并行读取的强大支持](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)，
该方案可以扩展到 PB 级数据量。此外，您还可以利用诸如 [Parquet](/interfaces/formats/Parquet) 等复杂且支持压缩的格式。

这里有一篇[博客文章](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)，其中包含使用 S3 将数据导入 ClickHouse Cloud 的具体代码示例。