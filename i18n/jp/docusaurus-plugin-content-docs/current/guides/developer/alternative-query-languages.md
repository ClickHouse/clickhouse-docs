---
'slug': '/guides/developer/alternative-query-languages'
'sidebar_label': '代替クエリ言語'
'title': '代替クエリ言語'
'description': 'ClickHouseで代替クエリ言語を使用する'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

ClickHouseは、標準SQL以外にもさまざまな代替クエリ言語をデータのクエリにサポートしています。

現在サポートされているダイアレクトは以下の通りです：
- `clickhouse`: ClickHouseのデフォルトの[SQLダイアレクト](../../chdb/reference/sql-reference.md)
- `prql`: [Pipelined Relational Query Language (PRQL)](https://prql-lang.org/)
- `kusto`: [Kusto Query Language (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

使用するクエリ言語は、`dialect`を設定することで制御されます。

## Standard SQL {#standard-sql}

Standard SQLはClickHouseのデフォルトのクエリ言語です。

```sql
SET dialect = 'clickhouse'
```

## Pipelined Relational Query Language (PRQL) {#pipelined-relational-query-language-prql}

<ExperimentalBadge/>

PRQLを有効にするには：

```sql
SET allow_experimental_prql_dialect = 1; -- このSET文はClickHouseのバージョンが>= v25.1の場合のみ必要です
SET dialect = 'prql'
```

PRQLのクエリの例：

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

内部的に、ClickHouseはPRQLをSQLにトランスパイルしてPRQLクエリを実行します。

## Kusto Query Language (KQL) {#kusto-query-language-kql}

<ExperimentalBadge/>

KQLを有効にするには：

```sql
SET allow_experimental_kusto_dialect = 1; -- このSET文はClickHouseのバージョンが>= 25.1の場合のみ必要です
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
