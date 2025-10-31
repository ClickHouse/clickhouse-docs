---
'title': 'オブジェクトストレージを使用する'
'description': 'オブジェクトストレージから ClickHouse Cloud へのデータ移動'
'keywords':
- 'object storage'
- 's3'
- 'azure blob'
- 'gcs'
- 'migration'
'slug': '/integrations/migration/object-storage-to-clickhouse'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# CloudオブジェクトストレージからClickHouse Cloudにデータを移動する

<Image img={object_storage_01} size='md' alt='セルフマネージド ClickHouse の移行' background='white' />

Cloudオブジェクトストレージをデータレイクとして使用し、そのデータをClickHouse Cloudにインポートしたい場合、または現在のデータベースシステムがCloudオブジェクトストレージにデータを直接オフロードできる場合は、Cloudオブジェクトストレージに保存されているデータをClickHouse Cloudのテーブルに移行するためのテーブル関数を使用することができます。

- [s3](/sql-reference/table-functions/s3.md) または [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

現在のデータベースシステムがCloudオブジェクトストレージにデータを直接オフロードできない場合、[サードパーティのETL/ELTツール](/cloud/migration/etl-tool-to-clickhouse)や[clickhouse-local](/cloud/migration/clickhouse-local)を使用して、現在のデータベースシステムからCloudオブジェクトストレージへデータを移動し、そのデータを第二のステップとしてClickHouse Cloudのテーブルに移行することができます。

これは二段階のプロセス（Cloudオブジェクトストレージにデータをオフロードし、次にClickHouseにロードする）ですが、[堅牢なClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)の高並列なCloudオブジェクトストレージからの読み取りサポートのおかげで、ペタバイトにスケールする利点があります。また、[Parquet](/interfaces/formats/#data-format-parquet)のような高度で圧縮されたフォーマットを活用することもできます。

S3を使用してClickHouse Cloudにデータを取り込む方法を示す具体的なコード例を含む[ブログ記事](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)があります。
