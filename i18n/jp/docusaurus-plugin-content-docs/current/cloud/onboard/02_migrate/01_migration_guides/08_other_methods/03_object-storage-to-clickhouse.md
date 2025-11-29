---
title: 'オブジェクトストレージの利用'
description: 'オブジェクトストレージから ClickHouse Cloud へのデータ移行'
keywords: ['object storage', 's3', 'azure blob', 'gcs', '移行']
slug: /integrations/migration/object-storage-to-clickhouse
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';

# クラウドオブジェクトストレージから ClickHouse Cloud へのデータ移行 {#move-data-from-cloud-object-storage-to-clickhouse-cloud}

<Image img={object_storage_01} size="md" alt="Migrating Self-managed ClickHouse" background="white" />

Cloud Object Storage をデータレイクとして利用していて、そのデータを ClickHouse Cloud にインポートしたい場合や、
現在利用しているデータベースシステムがデータを直接 Cloud Object Storage にオフロードできる場合には、
Cloud Object Storage に保存されたデータを ClickHouse Cloud のテーブルへ移行するために、以下のいずれかの
テーブル関数を使用できます。

* [s3](/sql-reference/table-functions/s3.md) または [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
* [gcs](/sql-reference/table-functions/gcs)
* [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

現在利用しているデータベースシステムがデータを直接 Cloud Object Storage にオフロードできない場合は、
[サードパーティ製 ETL/ELT ツール](/cloud/migration/etl-tool-to-clickhouse) や [clickhouse-local](/cloud/migration/clickhouse-local) を使って、
まず現在のデータベースシステムから Cloud Object Storage へデータを転送し、その後第 2 段階として
ClickHouse Cloud のテーブルへそのデータを移行することができます。

これは 2 段階のプロセス（データを Cloud Object Storage にオフロードし、その後 ClickHouse に読み込む）ではありますが、
ClickHouse Cloud による Cloud Object Storage からの高並列読み取りに対する
[強力なサポート](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)のおかげで、
ペタバイト規模までスケールできるという利点があります。
また、[Parquet](/interfaces/formats/Parquet) のような、高度な圧縮フォーマットを活用することもできます。

S3 を利用して ClickHouse Cloud にデータを取り込む具体的なコード例を紹介している
[ブログ記事](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) もあります。