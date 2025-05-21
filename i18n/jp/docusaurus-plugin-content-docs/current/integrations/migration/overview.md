---
sidebar_label: '概要'
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data']
title: 'ClickHouseへのデータ移行'
description: 'ClickHouseへのデータ移行に利用可能なオプションを説明するページ'
---


# ClickHouseへのデータ移行

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

データが現在どこに存在するかによって、ClickHouse Cloudへのデータ移行にはいくつかのオプションがあります。

- [セルフマネージドからCloudへ](./clickhouse-to-cloud.md): `remoteSecure` 関数を使用してデータを転送
- [別のDBMSから](./clickhouse-local-etl.md): 現在のDBMSに適したClickHouseテーブル関数とともに [clickhouse-local] ETLツールを使用
- [どこからでも！](./etl-tool-to-clickhouse.md): 様々なデータソースに接続する多くの人気のあるETL/ELTツールのいずれかを使用
- [オブジェクトストレージから](./object-storage-to-clickhouse.md): S3からClickHouseにデータを簡単に挿入

例として、[Redshiftからの移行](/integrations/data-ingestion/redshift/index.md)では、ClickHouseへのデータ移行の3つの異なる方法を紹介しています。
