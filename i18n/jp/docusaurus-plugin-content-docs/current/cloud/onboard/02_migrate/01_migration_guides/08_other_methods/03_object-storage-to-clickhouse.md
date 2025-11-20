---
title: 'オブジェクトストレージの使用'
description: 'オブジェクトストレージから ClickHouse Cloud へのデータ移行'
keywords: ['object storage', 's3', 'azure blob', 'gcs', 'migration']
slug: /integrations/migration/object-storage-to-clickhouse
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import object_storage_01 from '@site/static/images/integrations/migration/object-storage-01.png';


# クラウドオブジェクトストレージから ClickHouse Cloud へデータを移行する

<Image img={object_storage_01} size='md' alt='Migrating Self-managed ClickHouse' background='white' />

Cloud Object Storage をデータレイクとして利用しており、そのデータを ClickHouse Cloud にインポートしたい場合や、
現在利用しているデータベースシステムがデータを Cloud Object Storage に直接オフロードできる場合には、
Cloud Object Storage に保存されているデータを ClickHouse Cloud のテーブルへ移行するために、次のいずれかの
テーブル関数を利用できます:

- [s3](/sql-reference/table-functions/s3.md) または [s3Cluster](/sql-reference/table-functions/s3Cluster.md)
- [gcs](/sql-reference/table-functions/gcs)
- [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)

現在利用しているデータベースシステムが Cloud Object Storage へ直接データをオフロードできない場合は、
[サードパーティ製 ETL/ELT ツール](/cloud/migration/etl-tool-to-clickhouse) または [clickhouse-local](/cloud/migration/clickhouse-local) を使用して、
まず既存のデータベースシステムから Cloud Object Storage へデータを移動し、その後の第 2 段階としてそのデータを ClickHouse Cloud のテーブルへ移行できます。

これは 2 段階のプロセス（データを Cloud Object Storage にオフロードし、その後 ClickHouse にロード）ではありますが、
Cloud Object Storage からの高並列読み取りに対する [ClickHouse Cloud の堅牢なサポート](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) により、
ペタバイト規模までスケールできるという利点があります。
また、[Parquet](/interfaces/formats/Parquet) のような高機能かつ高圧縮な形式も活用できます。

S3 を使用して ClickHouse Cloud にデータを取り込む方法を、具体的なコード例とともに紹介した
[ブログ記事](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3) も用意されています。