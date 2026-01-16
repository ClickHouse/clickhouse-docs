---
slug: /guides/developer/alternative-query-languages
sidebar_label: 'Альтернативные языки запросов'
title: 'Альтернативные языки запросов'
description: 'Использование альтернативных языков запросов в ClickHouse'
keywords: ['альтернативные языки запросов', 'диалекты запросов', 'диалект MySQL', 'диалект PostgreSQL', 'руководство для разработчиков']
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

Помимо стандартного SQL, ClickHouse поддерживает различные альтернативные языки запросов для работы с данными.

В настоящее время поддерживаются следующие диалекты:

* `clickhouse`: Диалект по умолчанию — [SQL-диалект](../../chdb/reference/sql-reference.md) ClickHouse
* `prql`: [Pipelined Relational Query Language (PRQL)](https://prql-lang.org/)
* `kusto`: [Kusto Query Language (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

Используемый язык запросов задаётся параметром `dialect`.

## Стандартный SQL \\{#standard-sql\\}

Стандартный SQL — язык запросов, используемый в ClickHouse по умолчанию.

```sql
SET dialect = 'clickhouse'
```

## Конвейерный реляционный язык запросов (PRQL) \\{#pipelined-relational-query-language-prql\\}

<ExperimentalBadge />

Чтобы включить поддержку PRQL:

```sql
SET allow_experimental_prql_dialect = 1; -- эта команда SET требуется только для версий ClickHouse >= v25.1
SET dialect = 'prql'
```

Пример запроса на PRQL:

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

Внутренне ClickHouse транспилирует PRQL в SQL для выполнения запросов PRQL.

## Язык запросов Kusto (KQL) \\{#kusto-query-language-kql\\}

<ExperimentalBadge />

Чтобы включить поддержку KQL:

```sql
SET allow_experimental_kusto_dialect = 1; -- эта инструкция SET требуется только для версий ClickHouse начиная с 25.1
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

Обратите внимание, что запросы KQL могут не иметь доступа ко всем функциям, определённым в ClickHouse.
