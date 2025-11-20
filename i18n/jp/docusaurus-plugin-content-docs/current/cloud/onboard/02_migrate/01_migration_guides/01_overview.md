---
sidebar_label: '概要'
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data']
title: 'ClickHouse へのデータ移行'
description: 'ClickHouse へデータを移行するための選択肢を説明するページ'
doc_type: 'guide'
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

現在データが保存されている場所に応じて、ClickHouse Cloudへデータを移行するための複数のオプションがあります:

- [セルフマネージドからクラウドへ](/cloud/migration/clickhouse-to-cloud): `remoteSecure`関数を使用したデータ転送
- [他のDBMSから](/cloud/migration/clickhouse-local): [clickhouse-local] ETLツールと、使用中のDBMSに対応するClickHouseテーブル関数を使用
- [あらゆる場所から!](/cloud/migration/etl-tool-to-clickhouse): 多様なデータソースに接続可能な、広く利用されているETL/ELTツールを使用
- [オブジェクトストレージから](/integrations/migration/object-storage-to-clickhouse): S3からClickHouseへ簡単にデータを挿入

[Redshiftからの移行](/migrations/redshift/migration-guide)の例では、ClickHouseへデータを移行する3つの異なる方法を紹介しています。