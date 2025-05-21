---
'slug': '/guides/developer/alternative-query-languages'
'sidebar_label': 'Alternative Query Languages'
'title': 'Alternative Query Languages'
'description': 'Use alternative query languages in ClickHouse'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

除了标准 SQL，ClickHouse 还支持多种替代查询语言来查询数据。

当前支持的方言为：
- `clickhouse`：ClickHouse 的默认 [SQL 方言](../../chdb/reference/sql-reference.md)
- `prql`： [管道式关系查询语言 (PRQL)](https://prql-lang.org/)
- `kusto`： [Kusto 查询语言 (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

使用哪种查询语言由设置 `dialect` 控制。

## 标准 SQL {#standard-sql}

标准 SQL 是 ClickHouse 的默认查询语言。

```sql
SET dialect = 'clickhouse'
```

## 管道式关系查询语言 (PRQL) {#pipelined-relational-query-language-prql}

<ExperimentalBadge/>

要启用 PRQL：

```sql
SET allow_experimental_prql_dialect = 1; -- this SET statement is required only for ClickHouse versions >= v25.1
SET dialect = 'prql'
```

示例 PRQL 查询：

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

在底层，ClickHouse 使用从 PRQL 到 SQL 的转译来执行 PRQL 查询。

## Kusto 查询语言 (KQL) {#kusto-query-language-kql}

<ExperimentalBadge/>

要启用 KQL：

```sql
SET allow_experimental_kusto_dialect = 1; -- this SET statement is required only for ClickHouse versions >= 25.1
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

请注意，KQL 查询可能无法访问 ClickHouse 中定义的所有函数。
