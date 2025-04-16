---
title: 'chDB'
sidebar_label: 'Обзор'
slug: /chdb
description: 'chDB — это SQL OLAP движок, работающий в процессе и основанный на ClickHouse'
keywords: ['chdb', 'встраиваемый', 'clickhouse-lite', 'в процессе', 'in process']
---


# chDB

chDB — это быстрый SQL OLAP движок, работающий в процессе и основанный на [ClickHouse](https://github.com/clickhouse/clickhouse). Вы можете использовать его, когда хотите получить мощность ClickHouse в языке программирования без необходимости подключения к серверу ClickHouse.

## Какие языки поддерживаются chDB? {#what-languages-are-supported-by-chdb}

chDB имеет следующие привязки языков:

* [Python](install/python.md)
* [Go](install/go.md)
* [Rust](install/rust.md)
* [NodeJS](install/nodejs.md)
* [Bun](install/bun.md)

## Какие форматы ввода и вывода поддерживаются? {#what-input-and-output-formats-are-supported}

chDB поддерживает Parquet, CSV, JSON, Apache Arrow, ORC и [более 60 форматов](/interfaces/formats).

## Как мне начать? {#how-do-i-get-started}

* Если вы используете [Go](install/go.md), [Rust](install/rust.md), [NodeJS](install/nodejs.md) или [Bun](install/bun.md), ознакомьтесь с соответствующими языковыми страницами.
* Если вы используете Python, смотрите [руководство для начинающих](getting-started.md). Также есть руководства, показывающие, как выполнять общие задачи, такие как:
    * [JupySQL](guides/jupysql.md)
    * [Запросы к Pandas](guides/querying-pandas.md)
    * [Запросы к Apache Arrow](guides/querying-apache-arrow.md)
    * [Запросы данных в S3](guides/querying-s3-bucket.md)
    * [Запросы к файлам Parquet](guides/querying-parquet.md)
    * [Запросы к удаленному ClickHouse](guides/query-remote-clickhouse.md)
    * [Использование базы данных clickhouse-local](guides/clickhouse-local.md)

## Вводное видео {#an-introductory-video}

Вы можете просмотреть краткое введение в проект chDB, предоставленное Алексеем Миловидовым, оригинальным создателем ClickHouse:

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/cuf_hYn7dqU?si=SzUm7RW4Ae5-YwFo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## О chDB {#about-chdb}

- Прочтите полную историю о рождении проекта chDB на [блоге Auxten](https://clickhouse.com/blog/chdb-embedded-clickhouse-rocket-engine-on-a-bicycle)
- Узнайте о chDB и его сценариях использования на [Официальном блоге ClickHouse](https://clickhouse.com/blog/welcome-chdb-to-clickhouse)
- Ознакомьтесь с chDB в вашем браузере, используя [примеры codapi](https://antonz.org/trying-chdb/)

## Какая лицензия используется? {#what-license-does-it-use}

chDB доступен под лицензией Apache, версия 2.0.
