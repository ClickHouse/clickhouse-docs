---
title: 'chDB'
sidebar_label: '概要'
slug: /chdb
description: 'chDBはClickHouseによって提供されるインプロセスSQL OLAPエンジンです'
keywords: ['chdb', '埋め込み', 'clickhouse-lite', 'インプロセス', 'in process']
---


# chDB

chDBは、[ClickHouse](https://github.com/clickhouse/clickhouse)によって提供される高速インプロセスSQL OLAPエンジンです。ClickHouseサーバーに接続することなく、プログラミング言語でClickHouseの力を利用したいときに使用できます。

## chDBはどの言語をサポートしていますか？ {#what-languages-are-supported-by-chdb}

chDBは以下の言語バインディングを提供しています：

* [Python](install/python.md)
* [Go](install/go.md)
* [Rust](install/rust.md)
* [NodeJS](install/nodejs.md)
* [Bun](install/bun.md)

## chDBはどの入力および出力フォーマットをサポートしていますか？ {#what-input-and-output-formats-are-supported}

chDBはParquet、CSV、JSON、Apache Arrow、ORC、そして[60以上のフォーマット](/interfaces/formats)をサポートしています。

## どうやって始めればいいですか？ {#how-do-i-get-started}

* [Go](install/go.md)、[Rust](install/rust.md)、[NodeJS](install/nodejs.md)、または[Bun](install/bun.md)を使用している場合、対応する言語のページを確認してください。
* Pythonを使用している場合は、[はじめにの開発者ガイド](getting-started.md)を参照してください。以下のような一般的なタスクを実行する方法を示すガイドもあります：
    * [JupySQL](guides/jupysql.md)
    * [Pandasでのクエリ](guides/querying-pandas.md)
    * [Apache Arrowでのクエリ](guides/querying-apache-arrow.md)
    * [S3でのデータクエリ](guides/querying-s3-bucket.md)
    * [Parquetファイルのクエリ](guides/querying-parquet.md)
    * [リモートClickHouseのクエリ](guides/query-remote-clickhouse.md)
    * [clickhouse-localデータベースの使用](guides/clickhouse-local.md)

<!-- ## chDBとは何ですか？

chDBは以下を可能にします：

- Python DB API 2.0をサポート： [例](https://github.com/chdb-io/chdb/blob/main/examples/dbapi.py) および [カスタムUDF関数](https://github.com/chdb-io/chdb/blob/main/examples/udf.py) -->

## イントロダクションビデオ {#an-introductory-video}

ClickHouseのオリジナルクリエイターであるAlexey MilovidovによるchDBプロジェクトの簡単な紹介を聞くことができます：

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/cuf_hYn7dqU?si=SzUm7RW4Ae5-YwFo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## chDBについて {#about-chdb}

- [Auxtenのブログ](https://clickhouse.com/blog/chdb-embedded-clickhouse-rocket-engine-on-a-bicycle)でchDBプロジェクトの誕生の全貌を読むことができます
- [公式ClickHouseブログ](https://clickhouse.com/blog/welcome-chdb-to-clickhouse)でchDBとそのユースケースについて読むことができます
- [codapiの例](https://antonz.org/trying-chdb/)を使用してブラウザでchDBを発見できます

## どのライセンスを使用していますか？ {#what-license-does-it-use}

chDBはApache License, Version 2.0の下で利用可能です。
