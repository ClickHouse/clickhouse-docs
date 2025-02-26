---
title: オブジェクトストレージからClickHouse Cloudへ
description: オブジェクトストレージからClickHouse Cloudへデータを移動する
keywords: [オブジェクトストレージ, s3, azure blob, gcs, 移行]
---

# クラウドオブジェクトストレージからClickHouse Cloudにデータを移動する

<img src={require('./images/object-storage-01.png').default} class="image" alt="セルフマネージドClickHouseの移行" style={{width: '90%', padding: '30px'}}/>

データレイクとしてクラウドオブジェクトストレージを使用し、このデータをClickHouse Cloudにインポートしたい場合、または現在のデータベースシステムがクラウドオブジェクトストレージに直接データをオフロードできるのであれば、次のテーブル関数を使用してクラウドオブジェクトストレージに保存されているデータをClickHouse Cloudのテーブルに移行できます：

- [s3](/sql-reference/table-functions/s3.md) または [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

現在のデータベースシステムがクラウドオブジェクトストレージに直接データをオフロードできない場合は、[サードパーティのETL/ELTツール](./etl-tool-to-clickhouse.md)または[clickhouse-local](./clickhouse-local-etl.md)を使用して、現在のデータベースシステムからクラウドオブジェクトストレージにデータを移動し、その後データをClickHouse Cloudのテーブルに移行することができます。

これは二段階のプロセス（データをクラウドオブジェクトストレージにオフロードし、次にClickHouseにロードする）ですが、このプロセスの利点は、[堅牢なClickHouse Cloud](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)のサポートにより、クラウドオブジェクトストレージからの高い並行読み取りが可能になり、ペタバイト規模にスケールする点です。また、[Parquet](/interfaces/formats/#data-format-parquet)のような高度で圧縮されたフォーマットを活用することもできます。

具体的なコード例を示した[ブログ記事](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)があり、S3を使用してClickHouse Cloudにデータを取り込む方法を紹介しています。
