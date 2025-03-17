---
title: chDB
sidebar_label: 概要
slug: /chdb
description: chDBはClickHouseによって支えられたプロセス内SQL OLAPエンジンです
keywords: [chdb, 埋め込み, clickhouse-lite, プロセス内, in process]
---


# chDB

chDBは、[ClickHouse](https://github.com/clickhouse/clickhouse)によって支えられた高速なプロセス内SQL OLAPエンジンです。
ClickHouseサーバーに接続することなく、プログラミング言語でClickHouseの力を利用したいときに使用できます。

## chDBはどのプログラミング言語をサポートしていますか？ {#what-languages-are-supported-by-chdb}

chDBには以下の言語バインディングがあります：

* [Python](install/python.md)
* [Go](install/go.md)
* [Rust](install/rust.md)
* [NodeJS](install/nodejs.md)
* [Bun](install/bun.md)

## どの入力および出力形式がサポートされていますか？ {#what-input-and-output-formats-are-supported}

chDBはParquet、CSV、JSON、Apache Arrow、ORC、そして[60以上の形式](/interfaces/formats)をサポートしています。

## どうすれば始められますか？ {#how-do-i-get-started}

* [Go](install/go.md)、 [Rust](install/rust.md)、 [NodeJS](install/nodejs.md)、 もしくは [Bun](install/bun.md) を使用している場合は、対応する言語のページを確認してください。
* Pythonを使用している場合は、[はじめにの開発者ガイド](getting-started.md)をご覧ください。また、一般的なタスクを実行する方法を示すガイドもあります：
    * [JupySQL](guides/jupysql.md)
    * [Pandasへのクエリ](guides/querying-pandas.md)
    * [Apache Arrowへのクエリ](guides/querying-apache-arrow.md)
    * [S3のデータへのクエリ](guides/querying-s3-bucket.md)
    * [Parquetファイルへのクエリ](guides/querying-parquet.md)
    * [リモートClickHouseへのクエリ](guides/query-remote-clickhouse.md)
    * [clickhouse-localデータベースの使用](guides/clickhouse-local.md)

<!-- ## chDBとは？

chDBはあなたに 

- Python DB API 2.0をサポート： [例](https://github.com/chdb-io/chdb/blob/main/examples/dbapi.py) と [カスタムUDF関数](https://github.com/chdb-io/chdb/blob/main/examples/udf.py) -->

## イントロダクションビデオ {#an-introductory-video}

ClickHouseのオリジナルクリエーターであるアレクセイ・ミロビドフによるchDBプロジェクトの簡単な紹介を視聴できます：

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/cuf_hYn7dqU?si=SzUm7RW4Ae5-YwFo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## chDBについて {#about-chdb}

- chDBプロジェクトの誕生の全ストーリーを[Auxtenのブログ](https://clickhouse.com/blog/chdb-embedded-clickhouse-rocket-engine-on-a-bicycle)で読む
- chDBとそのユースケースについては[公式ClickHouseブログ](https://clickhouse.com/blog/welcome-chdb-to-clickhouse)を参照
- [codapiの例](https://antonz.org/trying-chdb/)を使ってブラウザでchDBを発見してください


## どのライセンスを使用していますか？ {#what-license-does-it-use}

chDBはApache License, Version 2.0の下で提供されています。
