---
slug: /integrations/data-formats
sidebar_label: 概述
sidebar_position: 1
keywords: ['clickhouse', 'CSV', 'TSV', 'Parquet', 'clickhouse-client', 'clickhouse-local']
---


# 从各种数据格式导入到 ClickHouse

在本部分文档中，您可以找到加载各种文件类型的示例。

### [**二进制**](/integrations/data-ingestion/data-formats/binary.md) {#binary}

导出并加载二进制格式，例如 ClickHouse 原生格式、MessagePack、Protocol Buffers 和 Cap’n Proto。

### [**CSV 和 TSV**](/integrations/data-ingestion/data-formats/csv-tsv.md) {#csv-and-tsv}

导入和导出 CSV 家族，包括 TSV，支持自定义头部和分隔符。

### [**JSON**](/integrations/data-ingestion/data-formats/json/intro.md) {#json}

加载和导出多种格式的 JSON，包括对象格式和行分隔的 NDJSON。

### [**Parquet 数据**](/integrations/data-ingestion/data-formats/parquet.md) {#parquet-data}

处理常见的 Apache 格式，如 Parquet 和 Arrow。

### [**SQL 数据**](/integrations/data-ingestion/data-formats/sql.md) {#sql-data}

需要 SQL 转储以导入到 MySQL 或 Postgresql 吗？不必再找了。

如果您希望连接像 Grafana、Tableau 等 BI 工具，请查看文档的 [可视化类别](../../data-visualization/index.md)。

## 相关内容 {#related-content}

- 博客: [ClickHouse 中数据格式的介绍](https://clickhouse.com/blog/data-formats-clickhouse-csv-tsv-parquet-native)
