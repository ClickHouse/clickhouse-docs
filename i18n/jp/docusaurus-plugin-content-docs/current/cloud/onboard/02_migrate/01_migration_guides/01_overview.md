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
'description': 'ClickHouseへのデータ移行のための利用可能なオプションを記述したページ'
'doc_type': 'guide'
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

データの現在の所在地に応じて、ClickHouse Cloud へのデータ移行にはいくつかのオプションがあります：

- [セルフマネージドから Cloud へ](/cloud/migration/clickhouse-to-cloud): `remoteSecure` 関数を使用してデータを転送します
- [別の DBMS](/cloud/migration/clickhouse-local): [clickhouse-local] ETL ツールと、お使いの DBMS に適した ClickHouse テーブル関数を併用します
- [どこでも!](/cloud/migration/etl-tool-to-clickhouse): 様々なデータソースに接続できる多くの人気 ETL/ELT ツールのいずれかを使用します
- [オブジェクトストレージ](/integrations/migration/object-storage-to-clickhouse): S3 から ClickHouse へ簡単にデータを挿入します

例として [Redshift からの移行](/migrations/redshift/migration-guide) では、ClickHouse へデータを移行するための 3 つの異なる方法を紹介します。
