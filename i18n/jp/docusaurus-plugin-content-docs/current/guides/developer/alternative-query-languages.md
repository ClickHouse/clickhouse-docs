---
slug: /guides/developer/alternative-query-languages
sidebar_label: '代替クエリ言語'
title: '代替クエリ言語'
description: 'ClickHouseで代替クエリ言語を使用する'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

標準SQLに加えて、ClickHouseはデータをクエリするためのさまざまな代替クエリ言語をサポートしています。

現在サポートされている方言は以下の通りです：
- `clickhouse`: ClickHouseのデフォルトの [SQL方言](../../chdb/reference/sql-reference.md)
- `prql`: [パイプライン式関係クエリ言語 (PRQL)](https://prql-lang.org/)
- `kusto`: [Kustoクエリ言語 (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

使用されるクエリ言語は、`dialect` を設定することで制御されます。

## 標準SQL {#standard-sql}

標準SQLはClickHouseのデフォルトのクエリ言語です。

```sql
SET dialect = 'clickhouse'
```

## パイプライン式関係クエリ言語 (PRQL) {#pipelined-relational-query-language-prql}

<ExperimentalBadge/>

PRQLを有効にするには：

```sql
SET allow_experimental_prql_dialect = 1; -- このSET文はClickHouseバージョン >= v25.1 にのみ必要です
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

内部では、ClickHouseはPRQLをSQLに変換してPRQLクエリを実行します。

## Kustoクエリ言語 (KQL) {#kusto-query-language-kql}

<ExperimentalBadge/>

KQLを有効にするには：

```sql
SET allow_experimental_kusto_dialect = 1; -- このSET文はClickHouseバージョン >= 25.1 にのみ必要です
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

KQLクエリはClickHouseで定義されたすべての関数にアクセスできない場合があることに注意してください。
