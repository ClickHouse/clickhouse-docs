---
title: '湖仓表格式入门'
sidebar_label: '入门'
slug: /use-cases/data-lake/getting-started
sidebar_position: 1
pagination_prev: use-cases/data_lake/index
pagination_next: use-cases/data_lake/getting-started/querying-directly
description: '使用 ClickHouse 对开放表格式数据进行查询、加速和回写的动手实践入门指南。'
keywords: ['数据湖', '湖仓', '入门', 'iceberg', 'Delta Lake', 'hudi', 'paimon']
doc_type: 'guide'
---

本指南通过动手实践演示 ClickHouse 在湖仓表格式方面提供的核心能力。

## 就地查询数据 \{#querying-data-in-place\}

ClickHouse 可以作为针对存储在对象存储中的开放表格式的查询引擎使用。无需复制数据，用户即可将 ClickHouse 指向已有的 Iceberg、Delta Lake、Hudi 或 Paimon 表并立即开始查询，无论是用于支撑生产工作负载还是交互式地探索数据。这既可以通过使用表函数和表引擎进行直接读取来实现，也可以通过连接到数据目录来完成。

* [直接查询开放表格式](/use-cases/data-lake/getting-started/querying-directly) — 使用 ClickHouse 表函数读取对象存储中的 Iceberg、Delta Lake、Hudi 和 Paimon 表，无需任何预先配置步骤。
* [连接到数据目录](/use-cases/data-lake/getting-started/connecting-catalogs) — 将数据目录暴露为 ClickHouse 数据库，并使用标准 SQL 查询其中的表。建议在需要访问目录中的多个表时采用此方式。

## 加速分析 \{#accelerating-analytics\}

对于需要低延迟响应和高并发的工作负载，将开放表格式中的数据加载到 ClickHouse 的 MergeTree 引擎中可以显著提升性能。其对稀疏主索引、跳过索引以及列式存储的利用，使得对 Parquet 文件需要数秒才能完成的查询能够在毫秒级完成。

* [使用 MergeTree 加速分析](/use-cases/data-lake/getting-started/accelerating-analytics) - 将数据从目录加载到 MergeTree 表中，可实现查询速度约提升 40 倍。

## 将数据写回 \{#writing-data-back\}

数据也可以从 ClickHouse 写回到开放表格式。无论是将老化数据迁移到长期存储，还是将转换结果发布供下游使用，ClickHouse 都可以将数据写入对象存储中的 Iceberg 和 Delta 表。

* [将数据写入开放表格式](/use-cases/data-lake/getting-started/writing-data) - 使用 `INSERT INTO SELECT` 将原始数据和聚合结果从 ClickHouse 写入 Iceberg 表。