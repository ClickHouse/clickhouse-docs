---
sidebar_label: 概要
sidebar_position: 1
slug: /integrations/migration/overview
keywords: [clickhouse, migrate, migration, migrating, data]
---


# ClickHouse へのデータ移行

<div class='vimeo-container'>
  <iframe src="https://player.vimeo.com/video/753082620?h=eb566c8c08"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br/>

ClickHouse Cloud にデータを移行するための方法はいくつかあり、データが現在どこにあるかによって異なります。

- [セルフマネージドからクラウドへ](./clickhouse-to-cloud.md): `remoteSecure` 関数を使用してデータを転送
- [別の DBMS](./clickhouse-local-etl.md): 現在の DBMS に適した ClickHouse テーブル関数とともに [clickhouse-local] ETL ツールを使用
- [どこでも！](./etl-tool-to-clickhouse.md): 様々なデータソースに接続できる多くの人気 ETL/ELT ツールのいずれかを使用
- [オブジェクトストレージ](./object-storage-to-clickhouse.md): S3 から ClickHouse へデータを簡単に挿入

例として、[Redshift からの移行](/integrations/data-ingestion/redshift/index.md) では、ClickHouse へのデータ移行のための三つの異なる方法を示しています。
