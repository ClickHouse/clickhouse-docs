---
title: '使用对象存储'
description: '将数据从对象存储迁移到 ClickHouse Cloud'
keywords: ['对象存储', 's3', 'azure blob', 'gcs', '迁移']
slug: /integrations/migration/object-storage-to-clickhouse
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';

# 将数据从云对象存储迁移到 ClickHouse Cloud \\{#move-data-from-cloud-object-storage-to-clickhouse-cloud\\}

<Image img={object_storage_01} size="md" alt="迁移自管理 ClickHouse" />

如果您将云对象存储用作数据湖，并希望将其中的数据导入 ClickHouse Cloud，
或者当前数据库系统可以将数据直接导出到云对象存储，那么您可以使用以下
表函数之一，将存储在云对象存储中的数据迁移到 ClickHouse Cloud 的表中：

* [s3](/sql-reference/table-functions/s3.md) 或 [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
* [gcs](/sql-reference/table-functions/gcs)
* [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

如果当前数据库系统无法将数据直接导出到云对象存储，您可以使用[第三方 ETL/ELT 工具](/cloud/migration/etl-tool-to-clickhouse)或 [clickhouse-local](/cloud/migration/clickhouse-local)，
先将数据从当前数据库系统迁移到云对象存储，然后在第二步中再将这些数据迁移到 ClickHouse Cloud 的表中。

虽然这是一个两步流程（先将数据导出到云对象存储，然后再加载到 ClickHouse），但其优点是，
借助 [ClickHouse Cloud 对从云对象存储进行高度并行读取的强力支持](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)，
该方式可以扩展到 PB 级别的数据量。
此外，您还可以利用 [Parquet](/interfaces/formats/Parquet) 等高级的压缩格式。

这篇[博客文章](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)提供了具体的代码示例，展示了如何使用 S3 将数据导入 ClickHouse Cloud。