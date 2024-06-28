---
title: chDB
sidebar_label: Overview
slug: /en/chdb
description: chDB is an in-process SQL OLAP Engine powered by ClickHouse
keywords: [chdb, embedded, clickhouse-lite, in-process, in process]
---

# chDB

chDB is an in-process SQL OLAP Engine powered by ClickHouse. It is developed by ClickHouse, Inc and open-source contributors.

## Features
- In-process SQL OLAP Engine, powered by [ClickHouse](https://github.com/clickhouse/clickhouse)
- Serverless. No need to install or run ClickHouse services.
- Minimized data copy from C++ to Python with [python memoryview](https://docs.python.org/3/c-api/memoryview.html)
- Input & Output support Parquet, CSV, JSON, Arrow, ORC and [60+ more formats](https://clickhouse.com/docs/en/interfaces/formats)
- Supports Python DB API 2.0: [example](https://github.com/chdb-io/chdb/blob/main/examples/dbapi.py) and [custom UDF Functions](https://github.com/chdb-io/chdb/blob/main/examples/udf.py)
- Library bindings for [Python](https://github.com/chdb-io/chdb), [Go](https://github.com/chdb-io/chdb-go), [Rust](https://github.com/chdb-io/chdb-rust), [NodeJS](https://github.com/chdb-io/chdb-node), [Bun](https://github.com/chdb-io/chdb-bun)
- Apache License, Version 2.0

## About
- Read the full story about the birth of the chDB project on [Auxten's blog](https://clickhouse.com/blog/chdb-embedded-clickhouse-rocket-engine-on-a-bicycle)
- Read about chDB and its usecases on the [Official ClickHouse Blog](https://clickhouse.com/blog/welcome-chdb-to-clickhouse)
- Discover chDB in your browser using [codapi examples](https://antonz.org/trying-chdb/)
- Listen to a brief project introduction courtesy of our hero Alexey Milovidov, the original creator of ClickHouse:

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/cuf_hYn7dqU?start=3053"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>
