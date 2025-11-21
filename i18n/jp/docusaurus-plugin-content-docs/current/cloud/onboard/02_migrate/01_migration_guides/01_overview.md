---
sidebar_label: '概要'
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data']
title: 'ClickHouse へのデータ移行'
description: 'データを ClickHouse に移行する際に利用できるオプションを説明するページ'
doc_type: 'guide'
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

現在データが存在している場所に応じて、ClickHouse Cloud にデータを移行する方法はいくつかあります。

- [Self-managed to Cloud](/cloud/migration/clickhouse-to-cloud): `remoteSecure` 関数を使ってデータを転送します
- [Another DBMS](/cloud/migration/clickhouse-local): [clickhouse-local] ETL ツールと、現在使用している DBMS 用の適切な ClickHouse テーブル関数を併用します
- [Anywhere!](/cloud/migration/etl-tool-to-clickhouse): あらゆる種類のデータソースに接続できる、数多くの一般的な ETL/ELT ツールのいずれかを利用します
- [Object Storage](/integrations/migration/object-storage-to-clickhouse): S3 から ClickHouse へ簡単にデータを挿入します

[Redshift からの移行](/migrations/redshift/migration-guide)の例では、データを ClickHouse に移行する 3 つの異なる方法を紹介しています。