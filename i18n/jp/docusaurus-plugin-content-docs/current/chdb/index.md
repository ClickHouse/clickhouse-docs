---
'title': 'chDB'
'sidebar_label': '概要'
'slug': '/chdb'
'description': 'chDB は ClickHouse によってパワーアップされたインプロセス SQL OLAP エンジンです。'
'keywords':
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'in-process'
- 'in process'
---




# chDB

chDBは、[ClickHouse](https://github.com/clickhouse/clickhouse)に基づいた、高速なプロセス内SQL OLAPエンジンです。ClickHouseサーバーに接続することなく、プログラミング言語でClickHouseの機能を利用したいときに使用できます。

## chDBはどの言語をサポートしていますか？ {#what-languages-are-supported-by-chdb}

chDBには以下の言語バインディングがあります：

* [Python](install/python.md)
* [Go](install/go.md)
* [Rust](install/rust.md)
* [NodeJS](install/nodejs.md)
* [Bun](install/bun.md)

## どの入力および出力フォーマットがサポートされていますか？ {#what-input-and-output-formats-are-supported}

chDBはParquet、CSV、JSON、Apache Arrow、ORC、および[60以上のフォーマット](/interfaces/formats)をサポートしています。

## どのように始めればよいですか？ {#how-do-i-get-started}

* [Go](install/go.md)、[Rust](install/rust.md)、[NodeJS](install/nodejs.md)、または[Bun](install/bun.md)を使用している場合は、対応する言語ページを参照してください。
* Pythonを使用している場合は、[はじめに開発者ガイド](getting-started.md)を参照してください。一般的なタスクを行う方法を示すガイドもあります：
    * [JupySQL](guides/jupysql.md)
    * [Pandasのクエリ](guides/querying-pandas.md)
    * [Apache Arrowのクエリ](guides/querying-apache-arrow.md)
    * [S3のデータのクエリ](guides/querying-s3-bucket.md)
    * [Parquetファイルのクエリ](guides/querying-parquet.md)
    * [リモートClickHouseのクエリ](guides/query-remote-clickhouse.md)
    * [clickhouse-localデータベースの使用](guides/clickhouse-local.md)

<!-- ## What is chDB?

chDB lets you 

- Supports Python DB API 2.0: [example](https://github.com/chdb-io/chdb/blob/main/examples/dbapi.py) and [custom UDF Functions](https://github.com/chdb-io/chdb/blob/main/examples/udf.py) -->

## イントロダクションビデオ {#an-introductory-video}

ClickHouseの元クリエイターであるAlexey Milovidovによる、chDBプロジェクトの簡単な紹介をお聞きいただけます：

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/cuf_hYn7dqU?si=SzUm7RW4Ae5-YwFo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## chDBについて {#about-chdb}

- [Auxtenのブログ](https://clickhouse.com/blog/chdb-embedded-clickhouse-rocket-engine-on-a-bicycle)でchDBプロジェクトの誕生の全ストーリーをお読みください
- [公式ClickHouseブログ](https://clickhouse.com/blog/welcome-chdb-to-clickhouse)でchDBとそのユースケースについてお読みください
- [codapi examples](https://antonz.org/trying-chdb/)を使ってブラウザでchDBを発見してください。

## どのライセンスを使用していますか？ {#what-license-does-it-use}

chDBはApache License, Version 2.0のもとで提供されています。
