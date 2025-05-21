---
title: 'オブジェクトストレージから ClickHouse Cloud への移行'
description: 'オブジェクトストレージから ClickHouse Cloud へのデータ移行'
keywords: ['オブジェクトストレージ', 's3', 'azure blob', 'gcs', '移行']
slug: /integrations/migration/object-storage-to-clickhouse
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# Cloud オブジェクトストレージから ClickHouse Cloud へのデータ移行

<Image img={object_storage_01} size='md' alt='セルフマネージド ClickHouse の移行' background='white' />

Cloud オブジェクトストレージをデータレイクとして使用していて、このデータを ClickHouse Cloud にインポートしたい場合、
または現在のデータベースシステムが直接 Cloud オブジェクトストレージにデータをオフロードできる場合、以下の
テーブル関数のいずれかを使用して、Cloud オブジェクトストレージに保存されたデータを ClickHouse Cloud のテーブルに移行できます：

- [s3](/sql-reference/table-functions/s3.md) または [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

現在のデータベースシステムが直接 Cloud オブジェクトストレージにデータをオフロードできない場合は、[サードパーティの ETL/ELT ツール](./etl-tool-to-clickhouse.md)または [clickhouse-local](./clickhouse-local-etl.md)を使用して
現在のデータベースシステムから Cloud オブジェクトストレージにデータを移動し、次のステップでそのデータを ClickHouse Cloud のテーブルに移行できます。

このプロセスは二段階（データを Cloud オブジェクトストレージにオフロードし、次に ClickHouse にロードする）ですが、メリットは
Cloud オブジェクトストレージからの高並列読み取りをサポートする [堅固な ClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) により、ペタバイト規模にスケールできることです。
また、[Parquet](/interfaces/formats/#data-format-parquet) のような高度で圧縮されたフォーマットを活用することもできます。

[ブログ記事](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) では、S3 を使用して ClickHouse Cloud にデータを取り込む方法を具体的なコード例とともに紹介しています。
