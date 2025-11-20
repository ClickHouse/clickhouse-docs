---
slug: /guides/developer/alternative-query-languages
sidebar_label: '代替クエリ言語'
title: '代替クエリ言語'
description: 'ClickHouse で別のクエリ言語を使用する'
keywords: ['alternative query languages', 'query dialects', 'MySQL dialect', 'PostgreSQL dialect', 'developer guide']
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

標準的な SQL に加えて、ClickHouse はデータをクエリするためのさまざまな代替クエリ言語をサポートしています。

現在サポートされている方言は次のとおりです。

* `clickhouse`: ClickHouse のデフォルトの [SQL 方言](../../chdb/reference/sql-reference.md)
* `prql`: [Pipelined Relational Query Language (PRQL)](https://prql-lang.org/)
* `kusto`: [Kusto Query Language (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

使用するクエリ言語は、`dialect` の設定によって制御されます。


## 標準SQL {#standard-sql}

標準SQLは、ClickHouseのデフォルトクエリ言語です。

```sql
SET dialect = 'clickhouse'
```


## パイプライン型リレーショナルクエリ言語（PRQL） {#pipelined-relational-query-language-prql}

<ExperimentalBadge />

PRQLを有効にするには：

```sql
SET allow_experimental_prql_dialect = 1; -- このSET文はClickHouseバージョン >= v25.1の場合のみ必要です
SET dialect = 'prql'
```

PRQLクエリの例：

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

内部的には、ClickHouseはPRQLクエリを実行する際にPRQLからSQLへのトランスパイルを使用しています。


## Kustoクエリ言語（KQL） {#kusto-query-language-kql}

<ExperimentalBadge />

KQLを有効にするには:

```sql
SET allow_experimental_kusto_dialect = 1; -- このSET文はClickHouseバージョン25.1以降でのみ必要です
SET dialect = 'kusto'
```

```kql title="クエリ"
numbers(10) | project number
```

```response title="レスポンス"
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

注意: KQLクエリはClickHouseで定義されているすべての関数にアクセスできない場合があります。
