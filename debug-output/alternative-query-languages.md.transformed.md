---
slug: /guides/developer/alternative-query-languages
sidebar_label: 'Alternative Query Languages'
title: 'Alternative Query Languages'
description: 'Use alternative query languages in ClickHouse'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

Besides standard SQL, ClickHouse supports various alternative query languages for querying data.

The currently supported dialects are:
- `clickhouse`: The default [SQL dialect](../../sql-reference/syntax.md) of ClickHouse
- `prql`: [Pipelined Relational Query Language (PRQL)](https://prql-lang.org/)
- `kusto`: [Kusto Query Language (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

Which query language is used is controlled by setting `dialect`.

## Standard SQL \{#standard-sql}

Standard SQL is the default query language of ClickHouse.

```sql
SET dialect = 'clickhouse'
```

## Pipelined Relational Query Language (PRQL) \{#pipelined-relational-query-language-prql}

<ExperimentalBadge/>

To enable PRQL:

```sql
SET allow_experimental_prql_dialect = 1; -- this SET statement is required only for ClickHouse versions >= v25.1
SET dialect = 'prql'
```

Example PRQL query:


```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

Under the hood, ClickHouse uses transpilation from PRQL to SQL to run PRQL queries.

## Kusto Query Language (KQL) \{#kusto-query-language-kql}

<ExperimentalBadge/>

To enable KQL:

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

Note that KQL queries may not be able to access all functions defined in ClickHouse.
