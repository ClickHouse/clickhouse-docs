---
'title': '对象存储到ClickHouse Cloud'
'description': '将数据从对象存储迁移至ClickHouse Cloud'
'keywords':
- 'object storage'
- 's3'
- 'azure blob'
- 'gcs'
- 'migration'
'slug': '/integrations/migration/object-storage-to-clickhouse'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# 将数据从云对象存储移动到 ClickHouse Cloud

<Image img={object_storage_01} size='md' alt='迁移自管理的 ClickHouse' background='white' />

如果您使用云对象存储作为数据湖并希望将这些数据导入到 ClickHouse Cloud，或者如果您当前的数据库系统能够直接将数据卸载到云对象存储中，那么您可以使用以下表函数将存储在云对象存储中的数据迁移到 ClickHouse Cloud 表中：

- [s3](/sql-reference/table-functions/s3.md) 或 [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

如果您当前的数据库系统无法直接将数据卸载到云对象存储中，您可以使用 [第三方 ETL/ELT 工具](./etl-tool-to-clickhouse.md) 或 [clickhouse-local](./clickhouse-local-etl.md) 将数据从当前数据库系统移动到云对象存储，以便在第二步中将数据迁移到 ClickHouse Cloud 表中。

尽管这是一个两步的过程（将数据卸载到云对象存储，然后加载到 ClickHouse），但其优势在于，这可以扩展到 PB 级别，得益于 [坚实的 ClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) 对云对象存储中高度并行读取的支持。
您还可以利用复杂且压缩的格式，如 [Parquet](/interfaces/formats/#data-format-parquet)。

有一篇 [博客文章](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) 提供了具体的代码示例，展示了如何使用 S3 将数据导入 ClickHouse Cloud。
