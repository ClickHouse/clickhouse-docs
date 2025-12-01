---
slug: /guides/developer/alternative-query-languages
sidebar_label: '其他查询语言'
title: '其他查询语言'
description: '在 ClickHouse 中使用其他查询语言'
keywords: ['其他查询语言', '查询方言', 'MySQL 方言', 'PostgreSQL 方言', '开发者指南']
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

除了标准 SQL 之外，ClickHouse 还支持多种其他可用于查询数据的查询语言。

当前支持的方言有：

* `clickhouse`：ClickHouse 的默认 [SQL 方言](../../chdb/reference/sql-reference.md)
* `prql`：[Pipelined Relational Query Language (PRQL)](https://prql-lang.org/)
* `kusto`：[Kusto Query Language (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

具体使用哪种查询语言由 `dialect` 设置项控制。

## 标准 SQL {#standard-sql}

标准 SQL 是 ClickHouse 的默认查询语言。

```sql
SET dialect = 'clickhouse'
```

## 管道式关系查询语言（PRQL） {#pipelined-relational-query-language-prql}

<ExperimentalBadge />

要启用 PRQL：

```sql
SET allow_experimental_prql_dialect = 1; -- 仅 ClickHouse 版本 >= v25.1 需要此 SET 语句
SET dialect = 'prql'
```

PRQL 示例查询：

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

在底层，ClickHouse 会先将 PRQL 转译为 SQL，然后再执行 PRQL 查询。

## Kusto 查询语言 (KQL) {#kusto-query-language-kql}

<ExperimentalBadge />

若要启用 KQL：

```sql
SET allow_experimental_kusto_dialect = 1; -- 此 SET 语句仅适用于 ClickHouse 版本 >= 25.1
SET dialect = 'kusto'
```

```kql title="Query"
numbers(10) | project number
```

```response title="Response"
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘
```

请注意，KQL 查询可能无法使用 ClickHouse 中定义的所有函数。
