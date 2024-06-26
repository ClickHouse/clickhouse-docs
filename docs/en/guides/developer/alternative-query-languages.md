---
slug: /en/guides/developer/alternative-query-languages
sidebar_label: Alternative Query Languages
title: Alternative Query Languages
description: Use alternative query languages in ClickHouse
---

You can use other query languages to query data in ClickHouse using the `dialect` setting.
After changing `dialect`, you can run queries in the newly configured dialect.

The currently supported dialects are:
- `clickhouse`: The default [ClickHouse SQL dialect](../../sql-reference/syntax.md)

Experimental dialects:
- `prql`: [Pipelined Relational Query Language](https://prql-lang.org/)
- `kusto`: [Kusto Quey Language (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

### ClickHouse SQL

The default SQL dialect for ClickHouse.

```sql
SET dialect = 'clickhouse'
```

## Experimental Dialects

These dialects may not be fully supported or have all of the features of their original specification.

### Pipelined Relational Query Language (PRQL)

You can execute queries using the PRQL language after setting the dialect to `prql`:
```sql
SET dialect = 'prql'
```

Then you can use every PRQL feature that the included compiler supports:

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days 
}
```

Under the hood ClickHouse will translate the PRQL query into an SQL query and execute it.

### Kusto Query Language (KQL)

Kusto may not be able to access all functions defined in ClickHouse.

Enable Kusto:
```sql
SET dialect = 'kusto'
```

Example query that selects from `system.numbers(10)`:
```sql
numbers(10) | project number
```

```sql
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

