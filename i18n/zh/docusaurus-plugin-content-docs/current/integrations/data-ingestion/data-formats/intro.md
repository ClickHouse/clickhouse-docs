---
slug: /integrations/data-formats
sidebar_label: '概览'
sidebar_position: 1
keywords: ['clickhouse', 'CSV', 'TSV', 'Parquet', 'clickhouse-client', 'clickhouse-local']
title: '从多种数据格式向 ClickHouse 导入数据'
description: '介绍如何将多种数据格式的数据导入 ClickHouse 的页面'
show_related_blogs: true
doc_type: '指南'
---



# 从多种数据格式导入到 ClickHouse {#importing-from-various-data-formats-to-clickhouse}

在本节文档中，可以找到从各种文件类型加载数据的示例。

### [**Binary**](/integrations/data-ingestion/data-formats/binary.md) {#binary}

导出和加载二进制格式，例如 ClickHouse Native、MessagePack、Protocol Buffers 和 Cap'n Proto。

### [**CSV and TSV**](/integrations/data-ingestion/data-formats/csv-tsv.md) {#csv-and-tsv}

导入和导出 CSV 系列格式（包括 TSV），并支持自定义表头和分隔符。

### [**JSON**](/integrations/data-ingestion/data-formats/json/intro.md) {#json}

以多种格式加载和导出 JSON，包括对象形式和按行分隔的 NDJSON。

### [**Parquet data**](/integrations/data-ingestion/data-formats/parquet.md) {#parquet-data}

处理常见的 Apache 格式，例如 Parquet 和 Arrow。

### [**SQL data**](/integrations/data-ingestion/data-formats/sql.md) {#sql-data}

需要一个 SQL 导出文件来导入到 MySQL 或 PostgreSQL 吗？这里就有相关说明。

如果希望连接 Grafana、Tableau 等 BI 工具，请查看文档中的[可视化](../../data-visualization/index.md)部分。
