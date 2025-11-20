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

<Image img={object_storage_01} size='md' alt='迁移自管理 ClickHouse' background='white' />

如果您使用云对象存储作为数据湖,并希望将数据导入 ClickHouse Cloud,
或者您当前的数据库系统能够直接将数据导出到云对象存储,那么您可以使用以下
表函数将云对象存储中的数据迁移到 ClickHouse Cloud 表:

- [s3](/sql-reference/table-functions/s3.md) 或 [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

如果您当前的数据库系统无法直接将数据导出到云对象存储,您可以使用[第三方 ETL/ELT 工具](/cloud/migration/etl-tool-to-clickhouse)或 [clickhouse-local](/cloud/migration/clickhouse-local)
先将数据从当前数据库系统迁移到云对象存储,然后再将数据迁移到 ClickHouse Cloud 表。

虽然这是一个两步流程(先将数据导出到云对象存储,再加载到 ClickHouse),但其优势在于
借助 [ClickHouse Cloud 对云对象存储高并发读取的强大支持](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3),该方案可扩展至 PB 级规模。
此外,您还可以利用 [Parquet](/interfaces/formats/Parquet) 等高效压缩格式。

相关[博客文章](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)提供了具体的代码示例,演示如何通过 S3 将数据导入 ClickHouse Cloud。