---
title: chDB
sidebar_label: Обзор
slug: /chdb
description: chDB — это встроенный SQL OLAP движок, работающий на базе ClickHouse
keywords: [chdb, встроенный, clickhouse-lite, in-process, в процессе]
---


# chDB

chDB — это быстрый встроенный SQL OLAP движок, работающий на базе [ClickHouse](https://github.com/clickhouse/clickhouse).
Вы можете использовать его, когда хотите получить мощь ClickHouse в языке программирования без необходимости подключения к серверу ClickHouse.

## Какие языки поддерживает chDB? {#what-languages-are-supported-by-chdb}

chDB имеет следующие языковые привязки:

* [Python](install/python.md)
* [Go](install/go.md)
* [Rust](install/rust.md)
* [NodeJS](install/nodejs.md)
* [Bun](install/bun.md)

## Какие форматы ввода и вывода поддерживаются? {#what-input-and-output-formats-are-supported}

chDB поддерживает Parquet, CSV, JSON, Apache Arrow, ORC и [более 60 форматов](/interfaces/formats).

## Как начать? {#how-do-i-get-started}

* Если вы используете [Go](install/go.md), [Rust](install/rust.md), [NodeJS](install/nodejs.md) или [Bun](install/bun.md), ознакомьтесь с соответствующими страницами для языка.
* Если вы используете Python, посмотрите [руководство для начинающих](getting-started.md). Также есть руководства, показывающие, как выполнять общие задачи, такие как:
    * [JupySQL](guides/jupysql.md)
    * [Запросы к Pandas](guides/querying-pandas.md)
    * [Запросы к Apache Arrow](guides/querying-apache-arrow.md)
    * [Запросы к данным в S3](guides/querying-s3-bucket.md)
    * [Запросы к Parquet файлам](guides/querying-parquet.md)
    * [Запросы к удаленному ClickHouse](guides/query-remote-clickhouse.md)
    * [Использование базы данных clickhouse-local](guides/clickhouse-local.md)

## Вводное видео {#an-introductory-video}

Вы можете посмотреть короткое введение в проект chDB от Алексея Миловидова, оригинального создателя ClickHouse:

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/cuf_hYn7dqU?si=SzUm7RW4Ae5-YwFo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## О chDB {#about-chdb}

- Прочитайте полную историю о возникновении проекта chDB на [блоге Auxten](https://clickhouse.com/blog/chdb-embedded-clickhouse-rocket-engine-on-a-bicycle)
- Узнайте о chDB и его случаях использования на [Официальном блоге ClickHouse](https://clickhouse.com/blog/welcome-chdb-to-clickhouse)
- Ознакомьтесь с chDB в вашем браузере, используя [примеры codapi](https://antonz.org/trying-chdb/)

## Какую лицензию он использует? {#what-license-does-it-use}

chDB доступен под лицензией Apache License, Version 2.0.
