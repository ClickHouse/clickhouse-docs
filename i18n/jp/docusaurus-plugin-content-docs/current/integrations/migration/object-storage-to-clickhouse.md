---
'title': 'Object Storage to ClickHouse Cloud'
'description': 'Moving data from object storage to ClickHouse Cloud'
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


# CloudオブジェクトストレージからClickHouse Cloudへのデータ移行

<Image img={object_storage_01} size='md' alt='セルフマネージドClickHouseの移行' background='white' />

Cloudオブジェクトストレージをデータレイクとして使用し、このデータをClickHouse Cloudにインポートしたい場合、または現在のデータベースシステムがデータをCloudオブジェクトストレージに直接オフロードできる場合は、Cloudオブジェクトストレージに保存されているデータをClickHouse Cloudテーブルに移行するためのテーブル関数の1つを使用できます：

- [s3](/sql-reference/table-functions/s3.md) または [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

現在のデータベースシステムが直接Cloudオブジェクトストレージにデータをオフロードできない場合は、[サードパーティETL/ELTツール](./etl-tool-to-clickhouse.md)や[clickhouse-local](./clickhouse-local-etl.md)を使用して、現在のデータベースシステムからCloudオブジェクトストレージにデータを移動し、そのデータを2段階でClickHouse Cloudテーブルに移行することができます。

このプロセスは2ステップ（Cloudオブジェクトストレージにデータをオフロードし、次にClickHouseにロードする）ですが、その利点は、Cloudオブジェクトストレージからの高い並列読み取りをサポートする[堅牢なClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)によってペタバイトにスケールすることができる点です。また、[Parquet](/interfaces/formats/#data-format-parquet)のような高度な圧縮形式を活用することもできます。

具体的なコード例を示す[ブログ記事](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)があり、S3を使用してClickHouse Cloudにデータを取り込む方法を説明しています。
