---
title: 'オブジェクトストレージの使用'
description: 'オブジェクトストレージから ClickHouse Cloud へのデータ移行'
keywords: ['object storage', 's3', 'azure blob', 'gcs', 'migration']
slug: /integrations/migration/object-storage-to-clickhouse
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# クラウドオブジェクトストレージから ClickHouse Cloud へのデータ移行

<Image img={object_storage_01} size='md' alt='Migrating Self-managed ClickHouse' background='white' />

データレイクとして Cloud Object Storage を使用していて、そのデータを ClickHouse Cloud にインポートしたい場合や、
現在のデータベースシステムがデータを Cloud Object Storage に直接オフロードできる場合には、
Cloud Object Storage に保存されたデータを ClickHouse Cloud のテーブルに移行するために、次のいずれかの
テーブル関数を利用できます。

- [s3](/sql-reference/table-functions/s3.md) または [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

現在のデータベースシステムが Cloud Object Storage へデータを直接オフロードできない場合は、
[サードパーティ製の ETL/ELT ツール](/cloud/migration/etl-tool-to-clickhouse) や [clickhouse-local](/cloud/migration/clickhouse-local) を使用して、
まず現在のデータベースシステムから Cloud Object Storage にデータを移動し、そのうえで 2 段階目として
そのデータを ClickHouse Cloud のテーブルに移行することができます。

これは 2 段階のプロセス（Cloud Object Storage にデータをオフロードし、その後 ClickHouse にロードする）ですが、
[ClickHouse Cloud の堅牢なサポート](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) により、Cloud Object Storage からの高度に並列化された読み取りが可能なため、
ペタバイト規模までスケールできるという利点があります。
また、[Parquet](/interfaces/formats/Parquet) のような高機能かつ圧縮されたフォーマットも活用できます。

S3 を利用して ClickHouse Cloud にデータを取り込む方法を、具体的なコード例とともに説明している
[ブログ記事](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) もあります。