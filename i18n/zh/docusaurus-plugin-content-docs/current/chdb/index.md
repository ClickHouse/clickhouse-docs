---
'title': 'chDB'
'sidebar_label': '概述'
'slug': '/chdb'
'description': 'chDB 是一个由 ClickHouse 驱动的进程内 SQL OLAP 引擎'
'keywords':
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'in-process'
- 'in process'
---


# chDB

chDB 是一个快速的内嵌 SQL OLAP 引擎，由 [ClickHouse](https://github.com/clickhouse/clickhouse) 提供支持。您可以在希望以编程语言获取 ClickHouse 的强大功能而无需连接到 ClickHouse 服务器时使用它。

## chDB 支持哪些语言？ {#what-languages-are-supported-by-chdb}

chDB 具有以下语言绑定：

* [Python](install/python.md)
* [Go](install/go.md)
* [Rust](install/rust.md)
* [NodeJS](install/nodejs.md)
* [Bun](install/bun.md)

## 支持哪些输入和输出格式？ {#what-input-and-output-formats-are-supported}

chDB 支持 Parquet、CSV、JSON、Apache Arrow、ORC 和 [60 多种格式](/interfaces/formats)。

## 我该如何开始？ {#how-do-i-get-started}

* 如果您使用的是 [Go](install/go.md)、[Rust](install/rust.md)、[NodeJS](install/nodejs.md) 或 [Bun](install/bun.md)，请查看相应的语言页面。
* 如果您使用的是 Python，请参阅 [入门开发者指南](getting-started.md)。还有一些指南展示了如何完成常见任务，例如：
    * [JupySQL](guides/jupysql.md)
    * [使用 Pandas 查询](guides/querying-pandas.md)
    * [使用 Apache Arrow 查询](guides/querying-apache-arrow.md)
    * [查询 S3 中的数据](guides/querying-s3-bucket.md)
    * [查询 Parquet 文件](guides/querying-parquet.md)
    * [查询远程 ClickHouse](guides/query-remote-clickhouse.md)
    * [使用 clickhouse-local 数据库](guides/clickhouse-local.md)

<!-- ## chDB 是什么？

chDB 让您 

- 支持 Python DB API 2.0: [示例](https://github.com/chdb-io/chdb/blob/main/examples/dbapi.py) 和 [自定义 UDF 函数](https://github.com/chdb-io/chdb/blob/main/examples/udf.py) -->

## 介绍视频 {#an-introductory-video}

您可以收听 ClickHouse 的原始创建者 Alexey Milovidov 对 chDB 项目的简要介绍：

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/cuf_hYn7dqU?si=SzUm7RW4Ae5-YwFo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## 关于 chDB {#about-chdb}

- 在 [Auxten 的博客](https://clickhouse.com/blog/chdb-embedded-clickhouse-rocket-engine-on-a-bicycle) 上阅读关于 chDB 项目诞生的完整故事
- 在 [官方 ClickHouse 博客](https://clickhouse.com/blog/welcome-chdb-to-clickhouse) 上阅读有关 chDB 及其用例的信息
- 使用 [codapi 示例](https://antonz.org/trying-chdb/) 在浏览器中发现 chDB

## 它使用什么许可证？ {#what-license-does-it-use}

chDB 根据 Apache 许可证 2.0 版提供。
