---
title: chDB
sidebar_label: 概要
slug: /chdb
description: chDBはClickHouseにより動作するプロセス内SQL OLAPエンジンです
keywords: [chdb, 埋め込み, clickhouse-lite, プロセス内, in process]
---

# chDB

chDBは、[ClickHouse](https://github.com/clickhouse/clickhouse)により動作する高速なプロセス内SQL OLAPエンジンです。ClickHouseサーバーに接続することなく、プログラミング言語でClickHouseの力を得たい場合に使用できます。

## chDBはどの言語をサポートしていますか？ {#what-languages-are-supported-by-chdb}

chDBは以下の言語バインディングをサポートしています：

* [Python](install/python.md)
* [Go](install/go.md)
* [Rust](install/rust.md)
* [NodeJS](install/nodejs.md)
* [Bun](install/bun.md)

## どの入力および出力形式がサポートされていますか？ {#what-input-and-output-formats-are-supported}

chDBはParquet、CSV、JSON、Apache Arrow、ORC、そして[60以上の形式](/interfaces/formats)をサポートしています。

## どのように始めればよいですか？ {#how-do-i-get-started}

* [Go](install/go.md)、[Rust](install/rust.md)、[NodeJS](install/nodejs.md)、または[Bun](install/bun.md)を使用している場合は、対応する言語ページを確認してください。
* Pythonを使用している場合は、[はじめにの開発者ガイド](getting-started.md)を参照してください。また、以下のような一般的な作業を行う方法を示すガイドもあります：
    * [JupySQL](guides/jupysql.md)
    * [Pandasのクエリ](guides/querying-pandas.md)
    * [Apache Arrowのクエリ](guides/querying-apache-arrow.md)
    * [S3のデータクエリ](guides/querying-s3-bucket.md)
    * [Parquetファイルのクエリ](guides/querying-parquet.md)
    * [リモートClickHouseのクエリ](guides/query-remote-clickhouse.md)
    * [clickhouse-localデータベースの使用](guides/clickhouse-local.md)

<!-- ## chDBとは？

chDBは、 

- Python DB API 2.0をサポートしています：[例](https://github.com/chdb-io/chdb/blob/main/examples/dbapi.py)および[カスタムUDF関数](https://github.com/chdb-io/chdb/blob/main/examples/udf.py) -->

## 導入ビデオ {#an-introductory-video}

ClickHouseのオリジナルクリエイターであるAlexey Milovidovが提供するchDBプロジェクトの簡潔な紹介を聞くことができます：

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/cuf_hYn7dqU?si=SzUm7RW4Ae5-YwFo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## chDBについて {#about-chdb}

- chDBプロジェクトの誕生に関する詳細な話を[Auxtenのブログ](https://clickhouse.com/blog/chdb-embedded-clickhouse-rocket-engine-on-a-bicycle)でお読みください
- chDBとその使用例については、[公式ClickHouseブログ](https://clickhouse.com/blog/welcome-chdb-to-clickhouse)を参照してください
- [codapiの例](https://antonz.org/trying-chdb/)を使用してブラウザでchDBを発見してください

## 使用しているライセンスは何ですか？ {#what-license-does-it-use}

chDBはApache License, Version 2.0のもとで利用可能です。
