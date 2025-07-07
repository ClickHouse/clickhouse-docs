---
'sidebar_label': '概要'
'sidebar_position': 1
'slug': '/integrations/migration/overview'
'keywords':
- 'clickhouse'
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
'title': 'ClickHouseへのデータ移行'
'description': 'ClickHouseへのデータ移行のオプションについて説明するページです。'
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

データが現在どこに存在するかに応じて、ClickHouse Cloud へのデータ移行にはいくつかのオプションがあります：

- [セルフマネージドからクラウド](./clickhouse-to-cloud.md): `remoteSecure` 関数を使用してデータを転送する
- [別の DBMS](./clickhouse-local-etl.md): 現在の DBMS に適した ClickHouse テーブル関数とともに、[clickhouse-local] ETL ツールを使用する
- [どこでも！](./etl-tool-to-clickhouse.md): 様々なデータソースに接続する多くの人気 ETL/ELT ツールの1つを使用する
- [オブジェクトストレージ](./object-storage-to-clickhouse.md): S3 から ClickHouse にデータを簡単に挿入する

例として、[Redshift からの移行](/integrations/data-ingestion/redshift/index.md) では、ClickHouse へのデータ移行のための 3 つの異なる方法を紹介しています。
