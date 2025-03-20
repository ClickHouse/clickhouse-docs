---
title: オブジェクトストレージからClickHouse Cloudへ
description: オブジェクトストレージからClickHouse Cloudへのデータ移行
keywords: [オブジェクトストレージ, s3, azure blob, gcs, マイグレーション]
---

import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# クラウドオブジェクトストレージからClickHouse Cloudへデータを移動する

<img src={object_storage_01} class="image" alt="セルフマネージドClickHouseのマイグレーション" style={{width: '90%', padding: '30px'}} />

クラウドオブジェクトストレージをデータレイクとして使用していて、そのデータをClickHouse Cloudにインポートしたい場合、または現在のデータベースシステムが直接クラウドオブジェクトストレージにデータをオフロードできる場合は、クラウドオブジェクトストレージに保存されたデータをClickHouse Cloudのテーブルにマイグレーションするためのテーブル関数のいずれかを使用できます。

- [s3](/sql-reference/table-functions/s3.md) または [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

現在のデータベースシステムが直接クラウドオブジェクトストレージにデータをオフロードできない場合は、[サードパーティのETL/ELTツール](./etl-tool-to-clickhouse.md)または[clickhouse-local](./clickhouse-local-etl.md)を使用して、現在のデータベースシステムからクラウドオブジェクトストレージにデータを移動し、次のステップでそのデータをClickHouse Cloudのテーブルにマイグレーションすることができます。

これは二段階のプロセス（データをクラウドオブジェクトストレージにオフロードし、その後ClickHouseにロードする）ですが、利点は、[堅牢なClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)によるクラウドオブジェクトストレージからの高並列リードのサポートにより、ペタバイトスケールに拡張できることです。また、[Parquet](/interfaces/formats/#data-format-parquet)のような高度な圧縮形式を活用することも可能です。

データをClickHouse CloudにS3を使用して取得する方法を示す具体的なコード例を含む[ブログ記事](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)があります。
