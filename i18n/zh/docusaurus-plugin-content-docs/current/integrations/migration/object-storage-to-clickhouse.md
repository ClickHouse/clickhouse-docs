---
title: 将对象存储迁移到 ClickHouse Cloud
description: 将数据从对象存储迁移到 ClickHouse Cloud
keywords: [对象存储, s3, azure blob, gcs, 迁移]
---

import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# 从云对象存储迁移数据到 ClickHouse Cloud

<img src={object_storage_01} class="image" alt="迁移自管理的 ClickHouse" style={{width: '90%', padding: '30px'}} />

如果您使用云对象存储作为数据湖，并希望将这些数据导入到 ClickHouse Cloud，或者如果您当前的数据库系统能够直接卸载数据到云对象存储，那么您可以使用以下表函数将存储在云对象存储中的数据迁移到 ClickHouse Cloud 表：

- [s3](/sql-reference/table-functions/s3.md) 或 [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

如果您当前的数据库系统无法直接卸载数据到云对象存储，您可以使用 [第三方 ETL/ELT 工具](./etl-tool-to-clickhouse.md) 或 [clickhouse-local](./clickhouse-local-etl.md) 将数据从您当前的数据库系统迁移到云对象存储，以便在第二步将该数据迁移到 ClickHouse Cloud 表中。

尽管这是一个两步过程（将数据卸载到云对象存储，然后加载到 ClickHouse），但其优势在于得益于支持高并行读取云对象存储的 [稳定的 ClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)，可以扩展到 PB 级别。此外，您可以利用 [Parquet](/interfaces/formats/#data-format-parquet) 等复杂且压缩的格式。

有一篇 [博客文章](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)，提供了具体的代码示例，展示了如何使用 S3 将数据导入到 ClickHouse Cloud。
