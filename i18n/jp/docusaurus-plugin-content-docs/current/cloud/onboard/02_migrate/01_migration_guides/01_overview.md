---
sidebar_label: '概要'
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data']
title: 'ClickHouse へのデータ移行'
description: 'ClickHouse へのデータ移行に利用可能なオプションを説明するページ'
doc_type: 'guide'
---

# ClickHouse へのデータ移行 \\{#migrating-data-into-clickhouse\\}

<div class="vimeo-container">
  <iframe
    src="https://player.vimeo.com/video/753082620?h=eb566c8c08"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
fullscreen;
picture-in-picture"
    allowfullscreen
  />
</div>

<br />

現在データがどこにあるかに応じて、ClickHouse Cloud にデータを移行する方法はいくつかあります。

* [セルフマネージド環境から Cloud へ](/cloud/migration/clickhouse-to-cloud): `remoteSecure` 関数を使用してデータを転送します
* [別の DBMS から](/cloud/migration/clickhouse-local): [clickhouse-local] ETL ツールと、現在利用中の DBMS に対応する ClickHouse のテーブル関数を組み合わせて使用します
* [どこからでも！](/cloud/migration/etl-tool-to-clickhouse): さまざまな種類のデータソースに接続できる、広く利用されている ETL/ELT ツールのいずれかを使用します
* [オブジェクトストレージから](/integrations/migration/object-storage-to-clickhouse): S3 から ClickHouse へ簡単にデータを取り込めます

[Redshift からの移行](/migrations/redshift/migration-guide)の例では、ClickHouse にデータを移行する 3 つの異なる方法を紹介しています。