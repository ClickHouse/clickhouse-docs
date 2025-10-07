---
'slug': '/guides/developer/alternative-query-languages'
'sidebar_label': '代替クエリ言語'
'title': '代替クエリ言語'
'description': 'ClickHouseで代替クエリ言語を使用する'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

ClickHouseは、標準SQLの他にデータをクエリするためのさまざまな代替クエリ言語をサポートしています。

現在サポートされているダイアレクトは以下の通りです。
- `clickhouse`: ClickHouseのデフォルトの [SQLダイアレクト](../../chdb/reference/sql-reference.md)
- `prql`: [パイプライン型リレーショナルクエリ言語 (PRQL)](https://prql-lang.org/)
- `kusto`: [Kustoクエリ言語 (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

使用されるクエリ言語は、`dialect`を設定することで制御されます。

## 標準SQL {#standard-sql}

標準SQLはClickHouseのデフォルトのクエリ言語です。

```sql
SET dialect = 'clickhouse'
```

## パイプライン型リレーショナルクエリ言語 (PRQL) {#pipelined-relational-query-language-prql}

<ExperimentalBadge/>

PRQLを有効にするには：

```sql
SET allow_experimental_prql_dialect = 1; -- this SET statement is required only for ClickHouse versions >= v25.1
SET dialect = 'prql'
```

PRQLのサンプルクエリ：

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

内部的には、ClickHouseはPRQLからSQLへのトランスパイルを使用してPRQLクエリを実行します。

## Kustoクエリ言語 (KQL) {#kusto-query-language-kql}

<ExperimentalBadge/>

KQLを有効にするには：

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

KQLクエリは、ClickHouseで定義されたすべての関数にアクセスできない場合があることに注意してください。
