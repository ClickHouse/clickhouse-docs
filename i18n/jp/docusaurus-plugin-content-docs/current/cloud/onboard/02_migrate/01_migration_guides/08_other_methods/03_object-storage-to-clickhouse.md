---
title: 'オブジェクトストレージの利用'
description: 'オブジェクトストレージから ClickHouse Cloud へのデータ移行'
keywords: ['object storage', 's3', 'azure blob', 'gcs', '移行']
slug: /integrations/migration/object-storage-to-clickhouse
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';

# クラウドオブジェクトストレージから ClickHouse Cloud へデータを移行する \{#move-data-from-cloud-object-storage-to-clickhouse-cloud\}

<Image img={object_storage_01} size="md" alt="セルフマネージド ClickHouse の移行" />

Cloud Object Storage（クラウドオブジェクトストレージ）をデータレイクとして利用していて、そのデータを ClickHouse Cloud にインポートしたい場合、
または現在のデータベースシステムがデータを Cloud Object Storage へ直接オフロードできる場合には、
Cloud Object Storage に保存されているデータを ClickHouse Cloud のテーブルへ移行するために、以下のいずれかの
テーブル関数を利用できます：

* [s3](/sql-reference/table-functions/s3.md) または [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
* [gcs](/sql-reference/table-functions/gcs)
* [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

現在のデータベースシステムがデータを Cloud Object Storage へ直接オフロードできない場合は、
[サードパーティ製の ETL/ELT ツール](/cloud/migration/etl-tool-to-clickhouse) または [clickhouse-local](/cloud/migration/clickhouse-local) を使用して
現在のデータベースシステムから Cloud Object Storage へデータを移動し、その後の第 2 ステップとしてそのデータを ClickHouse Cloud のテーブルへ移行できます。

これは 2 段階のプロセス（Cloud Object Storage へデータをオフロードし、その後 ClickHouse にロード）ではありますが、
ClickHouse Cloud による Cloud Object Storage からの高並列読み取りの[強力なサポート](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) により、
PB 単位までスケールできます。
また、[Parquet](/interfaces/formats/Parquet) のような高機能かつ高圧縮なフォーマットを活用することもできます。

S3 を使用して ClickHouse Cloud にデータを取り込む具体的なコード例を示した
[ブログ記事](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) もあります。