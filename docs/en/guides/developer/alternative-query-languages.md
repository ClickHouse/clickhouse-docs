---
slug: /en/guides/developer/alternative-query-languages
sidebar_label: Alternative Query Languages
title: Alternative Query Languages
description: Use alternative query languages in ClickHouse
---

You can use other query languages to query data in ClickHouse using the `dialect` setting. The currently supported dialects are:
- `clickhouse`: The default [ClickHouse SQL dialect](../../sql-reference/syntax.md)
- `prql`: [Pipelined Relational Query Language](https://prql-lang.org/)

You can execute queries using the PRQL language after setting the dialect to `prql`:
```sql
SET dialect = 'prql'
```

Then you can use every PRQL feature that the included PRQL compiler supports:

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days 
}
```

Under the hood ClickHouse will translate the PRQL query into an SQL query and execute it. To switch back to the ClickHouse SQL dialect set the dialect to `clickhouse`:
```sql
SET dialect = 'clickhouse'
```
