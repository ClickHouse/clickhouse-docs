---
slug: /guides/developer/alternative-query-languages
sidebar_label: '代替クエリ言語'
title: '代替クエリ言語'
description: 'ClickHouse で別のクエリ言語を使用する'
keywords: ['代替クエリ言語', 'クエリ言語の方言', 'MySQL 方言', 'PostgreSQL 方言', '開発者ガイド']
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

標準的な SQL に加えて、ClickHouse はデータをクエリするためのさまざまな別のクエリ言語をサポートしています。

現在サポートされている方言は次のとおりです。

* `clickhouse`: ClickHouse のデフォルトの [SQL 方言](../../chdb/reference/sql-reference.md)
* `prql`: [Pipelined Relational Query Language (PRQL)](https://prql-lang.org/)
* `kusto`: [Kusto Query Language (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

どのクエリ言語を使用するかは、`dialect` の設定によって制御されます。

## 標準SQL \{#standard-sql\}

標準SQLは ClickHouse のデフォルトのクエリ言語です。

```sql
SET dialect = 'clickhouse'
```

## パイプライン型リレーショナルクエリ言語 (PRQL) \{#pipelined-relational-query-language-prql\}

<ExperimentalBadge />

PRQL を有効にするには:

```sql
SET allow_experimental_prql_dialect = 1; -- this SET statement is required only for ClickHouse versions >= v25.1
SET dialect = 'prql'
```

PRQL クエリの例：

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

内部的には、ClickHouse は PRQL クエリを実行する際、PRQL を SQL にトランスパイルして処理します。

## Kusto クエリ言語 (KQL) \{#kusto-query-language-kql\}

<ExperimentalBadge />

KQL を有効にするには、次の手順に従います。

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

KQL クエリからは、ClickHouse で定義されているすべての関数を利用できない場合があります。
