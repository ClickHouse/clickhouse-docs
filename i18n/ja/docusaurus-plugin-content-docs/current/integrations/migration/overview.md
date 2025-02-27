---
sidebar_label: 概要
sidebar_position: 1
slug: /integrations/migration/overview
keywords: [clickhouse, 移行, マイグレーション, データ移行]
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

データが現在どこにあるかに応じて、ClickHouse Cloudへのデータ移行にはいくつかのオプションがあります：

- [セルフマネージドからクラウドへ](./clickhouse-to-cloud.md): `remoteSecure` 関数を使用してデータを転送
- [別のDBMS](./clickhouse-local-etl.md): 現在のDBMSに適したClickHouseのテーブル関数と共に、[clickhouse-local] ETLツールを使用
- [どこでも！](./etl-tool-to-clickhouse.md): 様々なデータソースに接続する人気のあるETL/ELTツールのいずれかを使用
- [オブジェクトストレージ](./object-storage-to-clickhouse.md): S3からClickHouseへのデータ挿入を簡単に実行

例として、[Redshiftからの移行](/integrations/data-ingestion/redshift/index.md)では、ClickHouseにデータを移行するための3つの異なる方法を示しています。
