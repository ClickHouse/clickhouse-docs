---
'slug': '/guides/developer/alternative-query-languages'
'sidebar_label': 'Альтернативные языки запросов'
'title': 'Альтернативные языки запросов'
'description': 'Используйте альтернативные языки запросов в ClickHouse'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

Кроме стандартного SQL, ClickHouse поддерживает различные альтернативные языки запросов для обращения к данным.

В настоящее время поддерживаемые диалекты:
- `clickhouse`: Стандартный [SQL-диалект](../../chdb/reference/sql-reference.md) ClickHouse
- `prql`: [Язык запросов с конвейером (PRQL)](https://prql-lang.org/)
- `kusto`: [Язык запросов Kusto (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

Какой язык запросов используется, контролируется с помощью настройки `dialect`.

## Стандартный SQL {#standard-sql}

Стандартный SQL является языком запросов по умолчанию в ClickHouse.

```sql
SET dialect = 'clickhouse'
```

## Язык запросов с конвейером (PRQL) {#pipelined-relational-query-language-prql}

<ExperimentalBadge/>

Чтобы включить PRQL:

```sql
SET allow_experimental_prql_dialect = 1; -- this SET statement is required only for ClickHouse versions >= v25.1
SET dialect = 'prql'
```

Пример запроса PRQL:

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

Внутри ClickHouse используется трансляция из PRQL в SQL для выполнения запросов PRQL.

## Язык запросов Kusto (KQL) {#kusto-query-language-kql}

<ExperimentalBadge/>

Чтобы включить KQL:

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

Обратите внимание, что запросы KQL могут не иметь доступа ко всем функциям, определенным в ClickHouse.
