---
title: chDB
sidebar_label: Overview
slug: /en/chdb
description: chDB is an in-process SQL OLAP Engine powered by ClickHouse
keywords: [chdb, embedded, clickhouse-lite, in-process, in process]
---

# chDB

chDB is a fast in-process SQL OLAP Engine powered by [ClickHouse](https://github.com/clickhouse/clickhouse).
You can use it when you want to get the power of ClickHouse in a programming language without needing to connect to a ClickHouse server.

## What languages are supported by chDB?

chDB has the following language bindings:

* [Python](install/python.md)
* [Go](install/go.md)
* [Rust](install/rust.md)
* [NodeJS](install/nodejs.md)
* [Bun](install/bun.md)

## What input and output formats are supported?

chdB supports Parquet, CSV, JSON, Apache Arrow, ORC, and [60+ more formats](https://clickhouse.com/docs/en/interfaces/formats).

## How do I get started?

* If you're using Go, Rust, NodeJS, or Bun, take a look at the corresponding language pages.
* If you're using Python, see the [getting started developer guide](getting-started.md)

<!-- ## What is chDB?

chDB lets you 

- Supports Python DB API 2.0: [example](https://github.com/chdb-io/chdb/blob/main/examples/dbapi.py) and [custom UDF Functions](https://github.com/chdb-io/chdb/blob/main/examples/udf.py) -->

## An introductory video

You can listen to a brief project introduction to chDB, courtesy of Alexey Milovidov, the original creator of ClickHouse:

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/cuf_hYn7dqU?si=SzUm7RW4Ae5-YwFo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## About chDB

- Read the full story about the birth of the chDB project on [Auxten's blog](https://clickhouse.com/blog/chdb-embedded-clickhouse-rocket-engine-on-a-bicycle)
- Read about chDB and its use cases on the [Official ClickHouse Blog](https://clickhouse.com/blog/welcome-chdb-to-clickhouse)
- Discover chDB in your browser using [codapi examples](https://antonz.org/trying-chdb/)


## What license does it use?

chDB is available under the Apache License, Version 2.0.