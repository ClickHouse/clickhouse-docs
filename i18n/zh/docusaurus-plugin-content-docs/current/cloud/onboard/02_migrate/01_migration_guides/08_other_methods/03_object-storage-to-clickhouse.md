---
title: '使用对象存储'
description: '将数据从对象存储迁移到 ClickHouse Cloud'
keywords: ['对象存储', 's3', 'azure blob', 'gcs', '迁移']
slug: /integrations/migration/object-storage-to-clickhouse
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';

# 将数据从云对象存储迁移到 ClickHouse Cloud {#move-data-from-cloud-object-storage-to-clickhouse-cloud}

<Image img={object_storage_01} size="md" alt="迁移自管 ClickHouse" background="white" />

如果你将云对象存储用作数据湖并希望将这些数据导入 ClickHouse Cloud，或者当前数据库系统可以直接将数据导出到云对象存储，那么可以使用以下表函数，将存储在云对象存储中的数据迁移到 ClickHouse Cloud 表中：

* [s3](/sql-reference/table-functions/s3.md) 或 [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
* [gcs](/sql-reference/table-functions/gcs)
* [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

如果当前数据库系统无法直接将数据导出到云对象存储，你可以使用[第三方 ETL/ELT 工具](/cloud/migration/etl-tool-to-clickhouse)或 [clickhouse-local](/cloud/migration/clickhouse-local)，先将数据从当前数据库系统迁移到云对象存储，然后在第二步再将这些数据迁移到 ClickHouse Cloud 表中。

尽管这是一个两步流程（先将数据导出到云对象存储，再加载到 ClickHouse），其优势在于：凭借 [ClickHouse Cloud 对云对象存储高并发读取的强大支持](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)，该方案可以扩展到 PB 级数据规模。
同时，你还可以利用诸如 [Parquet](/interfaces/formats/Parquet) 等高级且高压缩率的格式。

有一篇[博客文章](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)提供了具体代码示例，展示了如何使用 S3 将数据导入 ClickHouse Cloud。